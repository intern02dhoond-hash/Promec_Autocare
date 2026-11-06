"use client";

import { useState } from "react";
import { X, AlertCircle, AlertTriangle, CheckCircle2, Truck, Package, ShieldAlert, ArrowRight } from "lucide-react";
import { PromecOrder } from "@/lib/orderStore";

interface CancelOrderModalProps {
  order: PromecOrder | null;
  isOpen: boolean;
  customerPhone: string;
  onClose: () => void;
  onOrderCancelled: (updatedOrder: PromecOrder) => void;
}

const CANCELLATION_REASONS = [
  { id: "MISTAKE", label: "Placed order by mistake / accidental duplicate" },
  { id: "DELAY", label: "Delivery taking longer than expected / changed mind" },
  { id: "ADDRESS_CHANGE", label: "Need to change delivery address or contact number" },
  { id: "FOUND_ALTERNATIVE", label: "Purchased another washer / alternative equipment" },
  { id: "FINANCIAL", label: "Financial / personal reasons" },
  { id: "OTHER", label: "Other reason" },
];

export default function CancelOrderModal({
  order,
  isOpen,
  customerPhone,
  onClose,
  onOrderCancelled,
}: CancelOrderModalProps) {
  const [selectedReason, setSelectedReason] = useState(CANCELLATION_REASONS[0].label);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen || !order) return null;

  const isShipped = order.orderStatus === "shipped" || Boolean(order.fulfillment?.waybill);
  const waybill = order.fulfillment?.waybill || "";
  const isCod = order.payment?.method === "COD_ADVANCE";
  const amountPaidInINR = Math.round((order.payment?.amountPaidInPaise || 0) / 100);

  const handleConfirmCancel = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch(`/aquaforceforautocare/api/account/orders/${encodeURIComponent(order.id)}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: customerPhone,
          reason: selectedReason,
          notes: notes.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to cancel order");
      }

      setSuccessMessage(data.message || "Order cancelled successfully.");
      if (data.order) {
        onOrderCancelled(data.order);
      }
    } catch (err: any) {
      setError(err.message || "Failed to cancel order. Please try again or contact support.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setError("");
    setSuccessMessage(null);
    setNotes("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200 font-open-sans">
      <div className="relative w-full max-w-[560px] max-h-[90vh] bg-white border border-slate-200 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-900 font-open-sans">
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-100 bg-slate-50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
              <ShieldAlert size={20} />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold font-montserrat text-[#0F1729]">
                Cancel Order
              </h3>
              <p className="text-xs text-slate-500 font-open-sans">
                Order ID: <span className="font-bold text-slate-900 font-montserrat">{order.id}</span>
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 rounded-lg transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        {successMessage ? (
          /* Success Screen */
          <div className="p-6 sm:p-8 text-center space-y-5 overflow-y-auto bg-white">
            <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 size={36} />
            </div>

            <div>
              <span className="text-xs font-bold font-montserrat uppercase tracking-wider text-emerald-600">
                Cancellation Confirmed
              </span>
              <h4 className="text-xl sm:text-2xl font-bold font-montserrat text-[#0F1729] mt-1">
                Order Cancelled
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 max-w-[460px] mx-auto mt-2 leading-relaxed font-open-sans">
                {successMessage}
              </p>
            </div>

            {isShipped && waybill && (
              <div className="bg-amber-50/90 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-900 text-left space-y-1.5 font-open-sans">
                <div className="flex items-center gap-2 font-bold font-montserrat text-amber-950">
                  <Truck size={15} className="text-amber-700" />
                  <span>Delhivery Doorstep Delivery Instructions</span>
                </div>
                <p className="text-[11.5px] text-amber-800 leading-relaxed">
                  Your shipment (AWB: <strong className="font-montserrat text-amber-950">{waybill}</strong>) has been flagged for Return to Origin (RTO). If the delivery rider reaches your address before the system turns it back, please refuse the package by stating <em>&quot;Order was cancelled&quot;</em>.
                </p>
              </div>
            )}

            {amountPaidInINR > 0 && (
              <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-3.5 text-xs text-blue-900 text-left font-open-sans">
                <span className="font-bold font-montserrat block text-blue-950 mb-0.5">
                  Refund of ₹{amountPaidInINR.toLocaleString("en-IN")}
                </span>
                <p className="text-[11.5px] text-blue-800 leading-relaxed">
                  {isCod
                    ? "Your 10% COD advance payment will be reversed back to your original payment method within 3 to 5 business days."
                    : "Your full prepaid payment will be credited back to your original payment method within 3 to 5 business days."}
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={handleClose}
              className="w-full py-3 bg-[#0066cc] hover:bg-[#0052b3] text-white font-bold font-montserrat uppercase tracking-wider text-xs rounded-xl shadow-md shadow-blue-600/20 transition-all cursor-pointer"
            >
              Done &amp; Return to Account
            </button>
          </div>
        ) : (
          /* Confirmation Form */
          <form onSubmit={handleConfirmCancel} className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs bg-white font-open-sans">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2 font-open-sans">
                <AlertCircle size={15} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* In-Transit Alert Notice */}
            {isShipped ? (
              <div className="bg-amber-50 border border-amber-200/90 rounded-xl p-3.5 space-y-2 text-amber-900 font-open-sans">
                <div className="flex items-center gap-2 font-bold font-montserrat text-amber-950 text-xs">
                  <Truck size={16} className="text-amber-700 shrink-0" />
                  <span>Shipment is In-Transit with Delhivery Express</span>
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  Waybill AWB: <strong className="font-montserrat text-amber-950">{waybill || "Assigned"}</strong>. Forward transit will be stopped immediately and marked for Return to Origin (RTO).
                </p>
                <div className="p-2 bg-white/80 rounded-lg border border-amber-200/60 text-[10.5px] text-amber-900 leading-relaxed">
                  <strong>Important:</strong> If a courier executive calls or attempts delivery at your doorstep, please <strong>refuse delivery</strong> citing <em>&quot;Order Cancelled&quot;</em>.
                </div>
              </div>
            ) : (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 text-blue-900 space-y-1 font-open-sans">
                <span className="font-bold font-montserrat block text-xs text-blue-950">Pre-Dispatch Cancellation</span>
                <p className="text-[11.5px] text-blue-800 leading-relaxed">
                  Your order is currently processing at our warehouse. It will be cancelled before courier dispatch and any payment made will be refunded.
                </p>
              </div>
            )}

            {/* Reason Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 font-montserrat">
                Please select reason for cancellation *
              </label>
              <div className="space-y-1.5">
                {CANCELLATION_REASONS.map((r) => {
                  const isSelected = selectedReason === r.label;
                  return (
                    <label
                      key={r.id}
                      onClick={() => setSelectedReason(r.label)}
                      className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? "bg-rose-50/70 border-rose-300 ring-1 ring-rose-400 text-slate-900 font-medium"
                          : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700"
                      }`}
                    >
                      <input
                        type="radio"
                        name="cancellationReason"
                        checked={isSelected}
                        onChange={() => setSelectedReason(r.label)}
                        className="accent-rose-600"
                      />
                      <span className="text-xs">{r.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Additional Notes */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 font-montserrat">
                Additional Comments / Feedback (Optional)
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Share any feedback that helps us improve our service..."
                className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-rose-400 rounded-xl p-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none leading-relaxed font-open-sans shadow-2xs"
              />
            </div>

            {/* Payment / Refund summary */}
            {amountPaidInINR > 0 && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                <span className="text-slate-600">Refund Amount ({isCod ? "10% COD Advance" : "Full Prepaid"}):</span>
                <strong className="text-slate-900 font-montserrat text-sm">₹{amountPaidInINR.toLocaleString("en-IN")}</strong>
              </div>
            )}

            {/* Actions */}
            <div className="pt-2 flex items-center justify-end gap-3 font-open-sans">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer font-montserrat"
              >
                Keep Order
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 text-xs font-bold font-montserrat uppercase tracking-wider bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white rounded-xl shadow-md shadow-rose-600/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <span>Cancelling Order...</span>
                ) : (
                  <>
                    <AlertCircle size={13} />
                    <span>Confirm Order Cancellation</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
