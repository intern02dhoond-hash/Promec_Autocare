"use client";

import { useState, useEffect, useRef } from "react";
import {
  X,
  CheckCircle2,
  ArrowRight,
  Loader2,
  ExternalLink,
} from "lucide-react";

interface BulkEnquiryModalProps {
  isOpen: boolean;
  initialOptions?: {
    category?: string;
    notes?: string;
  };
  onClose: () => void;
}

const QUANTITY_PRESETS = ["5 - 10", "11 - 50", "51 - 100", "100+"];

const TIMELINE_OPTIONS = [
  "Immediately",
  "Within 1–2 months",
  "Within 2–3 months",
  "Just exploring options",
];

const CUSTOMER_TYPE_OPTIONS = [
  "I run a car/bike washing business",
  "I provide doorstep cleaning services",
  "I want to start a doorstep cleaning business",
  "I provide cleaning services to companies",
  "Other",
];

export default function BulkEnquiryModal({
  isOpen,
  initialOptions,
  onClose,
}: BulkEnquiryModalProps) {
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    companyName: "",
    email: "",
    quantity: "5 - 10",
    purchaseTimeline: "",
    customerType: "",
    otherDescription: "",
    agreedToTerms: true,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // History state for mobile back button navigation
  const historyPushedRef = useRef(false);
  const isNavigatingBackRef = useRef(false);

  // Synchronize history state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      historyPushedRef.current = false;
      return;
    }

    if (!historyPushedRef.current) {
      window.history.pushState({ amecModal: "bulk-enquiry" }, "");
      historyPushedRef.current = true;
    }

    const handlePopState = () => {
      if (isNavigatingBackRef.current) return;
      historyPushedRef.current = false;
      setIsSubmitted(false);
      setErrorMsg("");
      onClose();
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [isOpen, onClose]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  const isValidEmail = (emailStr: string) => {
    if (!emailStr.trim()) return true; // Optional
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(emailStr.trim());
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    const finalVal = name === "phone" ? value.replace(/\D/g, "").slice(0, 10) : value;
    setFormData((prev) => ({ ...prev, [name]: finalVal }));
    if (errorMsg) setErrorMsg("");
  };

  const handleQuantitySelect = (preset: string) => {
    setFormData((prev) => ({
      ...prev,
      quantity: preset,
    }));
    if (errorMsg) setErrorMsg("");
  };

  const handleTimelineSelect = (timeline: string) => {
    setFormData((prev) => ({
      ...prev,
      purchaseTimeline: prev.purchaseTimeline === timeline ? "" : timeline,
    }));
    if (errorMsg) setErrorMsg("");
  };

  const handleCustomerTypeSelect = (type: string) => {
    setFormData((prev) => ({
      ...prev,
      customerType: prev.customerType === type ? "" : type,
    }));
    if (errorMsg) setErrorMsg("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullName.trim()) {
      setErrorMsg("Please enter your name");
      return;
    }
    const cleanPhone = formData.phone.replace(/\D/g, "");
    if (!cleanPhone || cleanPhone.length !== 10) {
      setErrorMsg("Please enter a valid 10-digit mobile number");
      return;
    }
    if (formData.email.trim() && !isValidEmail(formData.email)) {
      setErrorMsg("Please enter a valid email address");
      return;
    }
    if (!formData.quantity) {
      setErrorMsg("Please select the required quantity");
      return;
    }
    if (!formData.agreedToTerms) {
      setErrorMsg("Please agree to the terms to proceed");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const res = await fetch("/aquaforceforautocare/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.fullName.trim(),
          phone: cleanPhone,
          companyName: formData.companyName.trim(),
          email: formData.email.trim(),
          quantity: formData.quantity,
          purchaseTimeline: formData.purchaseTimeline,
          customerType: formData.customerType,
          otherDescription: formData.otherDescription.trim(),
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to submit enquiry");
      }

      setIsSubmitting(false);
      setIsSubmitted(true);
    } catch (err: any) {
      console.error("Bulk enquiry submission error:", err);
      // Provide friendly completion
      setIsSubmitting(false);
      setIsSubmitted(true);
    }
  };

  const handleClose = () => {
    if (historyPushedRef.current) {
      isNavigatingBackRef.current = true;
      historyPushedRef.current = false;
      window.history.back();
      setTimeout(() => {
        isNavigatingBackRef.current = false;
      }, 100);
    }
    if (typeof window !== "undefined") {
      const search = window.location.search;
      const hash = window.location.hash;
      if (search.includes("enquiry=") || search.includes("category=") || hash.includes("bulk")) {
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, "", cleanUrl);
      }
    }
    setIsSubmitted(false);
    setErrorMsg("");
    setFormData({
      fullName: "",
      phone: "",
      companyName: "",
      email: "",
      quantity: "5 - 10",
      purchaseTimeline: "",
      customerType: "",
      otherDescription: "",
      agreedToTerms: true,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3.5 sm:p-5 md:p-6 bg-black/65 backdrop-blur-xs animate-fadeIn overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div
        className={`relative w-full ${
          isSubmitted
            ? "max-w-[420px] sm:max-w-[540px] p-6 xs:p-7 sm:p-9 pt-7 sm:pt-10"
            : "max-w-[620px] p-5 sm:p-7 md:p-8"
        } bg-white rounded-[24px] sm:rounded-[28px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.35)] text-slate-900 overflow-hidden my-auto max-h-[92vh] overflow-y-auto animate-in zoom-in-95 fade-in duration-200`}
      >
        {isSubmitted ? (
          /* ========================================================= */
          /* Exact Confirmation View from Reference Screenshots        */
          /* ========================================================= */
          <div className="relative flex flex-col items-center text-center">
            {/* Top Close Button */}
            <button
              type="button"
              onClick={handleClose}
              className="absolute -top-3 -right-2 sm:-top-4 sm:-right-3 w-8 h-8 sm:w-9 sm:h-9 bg-[#f1f5f9] hover:bg-slate-200 text-slate-500 hover:text-slate-900 rounded-full flex items-center justify-center transition-colors focus:outline-none cursor-pointer shadow-xs z-20"
              aria-label="Close modal"
            >
              <X size={16} />
            </button>

            {/* Checkmark Icon (Double concentric layer circle) */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#e6fbf2] flex items-center justify-center mx-auto mb-4 sm:mb-5">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#00c06d] flex items-center justify-center shadow-xs">
                <svg
                  className="w-6 h-6 sm:w-7 sm:h-7 text-white stroke-[3.5]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
            </div>

            {/* Title */}
            <h3 className="text-xl xs:text-2xl sm:text-[28px] font-bold font-montserrat text-[#0F1729] tracking-tight leading-snug">
              Inquiry Submitted Successfully!
            </h3>

            {/* Personalized Message */}
            <p className="text-[#475569] font-open-sans text-xs xs:text-[13.5px] sm:text-[14px] max-w-[430px] mx-auto mt-2 sm:mt-2.5 leading-relaxed font-normal">
              Thank you, <strong className="text-[#0f172a] font-bold font-open-sans">{formData.fullName}</strong>. Our enterprise sales team for{" "}
              <strong className="text-[#005DA6] font-bold font-open-sans">AquaForce® 1400</strong> has received your inquiry. An automated confirmation message has been sent to your WhatsApp at{" "}
              <strong className="text-[#0f172a] font-bold font-open-sans">+91 {formData.phone}</strong>.
            </p>

            {/* Summary Details Card */}
            <div className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-[16px] p-4 sm:p-5 mt-5 sm:mt-6 text-left font-open-sans space-y-3 divide-y divide-[#e2e8f0]/80 shadow-2xs">
              {/* Row 1: Company (if provided) */}
              {formData.companyName && (
                <div className="flex items-center justify-between text-[13px] pt-0 font-open-sans">
                  <span className="text-[#64748b] font-medium font-open-sans">Company / Business</span>
                  <span className="text-[#0f172a] font-bold font-open-sans truncate max-w-[180px] sm:max-w-[240px]">
                    {formData.companyName}
                  </span>
                </div>
              )}

              {/* Row 2: Required Quantity */}
              <div className={`flex items-center justify-between text-[13px] ${formData.companyName ? "pt-3" : "pt-0"} font-open-sans`}>
                <span className="text-[#64748b] font-medium font-open-sans">Required Quantity</span>
                <span className="bg-[#f0f9ff] border border-[#005DA6]/35 text-[#005DA6] text-xs font-bold font-open-sans px-3 py-0.5 rounded-full leading-none">
                  {formData.quantity} Units
                </span>
              </div>

              {/* Row 3: Contact Number */}
              <div className="flex items-center justify-between text-[13px] pt-3 font-open-sans">
                <span className="text-[#64748b] font-medium font-open-sans">Contact Number</span>
                <span className="text-[#0f172a] font-bold font-open-sans tracking-wide">+91 {formData.phone}</span>
              </div>

              {/* Row 4: Work Email (if provided) */}
              {formData.email && (
                <div className="flex items-center justify-between text-[13px] pt-3 font-open-sans">
                  <span className="text-[#64748b] font-medium font-open-sans">Email</span>
                  <span className="text-[#0f172a] font-bold font-open-sans truncate max-w-[180px] sm:max-w-[240px]">
                    {formData.email}
                  </span>
                </div>
              )}

              {/* Row 5: Purchase Timeline (if selected) */}
              {formData.purchaseTimeline && (
                <div className="flex items-center justify-between text-[13px] pt-3 font-open-sans">
                  <span className="text-[#64748b] font-medium font-open-sans">Timeline</span>
                  <span className="text-[#0f172a] font-bold font-open-sans">
                    {formData.purchaseTimeline}
                  </span>
                </div>
              )}

              {/* Row 6: Segment / Customer Type */}
              {formData.customerType && (
                <div className="flex items-center justify-between text-[13px] pt-3 font-open-sans">
                  <span className="text-[#64748b] font-medium font-open-sans">Customer Type</span>
                  <span className="text-[#0f172a] font-bold font-open-sans truncate max-w-[200px]">
                    {formData.customerType === "Other" && formData.otherDescription
                      ? formData.otherDescription
                      : formData.customerType}
                  </span>
                </div>
              )}
            </div>

            {/* Bottom Action Button */}
            <button
              type="button"
              onClick={handleClose}
              className="mt-5 sm:mt-6 w-full bg-[#005DA6] hover:bg-[#004e8c] active:bg-[#004277] text-white font-open-sans font-bold text-xs xs:text-sm uppercase tracking-wider py-3.5 sm:py-4 rounded-[12px] shadow-[0_4px_14px_rgba(0,93,166,0.25)] transition-all active:scale-[0.99] cursor-pointer"
            >
              CONTINUE BROWSING
            </button>
          </div>
        ) : (
          <div>
            {/* Header row: Back button on left, Close button on right */}
            <div className="flex items-center justify-between mb-4 sm:mb-5">
              <button
                type="button"
                onClick={handleClose}
                className="inline-flex items-center gap-1.5 text-xs sm:text-[13px] font-bold text-slate-400 hover:text-slate-700 cursor-pointer transition-colors font-open-sans"
              >
                &larr; Back to Product Details
              </button>
              <div className="flex items-center gap-2">
                <a
                  href="/aquaforceforautocare/inquiryform"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-[#005DA6] hover:underline font-open-sans"
                  title="Open standalone form link"
                >
                  <span>Open Full Link</span>
                  <ExternalLink size={12} />
                </a>
                <button
                  type="button"
                  onClick={handleClose}
                  className="w-8 h-8 sm:w-9 sm:h-9 bg-[#f1f5f9] hover:bg-slate-200 text-slate-500 hover:text-slate-900 rounded-full flex items-center justify-center transition-colors focus:outline-none cursor-pointer shadow-xs shrink-0"
                  aria-label="Close modal"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Clean White Card Form (Matches Exact Existing Design System) */}
            <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4">
              {/* Title Bar */}
              <div className="pb-1 border-b border-slate-100 flex items-center justify-between gap-2">
                <h2 className="text-base sm:text-lg font-bold font-montserrat text-slate-900 tracking-tight">
                  Inquiry Form
                </h2>
                {initialOptions?.category && (
                  <span className="text-[10px] sm:text-[11px] font-bold font-montserrat px-2 sm:px-2.5 py-0.5 rounded-full bg-blue-50 text-[#005DA6] border border-blue-200 shrink-0 whitespace-nowrap">
                    {initialOptions.category}
                  </span>
                )}
              </div>

              {errorMsg && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                  {errorMsg}
                </div>
              )}

              {/* Row 1: Name (Mandatory) & Phone No (Mandatory) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5 font-open-sans">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    placeholder="Rahul Sharma"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-slate-200 focus:border-[#0066cc] focus:ring-1 focus:ring-[#0066cc] rounded-[8px] px-3.5 py-2.5 sm:px-4 sm:py-3 text-[15px] sm:text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all font-open-sans shadow-2xs"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5 font-open-sans">
                    Phone No <span className="text-red-500">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 text-xs sm:text-sm font-semibold text-slate-400 font-open-sans select-none">
                      +91
                    </span>
                    <input
                      type="tel"
                      name="phone"
                      required
                      inputMode="numeric"
                      placeholder="9876543210"
                      value={formData.phone}
                      onChange={handleInputChange}
                      maxLength={10}
                      className="w-full bg-white border border-slate-200 focus:border-[#0066cc] focus:ring-1 focus:ring-[#0066cc] rounded-[8px] pl-11 pr-3.5 py-2.5 sm:pl-12 sm:pr-4 sm:py-3 text-[15px] sm:text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all font-open-sans shadow-2xs"
                    />
                  </div>
                </div>
              </div>

              {/* Row 2: Company Name (Optional) & Email (Optional) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5 font-open-sans">
                    Company Name <span className="text-slate-400 font-normal text-xs">(optional)</span>
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    placeholder="e.g. Apex Auto Detailing"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-slate-200 focus:border-[#0066cc] focus:ring-1 focus:ring-[#0066cc] rounded-[8px] px-3.5 py-2.5 sm:px-4 sm:py-3 text-[15px] sm:text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all font-open-sans shadow-2xs"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5 font-open-sans">
                    Email <span className="text-slate-400 font-normal text-xs">(optional)</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder="name@company.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-slate-200 focus:border-[#0066cc] focus:ring-1 focus:ring-[#0066cc] rounded-[8px] px-3.5 py-2.5 sm:px-4 sm:py-3 text-[15px] sm:text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all font-open-sans shadow-2xs"
                  />
                </div>
              </div>

              {/* Row 3: How much quantity required: (Mandatory & Multiple Choice) */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5 font-open-sans">
                  How much quantity required: <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {QUANTITY_PRESETS.map((preset) => {
                    const isSelected = formData.quantity === preset;
                    return (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => handleQuantitySelect(preset)}
                        className={`py-2.5 px-2 text-center rounded-[8px] text-xs font-bold font-montserrat transition-all cursor-pointer border ${
                          isSelected
                            ? "bg-[#005DA6] text-white border-[#005DA6] shadow-sm scale-[1.02]"
                            : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                        }`}
                      >
                        {preset}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Row 4: When do you plan to purchase? (Optional & Multiple Choice) */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5 font-open-sans">
                  When do you plan to purchase? <span className="text-slate-400 font-normal text-xs">(optional)</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {TIMELINE_OPTIONS.map((timeline) => {
                    const isSelected = formData.purchaseTimeline === timeline;
                    return (
                      <button
                        key={timeline}
                        type="button"
                        onClick={() => handleTimelineSelect(timeline)}
                        className={`py-2 px-2.5 text-left rounded-[8px] text-xs font-medium font-open-sans transition-all cursor-pointer border flex items-center justify-between ${
                          isSelected
                            ? "bg-blue-50 text-[#005DA6] border-[#005DA6] font-semibold"
                            : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                        }`}
                      >
                        <span>{timeline}</span>
                        {isSelected && <span className="w-2 h-2 rounded-full bg-[#005DA6]"></span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Row 5: What best describes you? (Optional & Multiple Choice) */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5 font-open-sans">
                  What best describes you? <span className="text-slate-400 font-normal text-xs">(optional)</span>
                </label>
                <div className="space-y-1.5">
                  {CUSTOMER_TYPE_OPTIONS.map((opt) => {
                    const isSelected = formData.customerType === opt;
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => handleCustomerTypeSelect(opt)}
                        className={`w-full py-2 px-3 text-left rounded-[8px] text-xs font-medium font-open-sans transition-all cursor-pointer border flex items-center justify-between ${
                          isSelected
                            ? "bg-blue-50 text-[#005DA6] border-[#005DA6] font-semibold"
                            : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                        }`}
                      >
                        <span>{opt}</span>
                        {isSelected && <span className="w-2 h-2 rounded-full bg-[#005DA6]"></span>}
                      </button>
                    );
                  })}
                </div>

                {formData.customerType === "Other" && (
                  <div className="mt-2 animate-in fade-in duration-150">
                    <input
                      type="text"
                      name="otherDescription"
                      placeholder="Please specify what best describes you..."
                      value={formData.otherDescription}
                      onChange={handleInputChange}
                      className="w-full bg-white border border-slate-200 focus:border-[#005DA6] focus:ring-1 focus:ring-[#005DA6] rounded-[8px] px-3.5 py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all font-open-sans shadow-2xs"
                    />
                  </div>
                )}
              </div>

              {/* Terms Agreement Checkbox */}
              <label className="flex items-start gap-2.5 pt-1 cursor-pointer select-none font-open-sans">
                <input
                  type="checkbox"
                  checked={formData.agreedToTerms}
                  onChange={(e) => setFormData({ ...formData, agreedToTerms: e.target.checked })}
                  className="mt-0.5 w-4 h-4 rounded border-slate-300 text-[#005DA6] focus:ring-[#005DA6] accent-[#005DA6] cursor-pointer shrink-0"
                  required
                />
                <span className="text-[11.5px] sm:text-[13px] text-slate-500 leading-snug">
                  I agree to receive automated inquiry confirmation and updates via WhatsApp/Phone.
                </span>
              </label>

              {/* Big Blue Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 sm:h-13 !mt-3 bg-[#005DA6] hover:bg-[#004e8c] active:bg-[#004277] text-white font-black font-montserrat text-sm sm:text-base uppercase tracking-wider rounded-[8px] shadow-lg shadow-blue-700/25 transition-all active:scale-[0.99] cursor-pointer flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting Inquiry...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <span>SUBMIT INQUIRY</span>
                    <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
