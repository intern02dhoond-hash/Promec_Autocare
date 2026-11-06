"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";
import Footer from "@/components/Footer";
import { trackPurchase } from "@/lib/analytics";

function ThankYouContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paymentId = searchParams.get("payment_id") || searchParams.get("paymentId") || "";
  const orderId = searchParams.get("order_id") || searchParams.get("orderId") || "";
  const amount = searchParams.get("amount") || "37999";
  const totalAmountParam = searchParams.get("total_amount") || amount;
  const codBalance = searchParams.get("cod_balance") || "0";
  const method = searchParams.get("method") || "PREPAID";
  const waybill = searchParams.get("waybill") || "";
  const customerName = searchParams.get("name") || searchParams.get("fullName") || "";

  const isCod = method.toUpperCase().includes("COD") || Number(codBalance) > 0;
  const formattedAmount = Number(amount).toLocaleString("en-IN");
  const formattedCodBalance = Number(codBalance).toLocaleString("en-IN");

  useEffect(() => {
    const type = searchParams.get("type");
    if (type === "inquiry" || searchParams.get("enquiry") === "bulk") {
      router.replace(`/inquiryform/thank-you?${searchParams.toString()}`);
    }
  }, [searchParams, router]);

  // Auto-hydrate verified customer session so their account immediately shows orders
  useEffect(() => {
    const phone = searchParams.get("phone") || searchParams.get("customer_phone");
    const name = searchParams.get("name") || searchParams.get("fullName");
    if (phone && typeof window !== "undefined") {
      const cleanPhone = phone.replace(/\D/g, "").slice(-10);
      if (cleanPhone) {
        const userObj = { phone: cleanPhone, fullName: name || "Customer" };
        try {
          localStorage.setItem("aquaforce_user", JSON.stringify(userObj));
          localStorage.setItem("promec_verified_user", JSON.stringify(userObj));
          window.dispatchEvent(new Event("aquaforce_auth_changed"));
        } catch (e) {}
      }
    }
  }, [searchParams]);

  useEffect(() => {
    const numericAmount = Number(amount) || 37999;

    // Trigger Meta Pixel Purchase Conversion Event
    if (typeof window !== "undefined" && (window as any).fbq) {
      (window as any).fbq("track", "Purchase", {
        value: numericAmount,
        currency: "INR",
        content_name: "AQUAFORCE 1400 PSI TECH Cordless Washer",
        content_type: "product",
      });
    }

    // Trigger Google Analytics 4 (GA4) Purchase Event
    trackPurchase({
      orderId: orderId || paymentId || `ORD_${Date.now()}`,
      value: numericAmount,
      paymentMethod: method,
      productName: "AquaForce 1400 High-pressure Washer",
      quantity: 1,
    });
  }, [amount, orderId, paymentId, method]);

  const handleReturn = () => {
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-[#0b0c0e] flex flex-col justify-between text-slate-900">
      {/* Clean Dedicated Brand Header - No overlapping navigation links */}
      <header className="w-full h-16 sm:h-20 bg-[#0b0c0e] border-b border-white/10 flex items-center justify-center px-4 shrink-0">
        <div className="relative w-[150px] h-[36px] sm:w-[180px] sm:h-[42px]">
          <Image
            src="/aquaforceforautocare/images/promec-logo.svg"
            alt="PROMEC"
            fill
            sizes="(max-width: 640px) 150px, 180px"
            className="object-contain object-center"
            priority
          />
        </div>
      </header>

      {/* Centered Confirmation Dialog Card with Generous Margins */}
      <main className="flex-1 flex items-center justify-center px-3.5 sm:px-6 py-8 sm:py-14 w-full">
        <div className="relative w-full max-w-[420px] sm:max-w-[520px] p-6 xs:p-7 sm:p-9 pt-8 sm:pt-10 bg-white rounded-[24px] sm:rounded-[28px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] text-slate-900 overflow-hidden my-auto animate-in zoom-in-95 fade-in duration-200 text-center">
          {/* Top Close Button inside Card */}
          <button
            type="button"
            onClick={handleReturn}
            className="absolute top-4 right-4 sm:top-5 sm:right-5 w-8 h-8 sm:w-9 sm:h-9 bg-[#f1f5f9] hover:bg-slate-200 text-slate-500 hover:text-slate-900 rounded-full flex items-center justify-center transition-colors focus:outline-none cursor-pointer shadow-xs z-20"
            aria-label="Close"
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
          <h1 className="text-xl xs:text-2xl sm:text-[28px] font-bold font-montserrat text-[#0F1729] tracking-tight leading-snug">
            Order Placed Successfully!
          </h1>

          {/* Personalized Message without AMEC */}
          <p className="text-[#475569] font-open-sans text-xs xs:text-[13.5px] sm:text-[14px] max-w-[430px] mx-auto mt-2 sm:mt-2.5 leading-relaxed font-normal">
            Thank you,{" "}
            <strong className="text-[#0f172a] font-bold font-open-sans">
              {customerName || "Valued Customer"}
            </strong>
            . Your order for{" "}
            <strong className="text-[#005DA6] font-bold font-open-sans">
              Aquaforce® 1400
            </strong>{" "}
            has been confirmed and our dispatch team is preparing your package for express delivery.
          </p>

          {/* Summary Details Card */}
          <div className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-[16px] p-4 sm:p-5 mt-5 sm:mt-6 text-left font-open-sans space-y-3 divide-y divide-[#e2e8f0]/80 shadow-2xs">
            {/* Row 1: Product */}
            <div className="flex items-center justify-between text-[13px] pt-0 font-open-sans">
              <span className="text-[#64748b] font-medium font-open-sans">Product</span>
              <span className="text-[#0f172a] font-bold font-open-sans truncate max-w-[180px] sm:max-w-[240px]">
                Aquaforce® 1400 PSI Tech
              </span>
            </div>

            {/* Row 2: Order Status */}
            <div className="flex items-center justify-between text-[13px] pt-3 font-open-sans">
              <span className="text-[#64748b] font-medium font-open-sans">Order Status</span>
              <span className="bg-[#f0f9ff] border border-[#005DA6]/35 text-[#005DA6] text-xs font-bold font-open-sans px-3 py-0.5 rounded-full leading-none">
                {isCod ? "10% Advance Paid • COD Confirmed" : "Paid & Confirmed"}
              </span>
            </div>

            {/* Row 3: Total Amount */}
            <div className="flex items-center justify-between text-[13px] pt-3 font-open-sans">
              <span className="text-[#64748b] font-medium font-open-sans">
                {isCod ? "10% Advance Paid" : "Amount Paid"}
              </span>
              <span className="text-[#0f172a] font-bold font-open-sans tracking-wide">
                ₹{formattedAmount}
              </span>
            </div>

            {/* Row 3.5: Balance on Delivery if COD */}
            {isCod && (
              <div className="flex items-center justify-between text-[13px] pt-3 font-open-sans bg-amber-50 -mx-4 px-4 py-2 rounded-lg border border-amber-200">
                <span className="text-amber-800 font-bold font-open-sans">Balance on Delivery</span>
                <span className="text-amber-900 font-extrabold font-open-sans tracking-wide">
                  ₹{formattedCodBalance} (Cash / UPI)
                </span>
              </div>
            )}

            {/* Row 4: Order ID (if available) */}
            {orderId && (
              <div className="flex items-center justify-between text-[13px] pt-3 font-open-sans">
                <span className="text-[#64748b] font-medium font-open-sans">Order ID</span>
                <span className="text-[#0f172a] font-bold font-mono text-xs truncate max-w-[180px] sm:max-w-[240px]">
                  {orderId}
                </span>
              </div>
            )}

            {/* Row 5: Payment ID (if available) */}
            {paymentId && (
              <div className="flex items-center justify-between text-[13px] pt-3 font-open-sans">
                <span className="text-[#64748b] font-medium font-open-sans">Payment ID</span>
                <span className="text-[#0f172a] font-bold font-mono text-xs truncate max-w-[180px] sm:max-w-[240px]">
                  {paymentId}
                </span>
              </div>
            )}

            {/* Row 6: Shipping */}
            <div className="flex items-center justify-between text-[13px] pt-3 font-open-sans">
              <span className="text-[#64748b] font-medium font-open-sans">Shipping Partner</span>
              <span className="text-emerald-700 font-bold font-open-sans flex items-center gap-1.5">
                <Image
                  src="/aquaforceforautocare/images/TRUCK-03.svg"
                  alt="Express Delivery Truck"
                  width={28}
                  height={28}
                  className="shrink-0 w-7 h-7 object-contain"
                />
                Delhivery Express {waybill ? `(#${waybill})` : "(2-4 Days)"}
              </span>
            </div>
          </div>

          {/* Bottom Action Buttons */}
          <div className="mt-6 sm:mt-8 space-y-2.5">
            <Link
              href={orderId ? `/account?orderId=${orderId}&tab=orders` : "/account?tab=orders"}
              className="w-full block bg-[#0077c8] hover:bg-[#0066b3] active:bg-[#005599] text-white font-bold font-montserrat uppercase tracking-wider py-3.5 sm:py-4 rounded-[12px] shadow-sm hover:shadow-md transition-all cursor-pointer text-xs sm:text-sm text-center"
            >
              TRACK ORDER IN MY ACCOUNT
            </Link>

            <Link
              href="/"
              className="w-full block bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold font-montserrat uppercase tracking-wider py-3 sm:py-3.5 rounded-[12px] transition-all cursor-pointer text-xs sm:text-xs text-center"
            >
              CONTINUE BROWSING
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function ThankYouPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#0b0c0e]">
          <div className="w-8 h-8 border-4 border-[#0066cc] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ThankYouContent />
    </Suspense>
  );
}
