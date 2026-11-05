"use client";

import React, { createContext, useContext } from "react";
import { useRouter } from "next/navigation";

export interface BulkEnquiryOptions {
  category?: string;
  notes?: string;
}

interface BulkEnquiryContextType {
  isOpen: boolean;
  initialOptions?: BulkEnquiryOptions;
  openBulkModal: (options?: BulkEnquiryOptions | React.MouseEvent | any) => void;
  closeBulkModal: () => void;
}

const BulkEnquiryContext = createContext<BulkEnquiryContextType>({
  isOpen: false,
  openBulkModal: () => {},
  closeBulkModal: () => {},
});

export function BulkEnquiryProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const openBulkModal = (options?: BulkEnquiryOptions | React.MouseEvent | any) => {
    let cat = "";
    if (
      options &&
      typeof options === "object" &&
      !options.nativeEvent &&
      !options._reactName &&
      typeof options.preventDefault !== "function"
    ) {
      if (options.category) cat = options.category;
    }
    const query = cat ? `?category=${encodeURIComponent(cat)}` : "";
    router.push(`/inquiryform${query}`);
  };

  const closeBulkModal = () => {};

  // URL query param & hash listener: redirect to standalone /inquiryform page instead of modal
  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const checkUrl = () => {
      try {
        const search = new URLSearchParams(window.location.search);
        const hash = window.location.hash;

        const isBulk =
          search.get("enquiry") === "bulk" ||
          search.get("bulk") === "true" ||
          search.get("form") === "bulk" ||
          hash === "#bulk-enquiry" ||
          hash === "#bulk-modal" ||
          hash === "#bulk";

        const catParam = (search.get("category") || search.get("cat") || search.get("enquiry") || "").toLowerCase();
        const isHomeCare = catParam === "homecare" || catParam === "home" || hash === "#homecare" || hash === "#home-care";
        const isCorporate = catParam === "corporate" || catParam === "facility" || catParam === "corporatecare" || hash === "#corporate" || hash === "#corporate-care";

        if (isBulk || isHomeCare || isCorporate) {
          let cat = "";
          if (isHomeCare) {
            cat = "Home Care";
          } else if (isCorporate) {
            cat = "Corporate & Facility Care";
          }
          openBulkModal(cat ? { category: cat } : undefined);
        }
      } catch (e) {
        console.error("[BulkEnquiryProvider] checkUrl error:", e);
      }
    };

    checkUrl();
    window.addEventListener("hashchange", checkUrl);
    return () => window.removeEventListener("hashchange", checkUrl);
  }, []);

  return (
    <BulkEnquiryContext.Provider
      value={{
        isOpen: false,
        initialOptions: undefined,
        openBulkModal,
        closeBulkModal,
      }}
    >
      {children}
    </BulkEnquiryContext.Provider>
  );
}

export function useBulkEnquiry() {
  return useContext(BulkEnquiryContext);
}
