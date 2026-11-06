"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Image from "next/image";
import { X, Truck, CheckCircle2, Clock, MapPin, ExternalLink, RefreshCw, AlertCircle, Copy, Check } from "lucide-react";
import { PromecOrder } from "@/lib/orderStore";

interface OrderTrackingModalProps {
  order: PromecOrder | null;
  isOpen: boolean;
  onClose: () => void;
  onFileDispute?: (order: PromecOrder) => void;
  onCancelOrder?: (order: PromecOrder) => void;
}

/* ─── helpers to extract live dates/locations from Delhivery scans ─── */
function extractScanInfo(scans: any[] | undefined, keywords: string[]) {
  if (!scans || scans.length === 0) return null;
  for (const scan of scans) {
    const detail = scan?.ScanDetail || scan;
    const desc = (detail?.Scan || detail?.Instructions || "").toLowerCase();
    if (keywords.some((kw) => desc.includes(kw))) {
      return {
        date: detail?.ScanDateTime || detail?.StatusDateTime || scan?.Date || "",
        location: detail?.ScannedLocation || scan?.Location || "",
      };
    }
  }
  return null;
}

function formatScanDate(raw: string): string {
  if (!raw) return "";
  try {
    const d = new Date(raw);
    if (isNaN(d.getTime())) return raw;
    return d.toLocaleDateString("en-IN", { month: "short", day: "numeric" }) +
      " · " +
      d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
  } catch {
    return raw;
  }
}

export default function OrderTrackingModal({
  order,
  isOpen,
  onClose,
  onFileDispute,
  onCancelOrder,
}: OrderTrackingModalProps) {
  const [copied, setCopied] = useState(false);
  const [liveData, setLiveData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const refreshTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const waybill = order?.fulfillment?.waybill || "";

  const fetchTracking = useCallback(async () => {
    if (!order) return;
    setLoading(true);
    try {
      const res = await fetch(`/aquaforceforautocare/api/account/orders/${order.id}`);
      const data = await res.json();
      if (data.success && data.tracking) {
        setLiveData(data.tracking);
      }
    } catch (err) {
      console.warn("Could not fetch live tracking:", err);
    } finally {
      setLoading(false);
    }
  }, [order]);

  useEffect(() => {
    if (isOpen && order) {
      fetchTracking();
      // Auto-refresh every 30 seconds while modal is open
      refreshTimer.current = setInterval(fetchTracking, 30_000);
    } else {
      setLiveData(null);
    }
    return () => {
      if (refreshTimer.current) {
        clearInterval(refreshTimer.current);
        refreshTimer.current = null;
      }
    };
  }, [isOpen, order, fetchTracking]);

  const copyAwb = () => {
    if (!waybill) return;
    navigator.clipboard.writeText(waybill);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen || !order) return null;

  // ─── Reverse scans so oldest-first for keyword matching ───
  const scansOldestFirst = liveData?.scans ? [...liveData.scans].reverse() : [];

  // ─── Determine shipment status stage (1 to 5) ───
  const liveStatus = (liveData?.status || "").toLowerCase();
  let currentStep = 2;
  const isDelivered = order.orderStatus === "delivered" || liveStatus.includes("delivered");
  const isShipped = order.orderStatus === "shipped" || Boolean(waybill) || liveStatus.includes("transit");
  const isOutForDelivery = liveStatus.includes("out for delivery");

  if (isDelivered) currentStep = 5;
  else if (isOutForDelivery) currentStep = 4;
  else if (isShipped) currentStep = 3;
  else if (order.orderStatus === "confirmed" || order.payment.status === "captured") currentStep = 2;
  else currentStep = 1;

  // ─── Build dynamic step descriptions from live scans ───
  const packedScan = extractScanInfo(scansOldestFirst, ["manifest", "picked up", "packed", "booked"]);
  const handedScan = extractScanInfo(scansOldestFirst, ["in transit", "dispatched", "shipped", "forwarded"]);
  const ofdScan = extractScanInfo(scansOldestFirst, ["out for delivery"]);
  const deliveredScan = extractScanInfo(scansOldestFirst, ["delivered"]);

  const steps = [
    {
      title: "Order Placed",
      desc: new Date(order.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
      done: currentStep >= 1,
    },
    {
      title: "Packed & Verified",
      desc: packedScan
        ? `${packedScan.location || "Nagpur Central Hub"} · ${formatScanDate(packedScan.date)}`
        : "Nagpur Central Hub",
      done: currentStep >= 2,
    },
    {
      title: "Handed to Delhivery",
      desc: handedScan
        ? `${handedScan.location || "In Transit"} · ${formatScanDate(handedScan.date)}`
        : waybill
        ? `AWB: ${waybill.slice(0, 10)}...`
        : "Express Priority",
      done: currentStep >= 3,
    },
    {
      title: "Out for Delivery",
      desc: ofdScan
        ? `${ofdScan.location || "Local Courier Hub"} · ${formatScanDate(ofdScan.date)}`
        : "Local Courier Hub",
      done: currentStep >= 4,
    },
    {
      title: "Delivered",
      desc: deliveredScan
        ? `${deliveredScan.location || "Doorstep"} · ${formatScanDate(deliveredScan.date)}`
        : "Doorstep Handover",
      done: currentStep >= 5,
    },
  ];

  const estimatedDelivery = liveData?.expectedDeliveryDate
    ? new Date(liveData.expectedDeliveryDate).toLocaleDateString("en-IN", { weekday: "short", month: "short", day: "numeric" })
    : (() => {
        const d = new Date(order.createdAt);
        d.setDate(d.getDate() + 4);
        return d.toLocaleDateString("en-IN", { weekday: "short", month: "short", day: "numeric" });
      })();

  const isCod = order.payment.method === "COD_ADVANCE";
  const codBalance = Math.round(order.payment.amountDueInPaise / 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 font-open-sans">
      <div className="relative w-full max-w-[620px] max-h-[90vh] bg-white border border-slate-200 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-900 font-open-sans">
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#0066cc]">
              <Truck size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold font-montserrat text-[#0F1729]">
                  Live Shipment Tracking
                </h3>
                <span
                  className={`px-2 py-0.5 rounded-full text-[11px] font-bold font-montserrat uppercase tracking-wider ${
                    order.orderStatus === "cancelled"
                      ? "bg-rose-50 text-rose-700 border border-rose-200"
                      : isDelivered
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : isShipped
                      ? "bg-sky-50 text-[#0066cc] border border-sky-200"
                      : "bg-amber-50 text-amber-700 border border-amber-200"
                  }`}
                >
                  {order.orderStatus === "cancelled"
                    ? "Cancelled"
                    : isDelivered
                    ? "Delivered"
                    : isShipped
                    ? "In Transit"
                    : "Preparing Package"}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-montserrat font-medium tracking-wide">
                Order ID: {order.id}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={fetchTracking}
              disabled={loading}
              title="Refresh tracking status"
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-200/70 rounded-lg transition-colors cursor-pointer"
            >
              <RefreshCw size={16} className={loading ? "animate-spin text-[#0066cc]" : ""} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 rounded-lg transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-sm font-open-sans bg-white">
          {/* Order Cancelled Notice */}
          {order.orderStatus === "cancelled" && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle size={20} className="text-rose-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <h4 className="font-bold font-montserrat text-rose-900 text-sm">
                  Order Cancelled
                </h4>
                <p className="text-rose-800 mt-1 leading-relaxed">
                  {(order as any).cancellation?.reason || "This order has been cancelled by the customer."}
                  {waybill && " Forward transit has been halted and Delhivery Return-to-Origin (RTO) has been initiated."}
                </p>
                {waybill && (
                  <p className="text-rose-700 font-semibold mt-1.5">
                    Notice: If a Delhivery courier attempts delivery at your doorstep, please refuse handover citing &quot;Order Cancelled&quot;.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Top Quick Status Highlight */}
          <div className="bg-gradient-to-r from-sky-50 via-blue-50/50 to-white border border-sky-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
            <div>
              <span className="text-xs font-semibold font-montserrat uppercase tracking-wider text-[#0066cc]">
                Estimated Delivery Date
              </span>
              <div className="text-lg sm:text-xl font-bold font-montserrat text-[#0F1729] mt-0.5">
                {order.orderStatus === "cancelled"
                  ? "Order Cancelled (RTO in progress)"
                  : isDelivered
                  ? "Delivered to Customer"
                  : estimatedDelivery}
              </div>
              <p className="text-xs text-slate-600 mt-0.5 flex items-center gap-1.5 font-open-sans">
                <MapPin size={13} className="text-rose-500 shrink-0" />
                Shipping to {order.customer.city}, {order.customer.state} ({order.customer.pincode})
              </p>
            </div>

            {waybill ? (
              <div className="sm:text-right shrink-0">
                <span className="text-[11px] text-slate-500 block font-open-sans">Delhivery Waybill (AWB)</span>
                <div className="flex items-center sm:justify-end gap-1.5 mt-0.5">
                  <span className="font-montserrat text-xs font-bold text-slate-800 bg-white px-2 py-1 rounded border border-slate-200 tracking-wider shadow-2xs">
                    {waybill}
                  </span>
                  <button
                    onClick={copyAwb}
                    className="p-1 hover:bg-slate-200 rounded text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                    title="Copy Waybill"
                  >
                    {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg font-medium">
                Waybill being generated by dispatch desk
              </div>
            )}
          </div>

          {/* Stepper Progress Bar */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 font-montserrat">
              Fulfillment Journey
            </h4>

            <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-[11px] sm:before:left-[15px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-200">
              {steps.map((st, idx) => {
                const isCurrent = currentStep === idx + 1;
                return (
                  <div key={st.title} className="relative flex items-start gap-3">
                    <div
                      className={`absolute -left-[23px] sm:-left-[27px] w-6 h-6 rounded-full flex items-center justify-center transition-colors border shadow-2xs ${
                        st.done
                          ? "bg-emerald-600 border-emerald-600 text-white"
                          : isCurrent
                          ? "bg-[#0066cc] border-[#0066cc] text-white ring-4 ring-blue-100"
                          : "bg-slate-100 border-slate-300 text-slate-400"
                      }`}
                    >
                      {st.done ? (
                        <CheckCircle2 size={14} className="stroke-[3]" />
                      ) : (
                        <span className="text-[11px] font-bold font-montserrat">{idx + 1}</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div
                        className={`text-sm font-semibold font-montserrat ${
                          st.done || isCurrent ? "text-slate-900" : "text-slate-400"
                        }`}
                      >
                        {st.title}
                      </div>
                      <div className="text-xs text-slate-500 font-open-sans">{st.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Live Delhivery Scans (if available) */}
          {liveData?.scans && liveData.scans.length > 0 && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3 flex items-center gap-1.5 font-montserrat">
                <Clock size={13} className="text-[#0066cc]" />
                Recent Courier Checkpoints
              </h4>
              <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                {liveData.scans.slice(0, 5).map((scan: any, i: number) => (
                  <div key={i} className="text-xs flex items-start justify-between gap-3 border-b border-slate-200/60 pb-2 last:border-0 last:pb-0">
                    <div>
                      <span className="font-semibold text-slate-800 block">
                        {scan.ScanDetail?.Scan || scan.Scan || "Package in Transit"}
                      </span>
                      <span className="text-slate-500">
                        {scan.ScanDetail?.ScannedLocation || scan.Location || "Transit Hub"}
                      </span>
                    </div>
                    <span className="text-slate-400 font-montserrat text-[11px] shrink-0">
                      {scan.ScanDetail?.ScanDateTime || scan.Date || ""}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* COD Reminder Note */}
          {isCod && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-start gap-3">
              <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs font-open-sans">
                <span className="font-bold text-amber-900 font-montserrat">
                  Cash on Delivery Balance: ₹{codBalance.toLocaleString("en-IN")}
                </span>
                <p className="text-amber-800/90 mt-0.5 leading-relaxed">
                  You paid 10% advance online. Please keep ₹{codBalance.toLocaleString("en-IN")} ready (Cash or UPI) to pay the Delhivery delivery executive at your doorstep.
                </p>
              </div>
            </div>
          )}

          {/* Destination Address Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 font-open-sans">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1 font-montserrat">
              Delivery Address
            </span>
            <p className="text-xs text-slate-700 leading-relaxed">
              <strong className="text-slate-900 font-montserrat">{order.customer.fullName}</strong>
              <br />
              {order.customer.shippingAddress}
              <br />
              {order.customer.city}, {order.customer.state} - {order.customer.pincode}
              <br />
              Phone: +91 {order.customer.phone}
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 sm:px-6 py-4 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3 font-open-sans">
          {waybill ? (
            <a
              href={`https://www.delhivery.com/track/package/${waybill}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-[#0066cc] hover:text-[#0052b3] font-bold font-montserrat transition-colors"
            >
              <span>Delhivery Official Portal</span>
              <ExternalLink size={13} />
            </a>
          ) : (
            <span className="text-xs text-slate-400">Tracking live updates enabled</span>
          )}

          <div className="flex items-center gap-2">
            {!isDelivered && order.orderStatus !== "cancelled" && onCancelOrder && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onCancelOrder(order);
                }}
                className="px-3.5 py-2 text-xs font-bold font-montserrat rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors cursor-pointer"
              >
                Cancel Order
              </button>
            )}

            {isDelivered && onFileDispute && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onFileDispute(order);
                }}
                className="px-3.5 py-2 text-xs font-bold font-montserrat rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors cursor-pointer"
              >
                Return / Replace
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold font-montserrat uppercase tracking-wider rounded-lg bg-[#0066cc] hover:bg-[#0052b3] text-white transition-colors cursor-pointer shadow-xs"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
