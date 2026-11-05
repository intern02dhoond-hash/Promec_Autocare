"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useOrderModal } from "@/context/OrderModalContext";
import { useBulkEnquiry } from "@/context/BulkEnquiryContext";
import EmiCodBadges from "@/components/EmiCodBadges";

const TOTAL_SLIDES = 4;

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { openModal } = useOrderModal();
  const { openBulkModal } = useBulkEnquiry();

  // Touch Swipe State
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);

  const minSwipeDistance = 40;

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEndX(null);
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStartX || !touchEndX) return;
    const distance = touchStartX - touchEndX;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe) {
      // Swipe left -> Next slide
      setCurrentSlide((prev) => (prev + 1) % TOTAL_SLIDES);
    } else if (isRightSwipe) {
      // Swipe right -> Prev slide
      setCurrentSlide((prev) => (prev - 1 + TOTAL_SLIDES) % TOTAL_SLIDES);
    }
  };

  // Auto-advance slides every 4.5 seconds and reset timer on slide change
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % TOTAL_SLIDES);
    }, 4500);
    return () => clearInterval(timer);
  }, [currentSlide]);

  return (
    <section
      id="home"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative h-[calc(100svh-42px)] sm:h-[calc(100svh-48px)] md:h-[calc(100dvh-52px)] lg:h-[calc(100vh-56px)] min-h-[500px] xs:min-h-[540px] sm:min-h-[580px] md:min-h-[620px] lg:min-h-[660px] max-h-[820px] 2xl:max-h-[880px] flex items-center overflow-hidden bg-slate-950 select-none group touch-pan-y"
    >
      {/* ========================================================= */}
      {/* SLIDE 1: Outdoor Patio SUV Foam Washing Scene (Banner 3 Y) */}
      {/* ========================================================= */}
      <div
        className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
          currentSlide === 0
            ? "opacity-100 z-10 pointer-events-auto"
            : "opacity-0 z-0 pointer-events-none"
        }`}
      >
        {/* Mobile Background Image */}
        <div className="sm:hidden absolute inset-0 z-0">
          <Image
            src="/aquaforceforautocare/images/Hero%20section%20Images/1.1.webp"
            alt="Aquaforce 1400 Cordless Portable Pressure Washer"
            fill
            priority
            quality={100}
            sizes="100vw"
            className="object-cover object-center"
          />
        </div>

        {/* Desktop Background Image */}
        <div className="hidden sm:block absolute inset-0 z-0">
          <Image
            src="/aquaforceforautocare/images/Hero%20section%20Images/1.webp"
            alt="Aquaforce 1400 Cordless Portable Pressure Washer car wash outdoor"
            fill
            priority
            quality={100}
            sizes="100vw"
            className="object-cover object-center"
          />
        </div>

        {/* Mobile Slide 1 Content Overlay - Left-aligned to keep device on right 100% visible */}
        <div className="sm:hidden relative z-10 w-full h-full flex flex-col justify-end pointer-events-none">
          <div className="w-full bg-gradient-to-t from-slate-950/95 via-slate-950/40 to-transparent pt-6 pb-6 xs:pb-7 px-4 xs:px-5 pointer-events-auto">
            {/* Left Content Box */}
            <div className="max-w-[68%]">
              {/* Eyebrow / Kicker */}
              <p className="text-white font-open-sans text-[10px] font-bold tracking-[0.2em] uppercase mb-1 drop-shadow-[0_2px_4px_rgba(0,0,0,1)]">
                CORDLESS. POWERFUL. PORTABLE.
              </p>

              {/* Headline */}
              <h1 className="font-montserrat text-[1.65rem] xs:text-[1.95rem] leading-[0.96] tracking-tight uppercase drop-shadow-[0_3px_12px_rgba(0,0,0,1)]">
                <span className="block font-black text-white">NO POWER.</span>
                <span className="block font-bold text-white/95">NO SOCKET.</span>
              </h1>

              {/* Description */}
              <p className="font-open-sans text-white font-medium text-[11.5px] xs:text-[12px] leading-snug mt-1.5 drop-shadow-[0_2px_6px_rgba(0,0,0,1)]">
                Wash your car anywhere with high-pressure cordless power.
              </p>

              {/* Pricing & Discount */}
              <div className="mt-2 flex items-center gap-2">
                <div className="flex items-baseline gap-1.5 font-open-sans">
                  <span className="text-white text-xl xs:text-2xl font-black tracking-tight drop-shadow-[0_2px_6px_rgba(0,0,0,1)]">
                    ₹37,999
                  </span>
                  <span className="text-white/75 line-through text-xs font-semibold drop-shadow-[0_2px_4px_rgba(0,0,0,1)]">
                    ₹51,350
                  </span>
                </div>
                <span className="inline-block bg-[#18c49e] font-open-sans text-slate-950 text-[9.5px] font-black px-2 py-0.5 rounded-xs uppercase tracking-wider shadow-md">
                  26% OFF
                </span>
              </div>
            </div>

            {/* COD & EMI Badges */}
            <div className="mt-2.5">
              <EmiCodBadges />
            </div>

            {/* Mobile Action Buttons - Side-by-Side 2-Column Grid */}
            <div className="grid grid-cols-2 gap-2 mt-3 mb-4 w-full">
              <button
                onClick={openModal}
                className="w-full inline-flex items-center justify-center gap-1.5 bg-[#0066cc] active:bg-[#0052b3] text-white font-montserrat text-[11.5px] font-black tracking-wider uppercase py-2.5 rounded-[6px] shadow-lg shadow-blue-600/40 transition-all active:scale-[0.98] cursor-pointer"
              >
                <span>BUY NOW</span>
                <ArrowRight className="w-3.5 h-3.5 shrink-0" />
              </button>
              <Link
                href="/inquiryform"
                className="w-full inline-flex items-center justify-center border border-white/70 bg-black/40 backdrop-blur-xs active:border-white text-white active:bg-white/15 font-open-sans text-[10px] xs:text-[11px] font-bold tracking-tight xs:tracking-normal uppercase py-2.5 px-1 rounded-[6px] transition-all active:scale-[0.98] drop-shadow text-center cursor-pointer whitespace-nowrap"
              >
                Inquire Bulk Quantity
              </Link>
            </div>
          </div>
        </div>

        {/* Desktop Slide 1 Content (Positioned on Left Half to Never Overlap Car/Machine on Right) */}
        <div className="hidden sm:flex relative z-10 w-full px-6 sm:px-12 lg:px-16 xl:px-20 pt-28 pb-16 sm:pt-36 sm:pb-24 lg:pt-40 lg:pb-28 h-full flex-col justify-center">
          <div className="max-w-[540px] lg:max-w-[620px] xl:max-w-[680px]">
            {/* Eyebrow / Kicker */}
            <p className="text-white/95 font-open-sans text-xs sm:text-sm font-bold tracking-[0.2em] uppercase mb-2.5 sm:mb-3 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
              CORDLESS. POWERFUL. PORTABLE.
            </p>

            {/* Headline */}
            <h1 className="font-montserrat text-5xl sm:text-6xl md:text-7xl lg:text-[84px] xl:text-[96px] leading-[0.95] tracking-tight uppercase drop-shadow-[0_4px_24px_rgba(0,0,0,0.95)]">
              <span className="block font-black text-white">NO POWER.</span>
              <span className="block font-bold text-white/90">NO SOCKET.</span>
            </h1>

            {/* Description Paragraph */}
            <p className="font-open-sans text-white mt-4 sm:mt-5 max-w-[480px] text-[14px] sm:text-[15.5px] leading-relaxed font-normal drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
              Wash your car anywhere with the Aquaforce® 1400 - a powerful,
              battery-powered portable pressure washer. No cables, no power
              sockets, no fixed setup needed.
            </p>

            {/* Pricing & Discount Badge */}
            <div className="flex items-center gap-3 sm:gap-4 mt-5 sm:mt-7 font-open-sans">
              <span className="text-white/70 line-through text-sm sm:text-base font-semibold drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                ₹51,350
              </span>
              <span className="text-white text-2xl sm:text-3xl font-black tracking-tight drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
                ₹37,999
              </span>
              <span className="bg-[#18c49e] text-slate-950 text-xs font-black px-3.5 py-1 rounded-full uppercase tracking-wider shadow">
                26% OFF
              </span>
            </div>

            {/* COD & EMI Badges */}
            <div className="mt-4 sm:mt-5">
              <EmiCodBadges />
            </div>

            {/* CTA Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-6 sm:mt-8">
              <button
                onClick={openModal}
                className="inline-flex items-center gap-2 bg-[#0066cc] hover:bg-[#0052b3] text-white font-montserrat text-xs sm:text-sm font-black tracking-wider uppercase px-6 sm:px-7 py-3.5 rounded-[4px] shadow-xl shadow-blue-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <span>BUY NOW</span>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </button>
              <Link
                href="/inquiryform"
                className="inline-flex items-center border border-white/60 hover:border-white text-white hover:bg-white/15 bg-black/20 backdrop-blur-xs font-open-sans text-xs sm:text-sm font-black tracking-wider uppercase px-6 sm:px-7 py-3.5 rounded-[4px] transition-all active:scale-[0.98] drop-shadow cursor-pointer"
              >
                Inquire Bulk Quantity
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* SLIDE 2: Promotional Launch Offer Banner (Banner 1 B) */}
      {/* ========================================================= */}
      <div
        className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
          currentSlide === 1
            ? "opacity-100 z-10 pointer-events-auto"
            : "opacity-0 z-0 pointer-events-none"
        }`}
      >
        {/* Mobile Background Image */}
        <div className="sm:hidden absolute inset-0 z-0">
          <Image
            src="/aquaforceforautocare/images/Hero%20section%20Images/2.1.webp"
            alt="Aquaforce 1400 Promotional Launch Offer 26% OFF"
            fill
            priority
            quality={100}
            sizes="100vw"
            className="object-cover object-center"
          />
        </div>

        {/* Desktop Background Image */}
        <div className="hidden sm:block absolute inset-0 z-0">
          <Image
            src="/aquaforceforautocare/images/Hero%20section%20Images/2.webp"
            alt="Aquaforce 1400 Promotional Launch Offer 26% OFF"
            fill
            priority
            quality={100}
            sizes="100vw"
            className="object-cover object-center"
          />
          {/* Left-to-Right Rich Contrast Gradient Overlay (Fixes white-on-white text against sky) */}
          <div className="absolute inset-y-0 left-0 w-full sm:w-[72%] lg:w-[60%] bg-gradient-to-r from-slate-950/90 via-slate-950/65 via-65% to-transparent pointer-events-none" />
          {/* Top-to-Bottom Navbar Gradient */}
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-slate-950/70 via-slate-950/20 to-transparent pointer-events-none" />
        </div>

        {/* Mobile Slide 2 Content Overlay */}
        <div className="sm:hidden relative z-10 w-full h-full flex flex-col justify-end pointer-events-none">
          <div className="w-full bg-gradient-to-t from-slate-950 via-slate-950/85 via-50% to-transparent pt-12 pb-7 px-4 xs:px-5 pointer-events-auto">
            {/* Red Promotional Launch Offer Badge */}
            <div className="inline-block bg-[#e53e3e] text-white font-inter text-[9.5px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-[3px] shadow-sm mb-1.5 w-fit">
              PROMOTIONAL LAUNCH OFFER
            </div>

            {/* Subtitle */}
            <p className="text-white font-inter font-semibold text-base xs:text-lg drop-shadow">
              Get AQUAFORCE 1400 at
            </p>

            {/* Huge 26% OFF Headline with vertical gradient text fill */}
            <h2 className="font-inter text-4xl xs:text-5xl font-black tracking-tight leading-none my-1 bg-gradient-to-b from-white via-[#f0f6ff] to-[#cfe2fe] bg-clip-text text-transparent drop-shadow-md">
              26% OFF
            </h2>

            {/* Pricing Row */}
            <div className="text-white font-inter text-xs font-bold flex items-center gap-2 mt-1 drop-shadow">
              <span className="text-white/70 font-normal">
                MRP: <span className="line-through">₹51,350</span>
              </span>
              <span className="text-white font-extrabold ml-1">
                Offer Price: ₹37,999
              </span>
            </div>

            {/* COD & EMI Badges */}
            <div className="mt-2.5">
              <EmiCodBadges />
            </div>

            {/* Mobile Action Buttons */}
            <div className="grid grid-cols-2 gap-2 mt-3 mb-4 w-full">
              <button
                onClick={openModal}
                className="w-full inline-flex items-center justify-center gap-1.5 bg-[#0066cc] active:bg-[#0052b3] text-white font-montserrat text-[11.5px] font-black tracking-wider uppercase py-3 rounded-[6px] shadow-xl shadow-blue-600/30 transition-all active:scale-[0.98] cursor-pointer"
              >
                <span>BUY NOW</span>
                <ArrowRight className="w-3.5 h-3.5 shrink-0" />
              </button>
              <Link
                href="/inquiryform"
                className="w-full inline-flex items-center justify-center border border-white/70 bg-black/25 backdrop-blur-xs active:border-white text-white active:bg-white/15 font-open-sans text-[10px] xs:text-[11px] font-bold tracking-tight xs:tracking-normal uppercase py-3 px-1 rounded-[6px] transition-all active:scale-[0.98] drop-shadow text-center cursor-pointer whitespace-nowrap"
              >
                Inquire Bulk Quantity
              </Link>
            </div>

            {/* Micro Footer Note */}
            <p className="text-white/70 font-inter text-[10.5px] mt-1.5 text-center drop-shadow">
              Limited-period promotional offer.
            </p>
          </div>
        </div>

        {/* Desktop Slide 2 Content (Left Positioned to Prevent Overlapping Machine on Right) */}
        <div className="hidden sm:flex relative z-10 w-full px-6 sm:px-12 lg:px-16 xl:px-20 pt-28 pb-16 sm:pt-36 sm:pb-24 lg:pt-40 lg:pb-28 h-full flex-col justify-center">
          <div className="max-w-[560px] lg:max-w-[640px] xl:max-w-[700px]">
            {/* Red Promotional Launch Offer Badge */}
            <div className="inline-block bg-[#e53e3e] text-white font-inter text-xs sm:text-[13px] font-black uppercase tracking-wider px-3.5 py-1.5 rounded-[4px] shadow-lg mb-3.5 w-fit drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              PROMOTIONAL LAUNCH OFFER
            </div>

            {/* Subtitle */}
            <p className="text-white font-inter font-bold text-xl sm:text-2xl lg:text-[32px] leading-[1.2] drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)]">
              Get AQUAFORCE 1400 at
            </p>

            {/* Huge 26% OFF Headline */}
            <h2 className="font-inter text-6xl sm:text-8xl lg:text-[104px] xl:text-[120px] font-black tracking-tight leading-none my-2 text-white drop-shadow-[0_4px_20px_rgba(0,0,0,0.95)]">
              26% OFF
            </h2>

            {/* Pricing Row */}
            <div className="text-white font-inter text-base sm:text-lg font-bold flex items-center gap-2 mt-3 drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)]">
              <span className="text-white/80 font-normal">
                MRP: <span className="line-through">₹51,350</span>
              </span>
              <span className="text-white font-extrabold ml-1 text-lg sm:text-xl">
                Offer Price: ₹37,999
              </span>
            </div>

            {/* COD & EMI Badges */}
            <div className="mt-4 sm:mt-5">
              <EmiCodBadges />
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-6 sm:mt-7">
              <button
                onClick={openModal}
                className="inline-flex items-center gap-2 bg-[#0066cc] hover:bg-[#0052b3] text-white font-montserrat text-xs sm:text-sm font-black tracking-wider uppercase px-7 py-3.5 rounded-[4px] shadow-xl shadow-blue-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <span>BUY NOW</span>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </button>
              <Link
                href="/inquiryform"
                className="inline-flex items-center border border-white/60 hover:border-white text-white hover:bg-white/15 bg-black/20 backdrop-blur-xs font-open-sans text-xs sm:text-sm font-black tracking-wider uppercase px-6 sm:px-7 py-3.5 rounded-[4px] transition-all active:scale-[0.98] drop-shadow cursor-pointer"
              >
                Inquire Bulk Quantity
              </Link>
            </div>

            {/* Micro Footer Note */}
            <p className="text-white/85 font-inter text-xs mt-3 drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]">
              Limited-period promotional offer.
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* SLIDE 3: Driveway Machine Washing Scene (Banner 4Y) */}
      {/* ========================================================= */}
      <div
        className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
          currentSlide === 2
            ? "opacity-100 z-10 pointer-events-auto"
            : "opacity-0 z-0 pointer-events-none"
        }`}
      >
        {/* Mobile Background Image */}
        <div className="sm:hidden absolute inset-0 z-0">
          <Image
            src="/aquaforceforautocare/images/Hero%20section%20Images/3.1.webp"
            alt="Aquaforce 1400 No Power No Socket"
            fill
            priority
            quality={100}
            sizes="100vw"
            className="object-cover object-center"
          />
        </div>

        {/* Desktop Background Image */}
        <div className="hidden sm:block absolute inset-0 z-0">
          <Image
            src="/aquaforceforautocare/images/Hero%20section%20Images/3.webp"
            alt="Aquaforce 1400 No Power No Socket Driveway Washing Scene"
            fill
            priority
            quality={100}
            sizes="100vw"
            className="object-cover object-center"
          />
          {/* Subtle bottom gradient so device is 100% visible and buttons remain crisp */}
          <div className="absolute inset-x-0 bottom-0 h-36 sm:h-44 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent pointer-events-none" />
        </div>

        {/* Mobile Slide 3 Content Overlay */}
        <div className="sm:hidden relative z-10 w-full h-full flex flex-col justify-end pointer-events-none">
          <div className="w-full bg-gradient-to-t from-black via-black/90 via-50% to-transparent pt-14 pb-7 px-4 xs:px-5 pointer-events-auto">
            {/* Description */}
            <p className="text-white font-medium font-open-sans text-[13px] xs:text-[13.5px] leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,1)]">
              Wash your car anywhere with the Aquaforce® 1400 - powerful cordless portable pressure washer.
            </p>

            {/* Pricing & Discount */}
            <div className="mt-2.5 flex items-center gap-2.5">
              <div className="flex items-baseline gap-2 font-open-sans">
                <span className="text-white text-2xl xs:text-[26px] font-black tracking-tight drop-shadow-[0_2px_6px_rgba(0,0,0,1)]">
                  ₹37,999
                </span>
                <span className="text-white/70 line-through text-xs xs:text-[13px] font-semibold drop-shadow-[0_2px_4px_rgba(0,0,0,1)]">
                  ₹51,350
                </span>
              </div>
              <span className="inline-block bg-[#18c49e] font-open-sans text-slate-950 text-[10.5px] font-black px-2.5 py-0.5 rounded-xs uppercase tracking-wider shadow-md">
                26% OFF
              </span>
            </div>

            {/* COD & EMI Badges */}
            <div className="mt-2.5">
              <EmiCodBadges />
            </div>

            {/* Mobile Action Buttons - Side-by-Side 2-Column Grid */}
            <div className="grid grid-cols-2 gap-2 mt-3 mb-4 w-full">
              <button
                onClick={openModal}
                className="w-full inline-flex items-center justify-center gap-1.5 bg-[#0066cc] active:bg-[#0052b3] text-white font-montserrat text-[11.5px] font-black tracking-wider uppercase py-3 rounded-[6px] shadow-xl shadow-blue-600/40 transition-all active:scale-[0.98] cursor-pointer"
              >
                <span>BUY NOW</span>
                <ArrowRight className="w-3.5 h-3.5 shrink-0" />
              </button>
              <Link
                href="/inquiryform"
                className="w-full inline-flex items-center justify-center border border-white/70 bg-black/25 backdrop-blur-xs active:border-white text-white active:bg-white/15 font-open-sans text-[10px] xs:text-[11px] font-bold tracking-tight xs:tracking-normal uppercase py-3 px-1 rounded-[6px] transition-all active:scale-[0.98] drop-shadow text-center cursor-pointer whitespace-nowrap"
              >
                Inquire Bulk Quantity
              </Link>
            </div>
          </div>
        </div>

        {/* Desktop Slide 3 Bottom Content Bar */}
        <div className="hidden sm:flex relative z-10 w-full px-6 sm:px-12 lg:px-16 xl:px-20 h-full flex-col justify-end pb-6 sm:pb-8 lg:pb-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 sm:gap-8">
            {/* Bottom-Left Description */}
            <div className="max-w-xl">
              <p className="text-white/95 font-open-sans text-[14px] sm:text-[15px] leading-relaxed font-normal drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                Wash your car anywhere with the Aquaforce® 1400 - a powerful,
                battery-powered portable pressure washer. No cables, no power
                sockets, no fixed setup needed.
              </p>
            </div>

            {/* Bottom-Right Pricing & Action Buttons */}
            <div className="flex flex-col items-start lg:items-end gap-3 shrink-0">
              {/* Pricing Line */}
              <div className="flex items-center gap-3 font-open-sans">
                <span className="text-white/70 line-through text-sm sm:text-base font-semibold drop-shadow">
                  ₹51,350
                </span>
                <span className="text-white text-2xl sm:text-3xl font-black tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                  ₹37,999
                </span>
                <span className="bg-[#18c49e] text-slate-950 text-xs font-black px-3.5 py-1 rounded-full uppercase tracking-wider shadow">
                  26% OFF
                </span>
              </div>

              {/* COD & EMI Badges */}
              <div className="my-1">
                <EmiCodBadges />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <button
                  onClick={openModal}
                  className="inline-flex items-center gap-2 bg-[#0066cc] hover:bg-[#0052b3] text-white font-montserrat text-xs sm:text-sm font-black tracking-wider uppercase px-5 sm:px-6 py-2.5 rounded-[4px] shadow-xl shadow-blue-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                  <span>BUY NOW</span>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </button>
                <Link
                  href="/inquiryform"
                  className="inline-flex items-center border border-white/80 hover:border-white text-white hover:bg-white/15 bg-black/20 backdrop-blur-xs font-open-sans text-xs sm:text-sm font-black tracking-wider uppercase px-5 sm:px-6 py-2.5 rounded-[4px] transition-all active:scale-[0.98] drop-shadow cursor-pointer"
                >
                  Inquire Bulk Quantity
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* SLIDE 4: Adventure Bike Foam Washing Scene (Banner 04) */}
      {/* ========================================================= */}
      <div
        className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
          currentSlide === 3
            ? "opacity-100 z-10 pointer-events-auto"
            : "opacity-0 z-0 pointer-events-none"
        }`}
      >
        {/* Mobile Background Image */}
        <div className="sm:hidden absolute inset-0 z-0">
          <Image
            src="/aquaforceforautocare/images/Hero%20section%20Images/4.1.webp"
            alt="Aquaforce 1400 Cordless Powerful Portable Bike Washing"
            fill
            priority
            quality={100}
            sizes="100vw"
            className="object-cover object-center"
          />
        </div>

        {/* Desktop Background Image */}
        <div className="hidden sm:block absolute inset-0 z-0">
          <Image
            src="/aquaforceforautocare/images/Hero%20section%20Images/4.webp"
            alt="Aquaforce 1400 Cordless Powerful Portable Adventure Bike Washing"
            fill
            priority
            quality={100}
            sizes="100vw"
            className="object-cover object-center"
          />
          {/* Subtle bottom gradient */}
          <div className="absolute inset-x-0 bottom-0 h-36 sm:h-44 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent pointer-events-none" />
        </div>

        {/* Mobile Slide 4 Content Overlay */}
        <div className="sm:hidden relative z-10 w-full h-full flex flex-col justify-end pointer-events-none">
          <div className="w-full bg-gradient-to-t from-black via-black/90 via-50% to-transparent pt-14 pb-7 px-4 xs:px-5 pointer-events-auto">
            {/* Description */}
            <p className="text-white font-medium font-open-sans text-[13px] xs:text-[13.5px] leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,1)]">
              Wash your car, bike, or outdoor gear anywhere with the Aquaforce® 1400 - high-pressure cordless washing.
            </p>

            {/* Pricing & Discount */}
            <div className="mt-2.5 flex items-center gap-2.5">
              <div className="flex items-baseline gap-2 font-open-sans">
                <span className="text-white text-2xl xs:text-[26px] font-black tracking-tight drop-shadow-[0_2px_6px_rgba(0,0,0,1)]">
                  ₹37,999
                </span>
                <span className="text-white/70 line-through text-xs xs:text-[13px] font-semibold drop-shadow-[0_2px_4px_rgba(0,0,0,1)]">
                  ₹51,350
                </span>
              </div>
              <span className="inline-block bg-[#18c49e] font-open-sans text-slate-950 text-[10.5px] font-black px-2.5 py-0.5 rounded-xs uppercase tracking-wider shadow-md">
                26% OFF
              </span>
            </div>

            {/* COD & EMI Badges */}
            <div className="mt-2.5">
              <EmiCodBadges />
            </div>

            {/* Mobile Action Buttons - Side-by-Side 2-Column Grid */}
            <div className="grid grid-cols-2 gap-2 mt-3 mb-4 w-full">
              <button
                onClick={openModal}
                className="w-full inline-flex items-center justify-center gap-1.5 bg-[#0066cc] active:bg-[#0052b3] text-white font-montserrat text-[11.5px] font-black tracking-wider uppercase py-3 rounded-[6px] shadow-xl shadow-blue-600/40 transition-all active:scale-[0.98] cursor-pointer"
              >
                <span>BUY NOW</span>
                <ArrowRight className="w-3.5 h-3.5 shrink-0" />
              </button>
              <Link
                href="/inquiryform"
                className="w-full inline-flex items-center justify-center border border-white/70 bg-black/25 backdrop-blur-xs active:border-white text-white active:bg-white/15 font-open-sans text-[10px] xs:text-[11px] font-bold tracking-tight xs:tracking-normal uppercase py-3 px-1 rounded-[6px] transition-all active:scale-[0.98] drop-shadow text-center cursor-pointer whitespace-nowrap"
              >
                Inquire Bulk Quantity
              </Link>
            </div>
          </div>
        </div>

        {/* Desktop Slide 4 Bottom Content Bar */}
        <div className="hidden sm:flex relative z-10 w-full px-6 sm:px-12 lg:px-16 xl:px-20 h-full flex-col justify-end pb-10 sm:pb-14 lg:pb-16">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 sm:gap-8">
            {/* Bottom-Left Description */}
            <div className="max-w-xl">
              <p className="text-white/95 font-open-sans text-[14px] sm:text-[15px] leading-relaxed font-normal drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                Wash your car, bike, or outdoor gear anywhere with the Aquaforce® 1400 - a powerful,
                battery-powered portable pressure washer. No cables, no power
                sockets, no fixed setup needed.
              </p>
            </div>

            {/* Bottom-Right Pricing & Action Buttons */}
            <div className="flex flex-col items-start lg:items-end gap-3 shrink-0">
              {/* Pricing Line */}
              <div className="flex items-center gap-3 font-open-sans">
                <span className="text-white/70 line-through text-sm sm:text-base font-semibold drop-shadow">
                  ₹51,350
                </span>
                <span className="text-white text-2xl sm:text-3xl font-black tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                  ₹37,999
                </span>
                <span className="bg-[#18c49e] text-slate-950 text-xs font-black px-3.5 py-1 rounded-full uppercase tracking-wider shadow">
                  26% OFF
                </span>
              </div>

              {/* COD & EMI Badges */}
              <div className="my-1">
                <EmiCodBadges />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <button
                  onClick={openModal}
                  className="inline-flex items-center gap-2 bg-[#0066cc] hover:bg-[#0052b3] text-white font-montserrat text-xs sm:text-sm font-black tracking-wider uppercase px-5 sm:px-6 py-2.5 rounded-[4px] shadow-xl shadow-blue-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                  <span>BUY NOW</span>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </button>
                <Link
                  href="/inquiryform"
                  className="inline-flex items-center border border-white/80 hover:border-white text-white hover:bg-white/15 bg-black/20 backdrop-blur-xs font-open-sans text-xs sm:text-sm font-black tracking-wider uppercase px-5 sm:px-6 py-2.5 rounded-[4px] transition-all active:scale-[0.98] drop-shadow cursor-pointer"
                >
                  Inquire Bulk Quantity
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* Carousel Controls: Navigation Indicators (4 Slides) */}
      {/* ========================================================= */}
      <div className="absolute bottom-1 sm:bottom-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1 sm:gap-2">
        <button
          onClick={() => setCurrentSlide(0)}
          className="p-1.5 cursor-pointer focus:outline-none"
          aria-label="Go to Slide 1"
        >
          <div
            className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${
              currentSlide === 0
                ? "w-7 sm:w-8 bg-white"
                : "w-1.5 sm:w-2 bg-white/40 hover:bg-white/70"
            }`}
          />
        </button>
        <button
          onClick={() => setCurrentSlide(1)}
          className="p-1.5 cursor-pointer focus:outline-none"
          aria-label="Go to Slide 2"
        >
          <div
            className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${
              currentSlide === 1
                ? "w-7 sm:w-8 bg-white"
                : "w-1.5 sm:w-2 bg-white/40 hover:bg-white/70"
            }`}
          />
        </button>
        <button
          onClick={() => setCurrentSlide(2)}
          className="p-1.5 cursor-pointer focus:outline-none"
          aria-label="Go to Slide 3"
        >
          <div
            className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${
              currentSlide === 2
                ? "w-7 sm:w-8 bg-white"
                : "w-1.5 sm:w-2 bg-white/40 hover:bg-white/70"
            }`}
          />
        </button>
        <button
          onClick={() => setCurrentSlide(3)}
          className="p-1.5 cursor-pointer focus:outline-none"
          aria-label="Go to Slide 4"
        >
          <div
            className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${
              currentSlide === 3
                ? "w-7 sm:w-8 bg-white"
                : "w-1.5 sm:w-2 bg-white/40 hover:bg-white/70"
            }`}
          />
        </button>
      </div>
    </section>
  );
}
