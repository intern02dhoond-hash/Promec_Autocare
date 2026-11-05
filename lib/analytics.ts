"use client";

export const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ||
  process.env.NEXT_PUBLIC_GA_ID ||
  "";

// Safe wrapper around gtag
export const gtag = (...args: any[]) => {
  if (typeof window !== "undefined" && typeof (window as any).gtag === "function") {
    (window as any).gtag(...args);
  }
};

/**
 * 1. Track Page Views (Website visits)
 */
export const trackPageView = (url: string) => {
  gtag("event", "page_view", {
    page_location: url,
    page_title: typeof document !== "undefined" ? document.title : "",
  });
};

/**
 * 2. Track "Shop Now" / "Buy Now" CTA Button Clicks
 */
export const trackClickShopNow = (buttonLocation: string = "Hero", productName: string = "AquaForce 1400", price: number = 37999) => {
  gtag("event", "select_item", {
    item_list_name: buttonLocation,
    items: [
      {
        item_id: "AMEC-AQUAFORCE-1400",
        item_name: productName,
        price: price,
        quantity: 1,
      },
    ],
  });

  // Custom event for direct funnel reporting in GA4
  gtag("event", "clicked_shop_now", {
    button_location: buttonLocation,
    product_name: productName,
    value: price,
    currency: "INR",
  });
};

/**
 * 3. Track Checkout Page Visits (User arrives at checkout form modal)
 */
export const trackBeginCheckout = (price: number = 37999, quantity: number = 1, variant: string = "Yellow") => {
  // 1. Standard GA4 E-Commerce funnel event
  gtag("event", "begin_checkout", {
    currency: "INR",
    value: price * quantity,
    items: [
      {
        item_id: "AMEC-AQUAFORCE-1400",
        item_name: "AquaForce 1400 High-pressure Washer",
        item_variant: variant,
        price: price,
        quantity: quantity,
      },
    ],
  });

  // 2. Custom funnel event for easy funnel exploration
  gtag("event", "checkout_page_visit", {
    value: price * quantity,
    currency: "INR",
    quantity: quantity,
  });

  // 3. Virtual Page View: registers in GA4 "Pages and Screens" report as /checkout
  gtag("event", "page_view", {
    page_title: "Checkout - AquaForce",
    page_location: typeof window !== "undefined" ? `${window.location.origin}/aquaforceforautocare/checkout` : "https://promectools.in/aquaforceforautocare/checkout",
    page_path: "/checkout",
  });
};

/**
 * 4. Track Payment Mode Selection (UPI, Card, Netbanking, COD)
 */
export const trackAddPaymentInfo = (paymentType: string, value: number) => {
  gtag("event", "add_payment_info", {
    currency: "INR",
    value: value,
    payment_type: paymentType,
    items: [
      {
        item_id: "AMEC-AQUAFORCE-1400",
        item_name: "AquaForce 1400 High-pressure Washer",
        price: value,
        quantity: 1,
      },
    ],
  });
};

/**
 * 5. Track Purchase Conversion
 */
export const trackPurchase = (data: {
  orderId: string;
  value: number;
  paymentMethod: string;
  productName?: string;
  quantity?: number;
}) => {
  gtag("event", "purchase", {
    transaction_id: data.orderId,
    value: data.value,
    currency: "INR",
    payment_type: data.paymentMethod,
    items: [
      {
        item_id: "AMEC-AQUAFORCE-1400",
        item_name: data.productName || "AquaForce 1400 High-pressure Washer",
        price: data.value,
        quantity: data.quantity || 1,
      },
    ],
  });
};
