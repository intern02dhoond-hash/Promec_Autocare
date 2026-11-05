"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Loader2,
  Check,
  ShieldCheck,
  Truck,
  PhoneCall,
  Home,
} from "lucide-react";

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

function InquiryFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryParam =
    searchParams.get("category") || searchParams.get("cat") || "";

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
  const [errorMsg, setErrorMsg] = useState("");

  // Auto-select category if provided via query param
  useEffect(() => {
    if (categoryParam) {
      const lower = categoryParam.toLowerCase();
      if (lower.includes("home")) {
        setFormData((prev) => ({
          ...prev,
          customerType: prev.customerType || "I provide doorstep cleaning services",
        }));
      } else if (lower.includes("corporate") || lower.includes("facility")) {
        setFormData((prev) => ({
          ...prev,
          customerType: prev.customerType || "I provide cleaning services to companies",
        }));
      }
    }
  }, [categoryParam]);

  const isValidEmail = (emailStr: string) => {
    if (!emailStr.trim()) return true; // Optional
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(
      emailStr.trim()
    );
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    const finalVal =
      name === "phone" ? value.replace(/\D/g, "").slice(0, 10) : value;
    setFormData((prev) => ({ ...prev, [name]: finalVal }));
    if (errorMsg) setErrorMsg("");
  };

  const handleQuantitySelect = (preset: string) => {
    setFormData((prev) => ({ ...prev, quantity: preset }));
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
      setErrorMsg("Please enter your full name");
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

    const chosenCustomerType =
      formData.customerType === "Other" && formData.otherDescription
        ? formData.otherDescription.trim()
        : formData.customerType;

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
          customerType: chosenCustomerType,
          otherDescription: formData.otherDescription.trim(),
          category: categoryParam || "B2B & Fleet Orders",
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to submit inquiry");
      }

      // Navigate to dedicated separate thank-you page
      const params = new URLSearchParams({
        name: formData.fullName.trim(),
        phone: cleanPhone,
        quantity: formData.quantity,
      });
      if (formData.companyName.trim()) params.set("company", formData.companyName.trim());
      if (formData.email.trim()) params.set("email", formData.email.trim());
      if (formData.purchaseTimeline) params.set("timeline", formData.purchaseTimeline);
      if (chosenCustomerType) params.set("customerType", chosenCustomerType);
      if (categoryParam) params.set("category", categoryParam);

      router.push(`/inquiryform/thank-you?${params.toString()}`);
    } catch (err: any) {
      console.error("Inquiry submission error:", err);
      // Even if network fails or partial response, route gracefully to thank-you page
      const params = new URLSearchParams({
        name: formData.fullName.trim(),
        phone: cleanPhone,
        quantity: formData.quantity,
      });
      if (formData.companyName.trim()) params.set("company", formData.companyName.trim());
      if (formData.email.trim()) params.set("email", formData.email.trim());
      if (categoryParam) params.set("category", categoryParam);

      router.push(`/inquiryform/thank-you?${params.toString()}`);
    }
  };

  const pillText = categoryParam ? categoryParam : "B2B & Fleet Orders";

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col font-sans selection:bg-[#005DA6] selection:text-white">
      {/* Brand Top Header Bar (Matches Site Header Aesthetic) */}
      <header className="border-b border-white/10 bg-black/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-3 group transition-transform active:scale-95"
          >
            <div className="relative w-[135px] h-[28px] sm:w-[170px] sm:h-[34px]">
              <Image
                src="/aquaforceforautocare/images/promec-logo.svg"
                alt="PROMEC"
                fill
                priority
                className="object-contain object-left"
              />
            </div>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/70 hover:text-white px-3 py-1.5 rounded-full hover:bg-white/5 transition-all font-open-sans"
            >
              <Home size={14} />
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="flex-1 max-w-[1240px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16">
        <div className="max-w-[660px] mx-auto">
          {/* Top Intro Heading */}
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold font-montserrat text-white tracking-tight leading-tight">
              AquaForce® 1400 Inquiry Form
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-slate-400 max-w-md mx-auto font-open-sans leading-relaxed">
              Cordless, high-pressure portable washer system. Fill out this
              quick questionnaire to receive tiered commercial pricing and
              priority stock allocation.
            </p>
          </div>

          {/* Card Container (Clean White Card - Standalone Page Form) */}
          <div className="bg-white rounded-[24px] sm:rounded-[28px] p-5 sm:p-8 md:p-9 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] text-slate-900 border border-slate-100">
            {/* Questionnaire Form */}
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              {/* Form Title & Single-line Pill on Mobile */}
              <div className="pb-2 border-b border-slate-100 flex items-center justify-between gap-2">
                <h2 className="text-base sm:text-xl font-bold font-montserrat text-slate-900 tracking-tight shrink min-w-0 truncate">
                  Inquiry Questionnaire
                </h2>
                <span className="text-[10px] sm:text-[11px] font-bold font-montserrat px-2 sm:px-2.5 py-0.5 rounded-full bg-blue-50 text-[#005DA6] border border-blue-200 whitespace-nowrap shrink-0 leading-normal">
                  {pillText}
                </span>
              </div>

              {errorMsg && (
                <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm font-medium">
                  {errorMsg}
                </div>
              )}

              {/* Row 1: Name (Mandatory) & Phone No (Mandatory) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
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
                    <span className="absolute left-3.5 text-xs sm:text-sm font-semibold text-slate-400 font-open-sans select-none">
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
                      className="w-full bg-white border border-slate-200 focus:border-[#0066cc] focus:ring-1 focus:ring-[#0066cc] rounded-[8px] pl-12 pr-3.5 py-2.5 sm:pl-13 sm:pr-4 sm:py-3 text-[15px] sm:text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all font-open-sans shadow-2xs"
                    />
                  </div>
                </div>
              </div>

              {/* Row 2: Company Name (Optional) & Email (Optional) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5 font-open-sans">
                    Company Name{" "}
                    <span className="text-slate-400 font-normal text-xs">
                      (optional)
                    </span>
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    placeholder="Speed Car Wash"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-slate-200 focus:border-[#0066cc] focus:ring-1 focus:ring-[#0066cc] rounded-[8px] px-3.5 py-2.5 sm:px-4 sm:py-3 text-[15px] sm:text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all font-open-sans shadow-2xs"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5 font-open-sans">
                    Email Address{" "}
                    <span className="text-slate-400 font-normal text-xs">
                      (optional)
                    </span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder="rahul@example.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-slate-200 focus:border-[#0066cc] focus:ring-1 focus:ring-[#0066cc] rounded-[8px] px-3.5 py-2.5 sm:px-4 sm:py-3 text-[15px] sm:text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all font-open-sans shadow-2xs"
                  />
                </div>
              </div>

              {/* Row 3: How many units do you need? (Preset selection) */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5 font-open-sans">
                  How many units do you need?{" "}
                  <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {QUANTITY_PRESETS.map((preset) => {
                    const isSelected = formData.quantity === preset;
                    return (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => handleQuantitySelect(preset)}
                        className={`py-2.5 px-3 rounded-[8px] border text-xs sm:text-sm font-bold font-montserrat transition-all cursor-pointer ${
                          isSelected
                            ? "bg-[#005DA6] text-white border-[#005DA6] shadow-[0_2px_8px_rgba(0,93,166,0.3)]"
                            : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        {preset}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Row 4: When are you looking to purchase? */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5 font-open-sans">
                  When are you looking to purchase?{" "}
                  <span className="text-slate-400 font-normal text-xs">
                    (optional)
                  </span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {TIMELINE_OPTIONS.map((timeline) => {
                    const isSelected = formData.purchaseTimeline === timeline;
                    return (
                      <button
                        key={timeline}
                        type="button"
                        onClick={() => handleTimelineSelect(timeline)}
                        className={`py-2 px-3 rounded-[8px] border text-left text-xs font-semibold font-open-sans transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? "bg-blue-50/80 text-[#005DA6] border-[#005DA6]"
                            : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        <span>{timeline}</span>
                        {isSelected && (
                          <Check size={14} className="text-[#005DA6] shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Row 5: Which best describes you? */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5 font-open-sans">
                  Which best describes you?{" "}
                  <span className="text-slate-400 font-normal text-xs">
                    (optional)
                  </span>
                </label>
                <div className="space-y-1.5">
                  {CUSTOMER_TYPE_OPTIONS.map((type) => {
                    const isSelected = formData.customerType === type;
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => handleCustomerTypeSelect(type)}
                        className={`w-full py-2 px-3 rounded-[8px] border text-left text-xs font-semibold font-open-sans transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? "bg-blue-50/80 text-[#005DA6] border-[#005DA6]"
                            : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        <span>{type}</span>
                        {isSelected && (
                          <Check size={14} className="text-[#005DA6] shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* If "Other" is selected, show custom input */}
                {formData.customerType === "Other" && (
                  <div className="mt-2.5 animate-in fade-in duration-150">
                    <input
                      type="text"
                      name="otherDescription"
                      placeholder="Please briefly describe your requirement..."
                      value={formData.otherDescription}
                      onChange={handleInputChange}
                      className="w-full bg-white border border-slate-200 focus:border-[#0066cc] focus:ring-1 focus:ring-[#0066cc] rounded-[8px] px-3.5 py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all font-open-sans shadow-2xs"
                    />
                  </div>
                )}
              </div>

              {/* Checkbox: Terms & WhatsApp Consent */}
              <div className="pt-1">
                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formData.agreedToTerms}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        agreedToTerms: e.target.checked,
                      }))
                    }
                    className="mt-0.5 w-4 h-4 rounded text-[#0066cc] border-slate-300 focus:ring-[#0066cc] cursor-pointer"
                  />
                  <span className="text-[11px] sm:text-xs text-slate-500 font-open-sans leading-relaxed">
                    I agree to be contacted via WhatsApp/Phone by the AMEC sales
                    team regarding enterprise pricing and order details.
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 bg-[#005DA6] hover:bg-[#004e8c] active:bg-[#004277] disabled:bg-slate-300 text-white font-montserrat font-bold text-xs xs:text-sm uppercase tracking-wider py-3.5 sm:py-4 rounded-[12px] shadow-[0_4px_14px_rgba(0,93,166,0.25)] transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Submitting Inquiry...</span>
                  </>
                ) : (
                  <>
                    <span>SUBMIT INQUIRY</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Trust Badges Footer Bar */}
          <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-3 gap-3 text-center">
            <div className="flex flex-col items-center">
              <ShieldCheck className="w-5 h-5 text-emerald-400 mb-1" />
              <span className="text-[11px] font-bold text-white font-montserrat">
                1-Year Warranty
              </span>
              <span className="text-[10px] text-slate-400 font-open-sans">
                Commercial grade
              </span>
            </div>
            <div className="flex flex-col items-center">
              <Truck className="w-5 h-5 text-sky-400 mb-1" />
              <span className="text-[11px] font-bold text-white font-montserrat">
                Pan-India Delivery
              </span>
              <span className="text-[10px] text-slate-400 font-open-sans">
                Doorstep dispatch
              </span>
            </div>
            <div className="flex flex-col items-center">
              <PhoneCall className="w-5 h-5 text-purple-400 mb-1" />
              <span className="text-[11px] font-bold text-white font-montserrat">
                Priority Support
              </span>
              <span className="text-[10px] text-slate-400 font-open-sans">
                Dedicated manager
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/60 py-6 text-center text-xs text-slate-500 font-open-sans">
        <div className="max-w-[1240px] mx-auto px-4">
          <p>
            © {new Date().getFullYear()} PROMEC INDIA. All rights reserved. AMEC
            Mobility Private Limited.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function InquiryFormPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#07090e]">
          <div className="w-8 h-8 border-4 border-[#005DA6] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <InquiryFormContent />
    </Suspense>
  );
}
