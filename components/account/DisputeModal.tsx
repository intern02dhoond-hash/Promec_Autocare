"use client";

import { useState } from "react";
import { X, ShieldAlert, CheckCircle2, AlertCircle, Wrench, Package, Truck, Sparkles, Send } from "lucide-react";
import { PromecOrder } from "@/lib/orderStore";
import { DisputeReason, PreferredResolution } from "@/lib/disputeStore";

interface DisputeModalProps {
  orders: PromecOrder[];
  preSelectedOrder?: PromecOrder | null;
  customerPhone: string;
  customerName: string;
  isOpen: boolean;
  onClose: () => void;
  onDisputeCreated: (newDispute: any) => void;
}

const ISSUE_OPTIONS: Array<{
  id: DisputeReason;
  title: string;
  desc: string;
  icon: any;
}> = [
  {
    id: "DAMAGED_IN_TRANSIT",
    title: "Damaged / Broken in Transit",
    desc: "Casing crack, broken lance, or transit impact damage",
    icon: ShieldAlert,
  },
  {
    id: "PRESSURE_PUMP_ISSUE",
    title: "Low Pressure / Pump Priming",
    desc: "Motor runs but pressure does not build to 1400 PSI",
    icon: Wrench,
  },
  {
    id: "MISSING_ACCESSORIES",
    title: "Missing Parts or Accessories",
    desc: "Foam cannon, 25V battery, quick-connect nozzles, etc.",
    icon: Package,
  },
  {
    id: "BATTERY_CHARGER_ISSUE",
    title: "Battery or Charger Issue",
    desc: "Battery won't charge or runtime seems short",
    icon: AlertCircle,
  },
  {
    id: "WRONG_ITEM_COLOR",
    title: "Wrong Variant or Color",
    desc: "Received different color or model than ordered",
    icon: Sparkles,
  },
  {
    id: "COURIER_DELAY_DELIVERY",
    title: "Delivery Delay / Undelivered",
    desc: "Courier marked delivered or stuck in transit for too long",
    icon: Truck,
  },
];

const RESOLUTION_OPTIONS: Array<{
  id: PreferredResolution;
  title: string;
  badge: string;
}> = [
  {
    id: "express_replacement",
    title: "Express Unit Replacement (Doorstep Swap)",
    badge: "Fastest • Recommended",
  },
  {
    id: "send_missing_parts",
    title: "Express Dispatch of Missing / Defective Parts",
    badge: "Courier Dispatch in 24h",
  },
  {
    id: "technician_call",
    title: "Priority Video Technician Call & Troubleshooting",
    badge: "Within 30 Mins",
  },
  {
    id: "refund",
    title: "Dispute Claim & Return / Refund",
    badge: "Under 7-Day Guarantee",
  },
];

export default function DisputeModal({
  orders,
  preSelectedOrder,
  customerPhone,
  customerName,
  isOpen,
  onClose,
  onDisputeCreated,
}: DisputeModalProps) {
  const [selectedOrderId, setSelectedOrderId] = useState<string>(
    preSelectedOrder?.id || (orders.length > 0 ? orders[0].id : "")
  );
  const [reason, setReason] = useState<DisputeReason>("DAMAGED_IN_TRANSIT");
  const [resolution, setResolution] = useState<PreferredResolution>("express_replacement");
  const [description, setDescription] = useState("");
  const [unboxingVideo, setUnboxingVideo] = useState("");
  const [testingVideo, setTestingVideo] = useState("");
  const [customerReview, setCustomerReview] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [createdCase, setCreatedCase] = useState<any>(null);

  if (!isOpen) return null;

  const activeOrder = orders.find((o) => o.id === selectedOrderId) || preSelectedOrder || orders[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setError("Please describe the issue in detail so our team can resolve it immediately.");
      return;
    }
    if (resolution !== "refund" && !testingVideo.trim()) {
      setError("Please provide the Testing Video of the washer system along with vacuum.");
      return;
    }
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/aquaforceforautocare/api/account/disputes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: selectedOrderId || activeOrder?.id,
          phone: customerPhone,
          fullName: customerName,
          type: resolution === "refund" ? "dispute" : "replacement",
          reason,
          preferredResolution: resolution,
          description,
          unboxingVideo: unboxingVideo.trim(),
          testingVideo: testingVideo.trim(),
          customerReview: customerReview.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setCreatedCase(data.dispute);
        onDisputeCreated(data.dispute);
      } else {
        setError(data.error || "Failed to submit request");
      }
    } catch (err: any) {
      setError(err.message || "Failed to communicate with care system");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setCreatedCase(null);
    setDescription("");
    setError("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 font-open-sans">
      <div className="relative w-full max-w-[650px] max-h-[92vh] bg-white border border-slate-200 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-900 font-open-sans">
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
              <ShieldAlert size={20} />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold font-montserrat text-[#0F1729]">
                File a Replacement / Dispute
              </h3>
              <p className="text-xs text-slate-500 font-open-sans">
                PROMEC 1-Year Pan-India Warranty & 7-Day Hassle-Free Replacement
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

        {/* Content */}
        {createdCase ? (
          /* Success Screen */
          <div className="p-6 sm:p-8 text-center space-y-5 overflow-y-auto bg-white">
            <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 size={36} />
            </div>

            <div>
              <span className="text-xs font-bold font-montserrat uppercase tracking-wider text-emerald-600">
                Request Registered Successfully
              </span>
              <h4 className="text-xl sm:text-2xl font-bold font-montserrat text-[#0F1729] mt-1">
                Case ID: {createdCase.id}
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 max-w-[480px] mx-auto mt-2 leading-relaxed font-open-sans">
                Thank you, <strong className="text-slate-900">{customerName}</strong>. Your replacement/dispute claim has been prioritized by our Quality Engineering team.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-left space-y-2 text-xs font-open-sans">
              <div className="flex justify-between border-b border-slate-200/60 pb-2">
                <span className="text-slate-500">Target Order:</span>
                <span className="font-montserrat font-bold text-slate-900 tracking-wide">{createdCase.orderId}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-2">
                <span className="text-slate-500">Category:</span>
                <span className="font-semibold text-slate-800">{createdCase.reasonLabel}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-2">
                <span className="text-slate-500">Requested Resolution:</span>
                <span className="font-bold text-[#0066cc] uppercase font-montserrat">
                  {createdCase.preferredResolution.replace(/_/g, " ")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status:</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-montserrat bg-amber-50 text-amber-800 border border-amber-200 uppercase">
                  Under QA Review
                </span>
              </div>
            </div>

            <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3.5 text-xs text-[#005DA6] text-left leading-relaxed font-open-sans">
              💡 <strong>Next Step:</strong> You do not need to do anything. We will update this case live inside your account and dispatch any replacement unit or technician call within 24 hours.
            </div>

            <button
              onClick={handleClose}
              className="w-full py-3 bg-[#0066cc] hover:bg-[#0052b3] text-white font-bold font-montserrat uppercase tracking-wider text-xs rounded-xl shadow-md shadow-blue-600/20 transition-all cursor-pointer"
            >
              Back to My Account
            </button>
          </div>
        ) : (
          /* Request Form */
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-5 text-sm bg-white font-open-sans">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2 font-open-sans">
                <AlertCircle size={15} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* 1. Order Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 font-montserrat">
                1. Select Order
              </label>
              {orders.length > 1 ? (
                <select
                  value={selectedOrderId}
                  onChange={(e) => setSelectedOrderId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#0066cc] rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none font-open-sans shadow-2xs"
                >
                  {orders.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.id} • {o.items?.[0]?.productName || "Aquaforce 1400"} • ₹
                      {o.pricing.finalTotalInINR.toLocaleString("en-IN")}
                    </option>
                  ))}
                </select>
              ) : activeOrder ? (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-montserrat font-bold text-slate-900 tracking-wide">{activeOrder.id}</span>
                    <span className="text-slate-500 block text-[11px] font-open-sans mt-0.5">
                      {activeOrder.items?.[0]?.productName || "Aquaforce 1400"} (
                      {activeOrder.items?.[0]?.color || "Yellow"})
                    </span>
                  </div>
                  <span className="font-bold font-montserrat text-emerald-700">
                    ₹{activeOrder.pricing.finalTotalInINR.toLocaleString("en-IN")}
                  </span>
                </div>
              ) : (
                <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  No previous orders found for this phone number.
                </div>
              )}
            </div>

            {/* 2. Issue Category */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 font-montserrat">
                2. Select Issue Type
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {ISSUE_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = reason === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setReason(opt.id)}
                      className={`text-left p-3 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? "bg-blue-50/80 border-[#0066cc] ring-2 ring-blue-500/20 shadow-2xs"
                          : "bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-slate-100/70"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon
                          size={16}
                          className={isSelected ? "text-[#0066cc]" : "text-slate-500"}
                        />
                        <span
                          className={`text-xs font-bold font-montserrat ${
                            isSelected ? "text-[#0F1729]" : "text-slate-700"
                          }`}
                        >
                          {opt.title}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 leading-snug pl-6 font-open-sans">
                        {opt.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Preferred Resolution */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 font-montserrat">
                3. Desired Resolution
              </label>
              <div className="space-y-2">
                {RESOLUTION_OPTIONS.map((resOpt) => {
                  const isSelected = resolution === resOpt.id;
                  return (
                    <label
                      key={resOpt.id}
                      onClick={() => setResolution(resOpt.id)}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? "bg-blue-50/80 border-[#0066cc] ring-1 ring-[#0066cc]"
                          : "bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-slate-100/70"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="resolution"
                          checked={isSelected}
                          onChange={() => setResolution(resOpt.id)}
                          className="accent-[#0066cc]"
                        />
                        <span
                          className={`text-xs font-semibold ${
                            isSelected ? "text-slate-900 font-montserrat" : "text-slate-700 font-open-sans"
                          }`}
                        >
                          {resOpt.title}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold font-montserrat px-2 py-0.5 rounded-full bg-white text-slate-700 border border-slate-200 shadow-2xs">
                        {resOpt.badge}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* 4. Description */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 font-montserrat">
                4. Problem Details &amp; Notes
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain what happened (e.g. package arrived damaged, pump won't build pressure, or missing lance). Any details help us expedite your replacement."
                className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#0066cc] rounded-xl p-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none leading-relaxed font-open-sans shadow-2xs"
                required
              />
            </div>

            {/* 5. Verification Checklist (Required for Claims & Replacements) */}
            <div className="p-3.5 sm:p-4 bg-amber-50/70 border border-amber-200/90 rounded-2xl space-y-3.5">
              <div className="flex items-center gap-2">
                <ShieldAlert size={17} className="text-amber-700 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-950 font-montserrat">
                    5. {resolution === "refund" ? "Product Photos / Proof (Optional)" : "Verification Proofs for Claim & Replacement"}
                  </h4>
                  <p className="text-[11px] text-amber-800 font-open-sans">
                    {resolution === "refund"
                      ? "Helpful for faster approval. If not available now, you can share via WhatsApp to +91 73875 88963:"
                      : "Testing video is strictly required to verify the issue and approve your replacement:"}
                  </p>
                </div>
              </div>

              <div className="space-y-3 text-xs font-open-sans">
                {/* 1. Unboxing Video (Optional) */}
                <div className="p-3 bg-white rounded-xl border border-slate-200/80 space-y-1.5 shadow-2xs">
                  <label className="font-bold text-slate-900 font-montserrat flex items-center justify-between text-xs">
                    <span>1. Unboxing Video of Washer System</span>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold uppercase">Optional</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Paste Google Drive / YouTube link, or type 'Sent via WhatsApp to 7387588963' (Optional)"
                    value={unboxingVideo}
                    onChange={(e) => setUnboxingVideo(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#0066cc] rounded-lg p-2.5 text-xs text-slate-900 outline-none transition-all font-open-sans"
                  />
                  <p className="text-[10.5px] text-slate-500">
                    If available, capture box unsealing and the machine + all accessories inside.
                  </p>
                </div>

                {/* 2. Testing Video with Vacuum */}
                <div className="p-3 bg-white rounded-xl border border-amber-200/70 space-y-1.5 shadow-2xs">
                  <label className="font-bold text-slate-900 font-montserrat flex items-center justify-between text-xs">
                    <span>2. Testing Video of Washer System Along with Vacuum {resolution !== "refund" && "*"}</span>
                    {resolution === "refund" ? (
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold uppercase">Optional / WhatsApp</span>
                    ) : (
                      <span className="text-[10px] bg-rose-100 text-rose-700 px-2 py-0.5 rounded font-bold uppercase">Mandatory</span>
                    )}
                  </label>
                  <input
                    type="text"
                    required={resolution !== "refund"}
                    placeholder="Paste video link showing pressure output and vacuum in operation"
                    value={testingVideo}
                    onChange={(e) => setTestingVideo(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#0066cc] rounded-lg p-2.5 text-xs text-slate-900 outline-none transition-all font-open-sans"
                  />
                  <p className="text-[10.5px] text-slate-500">
                    Demonstrate the high pressure spray output and the vacuum suction unit running.
                  </p>
                </div>
              </div>
            </div>

            {/* Quality Promise Note */}
            <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start gap-2.5 font-open-sans">
              <ShieldAlert size={16} className="text-[#0066cc] shrink-0 mt-0.5" />
              <span>
                <strong>{resolution === "refund" ? "7-Day Return Guarantee:" : "Zero Delay Policy:"}</strong>{" "}
                {resolution === "refund"
                  ? "Eligible orders can be returned within 7 days of delivery. Our logistics team will review and initiate a Delhivery doorstep pickup."
                  : "Under PROMEC India Warranty, genuine replacement parts or replacement units are approved directly without courier return friction."}
              </span>
            </div>

            {/* Submit Action */}
            <div className="pt-2 flex items-center justify-end gap-3 font-open-sans">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer font-montserrat"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 text-xs font-bold font-montserrat uppercase tracking-wider bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white rounded-xl shadow-md shadow-rose-600/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <span>Processing...</span>
                ) : (
                  <>
                    <Send size={13} />
                    <span>{resolution === "refund" ? "Submit Return Request" : "Submit Claim Now"}</span>
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
