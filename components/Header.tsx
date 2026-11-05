"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import {
  Menu,
  X,
  ArrowRight,
  User,
  ChevronDown,
  Car,
  Bike,
  Home,
  Building2,
} from "lucide-react";
import { useOrderModal } from "@/context/OrderModalContext";
import { useBulkEnquiry } from "@/context/BulkEnquiryContext";

const NAV_LINKS = [
  { label: "Home", href: "#home" },
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
];

const CATEGORY_ITEMS = [
  {
    name: "Autocare",
    desc: "Vehicle pressure washing",
    href: "/aquaforceforautocare",
    icon: Car,
    iconColor: "text-[#38bdf8]",
    iconBg: "bg-blue-500/20 border-blue-500/30",
    badge: "Current",
  },
  {
    name: "Service Partner",
    desc: "Delivery & rider partners",
    href: "https://promectools.in/aquaforceforgigworkers",
    icon: Bike,
    iconColor: "text-amber-400",
    iconBg: "bg-amber-500/20 border-amber-500/30",
  },
  {
    name: "Home Care",
    desc: "Driveway & domestic cleaning",
    action: "bulk_modal",
    icon: Home,
    iconColor: "text-emerald-400",
    iconBg: "bg-emerald-500/20 border-emerald-500/30",
  },
  {
    name: "Corporate & Facility Care",
    desc: "Industrial & commercial fleets",
    action: "bulk_modal",
    icon: Building2,
    iconColor: "text-purple-400",
    iconBg: "bg-purple-500/20 border-purple-500/30",
  },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [mobileCategoriesOpen, setMobileCategoriesOpen] = useState(false);
  const [mobileNavbarCategoriesOpen, setMobileNavbarCategoriesOpen] = useState(false);
  const categoriesRef = useRef<HTMLDivElement>(null);
  const { openModal, verifiedUser, openAccountModal } = useOrderModal();
  const { openBulkModal } = useBulkEnquiry();

  const handleAccountClick = (e: React.MouseEvent) => {
    e.preventDefault();
    console.log("[Header] handleAccountClick clicked! verifiedUser:", Boolean(verifiedUser));
    if (verifiedUser) {
      window.location.href = "/aquaforceforautocare/account";
    } else {
      openAccountModal();
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        categoriesRef.current &&
        !categoriesRef.current.contains(e.target as Node)
      ) {
        setCategoriesOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock body scroll when mobile menu or mobile categories is open
  useEffect(() => {
    if (open || mobileNavbarCategoriesOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open, mobileNavbarCategoriesOpen]);

  return (
    <header
      className={`fixed left-0 right-0 z-50 transition-all duration-300 ease-in-out ${
        scrolled
          ? "top-3 sm:top-4 px-3 sm:px-6 md:px-8 pointer-events-none"
          : "top-0 px-4 sm:px-8 lg:px-12 pointer-events-auto bg-gradient-to-b from-black/50 via-black/20 to-transparent"
      }`}
    >
      <div
        className={`mx-auto transition-all duration-300 ease-in-out flex items-center justify-between pointer-events-auto ${
          scrolled
            ? "max-w-[1240px] w-full h-[54px] sm:h-[62px] px-4 sm:px-6 lg:px-8 rounded-xl sm:rounded-2xl bg-black/95 backdrop-blur-md border border-white/20 shadow-[0_12px_36px_rgba(0,0,0,0.7)]"
            : "max-w-[1440px] w-full h-[64px] sm:h-[76px] lg:h-[82px] bg-transparent border-b border-transparent shadow-none"
        }`}
      >
        {/* PROMEC Brand Logo */}
        <div className="flex items-center group shrink-0 select-none">
          <div
            className={`relative transition-all duration-300 shrink-0 ${
              scrolled
                ? "w-[125px] h-[26px] sm:w-[155px] sm:h-[32px] lg:w-[185px] lg:h-[36px]"
                : "w-[135px] h-[28px] sm:w-[170px] sm:h-[34px] lg:w-[200px] lg:h-[40px]"
            }`}
          >
            <Image
              src="/aquaforceforautocare/images/promec-logo.svg"
              alt="PROMEC"
              fill
              priority
              sizes="(max-width: 640px) 135px, (max-width: 1024px) 170px, 200px"
              className="object-contain object-left"
            />
          </div>
        </div>

        {/* Center Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 lg:gap-11">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-[14.5px] lg:text-[16px] font-semibold text-white/90 hover:text-white transition-colors tracking-normal drop-shadow-sm hover:drop-shadow"
            >
              {link.label}
            </a>
          ))}

          {/* Categories Dropdown beside How It Works */}
          <div
            ref={categoriesRef}
            className="relative"
            onMouseEnter={() => setCategoriesOpen(true)}
            onMouseLeave={() => setCategoriesOpen(false)}
          >
            <button
              type="button"
              onClick={() => setCategoriesOpen((v) => !v)}
              aria-expanded={categoriesOpen}
              className="flex items-center gap-1.5 text-[14.5px] lg:text-[16px] font-semibold text-white/90 hover:text-white transition-colors tracking-normal drop-shadow-sm hover:drop-shadow cursor-pointer select-none py-1 group"
            >
              <span>Categories</span>
              <ChevronDown
                size={16}
                className={`transition-transform duration-200 ${
                  categoriesOpen ? "rotate-180 text-white" : "text-white/70 group-hover:text-white"
                }`}
              />
            </button>

            {/* Dropdown Menu Popup */}
            {categoriesOpen && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="w-[290px] bg-black/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.7)] p-2 space-y-1">
                  {CATEGORY_ITEMS.map((item) => {
                    const Icon = item.icon;
                    if (item.action === "bulk_modal") {
                      return (
                        <button
                          key={item.name}
                          type="button"
                          onClick={() => {
                            setCategoriesOpen(false);
                            openBulkModal({
                              category: item.name,
                              notes:
                                item.name === "Home Care"
                                  ? "Requirement for Home Care & Domestic cleaning solutions"
                                  : "Requirement for Corporate & Facility Care / Commercial Fleet solutions",
                            });
                          }}
                          className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/10 active:bg-white/15 transition-all text-left cursor-pointer group/item"
                        >
                          <div className={`w-8 h-8 rounded-lg ${item.iconBg} ${item.iconColor} flex items-center justify-center shrink-0 border transition-transform group-hover/item:scale-105`}>
                            <Icon size={16} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-[13.5px] font-bold text-white font-montserrat truncate">
                              {item.name}
                            </div>
                            <div className="text-[11px] text-white/60 font-open-sans truncate">
                              {item.desc}
                            </div>
                          </div>
                        </button>
                      );
                    }

                    const isExternal = item.href?.startsWith("http");
                    const linkClassName =
                      "flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/10 active:bg-white/15 transition-all text-left group/item";
                    const content = (
                      <>
                        <div
                          className={`w-8 h-8 rounded-lg ${item.iconBg} ${item.iconColor} flex items-center justify-center shrink-0 border transition-transform group-hover/item:scale-105`}
                        >
                          <Icon size={16} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-[13.5px] font-bold text-white font-montserrat flex items-center gap-2 truncate">
                            <span className="truncate">{item.name}</span>
                            {item.badge && (
                              <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-400/30 shrink-0">
                                {item.badge}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-white/60 font-open-sans truncate">
                            {item.desc}
                          </div>
                        </div>
                      </>
                    );

                    if (isExternal) {
                      return (
                        <a
                          key={item.name}
                          href={item.href}
                          onClick={() => setCategoriesOpen(false)}
                          className={linkClassName}
                        >
                          {content}
                        </a>
                      );
                    }

                    return (
                      <Link
                        key={item.name}
                        href={item.href || "#"}
                        onClick={() => setCategoriesOpen(false)}
                        className={linkClassName}
                      >
                        {content}
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Buy Now & My Account Action Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={handleAccountClick}
            title="My Account"
            aria-label="My Account"
            className="flex items-center justify-center w-[38px] h-[38px] sm:w-[42px] sm:h-[42px] rounded-full bg-white/10 hover:bg-white/20 border border-white/25 transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-sm group p-1"
          >
            <div className="relative w-full h-full">
              <Image
                src="/aquaforceforautocare/images/user-3d-avatar.png"
                alt="My Account"
                fill
                className="object-contain drop-shadow transition-transform group-hover:scale-105"
                priority
              />
            </div>
          </button>

          <button
            onClick={openModal}
            className="bg-white hover:bg-slate-100 text-[#0f172a] text-xs font-bold tracking-wider uppercase px-5 lg:px-6 py-2 sm:py-2.5 rounded-[6px] shadow-sm transition-all hover:scale-[1.03] active:scale-[0.97] cursor-pointer font-montserrat"
          >
            BUY NOW
          </button>
        </div>

        {/* Mobile Header Action Buttons */}
        <div className="md:hidden flex items-center gap-1.5 sm:gap-2">
          {/* Mobile Categories Button in Navbar */}
          <button
            type="button"
            onClick={() => {
              setMobileNavbarCategoriesOpen((v) => !v);
              if (open) setOpen(false);
            }}
            className={`flex items-center gap-1 text-[12px] sm:text-[13px] font-semibold px-2.5 py-1 sm:py-1.5 rounded-full border transition-all active:scale-95 cursor-pointer font-montserrat shrink-0 ${
              mobileNavbarCategoriesOpen
                ? "bg-white text-black border-white shadow-[0_0_12px_rgba(255,255,255,0.4)]"
                : "text-white/95 bg-white/10 hover:bg-white/15 border-white/20 backdrop-blur-md"
            }`}
            aria-label="Categories menu"
            aria-expanded={mobileNavbarCategoriesOpen}
          >
            <span>Categories</span>
            <ChevronDown
              size={13}
              className={`transition-transform duration-200 ${
                mobileNavbarCategoriesOpen ? "rotate-180" : "text-white/70"
              }`}
            />
          </button>

          {/* Mobile Menu Toggle Button */}
          <button
            className="text-white p-2 -mr-1 hover:bg-white/10 rounded-lg focus:outline-none transition-colors cursor-pointer"
            onClick={() => {
              setOpen((v) => !v);
              if (mobileNavbarCategoriesOpen) setMobileNavbarCategoriesOpen(false);
            }}
            aria-label="Toggle menu"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu with Backdrop */}
      {open && (
        <>
          <div
            className="md:hidden fixed inset-0 bg-black/70 backdrop-blur-xs z-40 transition-opacity pointer-events-auto"
            onClick={() => setOpen(false)}
          />
          <div
            className={`md:hidden fixed left-4 right-4 z-50 bg-[#0b0c0e]/98 backdrop-blur-xl border border-white/20 p-5 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200 pointer-events-auto ${
              scrolled ? "top-[72px]" : "top-[70px]"
            }`}
          >
            <nav className="flex flex-col gap-2 max-w-[1440px] mx-auto">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-[16px] font-semibold text-white/90 hover:text-white py-2.5 px-3 rounded-lg hover:bg-white/10 active:bg-white/15 transition-colors"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </a>
              ))}

              {/* Mobile Categories Accordion */}
              <div className="border-t border-b border-white/10 py-1.5 my-0.5">
                <button
                  type="button"
                  onClick={() => setMobileCategoriesOpen((v) => !v)}
                  className="w-full flex items-center justify-between text-[16px] font-semibold text-white/90 hover:text-white py-2 px-3 rounded-lg hover:bg-white/10 transition-colors cursor-pointer text-left"
                >
                  <span>Categories</span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-200 ${
                      mobileCategoriesOpen ? "rotate-180 text-white" : "text-white/60"
                    }`}
                  />
                </button>

                {mobileCategoriesOpen && (
                  <div className="pl-3 pr-1 py-1 space-y-1 animate-in fade-in duration-150">
                    {CATEGORY_ITEMS.map((item) => {
                      const Icon = item.icon;
                      if (item.action === "bulk_modal") {
                        return (
                          <button
                            key={item.name}
                            type="button"
                            onClick={() => {
                              setOpen(false);
                              openBulkModal({
                                category: item.name,
                                notes:
                                  item.name === "Home Care"
                                    ? "Requirement for Home Care & Domestic cleaning solutions"
                                    : "Requirement for Corporate & Facility Care / Commercial Fleet solutions",
                              });
                            }}
                            className="w-full flex items-center gap-2.5 py-2 px-3 rounded-lg text-sm text-white/80 hover:text-white hover:bg-white/10 text-left cursor-pointer"
                          >
                            <Icon size={15} className={item.iconColor} />
                            <span>{item.name}</span>
                          </button>
                        );
                      }
                      const isExternal = item.href?.startsWith("http");
                      const mobileClass =
                        "flex items-center gap-2.5 py-2 px-3 rounded-lg text-sm text-white/80 hover:text-white hover:bg-white/10";
                      const mobileContent = (
                        <>
                          <Icon size={15} className={item.iconColor} />
                          <span>{item.name}</span>
                          {item.badge && (
                            <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 border border-sky-400/30 ml-auto">
                              {item.badge}
                            </span>
                          )}
                        </>
                      );

                      if (isExternal) {
                        return (
                          <a
                            key={item.name}
                            href={item.href}
                            onClick={() => setOpen(false)}
                            className={mobileClass}
                          >
                            {mobileContent}
                          </a>
                        );
                      }

                      return (
                        <Link
                          key={item.name}
                          href={item.href || "#"}
                          onClick={() => setOpen(false)}
                          className={mobileClass}
                        >
                          {mobileContent}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
              <button
                onClick={(e) => {
                  setOpen(false);
                  handleAccountClick(e);
                }}
                className="w-full flex items-center justify-between text-[16px] font-semibold text-[#38bdf8] hover:text-white py-2.5 px-3 rounded-lg hover:bg-white/10 active:bg-white/15 transition-colors cursor-pointer text-left"
              >
                <div className="flex items-center gap-2.5">
                  <div className="relative w-6 h-6 shrink-0">
                    <Image
                      src="/aquaforceforautocare/images/user-3d-avatar.png"
                      alt="My Account"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <span>My Account & Orders</span>
                </div>
                <ArrowRight size={16} className="text-white/40" />
              </button>
              <button
                onClick={() => {
                  setOpen(false);
                  openModal();
                }}
                className="mt-2 w-full inline-flex items-center justify-center gap-2 bg-[#0066cc] hover:bg-[#0052b3] active:bg-[#004799] text-white text-xs font-bold tracking-wider uppercase px-5 py-3.5 rounded-[8px] shadow-lg shadow-blue-600/30 cursor-pointer active:scale-98 transition-all font-montserrat"
              >
                <span>BUY NOW</span>
                <ArrowRight className="w-4 h-4 text-white shrink-0" />
              </button>
            </nav>
          </div>
        </>
      )}

      {/* Mobile Categories Dropdown Menu with Backdrop */}
      {mobileNavbarCategoriesOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 bg-black/70 backdrop-blur-xs z-40 transition-opacity pointer-events-auto"
            onClick={() => setMobileNavbarCategoriesOpen(false)}
          />
          <div
            className={`md:hidden fixed left-4 right-4 z-50 bg-[#0b0c0e]/98 backdrop-blur-xl border border-white/20 p-3 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200 pointer-events-auto max-w-[420px] mx-auto ${
              scrolled ? "top-[70px] sm:top-[76px]" : "top-[72px] sm:top-[86px]"
            }`}
          >
            <div className="text-[11px] font-bold text-white/50 uppercase tracking-wider px-2 pb-2 font-montserrat border-b border-white/10 mb-1.5 flex items-center justify-between">
              <span>Categories</span>
              <button
                type="button"
                onClick={() => setMobileNavbarCategoriesOpen(false)}
                className="text-white/60 hover:text-white p-0.5 rounded cursor-pointer"
                aria-label="Close categories"
              >
                <X size={16} />
              </button>
            </div>
            <div className="space-y-1">
              {CATEGORY_ITEMS.map((item) => {
                const Icon = item.icon;
                if (item.action === "bulk_modal") {
                  return (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => {
                        setMobileNavbarCategoriesOpen(false);
                        openBulkModal({
                          category: item.name,
                          notes:
                            item.name === "Home Care"
                              ? "Requirement for Home Care & Domestic cleaning solutions"
                              : "Requirement for Corporate & Facility Care / Commercial Fleet solutions",
                        });
                      }}
                      className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/10 active:bg-white/15 transition-all text-left cursor-pointer group/item"
                    >
                      <div className={`w-8 h-8 rounded-lg ${item.iconBg} ${item.iconColor} flex items-center justify-center shrink-0 border transition-transform group-hover/item:scale-105`}>
                        <Icon size={16} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[13.5px] font-bold text-white font-montserrat flex items-center gap-2 truncate">
                          <span className="truncate">{item.name}</span>
                        </div>
                        <div className="text-[11px] text-white/60 font-open-sans truncate">
                          {item.desc}
                        </div>
                      </div>
                    </button>
                  );
                }

                const isExternal = item.href?.startsWith("http");
                if (isExternal) {
                  return (
                    <a
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileNavbarCategoriesOpen(false)}
                      className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/10 active:bg-white/15 transition-all text-left group/item cursor-pointer"
                    >
                      <div className={`w-8 h-8 rounded-lg ${item.iconBg} ${item.iconColor} flex items-center justify-center shrink-0 border transition-transform group-hover/item:scale-105`}>
                        <Icon size={16} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[13.5px] font-bold text-white font-montserrat flex items-center gap-2 truncate">
                          <span className="truncate">{item.name}</span>
                        </div>
                        <div className="text-[11px] text-white/60 font-open-sans truncate">
                          {item.desc}
                        </div>
                      </div>
                    </a>
                  );
                }

                return (
                  <Link
                    key={item.name}
                    href={item.href || "#"}
                    onClick={() => setMobileNavbarCategoriesOpen(false)}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/10 active:bg-white/15 transition-all text-left group/item cursor-pointer"
                  >
                    <div className={`w-8 h-8 rounded-lg ${item.iconBg} ${item.iconColor} flex items-center justify-center shrink-0 border transition-transform group-hover/item:scale-105`}>
                      <Icon size={16} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[13.5px] font-bold text-white font-montserrat flex items-center gap-2 truncate">
                        <span className="truncate">{item.name}</span>
                        {item.badge && (
                          <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-400/30 shrink-0">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-white/60 font-open-sans truncate">
                        {item.desc}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </>
      )}
    </header>
  );
}
