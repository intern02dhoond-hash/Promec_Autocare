"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, Star, Truck, RotateCcw, CheckCircle2, ArrowRight, ArrowLeft, Lock, FileText, ChevronDown, ChevronUp, Share2, Gift, Check, Info, Headphones, PackageCheck, Smartphone, Zap, CreditCard, Sparkles, Search, Percent, ShoppingCart, Eye, EyeOff, Landmark, ArrowUpRight, AlertTriangle } from "lucide-react";
import EmiCalculatorModal from "./EmiCalculatorModal";
import { QRCodeSVG } from "qrcode.react";
import { PROMEC_PAYLATER_OFFERS_METADATA, REAL_RAZORPAY_CASHBACK_OFFERS } from "@/lib/razorpayOffers";
import { trackBeginCheckout } from "@/lib/analytics";

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  verifiedUser?: {
    fullName: string;
    phone: string;
  } | null;
  startAtCheckout?: boolean;
}

const SpeedingTruckIcon = ({ className = "w-5 h-5 text-[#0066cc]" }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Fast Speed Lines */}
    <path d="M2 8h3" />
    <path d="M1 12h4" />
    <path d="M2 16h3" />
    {/* Truck Container */}
    <path d="M7 6h7.5v9H7z" />
    {/* Aerodynamic Fast Cab */}
    <path d="M14.5 9h3.5l2 3v3h-5.5V9z" />
    {/* Wheels */}
    <circle cx="9" cy="17" r="1.8" fill="currentColor" />
    <circle cx="17.5" cy="17" r="1.8" fill="currentColor" />
  </svg>
);

const getApiPath = (endpoint: string) => {
  const clean = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  return `/aquaforceforautocare${clean}`;
};

type UpiAppId = "paytm" | "phonepe" | "gpay" | "amazonpay" | "bhim";

const UPI_APP_OPTIONS: {
  id: UpiAppId;
  name: string;
  shortName: string;
  badge?: string;
  bgClass: string;
  borderClass: string;
  avatarBg: string;
  logo: string;
  androidPackage: string;
  iosScheme: string;
}[] = [
  {
    id: "paytm",
    name: "Paytm",
    shortName: "Paytm",
    badge: "Win Cashback",
    bgClass: "bg-[#f0f9ff]",
    borderClass: "border-sky-100",
    avatarBg: "bg-white",
    logo: "/UPI options/paytm_logo.svg.png",
    androidPackage: "net.one97.paytm",
    iosScheme: "paytmmp://pay",
  },
  {
    id: "phonepe",
    name: "PhonePe",
    shortName: "PhonePe",
    bgClass: "bg-[#f5f0fb]",
    borderClass: "border-purple-100",
    avatarBg: "bg-[#5f259f]",
    logo: "/UPI options/phonepe_symbol.svg.png",
    androidPackage: "com.phonepe.app",
    iosScheme: "phonepe://pay",
  },
  {
    id: "gpay",
    name: "Google Pay",
    shortName: "G Pay",
    bgClass: "bg-[#fef6f0]",
    borderClass: "border-orange-100",
    avatarBg: "bg-white",
    logo: "/UPI options/google.png",
    androidPackage: "com.google.android.apps.nbu.paisa.user",
    iosScheme: "gpay://upi/pay",
  },
  {
    id: "amazonpay",
    name: "Amazon Pay",
    shortName: "Amazon Pay",
    badge: "Win Cashback",
    bgClass: "bg-[#f8fafc]",
    borderClass: "border-slate-200",
    avatarBg: "bg-[#232f3e]",
    logo: "/UPI options/amazonpay.png",
    androidPackage: "in.amazon.mShop.android.shopping",
    iosScheme: "amazonpay://pay",
  },
  {
    id: "bhim",
    name: "BHIM UPI",
    shortName: "BHIM",
    bgClass: "bg-[#f0fdf4]",
    borderClass: "border-emerald-100",
    avatarBg: "bg-[#eef8ee]",
    logo: "/UPI options/bhim_logo.svg.png",
    androidPackage: "in.org.npci.upiapp",
    iosScheme: "bhim://pay",
  },
];

const getAppSpecificUpiUrl = (baseUpiUrl: string, appId: UpiAppId): string => {
  const isAndroid = typeof navigator !== "undefined" && /android/i.test(navigator.userAgent);
  const isIOS = typeof navigator !== "undefined" && /iPad|iPhone|iPod/.test(navigator.userAgent);

  const query = baseUpiUrl.includes("?")
    ? baseUpiUrl.split("?")[1]
    : baseUpiUrl.replace(/^upi:\/\/pay\??/, "");

  const app = UPI_APP_OPTIONS.find((a) => a.id === appId);
  if (!app) return baseUpiUrl;

  if (isAndroid) {
    return `intent://pay?${query}#Intent;scheme=upi;package=${app.androidPackage};end`;
  }

  if (isIOS) {
    return `${app.iosScheme}?${query}`;
  }

  return `upi://pay?${query}`;
};

const PaymentCardIcon = ({ className = "w-6 h-4 shrink-0" }: { className?: string }) => (
  <svg
    className={className}
    viewBox="5.7 10 24.6 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M5.84383 16.6676C6.40667 16.6556 7.00501 16.6653 7.56977 16.6653L10.8494 16.6653L20.6965 16.6656L27.0415 16.6654L29.0742 16.6654C29.4569 16.6654 29.9152 16.6538 30.2918 16.6762C30.2773 16.8284 30.2865 17.1254 30.2865 17.289V18.5046L30.2864 21.7129C30.2864 22.2698 30.2918 22.8271 30.2845 23.3838C30.2747 24.1237 29.9503 24.7729 29.4167 25.2728C29.1424 25.516 28.8683 25.6911 28.5226 25.8202C28.2573 25.918 27.979 25.9759 27.6967 25.992C27.3356 26.0125 26.8682 25.9994 26.497 25.9992L24.337 25.9985L17.6831 25.9986L11.4454 25.9988L9.41709 25.9995C9.06738 25.9995 8.62386 26.0123 8.28372 25.9906C7.9311 25.9675 7.58572 25.8798 7.26488 25.7317C6.61743 25.432 6.11432 24.889 5.86476 24.2206C5.65805 23.6533 5.70471 22.978 5.7053 22.3784L5.70592 20.7099L5.70528 17.7855C5.70527 17.4585 5.71354 17.1304 5.69753 16.8042C5.69552 16.7632 5.70498 16.7346 5.72218 16.6981C5.77069 16.6606 5.76947 16.673 5.84383 16.6676ZM27.5488 23.9899C28.2639 23.9164 28.2526 23.4268 28.2438 22.8569C28.236 22.3431 28.2588 21.8201 28.233 21.3062C28.1875 20.5529 27.4004 20.6645 26.8622 20.6648L25.5173 20.6655L24.2003 20.6651C24.0229 20.6649 23.6677 20.6543 23.5059 20.6713C22.7755 20.7279 22.7804 21.1361 22.7796 21.7236L22.7791 22.4413C22.7791 22.7391 22.7595 23.0921 22.7888 23.3831C22.8556 24.0482 23.48 23.9932 23.9725 23.9933H24.8965C25.7498 23.9931 26.7013 24.0132 27.5488 23.9899Z"
      fill="#005DA6"
    />
    <path
      d="M8.35485 10.0127C8.67943 10.0009 9.06545 10.0098 9.39417 10.0098H11.3222L17.2059 10.0099L24.0588 10.0099L26.3378 10.0094C27.5517 10.0093 28.6452 9.87624 29.5674 10.8712C30.1954 11.5488 30.2877 12.1413 30.2877 13.0254C30.2897 13.2942 30.2868 13.5631 30.2792 13.8319C29.4134 13.8505 28.4975 13.8357 27.6278 13.8357L12.8873 13.8356L8.02685 13.8356L6.36726 13.8371C6.16022 13.8374 5.90361 13.8258 5.70436 13.8329C5.71304 12.6925 5.57019 11.8004 6.41791 10.8802C6.92548 10.3292 7.61096 10.0448 8.35485 10.0127Z"
      fill="#005DA6"
    />
  </svg>
);

const EmiBadgeIcon = ({ className = "w-[26px] h-[16px] shrink-0" }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 26 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="26" height="16" rx="3.5" fill="#005DA6" />
    <text
      x="13"
      y="11.5"
      fill="white"
      fontSize="9.5"
      fontWeight="800"
      fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      textAnchor="middle"
      letterSpacing="-0.2px"
    >
      EMI
    </text>
  </svg>
);

const EmiCardPercentIcon = ({ className = "w-5 h-5 text-slate-800 shrink-0" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="14" x="2" y="5" rx="2" />
    <line x1="2" y1="10" x2="22" y2="10" />
    <circle cx="8" cy="15" r="0.75" fill="currentColor" />
    <circle cx="16" cy="15" r="0.75" fill="currentColor" />
    <line x1="15" y1="13" x2="9" y2="17" strokeWidth="2" />
  </svg>
);

const CodPaymentIcon = ({ className = "w-[22px] h-[22px] shrink-0" }: { className?: string }) => (
  <svg
    className={className}
    viewBox="6 6 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M6 19.0367C6.04955 18.8906 6.04734 18.5055 6.06803 18.3282C6.18976 17.2849 6.4434 16.3058 6.86209 15.3403C7.7873 13.1932 9.40162 11.4155 11.45 10.2884C12.2796 9.84244 13.1623 9.50327 14.0771 9.27892C14.3582 9.21278 14.7174 9.1542 15.005 9.10303L15.0066 16.9395L15.0066 19.1818L15.0058 19.8694C15.0057 20.0118 15.0006 20.1938 15.0165 20.332C15.0369 20.4992 15.1131 20.6544 15.2329 20.7727C15.4613 20.9967 15.7066 20.9924 16.0084 20.9914C16.2116 20.9908 16.4168 20.9903 16.6203 20.9901L18.4273 20.99H24.0409L25.8568 20.9901C26.1745 20.9901 26.5894 20.9791 26.9008 20.9982C26.8817 21.0824 26.8645 21.1682 26.8497 21.2533C26.7589 21.7792 26.6352 22.3114 26.466 22.8186C25.6676 25.1776 24.0666 27.1818 21.942 28.4815C21.8191 28.5582 21.658 28.6417 21.5295 28.7121C20.696 29.1738 19.8012 29.5155 18.872 29.7269C18.4125 29.8344 17.9811 29.9054 17.5101 29.9516C17.363 29.966 17.0943 29.9564 16.963 29.9999H15.8839C15.8125 29.9732 15.7069 29.967 15.6293 29.9608C14.2854 29.8522 12.9771 29.488 11.7706 28.8721C9.12736 27.5356 7.16986 25.1468 6.37869 22.2925C6.27464 21.9211 6.16953 21.4437 6.11616 21.0573C6.09543 20.9078 6.07727 20.7579 6.0617 20.6077C6.05018 20.4856 6.04098 20.2348 6 20.1271V19.0367Z"
      fill="#005DA6"
    />
    <path
      d="M17.1005 6H17.5119C17.5843 6.02684 17.699 6.03435 17.779 6.04048C18.0561 6.06172 18.3322 6.09948 18.607 6.1411C19.1896 6.23348 19.7658 6.36331 20.3318 6.52979C23.8972 7.58574 26.872 10.0602 28.5596 13.3736C29.149 14.5353 29.5667 15.7763 29.7995 17.058C29.8717 17.4683 29.9316 17.876 29.9638 18.2919C29.9693 18.3638 29.9761 18.4542 29.9998 18.522V18.8782C29.9351 19.0274 29.9034 19.1291 29.79 19.2525C29.539 19.5259 29.2257 19.497 28.8876 19.4972L28.2389 19.4971L26.0279 19.4965H19.7122H17.6396C17.2803 19.4965 16.8583 19.4856 16.5039 19.5011C16.5213 19.1575 16.5074 18.6983 16.5074 18.3448L16.5075 16.1264L16.5075 9.36869L16.507 7.68138C16.5069 7.38106 16.4804 6.79996 16.5497 6.52764C16.6314 6.20613 16.8546 6.1308 17.0917 6.00476L17.1005 6ZM18.0059 17.9875C18.1503 17.9774 18.3274 17.9873 18.4763 17.9876L19.4305 17.9879L22.4411 17.9878H26.4027L27.7187 17.9879C27.9354 17.9879 28.2021 17.9814 28.4166 17.9903C28.4199 17.9153 28.3749 17.7085 28.3627 17.6245C28.3169 17.3093 28.2651 17.0259 28.1886 16.7169C28.056 16.1809 27.8847 15.5842 27.6783 15.0696C27.1617 13.7806 26.3818 12.4926 25.4438 11.4688C25.0819 11.0659 24.6949 10.6865 24.2846 10.333C23.172 9.3915 21.8968 8.66109 20.5217 8.1777C20.0186 8.00362 19.4418 7.82203 18.9179 7.72764C18.7196 7.69383 18.5211 7.66119 18.3224 7.62973C18.2496 7.61812 18.0727 7.59458 18.0115 7.57348C17.9968 8.46329 18.0085 9.38369 18.0085 10.2753L18.0087 15.287V17.0205C18.0087 17.3361 18.0147 17.6736 18.0059 17.9875Z"
      fill="#005DA6"
    />
    <path
      d="M20.6674 10.7035C20.905 10.7019 21.1427 10.7016 21.3803 10.7025L22.6246 10.7017L23.2746 10.7017L23.4742 10.7017C23.6186 10.7017 23.7332 10.6994 23.8326 10.8236C23.8862 10.8914 23.9102 10.9778 23.8992 11.0634C23.8887 11.1486 23.8444 11.226 23.7763 11.2781C23.6732 11.3577 23.5784 11.3476 23.4554 11.3476L23.2035 11.3475L23.037 11.3475C23.0024 11.3475 22.958 11.349 22.9244 11.3447C23.0977 11.6091 23.1698 11.8353 23.2213 12.1428C23.2684 12.1464 23.3173 12.1435 23.3645 12.1448C23.5309 12.1494 23.6912 12.1127 23.8171 12.2487C23.8753 12.312 23.9057 12.396 23.9014 12.4819C23.8975 12.5672 23.8597 12.6474 23.7964 12.7047C23.6563 12.8312 23.4904 12.7776 23.3201 12.7894C23.2892 12.7915 23.2492 12.7905 23.2181 12.7889L23.2177 12.7918C23.15 13.2387 22.9265 13.6901 22.5568 13.962C22.3566 14.111 22.1167 14.1972 21.8675 14.21C21.7681 14.216 21.6353 14.2125 21.5335 14.2123L21.3365 14.2118C21.2987 14.2117 21.2489 14.2138 21.2128 14.2083C21.3623 14.4023 21.5282 14.602 21.6823 14.7935L22.5423 15.8621L22.8896 16.2935C22.9086 16.317 22.9278 16.3406 22.9466 16.3642C23.0374 16.4783 23.1215 16.5541 23.1075 16.7118C23.0996 16.7963 23.0584 16.8742 22.9928 16.9281C22.9271 16.9831 22.8418 17.0091 22.7566 16.9999C22.5882 16.9833 22.5235 16.8572 22.4243 16.7393C22.4067 16.7185 22.39 16.6967 22.3729 16.6754L21.9875 16.1969C21.8524 16.0226 21.7034 15.8432 21.5647 15.6709L20.7584 14.669L20.4438 14.2778C20.3974 14.2206 20.3 14.1068 20.2663 14.0506C20.2222 13.9785 20.2095 13.8916 20.231 13.8098C20.2586 13.703 20.3378 13.6141 20.4426 13.5824C20.5188 13.5593 20.6773 13.5664 20.7621 13.5664L21.4756 13.5666C21.5852 13.5666 21.7873 13.5726 21.8865 13.5567C21.9743 13.5424 22.0584 13.5114 22.1345 13.4654C22.3865 13.3139 22.4992 13.0615 22.5661 12.7896L20.9627 12.7891L20.5138 12.7892C20.4533 12.7892 20.3247 12.7926 20.2699 12.7842C20.2039 12.7736 20.1429 12.7426 20.0954 12.6956C20.0342 12.6345 19.9998 12.5516 20 12.4651C20.001 12.3778 20.0369 12.2944 20.0996 12.2337C20.1641 12.1717 20.2445 12.1449 20.3325 12.145C20.3993 12.145 20.4663 12.1446 20.5331 12.1447L21.0265 12.1447L22.0314 12.1447C22.2101 12.1447 22.3951 12.142 22.5729 12.1454C22.5666 12.126 22.5624 12.1029 22.5576 12.0828C22.5138 11.9006 22.4326 11.7263 22.2996 11.5911C22.196 11.485 22.0647 11.4102 21.9206 11.3752C21.7941 11.3433 21.7019 11.3472 21.5741 11.3474L21.3312 11.3476L20.6054 11.3476C20.5027 11.3476 20.3431 11.356 20.2455 11.3363C20.109 11.3086 20.0056 11.174 20.0021 11.0329C19.9996 10.9455 20.0328 10.8609 20.0942 10.7986C20.1969 10.6933 20.3131 10.7038 20.4463 10.7041C20.52 10.7047 20.5937 10.7046 20.6674 10.7035Z"
      fill="#005DA6"
    />
  </svg>
);
const UpiPaymentIcon = ({ className = "w-5 h-5 text-[#005DA6]" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 32 32" fill="none">
    <path
      d="M15.665 7.09912L16.4209 8.479V8.47998C16.5307 8.6798 16.7018 9.00597 16.8555 9.25732L18.0713 11.2456L18.6738 8.99463L19.6562 5.32764L21.7432 9.12549L24.3486 13.8608C24.7028 14.5032 25.0806 15.1637 25.4258 15.7993L16.6064 24.2231L13.8916 26.813L14.457 24.7085L14.8467 23.2573L14.8477 23.2554C14.8699 23.1718 14.9153 22.988 14.9453 22.8726C14.9631 22.8041 14.9802 22.7412 14.9951 22.689C15.0024 22.6633 15.0086 22.6425 15.0137 22.6265C15.0176 22.6139 15.0199 22.6068 15.0205 22.605L16.2588 19.2632L13.4629 21.4722C13.3297 21.5774 13.1122 21.7967 13.082 21.8257L12.5713 22.314V22.3149L10.8242 23.9858L8.55664 26.146L12.874 10.0552L14.1152 5.42432V5.42236C14.1831 5.16726 14.2497 4.90956 14.3174 4.65186L15.665 7.09912Z"
      stroke="#005DA6"
      strokeWidth={2}
    />
    <path
      d="M21.7432 9.125V9.12598L24.3486 13.8604V13.8613C24.7029 14.5038 25.0805 15.1641 25.4258 15.7998L16.6064 24.2227L13.8916 26.8125L14.457 24.708L14.8467 23.2578V23.2559C14.8689 23.1724 14.9153 22.9887 14.9453 22.873C14.9526 22.8451 14.9589 22.8177 14.9658 22.792C15.0735 22.6904 15.195 22.5794 15.3408 22.4404L15.4365 22.3496L15.5049 22.2363L16.7725 20.1533L20.1504 17.2588L20.1709 17.2422L20.1895 17.2236C20.8162 16.6266 20.6552 16.7621 21.209 16.2061L21.7217 15.6904L21.3896 15.0439C21.1069 14.4924 20.7236 13.6507 20.376 13.0186L20.3623 12.9922L20.3467 12.9678L18.3799 9.84375L19.6523 5.32324L21.7432 9.125Z"
      stroke="#005DA6"
      strokeWidth={2}
    />
  </svg>
);

const CardPaymentIcon = ({ className = "w-5 h-5 text-[#005a9c]" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" d="M2.25 6A2.25 2.25 0 014.5 3.75h15A2.25 2.25 0 0121.75 6v12a2.25 2.25 0 01-2.25 2.25h-15A2.25 2.25 0 012.25 18V6zm3 1.5a.75.75 0 000 1.5h1.5a.75.75 0 000-1.5h-1.5zm0 3a.75.75 0 000 1.5h6a.75.75 0 000-1.5h-6z" clipRule="evenodd" />
  </svg>
);

const BankPaymentIcon = ({ className = "w-5 h-5 text-[#005DA6]" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <g clipPath="url(#clip0_netbanking_bank)">
      <path d="M11.9146 0.755046C11.9313 0.754477 11.9479 0.754049 11.9645 0.753764C12.2112 0.749366 12.457 0.786913 12.691 0.864802C12.8918 0.932183 13.1139 1.02873 13.3116 1.10945L14.273 1.50249L17.2543 2.72084L20.637 4.10233L21.7356 4.55116C21.9445 4.63655 22.1867 4.72914 22.3897 4.82423C22.5401 4.89488 22.6779 4.98978 22.7976 5.10512C23.1169 5.41798 23.247 5.7988 23.251 6.23883L23.2504 7.07345C23.2492 7.68284 23.2663 8.08419 22.8117 8.55628C22.2864 9.10165 21.6257 9.00409 20.942 9.00409L19.0393 9.00373L12.0993 9.00393L5.1279 9.00398L3.14294 9.00449C2.85923 9.00455 2.29306 9.01968 2.03648 8.98405C1.7512 8.9453 1.48355 8.82369 1.26674 8.63428C0.973832 8.38102 0.769212 7.99051 0.754676 7.59978C0.740648 7.22264 0.754785 6.84113 0.7493 6.46333C0.746066 6.24069 0.744966 6.01228 0.800216 5.79529C0.85837 5.57121 0.967825 5.36372 1.11994 5.18919C1.41195 4.85683 1.73306 4.76644 2.12773 4.60589L3.11408 4.20483L6.22678 2.93246L9.56642 1.56809L10.634 1.13137C11.0945 0.942782 11.4062 0.786966 11.9146 0.755046Z" fill="#005DA6"/>
      <path d="M2.51097 19.5045C2.92208 19.4849 3.44589 19.4991 3.86543 19.4991L6.3699 19.4992H14.0004L19.1174 19.4991L20.6724 19.4992C20.9298 19.4992 21.3258 19.4876 21.5698 19.512C21.9437 19.549 22.2978 19.6988 22.5846 19.9416C22.9658 20.2628 23.2027 20.7231 23.2426 21.22C23.2842 21.7179 23.1247 22.2119 22.7997 22.5914C22.4651 22.9863 22.0167 23.2029 21.5051 23.2475C21.0402 23.2656 20.5184 23.2537 20.0481 23.2538H17.4595L9.60819 23.2537L4.76614 23.2536L3.28592 23.2541C3.03685 23.2541 2.65677 23.265 2.41848 23.2395C2.06264 23.2007 1.72551 23.0602 1.44748 22.8347C1.05163 22.5107 0.805734 22.0643 0.759764 21.5534C0.710725 21.048 0.868369 20.5442 1.19679 20.1569C1.53854 19.7478 1.98733 19.5491 2.51097 19.5045Z" fill="#005DA6"/>
      <path d="M9.00477 10.5009L12.2507 10.4995C13.1611 10.4995 14.0909 10.4889 14.9994 10.5028L15.0005 15.0757C15.0005 16.0418 15.0136 17.0385 14.998 18.0022C14.3481 18.0129 13.6731 18.0041 13.0216 18.0041H8.9983C9.01576 17.4137 8.99983 16.7324 8.99987 16.1362L8.9999 12.4964L8.99959 11.219C8.99946 10.9953 8.99142 10.7179 9.00477 10.5009Z" fill="#005DA6"/>
      <path d="M16.5048 10.5008L18.869 10.4995C19.5747 10.4994 20.2946 10.4924 20.9995 10.5026L21.0005 15.0724C21.0007 16.0394 21.0134 17.0371 20.9981 18.0021C20.5076 18.0103 20.0006 18.0039 19.5091 18.004H16.4983C16.5158 17.4158 16.4998 16.7367 16.5 16.1428V12.4939L16.4996 11.2234C16.4995 10.9987 16.4914 10.7189 16.5048 10.5008Z" fill="#005DA6"/>
      <path d="M3.00481 10.5008L5.36898 10.4995C6.07477 10.4994 6.79461 10.4924 7.49946 10.5026L7.50054 15.096C7.5006 16.0548 7.51358 17.0453 7.4981 18.0021C7.0074 18.0104 6.49927 18.0039 6.00752 18.004H2.99834C3.01581 17.4136 2.99987 16.732 2.99991 16.1358L2.99994 12.4989L2.99963 11.2239C2.9995 10.9991 2.99136 10.7189 3.00481 10.5008Z" fill="#005DA6"/>
    </g>
    <defs>
      <clipPath id="clip0_netbanking_bank">
        <rect width="24" height="24" fill="white"/>
      </clipPath>
    </defs>
  </svg>
);

const RibbonBadge = ({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) => (
  <div
    className={`absolute -top-3 sm:-top-3.5 left-1/2 -translate-x-1/2 z-20 pointer-events-none flex items-start justify-center select-none ${className}`}
  >
    {/* Left folded wing */}
    <svg
      className="w-2 sm:w-2.5 h-3 sm:h-3.5 text-[#0c6b32] shrink-0 fill-current -mr-[0.5px]"
      viewBox="0 0 10 14"
      preserveAspectRatio="none"
    >
      <polygon points="0,14 10,0 10,14" />
    </svg>

    {/* Center Banner */}
    <div className="bg-[#16a34a] text-white font-montserrat font-bold text-[10px] sm:text-[11px] tracking-tight px-3 sm:px-4 py-0.5 rounded-b-[6px] shadow-xs whitespace-nowrap flex items-center justify-center leading-none">
      {text}
    </div>

    {/* Right folded wing */}
    <svg
      className="w-2 sm:w-2.5 h-3 sm:h-3.5 text-[#0c6b32] shrink-0 fill-current -ml-[0.5px]"
      viewBox="0 0 10 14"
      preserveAspectRatio="none"
    >
      <polygon points="0,0 10,14 0,14" />
    </svg>
  </div>
);

const GooglePayIcon = ({ className = "w-8 h-8" }: { className?: string }) => (
  <div
    className={`${className} rounded-full bg-white border border-slate-200/90 flex items-center justify-center p-1.5 shadow-2xs shrink-0 select-none hover:border-slate-300 transition-colors overflow-hidden`}
    title="Google Pay"
  >
    <img
      src={getApiPath("/UPI options/google.png")}
      alt="Google Pay"
      className="w-full h-full object-contain"
      loading="lazy"
    />
  </div>
);

const PhonePeIcon = ({ className = "w-8 h-8" }: { className?: string }) => (
  <div
    className={`${className} rounded-full flex items-center justify-center shrink-0 select-none overflow-hidden shadow-2xs hover:brightness-105 transition-all`}
    title="PhonePe"
  >
    <img
      src={getApiPath("/UPI options/phonepe_symbol.svg.png")}
      alt="PhonePe"
      className="w-full h-full object-cover"
      loading="lazy"
    />
  </div>
);

const PaytmIcon = ({ className = "w-8 h-8" }: { className?: string }) => (
  <div
    className={`${className} rounded-full bg-white border border-slate-200/90 flex items-center justify-center px-1.5 py-1 shadow-2xs shrink-0 select-none hover:border-slate-300 transition-colors overflow-hidden`}
    title="Paytm"
  >
    <img
      src={getApiPath("/UPI options/paytm_logo.svg.png")}
      alt="Paytm"
      className="w-full h-full object-contain"
      loading="lazy"
    />
  </div>
);

const AmazonPayIcon = ({ className = "w-8 h-8" }: { className?: string }) => (
  <div
    className={`${className} rounded-full bg-white border border-slate-200/90 flex items-center justify-center p-1.5 shadow-2xs shrink-0 select-none hover:border-slate-300 transition-colors overflow-hidden`}
    title="Amazon Pay"
  >
    <img
      src={getApiPath("/UPI options/amazonpay.png")}
      alt="Amazon Pay"
      className="w-full h-full object-contain"
      loading="lazy"
    />
  </div>
);

const BhimIcon = ({ className = "w-8 h-8" }: { className?: string }) => (
  <div
    className={`${className} rounded-full bg-white border border-slate-200/90 flex items-center justify-center p-1.5 shadow-2xs shrink-0 select-none hover:border-slate-300 transition-colors overflow-hidden`}
    title="BHIM UPI"
  >
    <img
      src={getApiPath("/UPI options/bhim_logo.svg.png")}
      alt="BHIM UPI"
      className="w-full h-full object-contain"
      loading="lazy"
    />
  </div>
);

export interface EmiPlan {
  months: number;
  interestRate: number;
  monthlyAmount: number;
  totalPayable: number;
  isNoCost: boolean;
  isMostPopular?: boolean;
}

export interface EmiBankItem {
  id: string;
  code: string;
  name: string;
  logo: string;
  type: "credit" | "debit" | "both" | "cardless";
  isNoCost: boolean;
  hasOffer: boolean;
  offerText: string;
  offerId?: string;
  minAmount: number;
  startingEmi: number;
  plans: EmiPlan[];
  cashbackAmount?: number;
  cashbackText?: string;
  cashbackOfferId?: string;
  interestSavedAmount?: number;
  totalSavingsAmount?: number;
  badgeText?: string;
}

export interface NetbankingBankItem {
  code: string;
  name: string;
  shortName: string;
  logo: string;
  isPopular: boolean;
}

const DEFAULT_EMI_BANKS: EmiBankItem[] = [
  // 14 Real Credit Cards Enabled in Razorpay
  {
    id: "axis",
    code: "UTIB",
    name: "AXIS Bank",
    logo: "https://cashfreelogo.cashfree.com/assets_images/pg/nb/64/axis.png",
    type: "credit",
    isNoCost: true,
    hasOffer: true,
    offerText: "No Cost EMI + 5% Cashback",
    minAmount: 4000,
    startingEmi: 5488,
    plans: [],
  },
  {
    id: "icic",
    code: "ICIC",
    name: "ICICI Bank",
    logo: "https://cashfreelogo.cashfree.com/assets_images/pg/nb/64/icici.png",
    type: "credit",
    isNoCost: true,
    hasOffer: true,
    offerText: "No Cost EMI",
    minAmount: 4000,
    startingEmi: 5434,
    plans: [],
  },
  {
    id: "amex",
    code: "AMEX",
    name: "American Express Bank",
    logo: "https://cashfreelogo.cashfree.com/assets_images/pg/card/64/amex.png",
    type: "credit",
    isNoCost: false,
    hasOffer: false,
    offerText: "",
    minAmount: 5000,
    startingEmi: 5364,
    plans: [],
  },
  {
    id: "yesb",
    code: "YESB",
    name: "Yes Bank",
    logo: "https://cashfreelogo.cashfree.com/assets_images/pg/nb/64/yes.png",
    type: "credit",
    isNoCost: true,
    hasOffer: true,
    offerText: "No Cost EMI + 5% Cashback",
    minAmount: 4000,
    startingEmi: 5488,
    plans: [],
  },
  {
    id: "hsbc",
    code: "HSBC",
    name: "HSBC",
    logo: "https://cashfreelogo.cashfree.com/assets_images/pg/nb/64/hsb.png",
    type: "credit",
    isNoCost: true,
    hasOffer: true,
    offerText: "No Cost EMI + 5% Cashback",
    minAmount: 4000,
    startingEmi: 5488,
    plans: [],
  },
  {
    id: "scbl",
    code: "SCBL",
    name: "Standard Chartered Bank",
    logo: "https://cashfreelogo.cashfree.com/assets_images/pg/nb/64/scb.png",
    type: "credit",
    isNoCost: true,
    hasOffer: true,
    offerText: "No Cost EMI",
    minAmount: 4000,
    startingEmi: 5488,
    plans: [],
  },
  {
    id: "indb",
    code: "INDB",
    name: "Indus Ind Bank",
    logo: "https://cashfreelogo.cashfree.com/assets_images/pg/nb/64/indusind.png",
    type: "credit",
    isNoCost: true,
    hasOffer: true,
    offerText: "No Cost EMI",
    minAmount: 4000,
    startingEmi: 5488,
    plans: [],
  },
  {
    id: "barb",
    code: "BARB",
    name: "Bank of Baroda",
    logo: "https://cashfreelogo.cashfree.com/assets_images/pg/nb/64/bobc.png",
    type: "credit",
    isNoCost: true,
    hasOffer: true,
    offerText: "No Cost EMI",
    minAmount: 4000,
    startingEmi: 5488,
    plans: [],
  },
  {
    id: "fdrl",
    code: "FDRL",
    name: "Federal Bank",
    logo: "https://cashfreelogo.cashfree.com/assets_images/pg/nb/64/federal.png",
    type: "credit",
    isNoCost: true,
    hasOffer: true,
    offerText: "No Cost EMI",
    minAmount: 4000,
    startingEmi: 5488,
    plans: [],
  },
  {
    id: "onecard",
    code: "onecard",
    name: "One Card",
    logo: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'><circle cx='32' cy='32' r='30' fill='black'/><text x='32' y='42' font-size='30' font-weight='900' font-family='Arial,sans-serif' fill='white' text-anchor='middle'>1</text></svg>",
    type: "credit",
    isNoCost: false,
    hasOffer: false,
    offerText: "",
    minAmount: 2500,
    startingEmi: 5488,
    plans: [],
  },
  {
    id: "aubl",
    code: "AUBL",
    name: "AU Small Finance Bank",
    logo: "https://cashfreelogo.cashfree.com/assets_images/pg/nb/64/aus.png",
    type: "credit",
    isNoCost: true,
    hasOffer: true,
    offerText: "No Cost EMI",
    minAmount: 3000,
    startingEmi: 5488,
    plans: [],
  },
  {
    id: "idfb",
    code: "IDFB",
    name: "IDFC First Bank",
    logo: "https://cashfreelogo.cashfree.com/assets_images/pg/nb/64/idfc.png",
    type: "credit",
    isNoCost: true,
    hasOffer: true,
    offerText: "No Cost EMI + 3.5% Cashback",
    minAmount: 4000,
    startingEmi: 3902,
    plans: [],
  },
  {
    id: "kkbk",
    code: "KKBK",
    name: "Kotak Mahindra Bank",
    logo: "https://cashfreelogo.cashfree.com/assets_images/pg/paylater/64/kotak.png",
    type: "credit",
    isNoCost: true,
    hasOffer: true,
    offerText: "No Cost EMI",
    minAmount: 4000,
    startingEmi: 5488,
    plans: [],
  },
  {
    id: "ratn",
    code: "RATN",
    name: "RBL Bank",
    logo: "https://cashfreelogo.cashfree.com/assets_images/pg/nb/64/rbl.png",
    type: "credit",
    isNoCost: false,
    hasOffer: false,
    offerText: "",
    minAmount: 2000,
    startingEmi: 5488,
    plans: [],
  },

  // 1 Real Debit Card Enabled in Razorpay (HDFC Bank Debit Card)
  {
    id: "hdfc_dc",
    code: "HDFC_DC",
    name: "HDFC Bank Debit Card",
    logo: "https://cashfreelogo.cashfree.com/assets_images/pg/nb/64/hdfc.png",
    type: "debit",
    isNoCost: true,
    hasOffer: true,
    offerText: "No Cost EMI",
    minAmount: 6000,
    startingEmi: 3075,
    plans: [],
  },
];

export interface DynamicEmiPlan {
  months: number;
  monthlyAmount: number;
  interestRate: number;
  totalPayable: number;
  isNoCost: boolean;
  isMostPopular?: boolean;
}

function calculateEmi(principal: number, annualRatePercent: number, months: number): number {
  if (annualRatePercent === 0 || !annualRatePercent) {
    return Math.round(principal / months);
  }
  const monthlyRate = annualRatePercent / 12 / 100;
  const emi =
    (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
    (Math.pow(1 + monthlyRate, months) - 1);
  return Math.round(emi);
}

export const calculateBankEmiPlans = (
  bankId: string,
  bankCode: string,
  bankName: string,
  totalAmount: number
): DynamicEmiPlan[] => {
  const isDebit =
    bankId.toLowerCase().includes("_dc") ||
    bankCode.toLowerCase().includes("_dc") ||
    bankName.toLowerCase().includes("debit");
  const isHdfc =
    bankId.toLowerCase().includes("hdfc") ||
    bankCode.toLowerCase().includes("hdfc") ||
    bankName.toLowerCase().includes("hdfc");
  const isIndus =
    bankId.toLowerCase().includes("ind") ||
    bankCode.toLowerCase().includes("indb") ||
    bankName.toLowerCase().includes("indus");
  const isBajaj =
    bankId.toLowerCase().includes("bajaj") ||
    bankCode.toLowerCase().includes("bajaj") ||
    bankName.toLowerCase().includes("bajaj");

  const principal = totalAmount;

  // Available tenures
  const tenures = isBajaj
    ? [3, 6]
    : isHdfc && !isDebit
    ? [3, 6, 9, 12, 18, 24, 36, 48]
    : isIndus
    ? [3, 6, 9, 12, 18, 24, 36]
    : isDebit
    ? [3, 6, 9, 12, 18]
    : [3, 6, 9, 12, 18, 24];

  // Match against Promec PayLater No Cost EMI Offers configured in Razorpay
  const normalizedBankCode = (bankCode || bankId || "").toUpperCase();
  const noCostMeta = PROMEC_PAYLATER_OFFERS_METADATA.find(
    (meta) =>
      meta.bankCode === normalizedBankCode ||
      (isDebit && meta.cardType === "debit" && (meta.bankCode === "HDFC_DC" || normalizedBankCode.includes("HDFC"))) ||
      (!isDebit && meta.cardType === "credit" && (meta.bankCode === normalizedBankCode || meta.bankName.toLowerCase().includes(bankName.toLowerCase())))
  );

  const eligibleTenures = new Set<number>(
    noCostMeta && totalAmount >= (noCostMeta.minAmount || 0) && totalAmount <= (noCostMeta.maxAmount || 999999)
      ? noCostMeta.tenures
      : []
  );

  return tenures.map((months) => {
    const isNoCost = eligibleTenures.has(months);

    if (isNoCost) {
      const monthlyAmount = Math.round(principal / months);
      return {
        months,
        monthlyAmount,
        interestRate: 0,
        totalPayable: principal,
        isNoCost: true,
        isMostPopular: months === 6,
      };
    }

    const interestRate = bankCode === "UTIB" ? 17 : bankCode === "onecard" ? 16 : bankCode === "KKBK" ? 16 : 15;
    const monthlyAmount = calculateEmi(principal, interestRate, months);
    const totalPayable = monthlyAmount * months;
    return {
      months,
      monthlyAmount,
      interestRate,
      totalPayable,
      isNoCost: false,
      isMostPopular: months === 6,
    };
  });
};

export const calculateStartingEmi = (
  bankId: string,
  bankCode: string,
  bankName: string,
  totalAmount: number
): number => {
  const plans = calculateBankEmiPlans(bankId, bankCode, bankName, totalAmount);
  if (!plans.length) return Math.round(totalAmount / 12);
  const plan6 = plans.find((p) => p.months === 6);
  if (plan6) return plan6.monthlyAmount;
  return plans[0].monthlyAmount;
};

export const isCardEligibleForEmiBank = (
  cardNumber: string,
  bankCode: string,
  bankName: string
): boolean => {
  const clean = cardNumber.replace(/\D/g, "");
  if (clean.length < 6) return true; // user is still typing

  const lowerCode = (bankCode || "").toLowerCase();
  const lowerName = (bankName || "").toLowerCase();

  // Amex validation
  const isAmexCard = clean.startsWith("34") || clean.startsWith("37");
  const isAmexBank = lowerCode.includes("amex") || lowerName.includes("american express");
  if (isAmexCard && !isAmexBank) {
    return false;
  }
  if (!isAmexCard && isAmexBank) {
    return false;
  }

  // Valid card networks: Visa (4), Mastercard (51-55, 22-27), RuPay (6, 508, 81, 82), Diners (36, 38, 30)
  const isRecognizedNetwork =
    clean.startsWith("4") ||
    clean.startsWith("5") ||
    clean.startsWith("2") ||
    clean.startsWith("6") ||
    clean.startsWith("508") ||
    clean.startsWith("81") ||
    clean.startsWith("82") ||
    clean.startsWith("34") ||
    clean.startsWith("37") ||
    clean.startsWith("36") ||
    clean.startsWith("38") ||
    clean.startsWith("30");

  if (!isRecognizedNetwork && clean.length >= 6) {
    return false;
  }

  return true;
};

// Razorpay native gateway supported EMI banks
export const RZP_NATIVE_EMI_BANKS = new Set([
  "AMEX", "AUBL", "BARB", "FDRL", "HDFC_DC", "HSBC", "ICIC", 
  "IDFB", "INDB", "KKBK", "RATN", "SCBL", "UTIB", "YESB", "onecard", "HDFC"
]);

const DEFAULT_NETBANKING_BANKS: NetbankingBankItem[] = [
  {
    code: "SBIN",
    name: "State Bank of India",
    shortName: "SBI",
    logo: "https://cashfreelogo.cashfree.com/assets_images/pg/nb/64/sbi.png",
    isPopular: true,
  },
  {
    code: "ICIC",
    name: "ICICI Bank",
    shortName: "ICICI Bank",
    logo: "https://cashfreelogo.cashfree.com/assets_images/pg/nb/64/icici.png",
    isPopular: true,
  },
  {
    code: "UTIB",
    name: "Axis Bank",
    shortName: "Axis Bank",
    logo: "https://cashfreelogo.cashfree.com/assets_images/pg/nb/64/axis.png",
    isPopular: true,
  },
  {
    code: "KKBK",
    name: "Kotak Mahindra Bank",
    shortName: "Kotak Mahindra Bank",
    logo: "https://cashfreelogo.cashfree.com/assets_images/pg/nb/64/kotak.png",
    isPopular: true,
  },
  {
    code: "CNRB",
    name: "Canara Bank",
    shortName: "Canara Bank",
    logo: "https://cashfreelogo.cashfree.com/assets_images/pg/nb/64/canara.png",
    isPopular: true,
  },
  {
    code: "HDFC",
    name: "HDFC Bank",
    shortName: "HDFC Bank",
    logo: "https://cashfreelogo.cashfree.com/assets_images/pg/nb/64/hdfc.png",
    isPopular: true,
  },
  {
    code: "BARB_R",
    name: "Bank of Baroda",
    shortName: "Bank of Baroda",
    logo: "https://cashfreelogo.cashfree.com/assets_images/pg/nb/64/bobc.png",
    isPopular: true,
  },
  {
    code: "PUNB_R",
    name: "Punjab National Bank",
    shortName: "PNB",
    logo: "https://cashfreelogo.cashfree.com/assets_images/pg/nb/64/pnbc.png",
    isPopular: true,
  },
  {
    code: "INDB",
    name: "Indusind Bank",
    shortName: "IndusInd Bank",
    logo: "https://cashfreelogo.cashfree.com/assets_images/pg/nb/64/indusind.png",
    isPopular: false,
  },
  {
    code: "IDFB",
    name: "IDFC FIRST Bank",
    shortName: "IDFC FIRST Bank",
    logo: "https://cashfreelogo.cashfree.com/assets_images/pg/nb/64/idfc.png",
    isPopular: false,
  },
  {
    code: "YESB",
    name: "Yes Bank",
    shortName: "Yes Bank",
    logo: "https://cashfreelogo.cashfree.com/assets_images/pg/nb/64/yes.png",
    isPopular: false,
  },
  {
    code: "UBIN",
    name: "Union Bank of India",
    shortName: "Union Bank",
    logo: "https://cashfreelogo.cashfree.com/assets_images/pg/nb/64/union.png",
    isPopular: false,
  },
  {
    code: "FDRL",
    name: "Federal Bank",
    shortName: "Federal Bank",
    logo: "https://cashfreelogo.cashfree.com/assets_images/pg/nb/64/federal.png",
    isPopular: false,
  },
  {
    code: "CBIN",
    name: "Central Bank of India",
    shortName: "Central Bank",
    logo: "https://cashfreelogo.cashfree.com/assets_images/pg/nb/64/cbi.png",
    isPopular: false,
  },
  {
    code: "BKID",
    name: "Bank of India",
    shortName: "Bank of India",
    logo: "https://cashfreelogo.cashfree.com/assets_images/pg/nb/64/boi.png",
    isPopular: false,
  },
  {
    code: "IDIB",
    name: "Indian Bank",
    shortName: "Indian Bank",
    logo: "https://cashfreelogo.cashfree.com/assets_images/pg/nb/64/indian.png",
    isPopular: false,
  },
  {
    code: "UCBA",
    name: "UCO Bank",
    shortName: "UCO Bank",
    logo: "https://cashfreelogo.cashfree.com/assets_images/pg/nb/64/uco.png",
    isPopular: false,
  },
];

const PRODUCT_DATA = {
  name: "Cordless AquaForce® 1400 High-pressure Washer System",
  description:
    "The Aquaforce® 1400 is a powerful, battery-powered portable pressure washer. No cables, no power sockets, no fixed setup needed.",
  rating: 4.8,
  reviewsCount: 2097,
  offerPrice: 37999,
  mrp: 49999,
  colors: [
    {
      name: "Yellow",
      hex: "#f5c518",
      inStock: true,
      images: [
        "/aquaforceforautocare/images/products/yellow/1.webp",
        "/aquaforceforautocare/images/products/yellow/2.webp",
        "/aquaforceforautocare/images/products/yellow/3.webp",
        "/aquaforceforautocare/images/products/yellow/4.webp",
        "/aquaforceforautocare/images/products/yellow/5.webp",
        "/aquaforceforautocare/images/products/yellow/6.webp",
        "/aquaforceforautocare/images/products/yellow/7.webp",
        "/aquaforceforautocare/images/products/yellow/8.webp",
        "/aquaforceforautocare/images/products/yellow/9.webp",
        "/aquaforceforautocare/images/products/yellow/10.webp",
        "/aquaforceforautocare/images/products/yellow/11.webp",
      ],
    },
    {
      name: "Blue",
      hex: "#0066cc",
      inStock: false,
      images: [
        "/aquaforceforautocare/images/products/blue/1.webp",
        "/aquaforceforautocare/images/products/blue/2.webp",
        "/aquaforceforautocare/images/products/blue/3.webp",
        "/aquaforceforautocare/images/products/blue/4.webp",
        "/aquaforceforautocare/images/products/blue/5.webp",
        "/aquaforceforautocare/images/products/blue/6.webp",
        "/aquaforceforautocare/images/products/blue/7.webp",
        "/aquaforceforautocare/images/products/blue/8.webp",
        "/aquaforceforautocare/images/products/blue/9.webp",
        "/aquaforceforautocare/images/products/blue/10.webp",
        "/aquaforceforautocare/images/products/blue/11.webp",
      ],
    },
  ],
};

interface BankOffer {
  bankName: string;
  offerText: string;
  logo: string;
  badge?: string;
  accentBg: string;
  accentBorder: string;
}

const DEFAULT_BANK_OFFERS: BankOffer[] = [
  {
    bankName: "Yes Bank",
    offerText: "5% Cashback on Yes Bank Credit Card EMI Transactions",
    logo: "https://cashfreelogo.cashfree.com/assets_images/pg/nb/64/yes.png",
    accentBg: "bg-emerald-50/60",
    accentBorder: "border-emerald-200",
    badge: "5% Cashback",
  },
  {
    bankName: "HSBC",
    offerText: "5% Cashback on Min Cart Value of Rs 5000 on HSBC Credit Card EMI Transactions",
    logo: "https://cashfreelogo.cashfree.com/assets_images/pg/nb/64/hsb.png",
    accentBg: "bg-emerald-50/60",
    accentBorder: "border-emerald-200",
    badge: "5% Cashback",
  },
  {
    bankName: "Axis Bank",
    offerText: "5% Cashback on Min Cart Value of Rs 5,000 on AXIS Bank Credit Card EMI Transactions",
    logo: "https://cashfreelogo.cashfree.com/assets_images/pg/nb/64/axis.png",
    accentBg: "bg-emerald-50/60",
    accentBorder: "border-emerald-200",
    badge: "5% Cashback",
  },
  {
    bankName: "IDFC FIRST Bank",
    offerText: "3.5% Cashback on Min Cart Value of Rs 5000 using IDFC FIRST Bank Credit Card EMI Transactions",
    logo: "https://cashfreelogo.cashfree.com/assets_images/pg/nb/64/idfc.png",
    accentBg: "bg-emerald-50/60",
    accentBorder: "border-emerald-200",
    badge: "3.5% Cashback",
  },
  {
    bankName: "Tata NeuCard",
    offerText: "Upto 1.5% savings with NeuCard on EMI/ non EMI trxns",
    logo: "https://cashfreelogo.cashfree.com/assets_images/pg/nb/64/hdfc.png",
    accentBg: "bg-emerald-50/60",
    accentBorder: "border-emerald-200",
    badge: "Up to 1.5% Back",
  },
];

const detectCardBankAndOffer = (cardNumber: string, liveBanks?: EmiBankItem[]): BankOffer | null => {
  const clean = cardNumber.replace(/\D/g, "");
  if (clean.length < 3) return null;

  const enhance = (offer: BankOffer): BankOffer => {
    if (!liveBanks || liveBanks.length === 0) return offer;
    const liveMatch = liveBanks.find(
      (b) =>
        b.name.toLowerCase().includes(offer.bankName.toLowerCase()) ||
        offer.bankName.toLowerCase().includes(b.name.toLowerCase())
    );
    if (liveMatch && (liveMatch.offerText || liveMatch.badgeText)) {
      return {
        ...offer,
        offerText: liveMatch.offerText || offer.offerText,
        badge: liveMatch.badgeText || offer.badge,
      };
    }
    return offer;
  };

  // Yes Bank: 531849, 536303, 524167, 558918, 549921, 518851, 528694, 547122
  if (
    clean.startsWith("531849") ||
    clean.startsWith("536303") ||
    clean.startsWith("524167") ||
    clean.startsWith("558918") ||
    clean.startsWith("549921") ||
    clean.startsWith("518851") ||
    clean.startsWith("528694") ||
    clean.startsWith("547122") ||
    clean.startsWith("404638") ||
    clean.startsWith("404652")
  ) {
    return enhance({
      bankName: "Yes Bank",
      offerText: "0% Interest No Cost EMI + 5% Cashback (Up to ₹1,500)",
      logo: "https://cashfreelogo.cashfree.com/assets_images/pg/nb/64/yes.png",
      accentBg: "bg-emerald-50/60",
      accentBorder: "border-emerald-200",
      badge: "No Cost EMI + 5% Cashback",
    });
  }

  // Axis Bank: 4033, 416019, 437552, 450650, 5125, 652188
  if (
    clean.startsWith("4033") ||
    clean.startsWith("416019") ||
    clean.startsWith("437552") ||
    clean.startsWith("450650") ||
    clean.startsWith("5125") ||
    clean.startsWith("652188")
  ) {
    return enhance({
      bankName: "Axis Bank",
      offerText: "0% Interest No Cost EMI + 5% Cashback (Up to ₹750)",
      logo: "https://cashfreelogo.cashfree.com/assets_images/pg/nb/64/axis.png",
      accentBg: "bg-emerald-50/60",
      accentBorder: "border-emerald-200",
      badge: "No Cost EMI + 5% Cashback",
    });
  }

  // HSBC: 461721, 512042, 486269, 461709, 461716, 456719, 438459, 456342, 542207, 540259
  if (
    clean.startsWith("461721") ||
    clean.startsWith("512042") ||
    clean.startsWith("486269") ||
    clean.startsWith("461709") ||
    clean.startsWith("461716") ||
    clean.startsWith("456719") ||
    clean.startsWith("438459") ||
    clean.startsWith("456342") ||
    clean.startsWith("542207") ||
    clean.startsWith("540259")
  ) {
    return enhance({
      bankName: "HSBC",
      offerText: "0% Interest No Cost EMI + 5% Cashback (Up to ₹1,000)",
      logo: "https://cashfreelogo.cashfree.com/assets_images/pg/nb/64/hsb.png",
      accentBg: "bg-emerald-50/60",
      accentBorder: "border-emerald-200",
      badge: "No Cost EMI + 5% Cashback",
    });
  }

  // IDFC FIRST Bank: 401561, 428102, 439992, 440523, 444341, 515349, 525567, 528614
  if (
    clean.startsWith("401561") ||
    clean.startsWith("428102") ||
    clean.startsWith("439992") ||
    clean.startsWith("440523") ||
    clean.startsWith("444341") ||
    clean.startsWith("515349") ||
    clean.startsWith("525567") ||
    clean.startsWith("528614")
  ) {
    return enhance({
      bankName: "IDFC FIRST Bank",
      offerText: "0% Interest No Cost EMI + 3.5% Cashback (Up to ₹3,000)",
      logo: "https://cashfreelogo.cashfree.com/assets_images/pg/nb/64/idfc.png",
      accentBg: "bg-emerald-50/60",
      accentBorder: "border-emerald-200",
      badge: "No Cost EMI + 3.5% Cashback",
    });
  }

  // Tata NeuCard (HDFC): 402219, 402359, 652925, 652926
  if (
    clean.startsWith("402219") ||
    clean.startsWith("402359") ||
    clean.startsWith("652925") ||
    clean.startsWith("652926")
  ) {
    return enhance({
      bankName: "Tata NeuCard",
      offerText: "Upto 1.5% savings with NeuCard on EMI/ non EMI trxns",
      logo: "https://cashfreelogo.cashfree.com/assets_images/pg/nb/64/hdfc.png",
      accentBg: "bg-emerald-50/60",
      accentBorder: "border-emerald-200",
      badge: "Up to 1.5% Back",
    });
  }

  // HDFC Bank Standard Cards
  if (
    clean.startsWith("416021") ||
    clean.startsWith("421421") ||
    clean.startsWith("437554") ||
    clean.startsWith("450644") ||
    clean.startsWith("4629") ||
    clean.startsWith("549771") ||
    clean.startsWith("652166")
  ) {
    return enhance({
      bankName: "HDFC Bank",
      offerText: "",
      logo: "https://cashfreelogo.cashfree.com/assets_images/pg/nb/64/hdfc.png",
      accentBg: "bg-slate-50",
      accentBorder: "border-slate-200",
      badge: "",
    });
  }

  // ICICI Bank Credit Cards: Active No Cost EMI
  if (
    clean.startsWith("4055") ||
    clean.startsWith("4060") ||
    clean.startsWith("416012") ||
    clean.startsWith("4315") ||
    clean.startsWith("438628") ||
    clean.startsWith("5181") ||
    clean.startsWith("5433") ||
    clean.startsWith("652177")
  ) {
    return enhance({
      bankName: "ICICI Bank",
      offerText: "0% Interest No Cost EMI available (3, 6, 9, 12 Months)",
      logo: "https://cashfreelogo.cashfree.com/assets_images/pg/nb/64/icici.png",
      accentBg: "bg-emerald-50/60",
      accentBorder: "border-emerald-200",
      badge: "No Cost EMI",
    });
  }

  // Kotak Mahindra Bank: Active No Cost EMI
  if (
    clean.startsWith("4166") ||
    clean.startsWith("438652") ||
    clean.startsWith("4854") ||
    clean.startsWith("652199")
  ) {
    return enhance({
      bankName: "Kotak Mahindra Bank",
      offerText: "0% Interest No Cost EMI available (3, 6, 9, 12 Months)",
      logo: "https://cashfreelogo.cashfree.com/assets_images/pg/nb/64/kotak.png",
      accentBg: "bg-emerald-50/60",
      accentBorder: "border-emerald-200",
      badge: "No Cost EMI",
    });
  }

  // Bank of Baroda: Active No Cost EMI
  if (clean.startsWith("437553") || clean.startsWith("450653") || clean.startsWith("652151")) {
    return enhance({
      bankName: "Bank of Baroda",
      offerText: "0% Interest No Cost EMI available (3, 6, 9, 12 Months)",
      logo: "https://cashfreelogo.cashfree.com/assets_images/pg/nb/64/bobc.png",
      accentBg: "bg-emerald-50/60",
      accentBorder: "border-emerald-200",
      badge: "No Cost EMI",
    });
  }

  return null;
};

export default function OrderModal({
  isOpen,
  onClose,
  verifiedUser,
  startAtCheckout = false,
}: OrderModalProps) {
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [selectedVacuumOption, setSelectedVacuumOption] = useState<"with" | "without">("with");
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentId, setPaymentId] = useState("");
  const [copiedReferral, setCopiedReferral] = useState(false);
  const [isHighlightsOpen, setIsHighlightsOpen] = useState(false);
  const [isSpecsOpen, setIsSpecsOpen] = useState(false);
  const [isBoxOpen, setIsBoxOpen] = useState(false);
  const [isReplacementOpen, setIsReplacementOpen] = useState(false);
  const [isKnowMoreOpen, setIsKnowMoreOpen] = useState(false);
  const [isFullReturnPolicyOpen, setIsFullReturnPolicyOpen] = useState(false);
  const [isImportantNoteOpen, setIsImportantNoteOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"FULL_ONLINE" | "10_PERCENT_COD">("FULL_ONLINE");
  const [onlinePaymentMode, setOnlinePaymentMode] = useState<"FULL" | "EMI">("FULL");
  const [isCodSuccess, setIsCodSuccess] = useState(false);
  const [isEmiModalOpen, setIsEmiModalOpen] = useState(false);
    const [delhiveryCodAvailable, setDelhiveryCodAvailable] = useState<boolean | null>(null);
  const [checkoutStep, setCheckoutStep] = useState<"details" | "choose_emi" | "emi_plan_select" | "emi_add_card" | "awaiting_payment" | "select_netbanking" | "card_payment" | "card_otp">("details");
  const [selectedEmiBankObj, setSelectedEmiBankObj] = useState<EmiBankItem | null>(() => DEFAULT_EMI_BANKS.find((b) => b.id === "hdfc_dc") || DEFAULT_EMI_BANKS[0]);
  const [selectedEmiPlan, setSelectedEmiPlan] = useState<DynamicEmiPlan | null>(null);
  const [isEmiPlanCollapsed, setIsEmiPlanCollapsed] = useState(false);
  const [isEmiAccordionOpen, setIsEmiAccordionOpen] = useState(true);
  const [backendCardEligibility, setBackendCardEligibility] = useState<{
    checkedCardBin: string;
    checkedBankCode: string;
    isEligible: boolean;
    error?: string;
    network?: string;
    isLoading?: boolean;
  }>({
    checkedCardBin: "",
    checkedBankCode: "",
    isEligible: true,
  });
  const [liveRazorpayOffers, setLiveRazorpayOffers] = useState<any[]>([]);
  const [awaitingPaymentData, setAwaitingPaymentData] = useState<{
    orderId: string;
    razorpayOrderId: string;
    qrCodeUrl: string;
    upiIntentUrl: string;
    amountInPaise: number;
    amountDisplay: string;
    isCod: boolean;
    codBalanceDisplay: string;
    totalDisplay: string;
    paymentTitle?: string;
    paymentSubtitle?: string;
    emiMonthlyDisplay?: string;
    bankName?: string;
  } | null>(null);
  const awaitingPaymentTimerRef = useRef<number>(0);
  const [awaitingPaymentCountdown, setAwaitingPaymentCountdown] = useState<number>(900);
  const [isAwaitingUpi, setIsAwaitingUpi] = useState(false);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [bankSearchQuery, setBankSearchQuery] = useState("");
  const [selectedEmiFilter, setSelectedEmiFilter] = useState<"all" | "no_cost" | "credit" | "debit" | "bajaj">("all");
  const [expandedTncOfferId, setExpandedTncOfferId] = useState<string | null>(null);
  const [isOffersModalOpen, setIsOffersModalOpen] = useState(false);
  const [expandedBankId, setExpandedBankId] = useState<string | null>("axis");
  const [selectedTenure, setSelectedTenure] = useState<number>(6);
  const [selectedEmiBank, setSelectedEmiBank] = useState<string>("Axis Bank");
  const [selectedCustomPayment, setSelectedCustomPayment] = useState<"upi" | "card" | "wallet" | "netbanking" | "cod" | "">("upi");
  const [selectedUpiApp, setSelectedUpiApp] = useState<UpiAppId>("paytm");
  const [showQrCode, setShowQrCode] = useState(false);
  const [upiVpa, setUpiVpa] = useState("");
  const [upiValidationMsg, setUpiValidationMsg] = useState("");
  const [selectedBank, setSelectedBank] = useState("SBIN");
  const [selectedWallet, setSelectedWallet] = useState("payzapp");
  const [paymentErrorMessage, setPaymentErrorMessage] = useState<string | null>(null);

  // Dedicated Netbanking Flow State (Matches User Images 1, 2, 3)
  const [netbankingSearchQuery, setNetbankingSearchQuery] = useState("");
  const [selectedNetbankingTab, setSelectedNetbankingTab] = useState<"popular" | "other">("popular");
  const [selectedBankForSheet, setSelectedBankForSheet] = useState<NetbankingBankItem | null>(null);
  const [isRedirectingToBank, setIsRedirectingToBank] = useState(false);

  // Dedicated Card Payment Flow State (Matches User Reference Image)
  const [cardHolderName, setCardHolderName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [showCvv, setShowCvv] = useState(false);
  const [saveCardAsPerRbi, setSaveCardAsPerRbi] = useState(true);
  const [isOrderSummaryOpen, setIsOrderSummaryOpen] = useState(false);
  const [isProcessingCard, setIsProcessingCard] = useState(false);
  const [cardErrorMessage, setCardErrorMessage] = useState<string | null>(null);
  const [debitEmiDeclinedMsg, setDebitEmiDeclinedMsg] = useState<string | null>(null);
  const [failedCardPayload, setFailedCardPayload] = useState<any>(null);
  const [cardPhone, setCardPhone] = useState("");
  const [cardOtpRecipient, setCardOtpRecipient] = useState<string>("");

  // Dedicated Card OTP Verification State (Matches User Image 2 - media_1790406822318.png)
  const [cardOtp, setCardOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [cardOtpTimer, setCardOtpTimer] = useState<number>(29);
  const [isVerifyingCardOtp, setIsVerifyingCardOtp] = useState<boolean>(false);
  const [cardOrderId, setCardOrderId] = useState<string>("");
  const [cardRazorpayOrderId, setCardRazorpayOrderId] = useState<string>("");
  const [cardLast4, setCardLast4] = useState<string>("");
  const [cardOfferCarouselIndex, setCardOfferCarouselIndex] = useState<number>(0);
  const cardOtpInputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const cardOtpTimerRef = useRef<NodeJS.Timeout | null>(null);
  const rzpCardInstanceRef = useRef<any>(null);
  const hasInitializedCardHolderName = useRef<boolean>(false);

  // Live Razorpay Payment Methods State (populated dynamically with enabled banks only)
  const [liveEmiBanks, setLiveEmiBanks] = useState<EmiBankItem[]>(DEFAULT_EMI_BANKS);
  const [liveNetbankingBanks, setLiveNetbankingBanks] = useState<NetbankingBankItem[]>(DEFAULT_NETBANKING_BANKS);
  const [isLoadingLiveMethods, setIsLoadingLiveMethods] = useState<boolean>(false);

  // Dynamic Pricing Calculations
  const currentOfferPrice = selectedVacuumOption === "without" ? 35999 : 37999;
  const currentMRP = selectedVacuumOption === "without" ? 47999 : 51350;
  const unitSavings = currentMRP - currentOfferPrice;
  const totalPrice = currentOfferPrice * quantity;
  const totalMRP = currentMRP * quantity;
  const totalSavings = unitSavings * quantity;
  const savingsPercentage = Math.round((unitSavings / currentMRP) * 100);
  const taxAmount = Math.round(((totalPrice * 18) / 118) * 100) / 100;

  // Fetch Live Razorpay Payment Methods when Modal Opens or Total Price changes
  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;

    const fetchLiveMethods = async () => {
      try {
        setIsLoadingLiveMethods(true);
        const res = await fetch(getApiPath(`/api/razorpay/methods?price=${totalPrice}`));
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.success) {
            if (Array.isArray(data.offers)) {
              setLiveRazorpayOffers(data.offers);
            }
            if (Array.isArray(data.emi) && data.emi.length > 0) {
              setLiveEmiBanks(data.emi);
            }
            if (Array.isArray(data.netbanking) && data.netbanking.length > 0) {
              setLiveNetbankingBanks(data.netbanking);
              // Ensure selectedBank is a valid enabled bank
              if (!data.netbanking.some((b: NetbankingBankItem) => b.code === selectedBank)) {
                setSelectedBank(data.netbanking[0].code);
              }
            }
          }
        }
      } catch (err) {
        console.warn("Could not load live Razorpay methods, using enabled fallback:", err);
      } finally {
        if (isMounted) {
          setIsLoadingLiveMethods(false);
        }
      }
    };

    fetchLiveMethods();

    return () => {
      isMounted = false;
    };
  }, [isOpen, totalPrice]);

  // Dynamic rotation for card offers when card is not yet typed
  useEffect(() => {
    if (checkoutStep !== "card_payment") return;
    const clean = cardNumber.replace(/\D/g, "");
    if (clean.length >= 3) return;
    const interval = setInterval(() => {
      setCardOfferCarouselIndex((prev) => (prev + 1) % DEFAULT_BANK_OFFERS.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [checkoutStep, cardNumber]);

  // Live Backend Razorpay EMI Card Eligibility Check (Screen 5)
  useEffect(() => {
    const rawDigits = cardNumber.replace(/\D/g, "");
    if (checkoutStep !== "emi_add_card" || !selectedEmiBankObj) {
      return;
    }

    if (rawDigits.length < 6) {
      setBackendCardEligibility({
        checkedCardBin: "",
        checkedBankCode: selectedEmiBankObj.code,
        isEligible: true,
      });
      return;
    }

    const cardBin = rawDigits.slice(0, 8);
    if (
      backendCardEligibility.checkedCardBin === cardBin &&
      backendCardEligibility.checkedBankCode === selectedEmiBankObj.code
    ) {
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setBackendCardEligibility((prev) => ({ ...prev, isLoading: true }));
        const res = await fetch(getApiPath("/api/payments/check-card-eligibility"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cardNumber: rawDigits,
            bankCode: selectedEmiBankObj.code,
            bankName: selectedEmiBankObj.name,
            tenure: selectedTenure,
            amount: totalPrice,
          }),
        });
        const data = await res.json();
        setBackendCardEligibility({
          checkedCardBin: cardBin,
          checkedBankCode: selectedEmiBankObj.code,
          isEligible: Boolean(data?.eligible),
          error: data?.error || (data?.eligible ? undefined : "This card is not eligible for EMI"),
          network: data?.network,
          isLoading: false,
        });
      } catch (err) {
        console.error("Card eligibility check failed:", err);
        const localEligible = isCardEligibleForEmiBank(cardNumber, selectedEmiBankObj.code, selectedEmiBankObj.name);
        setBackendCardEligibility({
          checkedCardBin: cardBin,
          checkedBankCode: selectedEmiBankObj.code,
          isEligible: localEligible,
          error: localEligible ? undefined : "This card is not eligible for EMI",
          isLoading: false,
        });
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [cardNumber, selectedEmiBankObj, checkoutStep, selectedTenure, totalPrice, backendCardEligibility.checkedCardBin, backendCardEligibility.checkedBankCode]);

  // Dynamic 15-Minute QR Session & Countdown Timer
  const [upiSessionRef, setUpiSessionRef] = useState<string>(() => `AMEC${Date.now().toString(36).toUpperCase()}`);
  const [qrCountdownSecs, setQrCountdownSecs] = useState<number>(900);

  // Reset Show QR state and timer when modal closes
  useEffect(() => {
    if (!isOpen) {
      setShowQrCode(false);
      setQrCountdownSecs(900);
    }
  }, [isOpen]);

  // QR Countdown Timer - Only runs when user clicks "Show QR"
  useEffect(() => {
    if (!isOpen || !showQrCode) return;
    const timer = setInterval(() => {
      setQrCountdownSecs((prev) => {
        if (prev <= 1) {
          setUpiSessionRef(`AMEC${Date.now().toString(36).toUpperCase()}`);
          return 900;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, showQrCode]);

  const formatQrTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  // Selected Bank & Plan Helpers
  const monthlyEmi = selectedEmiBankObj?.startingEmi || (DEFAULT_EMI_BANKS.length > 0 ? Math.min(...DEFAULT_EMI_BANKS.map(b => b.startingEmi)) : Math.round(totalPrice / 6));

  const popularNetbankingBanks = liveNetbankingBanks.filter((b) => b.isPopular).slice(0, 6);
  const selectedBankObj = liveNetbankingBanks.find((b) => b.code === selectedBank);

  const filteredNetbankingBanks = liveNetbankingBanks.filter((b) => {
    if (netbankingSearchQuery.trim()) {
      const q = netbankingSearchQuery.toLowerCase().trim();
      return (
        b.name.toLowerCase().includes(q) ||
        b.shortName.toLowerCase().includes(q) ||
        b.code.toLowerCase().includes(q)
      );
    }
    return selectedNetbankingTab === "popular" ? b.isPopular : !b.isPopular;
  });

  const filteredBanks = liveEmiBanks.filter((bank) => {
    const matchesSearch =
      bank.name.toLowerCase().includes(bankSearchQuery.toLowerCase()) ||
      bank.code.toLowerCase().includes(bankSearchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (selectedEmiFilter === "no_cost") return bank.isNoCost;
    if (selectedEmiFilter === "credit") return bank.type === "credit" || bank.type === "both";
    if (selectedEmiFilter === "debit") return bank.type === "debit" || bank.type === "both";
    return true;
  });


  // 10% Cash on Delivery calculations
  const advanceAmount = Math.floor(totalPrice * 0.10);
  const codFee = 149;
  const codBalance = totalPrice - advanceAmount + codFee;
  const payableAmount = paymentMethod === "10_PERCENT_COD" ? advanceAmount : totalPrice;

  const handleShareReferral = () => {
    const currentUrl = typeof window !== "undefined" ? window.location.href.split("?")[0] : "https://promectools.in/aquaforceforautocare";
    const shareUrl = `${currentUrl}?ref=FRIEND1000`;
    if (navigator.share) {
      navigator
        .share({
          title: "AQUAFORCE® 1400 Cordless Pressure Washer",
          text: "Check out the AQUAFORCE® 1400 Cordless High-Pressure Washer! Use my referral link for ₹1,000 extra credit.",
          url: shareUrl,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(shareUrl);
      setCopiedReferral(true);
      setTimeout(() => setCopiedReferral(false), 2500);
    }
  };

  // Section Refs for Auto-Scrolling on Accordion Open
  const modalCardRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const replacementRef = useRef<HTMLDivElement>(null);
  const returnPolicyRef = useRef<HTMLDivElement>(null);
  const highlightsRef = useRef<HTMLDivElement>(null);
  const specsRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const thumbnailRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const thumbnailContainerRef = useRef<HTMLDivElement>(null);
  const isThumbnailMount = useRef(true);

  useEffect(() => {
    if (isThumbnailMount.current) {
      isThumbnailMount.current = false;
      return;
    }
    if (thumbnailContainerRef.current && thumbnailRefs.current[activeImageIndex]) {
      const container = thumbnailContainerRef.current;
      const thumb = thumbnailRefs.current[activeImageIndex];
      const offset = thumb.offsetLeft - container.offsetWidth / 2 + thumb.offsetWidth / 2;
      container.scrollTo({
        left: offset,
        behavior: "smooth",
      });
    }
  }, [activeImageIndex]);

  const toggleSection = (
    setter: React.Dispatch<React.SetStateAction<boolean>>,
    ref: React.RefObject<HTMLDivElement | null>
  ) => {
    setter((prev) => {
      const willOpen = !prev;
      if (willOpen) {
        setTimeout(() => {
          if (!ref.current) return;
          ref.current.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
          });
        }, 60);
      }
      return willOpen;
    });
  };

  // Touch Swipe State for Modal Image Gallery
  const [modalTouchStartX, setModalTouchStartX] = useState<number | null>(null);
  const [modalTouchEndX, setModalTouchEndX] = useState<number | null>(null);

  const minSwipeDistance = 35;

  const handleModalTouchStart = (e: React.TouchEvent) => {
    setModalTouchEndX(null);
    setModalTouchStartX(e.targetTouches[0].clientX);
  };

  const handleModalTouchMove = (e: React.TouchEvent) => {
    setModalTouchEndX(e.targetTouches[0].clientX);
  };

  const handleModalTouchEnd = () => {
    if (!modalTouchStartX || !modalTouchEndX) return;
    const distance = modalTouchStartX - modalTouchEndX;
    if (distance > minSwipeDistance) {
      nextImage();
    } else if (distance < -minSwipeDistance) {
      prevImage();
    }
  };

interface CheckoutFormData {
  fullName: string;
  email: string;
  phone: string;
  altPhone: string;
  deliveryAddress: string;
  city: string;
  state: string;
  pincode: string;
  gstNumber: string;
  customerType: "retail";
  companyName: string;
  agreedToTerms: boolean;
}

  const [formData, setFormData] = useState<CheckoutFormData>(() => {
    const defaults: CheckoutFormData = {
      fullName: "",
      email: "",
      phone: "",
      altPhone: "",
      deliveryAddress: "",
      city: "",
      state: "",
      pincode: "",
      gstNumber: "",
      customerType: "retail",
      companyName: "",
      agreedToTerms: true,
    };
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("promec_checkout_form_data");
        if (saved) {
          const parsed = JSON.parse(saved);
          return { ...defaults, ...parsed, customerType: "retail" };
        }
      } catch (err) {
        console.warn("Failed to load checkout form data from localStorage:", err);
      }
    }
    return defaults;
  });

  // Save formData to localStorage whenever any field updates
  useEffect(() => {
    try {
      localStorage.setItem("promec_checkout_form_data", JSON.stringify(formData));
    } catch (err) {
      console.warn("Failed to save checkout form data to localStorage:", err);
    }
  }, [formData]);

  // Auto-sync customer fullName from step 1 into cardHolderName when first entering card or EMI steps
  useEffect(() => {
    if (checkoutStep === "emi_add_card" || checkoutStep === "card_payment") {
      if (!hasInitializedCardHolderName.current) {
        if (formData.fullName?.trim() && !cardHolderName.trim()) {
          setCardHolderName(formData.fullName.trim());
        }
        hasInitializedCardHolderName.current = true;
      }
    } else if (checkoutStep === "details") {
      hasInitializedCardHolderName.current = false;
    }
  }, [checkoutStep, formData.fullName]);

  const [formErrors, setFormErrors] = useState<{
    fullName?: string;
    phone?: string;
    altPhone?: string;
    email?: string;
    deliveryAddress?: string;
    pincode?: string;
    city?: string;
    state?: string;
  }>({});

  const [isLoadingPincode, setIsLoadingPincode] = useState(false);
  const [delhiveryStatus, setDelhiveryStatus] = useState<{
    serviceable?: boolean;
    cod?: boolean;
    message?: string;
  }>({});

  const isValidEmail = (emailStr: string) => {
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(emailStr.trim());
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digitsOnly = e.target.value.replace(/\D/g, "").slice(0, 10);
    setFormData((prev) => ({ ...prev, phone: digitsOnly }));
    if (formErrors.phone && digitsOnly.length === 10) {
      setFormErrors((prev) => ({ ...prev, phone: undefined }));
    }
  };

  const handleAltPhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digitsOnly = e.target.value.replace(/\D/g, "").slice(0, 10);
    setFormData((prev) => ({ ...prev, altPhone: digitsOnly }));
    if (formErrors.altPhone && (digitsOnly.length === 10 || digitsOnly.length === 0)) {
      setFormErrors((prev) => ({ ...prev, altPhone: undefined }));
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFormData((prev) => ({ ...prev, email: val }));
    if (formErrors.email && isValidEmail(val)) {
      setFormErrors((prev) => ({ ...prev, email: undefined }));
    }
  };

  const handlePincodeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    const cleanVal = rawVal.replace(/\D/g, "").slice(0, 6);

    setFormData((prev) => ({ ...prev, pincode: cleanVal }));
    if (formErrors.pincode && cleanVal.length === 6) {
      setFormErrors((prev) => ({ ...prev, pincode: undefined }));
    }

    if (cleanVal.length === 6) {
      setIsLoadingPincode(true);
      setDelhiveryStatus({});
      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${cleanVal}`);
        const data = await res.json();
        if (Array.isArray(data) && data[0]?.Status === "Success" && data[0]?.PostOffice?.length > 0) {
          const po = data[0].PostOffice[0];
          const fetchedCity = po.District || po.Block || po.Circle || po.Name || "";
          const fetchedState = po.State || "";
          setFormData((prev) => ({
            ...prev,
            pincode: cleanVal,
            city: fetchedCity || prev.city,
            state: fetchedState || prev.state,
          }));
        }

        // Live Delhivery Serviceability Check
        const shipRes = await fetch(getApiPath(`/api/shiprocket/serviceability?pincode=${cleanVal}`));
        const shipData = await shipRes.json();
        if (shipData.success && shipData.serviceable) {
          const codOk = shipData.cod === true;
          setDelhiveryCodAvailable(codOk);
          setDelhiveryStatus({
            serviceable: true,
            cod: codOk,
            message: codOk
              ? "✓ Delhivery Express: Prepaid & Cash on Delivery Available"
              : "✓ Delhivery Express: Prepaid Delivery Available (COD Not Serviceable)",
          });
        } else if (shipData.remarks) {
          setDelhiveryCodAvailable(false);
          setDelhiveryStatus({
            serviceable: false,
            cod: false,
            message: shipData.remarks,
          });
        }
      } catch (err) {
        console.warn("Error fetching pincode details:", err);
      } finally {
        setIsLoadingPincode(false);
      }
    }
  };

  const currentColor = PRODUCT_DATA.colors[selectedColorIndex];
  const images = currentColor.images;

  // Track Checkout Page Visit (Virtual Page View & GA4 begin_checkout) when user advances to checkout screen
  useEffect(() => {
    if (isOpen && isCheckingOut) {
      trackBeginCheckout(totalPrice, quantity, currentColor?.name || "Yellow");
    }
  }, [isOpen, isCheckingOut, totalPrice, quantity, currentColor?.name]);

  // Load official Razorpay Custom Checkout SDK dynamically (In-Website native checkout, zero external popups)
  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window === "undefined") {
        resolve(false);
        return;
      }

      // If standard checkout.js was loaded previously, purge it so Custom Checkout SDK takes over
      const existingCheckoutJs = document.querySelector('script[src*="checkout.js"]');
      if (existingCheckoutJs) {
        existingCheckoutJs.remove();
        try {
          delete (window as any).Razorpay;
        } catch (_) {}
      }

      // If official custom razorpay.js is already loaded and ready
      const existingRzpJs = document.querySelector('script[src*="razorpay.js"]');
      if (existingRzpJs && typeof (window as any).Razorpay === "function") {
        resolve(true);
        return;
      }

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/razorpay.js";
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Track pushed history states: null | 'product' | 'checkout'
  const historyStateRef = useRef<"product" | "checkout" | null>(null);
  const isNavigatingBackRef = useRef(false);

  // Synchronize history state when modal opens/closes for seamless mobile back navigation
  useEffect(() => {
    if (!isOpen) {
      historyStateRef.current = null;
      return;
    }

    // Push initial history state for product view when modal opens
    if (historyStateRef.current === null) {
      window.history.pushState({ amecModal: "product" }, "");
      historyStateRef.current = "product";
    }

    const handlePopState = () => {
      // If we initiated window.history.back() / window.history.go() programmatically, ignore
      if (isNavigatingBackRef.current) {
        return;
      }

      // If user was in checkout view, pressing back returns to product details
      if (historyStateRef.current === "checkout") {
        historyStateRef.current = "product";
        setIsCheckingOut(false);
        setIsSubmitted(false);
        setIsProcessingPayment(false);
      } else {
        // If user was in product view, pressing back closes modal (returning to Home screen)
        historyStateRef.current = null;
        setIsCheckingOut(false);
        setIsSubmitted(false);
        setIsProcessingPayment(false);
        onClose();
      }
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [isOpen, onClose]);

  // When transitioning from product view -> checkout view, push checkout history state
  useEffect(() => {
    if (isOpen && isCheckingOut && historyStateRef.current === "product") {
      window.history.pushState({ amecModal: "checkout" }, "");
      historyStateRef.current = "checkout";
    }
  }, [isOpen, isCheckingOut]);

  // Handle back button from Checkout Form -> Product Details view
  const handleBackToProduct = () => {
    if (checkoutStep === "card_otp") {
      setCheckoutStep(onlinePaymentMode === "EMI" ? "emi_add_card" : "card_payment");
      setCardErrorMessage(null);
      return;
    }
    if (checkoutStep === "emi_add_card") {
      setCheckoutStep("emi_plan_select");
      setCardErrorMessage(null);
      return;
    }
    if (checkoutStep === "emi_plan_select") {
      setCheckoutStep("choose_emi");
      return;
    }
    if (checkoutStep === "choose_emi" || checkoutStep === "select_netbanking" || checkoutStep === "card_payment") {
      setCheckoutStep("details");
      setSelectedBankForSheet(null);
      setCardErrorMessage(null);
      return;
    }
    if (historyStateRef.current === "checkout") {
      historyStateRef.current = "product";
      setIsCheckingOut(false);
      setCheckoutStep("details");
      setIsSubmitted(false);
      setIsProcessingPayment(false);
      isNavigatingBackRef.current = true;
      window.history.back();
      setTimeout(() => {
        isNavigatingBackRef.current = false;
      }, 100);
    } else {
      setIsCheckingOut(false);
      setCheckoutStep("details");
    }
  };

  // Handle closing modal completely from any view
  const handleClose = () => {
    if (historyStateRef.current === "checkout") {
      isNavigatingBackRef.current = true;
      historyStateRef.current = null;
      window.history.go(-2);
      setTimeout(() => {
        isNavigatingBackRef.current = false;
      }, 100);
    } else if (historyStateRef.current === "product") {
      isNavigatingBackRef.current = true;
      historyStateRef.current = null;
      window.history.back();
      setTimeout(() => {
        isNavigatingBackRef.current = false;
      }, 100);
    }
    setIsCheckingOut(false);
    setIsSubmitted(false);
    setIsProcessingPayment(false);
    setPaymentId("");
    setIsCodSuccess(false);
    setPaymentMethod("FULL_ONLINE");
    setOnlinePaymentMode("FULL");
    setCheckoutStep("details");
    setBankSearchQuery("");
    setSelectedBankForSheet(null);
    setNetbankingSearchQuery("");
    setIsRedirectingToBank(false);
    setIsProcessingCard(false);
    setCardErrorMessage(null);
    setFormErrors({});
    onClose();
  };

  const resetAll = () => {
    handleClose();
  };

  // Reset when modal opens and lock background scroll completely
  useEffect(() => {
    if (isOpen) {
      const originalBodyOverflow = document.body.style.overflow;
      const originalHtmlOverflow = document.documentElement.style.overflow;
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
      setIsCheckingOut(startAtCheckout);
      if (verifiedUser) {
        setFormData((prev) => ({
          ...prev,
          fullName: verifiedUser.fullName || prev.fullName,
          phone: verifiedUser.phone || prev.phone,
        }));
      }
      setIsSubmitted(false);
      setIsProcessingPayment(false);
      setPaymentId("");
      setIsCodSuccess(false);
      setPaymentMethod("FULL_ONLINE");
      setOnlinePaymentMode("FULL");
      setFormErrors({});
      return () => {
        document.body.style.overflow = originalBodyOverflow || "";
        document.documentElement.style.overflow = originalHtmlOverflow || "";
      };
    }
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  // Card OTP Timer Effect (Must be before early return)
  useEffect(() => {
    if (checkoutStep === "card_otp") {
      setCardOtpTimer(29);
      if (cardOtpTimerRef.current) clearInterval(cardOtpTimerRef.current);
      cardOtpTimerRef.current = setInterval(() => {
        setCardOtpTimer((prev) => {
          if (prev <= 1) {
            if (cardOtpTimerRef.current) clearInterval(cardOtpTimerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      const focusTimer = setTimeout(() => {
        cardOtpInputsRef.current[0]?.focus();
      }, 150);

      return () => {
        clearTimeout(focusTimer);
        if (cardOtpTimerRef.current) {
          clearInterval(cardOtpTimerRef.current);
          cardOtpTimerRef.current = null;
        }
      };
    } else {
      if (cardOtpTimerRef.current) {
        clearInterval(cardOtpTimerRef.current);
        cardOtpTimerRef.current = null;
      }
    }
  }, [checkoutStep]);

  if (!isOpen) return null;

  const nextImage = () => {
    setActiveImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setActiveImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const MAX_QUANTITY_LIMIT = 10;

  const handleColorChange = (idx: number) => {
    setSelectedColorIndex(idx);
    setActiveImageIndex(0);
  };

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => Math.min(MAX_QUANTITY_LIMIT, Math.max(1, prev + delta)));
  };

interface CheckoutSubmitOptions {
  paymentMethod?: "FULL_ONLINE" | "10_PERCENT_COD";
  onlinePaymentMode?: "FULL" | "EMI";
  selectedCustomPayment?: "upi" | "card" | "wallet" | "netbanking" | "cod" | "";
  selectedEmiBank?: string;
  selectedTenure?: number;
  selectedUpiApp?: UpiAppId;
}

  const validateFormFields = (): boolean => {
    const errors: {
      fullName?: string;
      phone?: string;
      altPhone?: string;
      email?: string;
      deliveryAddress?: string;
      pincode?: string;
      city?: string;
      state?: string;
    } = {};

    if (!formData.fullName?.trim()) {
      errors.fullName = "Please enter your full name";
    }

    const cleanPhone = formData.phone.replace(/\D/g, "");
    if (!cleanPhone || cleanPhone.length !== 10) {
      errors.phone = "Please enter a valid 10-digit mobile number";
    }

    const cleanAltPhone = formData.altPhone.replace(/\D/g, "");
    if (cleanAltPhone && cleanAltPhone.length !== 10) {
      errors.altPhone = "Please enter a valid 10-digit mobile number";
    }

    if (!formData.email?.trim() || !isValidEmail(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!formData.deliveryAddress?.trim()) {
      errors.deliveryAddress = "Please enter complete delivery address";
    }

    if (!formData.pincode || formData.pincode.length !== 6) {
      errors.pincode = "Please enter a valid 6-digit pincode";
    }

    if (!formData.city?.trim()) {
      errors.city = "Please enter city";
    }

    if (!formData.state?.trim()) {
      errors.state = "Please enter state";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      const formEl = document.getElementById("checkout-form");
      if (formEl) {
        formEl.scrollTo({ top: 0, behavior: "smooth" });
      }
      return false;
    }

    setFormErrors({});
    return true;
  };

  const handleContinueEmi = (bankName: string, tenure: number) => {
    setSelectedEmiBank(bankName);
    setSelectedTenure(tenure);
    setPaymentMethod("FULL_ONLINE");
    setOnlinePaymentMode("EMI");
    setSelectedCustomPayment("card");

    const isValid = validateFormFields();
    if (isValid) {
      handleCheckoutSubmit({
        paymentMethod: "FULL_ONLINE",
        onlinePaymentMode: "EMI",
        selectedCustomPayment: "card",
        selectedEmiBank: bankName,
        selectedTenure: tenure,
      });
    } else {
      setCheckoutStep("details");
      setPaymentErrorMessage("Please complete your delivery details highlighted in red.");
    }
  };

  type CardNetwork = "visa" | "mastercard" | "rupay" | "amex" | "diners" | "maestro" | null;

  const getCardNetwork = (num: string): CardNetwork => {
    const raw = num.replace(/\D/g, "");
    if (!raw) return null;
    // RuPay: 508, 60, 65, 81, 82, 353, 356
    if (
      raw.startsWith("508") ||
      /^60(6[1-9]|7|8|9)/.test(raw) ||
      raw.startsWith("60") ||
      raw.startsWith("65") ||
      raw.startsWith("81") ||
      raw.startsWith("82") ||
      raw.startsWith("353") ||
      raw.startsWith("356")
    ) {
      return "rupay";
    }
    // Visa: starts with 4
    if (raw.startsWith("4")) return "visa";
    // Mastercard: 51-55, 2221-2720
    if (/^(5[1-5]|222[1-9]|22[3-9]|2[3-6]|27[01]|2720)/.test(raw)) return "mastercard";
    // Amex: 34, 37
    if (/^3[47]/.test(raw)) return "amex";
    // Diners: 30, 36, 38
    if (/^3[068]/.test(raw)) return "diners";
    // Maestro: 50, 56-58, 6
    if (/^(50|5[6-8])/.test(raw)) return "maestro";
    return null;
  };

  const handleDebitCreditCardClick = () => {
    setPaymentMethod("FULL_ONLINE");
    setSelectedCustomPayment("card");
    setOnlinePaymentMode("FULL");
    if (!cardHolderName && formData.fullName) {
      setCardHolderName(formData.fullName);
    }
    setCardErrorMessage(null);
    setCheckoutStep("card_payment");
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digitsOnly = e.target.value.replace(/\D/g, "").slice(0, 16);
    const formatted = digitsOnly.match(/.{1,4}/g)?.join(" ") || digitsOnly;
    setCardNumber(formatted);
    if (cardErrorMessage) setCardErrorMessage(null);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "").slice(0, 4);
    if (val.length >= 2) {
      let month = parseInt(val.slice(0, 2), 10);
      if (month > 12) month = 12;
      if (month === 0) month = 1;
      const formattedMonth = month.toString().padStart(2, "0");
      val = `${formattedMonth}/${val.slice(2)}`;
    }
    setCardExpiry(val);
    if (cardErrorMessage) setCardErrorMessage(null);
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 4);
    setCardCvv(digits);
    if (cardErrorMessage) setCardErrorMessage(null);
  };

  const detectedNetwork = getCardNetwork(cardNumber);

  const rawCardDigits = cardNumber.replace(/\D/g, "");
  const isCardValid =
    cardHolderName.trim().length > 0 &&
    rawCardDigits.length >= 15 &&
    cardExpiry.includes("/") &&
    cardExpiry.length === 5 &&
    cardCvv.length >= 3;

  const handleProceedCardPayment = async () => {
    const customerFullName = cardHolderName.trim() || (formData.fullName || "").trim() || "Customer";
    if (!customerFullName) {
      setCardErrorMessage("Please enter full name.");
      return;
    }
    if (!cardHolderName.trim()) {
      setCardHolderName(customerFullName);
    }

    if (rawCardDigits.length < 15) {
      setCardErrorMessage("Please enter a valid 16-digit card number.");
      return;
    }

    const [expMonth, expYear] = cardExpiry.split("/");
    if (!expMonth || !expYear || parseInt(expMonth, 10) < 1 || parseInt(expMonth, 10) > 12) {
      setCardErrorMessage("Please enter a valid expiry date (MM/YY).");
      return;
    }

    if (cardCvv.length < 3) {
      setCardErrorMessage("Please enter a valid CVV.");
      return;
    }

    // Behind-the-scenes contact & email for Razorpay backend processing
    const cleanPhone = (formData.phone || "").replace(/\D/g, "").slice(-10) || "9019623259";
    const cleanEmail = (formData.email || "").trim() || `${customerFullName.toLowerCase().replace(/[^a-z0-9]/g, "") || "customer"}@gmail.com`;
    setCardLast4(rawCardDigits.slice(-4));
    setCardOtpRecipient("");

    // Synchronize into formData
    setFormData((prev) => ({
      ...prev,
      phone: cleanPhone,
      email: cleanEmail,
      fullName: customerFullName,
    }));

    setIsProcessingCard(true);
    setCardErrorMessage(null);
    setDebitEmiDeclinedMsg(null);

    const isEmiMode = onlinePaymentMode === "EMI" || checkoutStep === "emi_add_card";
    const isEmi = isEmiMode;
    const targetBankCode = (selectedEmiBankObj?.code || "").toUpperCase();
    const isDebitCard = selectedEmiBankObj?.type === "debit";

    // === STEP 1: EXPLICIT PRE-CHECK FOR DEBIT CARD EMI ===
    if (isEmiMode && isDebitCard) {
      try {
        const eligibilityRes = await fetch(getApiPath("/api/payments/check-card-eligibility"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cardNumber: rawCardDigits,
            bankCode: targetBankCode,
            phone: cleanPhone,
            amount: totalPrice,
          }),
        });

        const eligibilityData = await eligibilityRes.json();

        // If the bank system explicitly states this debit card/phone is not pre-approved:
        if (eligibilityData && eligibilityData.eligible === false) {
          setIsProcessingCard(false);
          setDebitEmiDeclinedMsg(
            eligibilityData.error ||
            `Your bank (${selectedEmiBankObj?.name}) has not pre-approved this debit card for an instant EMI loan. To enable it, please SMS 'MYHDFC' (or your bank's keyword) to 56767 from your registered mobile number.`
          );

          // Cache data locally to allow a one-click fallback to a full payment if desired
          setFailedCardPayload({
            "card[number]": rawCardDigits,
            "card[expiry_month]": expMonth,
            "card[expiry_year]": expYear,
            "card[cvv]": cardCvv,
            "card[name]": customerFullName,
          });
          return;
        }
      } catch (checkErr) {
        console.warn("Pre-payment eligibility check error:", checkErr);
      }
    }

    try {
      // 1. Create Order via Backend with Razorpay Orders API
      const res = await fetch(getApiPath("/api/orders/create"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: {
            fullName: customerFullName,
            phone: cleanPhone,
            altPhone: formData.altPhone || "N/A",
            email: cleanEmail,
            deliveryAddress: formData.deliveryAddress || "Customer Delivery Address",
            city: formData.city || "Mumbai",
            state: formData.state || "Maharashtra",
            pincode: formData.pincode || "400001",
            gstNumber: formData.gstNumber?.trim() ? formData.gstNumber.trim().toUpperCase() : "N/A",
            customerType: "retail",
            companyName: formData.companyName?.trim() || undefined,
          },
          variantId: selectedVacuumOption === "without" ? "without-vacuum" : "with-vacuum",
          colorName: currentColor.name,
          quantity: quantity,
          paymentMethod: isEmi ? "EMI" : "FULL_ONLINE",
          cardNumber: rawCardDigits,
          emiDetails: isEmi && selectedEmiBankObj ? {
            bank: selectedEmiBankObj.code,
            tenure: selectedTenure,
            monthlyAmount: selectedEmiPlan?.monthlyAmount || calculateStartingEmi(selectedEmiBankObj.id, selectedEmiBankObj.code, selectedEmiBankObj.name, totalPrice),
          } : undefined,
          idempotencyKey: `promec_${isEmi ? "emi" : "card"}_${cleanPhone}_${Date.now()}`,
        }),
      });

      const orderData = await res.json();
      if (!res.ok || !orderData || orderData.error) {
        throw new Error(orderData?.error || "Order creation failed.");
      }

      setCardOrderId(orderData.orderId || orderData.id);
      setCardRazorpayOrderId(orderData.razorpayOrderId || orderData.id);
      setCardLast4(rawCardDigits.slice(-4));

      // 2. Load Razorpay Custom Checkout SDK
      await loadRazorpayScript();
      if (typeof (window as any).Razorpay !== "function") {
        throw new Error("Razorpay gateway is initializing. Please try again.");
      }

      let rzpInstance: any = null;
      let hasRetriedAsCard = false;

      let paymentResponded = false;
      const processingTimeout = setTimeout(() => {
        if (!paymentResponded) {
          console.warn("[Custom Checkout] Payment request timed out after 20s");
          setIsProcessingCard(false);
          setIsVerifyingCardOtp(false);
          if (isEmiMode && isDebitCard) {
            setDebitEmiDeclinedMsg(
              `Your bank (${selectedEmiBankObj?.name || "HDFC Bank"}) is taking too long to verify Debit Card EMI. Debit Card EMI requires prior bank pre-approval (SMS 'MYHDFC' to 56767). Click below to pay in full with this Card.`
            );
            setFailedCardPayload({
              "card[number]": rawCardDigits,
              "card[expiry_month]": expMonth,
              "card[expiry_year]": expYear,
              "card[cvv]": cardCvv,
              "card[name]": customerFullName,
            });
          } else {
            setCardErrorMessage("Bank gateway took too long to respond. Please try again or use another payment method.");
          }
        }
      }, 20000);

      // 3. Handle Real Bank OTP Event (Native OTP within our website UI)
      const handleOtpRequired = (data: any) => {
        paymentResponded = true;
        clearTimeout(processingTimeout);
        setIsProcessingCard(false);
        setIsVerifyingCardOtp(false);
        setCheckoutStep("card_otp");
        setCardOtpTimer(29);
        setCardOtp(["", "", "", "", "", ""]);

        // Dynamically capture live recipient phone/masked contact from bank event only
        let detectedRecipient = "";
        if (data && typeof data === "object") {
          detectedRecipient =
            data.bank_phone ||
            data.masked_contact ||
            data.masked_phone ||
            data.registered_phone ||
            "";
        }
        // Never default to checkout delivery phone number, as the issuing bank sends OTP to the card's registered phone
        setCardOtpRecipient(detectedRecipient ? String(detectedRecipient) : "");

        if (data === "incorrect_otp_retry") {
          setCardErrorMessage("Incorrect OTP. Please enter the valid OTP received on your mobile from your bank.");
        } else {
          setCardErrorMessage(null);
        }
        setTimeout(() => {
          cardOtpInputsRef.current[0]?.focus();
        }, 150);
      };

      // 4. Handle Bank 3DS redirect if required by issuing bank
      const handle3dsRequired = (data?: any) => {
        paymentResponded = true;
        clearTimeout(processingTimeout);
        setIsProcessingCard(false);
        setIsVerifyingCardOtp(false);
        const rzp = rzpInstance || rzpCardInstanceRef.current;
        if (rzp && typeof rzp.gotoBank === "function") {
          rzp.gotoBank();
        } else if (rzp && typeof rzp._payment?.gotoBank === "function") {
          rzp._payment.gotoBank();
        } else if (data?.redirect_url) {
          window.location.href = data.redirect_url;
        }
      };

      // 5. Handle Payment Success (Triggered after successful OTP authorization)
      const handlePaymentSuccess = async (response: any) => {
        paymentResponded = true;
        clearTimeout(processingTimeout);
        setIsVerifyingCardOtp(true);
        setCardErrorMessage(null);

        try {
          // Double verify signature and status === 'captured' on backend
          const verifyRes = await fetch(getApiPath("/api/payments/verify"), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderId: orderData.orderId || orderData.id,
              razorpayOrderId: response?.razorpay_order_id || orderData.razorpayOrderId || orderData.id,
              razorpayPaymentId: response?.razorpay_payment_id,
              razorpaySignature: response?.razorpay_signature,
              customer: {
                fullName: formData.fullName,
                phone: formData.phone,
                email: formData.email,
                deliveryAddress: formData.deliveryAddress,
                shippingAddress: formData.deliveryAddress,
                city: formData.city,
                state: formData.state,
                pincode: formData.pincode,
                altPhone: formData.altPhone,
                gstNumber: formData.gstNumber,
              },
            }),
          });

          const verifyData = await verifyRes.json();
          if (!verifyRes.ok || !verifyData?.success) {
            throw new Error(verifyData?.error || "Payment verification failed. Payment was not captured.");
          }

          const payId = response?.razorpay_payment_id || verifyData.paymentId;
          setPaymentId(payId);
          setIsSubmitted(true);
          setIsVerifyingCardOtp(false);

          if (typeof window !== "undefined" && (window as any).fbq) {
            (window as any).fbq("track", "Purchase", {
              value: totalPrice,
              currency: "INR",
              content_name: `${PRODUCT_DATA.name} (${currentColor.name})`,
              content_type: "product",
              num_items: quantity,
            });
          }

          const targetThankYou = window.location.pathname.startsWith("/aquaforceforautocare")
            ? "/aquaforceforautocare/thank-you"
            : "/thank-you";
          const methodLabel = isEmi
            ? `EMI on Card (${selectedEmiBankObj?.name || "Bank"} - ${selectedTenure} Months)`
            : "Credit/Debit Card";
          window.location.href = `${targetThankYou}?payment_id=${encodeURIComponent(payId)}&order_id=${encodeURIComponent(orderData.orderId || orderData.id)}&amount=${encodeURIComponent(totalPrice)}&total_amount=${encodeURIComponent(totalPrice)}&name=${encodeURIComponent(customerFullName)}&method=${encodeURIComponent(methodLabel)}${verifyData.waybill ? `&waybill=${encodeURIComponent(verifyData.waybill)}` : ""}`;
        } catch (err: any) {
          console.error("Card payment verification error:", err);
          setIsVerifyingCardOtp(false);
          setCardErrorMessage(err?.message || "Failed to confirm payment capture with bank.");
        }
      };

      // 6. Verified baseline mapping for Supported Native Razorpay EMI Issuers on merchant account
      const RZP_NATIVE_EMI_BANKS = new Set([
        "AMEX", "AUBL", "BARB", "FDRL", "HDFC_DC", "HSBC", "ICIC", "IDFB",
        "INDB", "KKBK", "RATN", "SCBL", "UTIB", "YESB", "ONECARD", "HDFC"
      ]);
      const targetBankCode = (selectedEmiBankObj?.code || "").toUpperCase().replace(/_DC$/, "_DC");

      // 7. Handle Payment Error / Decline from Bank
      const handlePaymentError = (err: any) => {
        paymentResponded = true;
        clearTimeout(processingTimeout);
        console.error("Custom checkout core error catch:", err);
        const errMsg =
          err?.error?.description ||
          err?.description ||
          err?.message ||
          "Payment was declined by your bank. Please check your card details.";

        // Close any blank/orphaned popup window opened by Razorpay
        const rzp = rzpInstance || rzpCardInstanceRef.current;
        const paymentObj = rzp?._payment || rzp;
        if (paymentObj?.popup) {
          try {
            if (typeof paymentObj.popup.close === "function") {
              paymentObj.popup.close();
            } else if (paymentObj.popup.window && typeof paymentObj.popup.window.close === "function") {
              paymentObj.popup.window.close();
            }
          } catch (_) {}
        }

        setIsProcessingCard(false);
        setIsVerifyingCardOtp(false);

        if (isEmiMode && isDebitCard) {
          setDebitEmiDeclinedMsg(
            `Your bank (${selectedEmiBankObj?.name || "HDFC Bank"}) has not pre-approved this debit card for an instant EMI loan. To enable it, please SMS 'MYHDFC' (or your bank's keyword) to 56767 from your registered mobile number.`
          );
          setFailedCardPayload({
            "card[number]": rawCardDigits,
            "card[expiry_month]": expMonth,
            "card[expiry_year]": expYear,
            "card[cvv]": cardCvv,
            "card[name]": customerFullName,
          });
        } else {
          setCardErrorMessage(errMsg);
        }
      };

      // 8. Pre-calculate Customer Fee Bearer (CFB) convenience fee via Razorpay Fees API
      const paymentMethod = isEmiMode ? "emi" : "card";
      const emiBankCode = isEmiMode && RZP_NATIVE_EMI_BANKS.has(targetBankCode) ? targetBankCode : undefined;
      let calculatedAmount = orderData.amount;
      let calculatedFee = 0;
      let calculatedTax = 0;

      try {
        const feesRes = await fetch(getApiPath("/api/payments/calculate-fees"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: orderData.amount,
            currency: "INR",
            method: paymentMethod,
            order_id: orderData.razorpayOrderId || orderData.id,
            card: {
              number: rawCardDigits,
              name: customerFullName,
              expiry_month: expMonth,
              expiry_year: expYear,
              cvv: cardCvv,
            },
            email: cleanEmail,
            contact: cleanPhone,
            ...(isEmiMode ? { emi_duration: Number(selectedTenure) || 6 } : {}),
            ...(emiBankCode ? { bank: emiBankCode } : {}),
          }),
        });

        const feesData = await feesRes.json();
        if (feesData?.input?.amount) {
          calculatedAmount = feesData.input.amount;
        }
        if (feesData?.input?.fee) {
          calculatedFee = feesData.input.fee;
        }
        if (feesData?.input?.tax) {
          calculatedTax = feesData.input.tax;
        }
        console.log("[Custom Checkout] CFB calculated:", {
          amount: calculatedAmount,
          fee: calculatedFee,
          tax: calculatedTax,
        });
      } catch (feeErr) {
        console.warn("[Custom Checkout] Fee calculation failed, proceeding with default amount:", feeErr);
      }

      // 9. Initialize Razorpay Custom Checkout instance with accurate amount and offers
      rzpInstance = new (window as any).Razorpay({
        key: orderData.keyId,
        order_id: orderData.razorpayOrderId || orderData.id,
        amount: calculatedAmount,
        currency: "INR",
        ...(Array.isArray(orderData.offers) && orderData.offers.length > 0 ? { offers: orderData.offers } : {}),
      });
      rzpCardInstanceRef.current = rzpInstance;

      // 10. Register Native OTP and Payment Handlers
      if (typeof rzpInstance.on === "function") {
        rzpInstance.on("payment.otp.required", handleOtpRequired);
        rzpInstance.on("payment.3ds.required", handle3dsRequired);
        rzpInstance.on("payment.success", handlePaymentSuccess);
        rzpInstance.on("payment.error", handlePaymentError);
        rzpInstance.on("payment.failed", handlePaymentError);
      }

      // 11. Dispatch createPayment directly to bank (100% In-Website, zero external popup)
      const paymentPayload: any = {
        "card[name]": customerFullName,
        "card[number]": rawCardDigits,
        "card[expiry_month]": expMonth,
        "card[expiry_year]": expYear,
        "card[cvv]": cardCvv,
        contact: cleanPhone,
        email: cleanEmail,
        order_id: orderData.razorpayOrderId || orderData.id,
        amount: calculatedAmount,
        currency: "INR",
      };

      // Include the pre-calculated fee and tax for Customer Fee Bearer compliance
      if (calculatedFee > 0) {
        paymentPayload.fee = calculatedFee;
      }
      if (calculatedTax > 0) {
        paymentPayload.tax = calculatedTax;
      }

      if (isEmiMode) {
        paymentPayload.method = "emi";
        paymentPayload.emi_duration = Number(selectedTenure) || 6;
        if (RZP_NATIVE_EMI_BANKS.has(targetBankCode)) {
          paymentPayload.bank = targetBankCode;
        }
      } else {
        paymentPayload.method = "card";
      }

      console.log("[Custom Checkout] Dispatching createPayment with method:", paymentPayload.method, "amount:", calculatedAmount, "fee:", calculatedFee);
      if (typeof rzpInstance.createPayment === "function") {
        rzpInstance.createPayment(paymentPayload, { nativeotp: true });
      } else {
        clearTimeout(processingTimeout);
        throw new Error("Razorpay Custom Checkout SDK is initializing. Please try again.");
      }

    } catch (err: any) {
      console.error("Card payment initiation error:", err);
      setIsProcessingCard(false);
      setIsVerifyingCardOtp(false);
      setCardErrorMessage(err.message || "Failed to process card details. Please try again.");
    }
  };

  // OTP Input & Confirmation Handlers (Exact Match to media_1790406822318.png)

  const handleOtpChange = (index: number, val: string) => {
    const cleanVal = val.replace(/\D/g, "");
    if (!cleanVal) {
      const newOtp = [...cardOtp];
      newOtp[index] = "";
      setCardOtp(newOtp);
      return;
    }
    const char = cleanVal.slice(-1);
    const newOtp = [...cardOtp];
    newOtp[index] = char;
    setCardOtp(newOtp);
    if (index < 5) {
      cardOtpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !cardOtp[index] && index > 0) {
      cardOtpInputsRef.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const newOtp = [...cardOtp];
    for (let i = 0; i < pasted.length; i++) {
      newOtp[i] = pasted[i];
    }
    setCardOtp(newOtp);
    const targetIdx = Math.min(pasted.length, 5);
    cardOtpInputsRef.current[targetIdx]?.focus();
  };

  const handleConfirmCardOtp = async (isSkip?: boolean) => {
    if (isSkip) {
      if (rzpCardInstanceRef.current) {
        if (typeof (rzpCardInstanceRef.current as any).gotoBank === "function") {
          (rzpCardInstanceRef.current as any).gotoBank();
          return;
        } else if (typeof (rzpCardInstanceRef.current as any)._payment?.gotoBank === "function") {
          (rzpCardInstanceRef.current as any)._payment.gotoBank();
          return;
        }
      }
      setCardErrorMessage("2FA OTP verification is required by your issuing bank.");
      return;
    }

    const enteredOtp = cardOtp.join("");
    if (enteredOtp.length < 6) {
      setCardErrorMessage("Please enter the 6-digit OTP sent to your phone.");
      return;
    }

    setIsVerifyingCardOtp(true);
    setCardErrorMessage(null);

    if (rzpCardInstanceRef.current && typeof (rzpCardInstanceRef.current as any).submitOTP === "function") {
      try {
        (rzpCardInstanceRef.current as any).submitOTP(enteredOtp);
      } catch (err: any) {
        setIsVerifyingCardOtp(false);
        setCardErrorMessage(err?.message || "Failed to submit OTP to bank.");
      }
    } else {
      setIsVerifyingCardOtp(false);
      setCardErrorMessage("Active payment session not found. Please re-enter card details.");
    }
  };

  const handleResendOtp = () => {
    if (rzpCardInstanceRef.current && typeof (rzpCardInstanceRef.current as any).resendOTP === "function") {
      try {
        (rzpCardInstanceRef.current as any).resendOTP();
        setCardOtpTimer(29);
        setCardOtp(["", "", "", "", "", ""]);
        setCardErrorMessage(null);
        cardOtpInputsRef.current[0]?.focus();
      } catch (err: any) {
        setCardErrorMessage(err?.message || "Failed to resend OTP.");
      }
    } else {
      setCardErrorMessage("Unable to resend OTP. Please re-enter card details.");
    }
  };


  const handleUpiAppSelectAndPay = (appId: UpiAppId) => {
    setSelectedUpiApp(appId);
    setPaymentMethod("FULL_ONLINE");
    setSelectedCustomPayment("upi");
    setOnlinePaymentMode("FULL");

    const isValid = validateFormFields();
    if (!isValid) {
      setPaymentErrorMessage("Please complete your delivery details highlighted in red before proceeding to UPI payment.");
      return;
    }

    setPaymentErrorMessage("");
    handleCheckoutSubmit({
      paymentMethod: "FULL_ONLINE",
      onlinePaymentMode: "FULL",
      selectedCustomPayment: "upi",
      selectedUpiApp: appId,
    });
  };

  const handleProceedNetbankingDirect = async (bank: NetbankingBankItem) => {
    setSelectedBank(bank.code);

    const isValid = validateFormFields();
    if (!isValid) {
      setSelectedBankForSheet(null);
      setCheckoutStep("details");
      setPaymentErrorMessage("Please complete your delivery details highlighted in red before proceeding to Netbanking.");
      return;
    }

    setIsRedirectingToBank(true);
    setPaymentErrorMessage("");

    try {
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        throw new Error("Unable to load Razorpay payment SDK. Please check your internet connection.");
      }

      const res = await fetch(getApiPath("/api/orders/create"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: {
            fullName: formData.fullName,
            phone: formData.phone,
            altPhone: formData.altPhone || "N/A",
            email: formData.email,
            deliveryAddress: formData.deliveryAddress,
            city: formData.city,
            state: formData.state,
            pincode: formData.pincode,
            gstNumber: formData.gstNumber?.trim() ? formData.gstNumber.trim().toUpperCase() : "N/A",
            customerType: "retail",
            companyName: formData.companyName?.trim() || undefined,
          },
          variantId: selectedVacuumOption === "without" ? "without-vacuum" : "with-vacuum",
          colorName: currentColor.name,
          quantity: quantity,
          paymentMethod: "FULL_ONLINE",
          idempotencyKey: `promec_nb_${bank.code}_${formData.phone.replace(/\D/g, "")}_${Date.now()}`,
        }),
      });

      const orderData = await res.json();
      if (!res.ok || !orderData || orderData.error) {
        throw new Error(orderData?.error || "Order creation failed.");
      }

      const activeKeyId = orderData.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
      if (!activeKeyId) {
        throw new Error("Razorpay Key ID is not configured on the server.");
      }

      const onNetbankingSuccess = async (response: any) => {
        const payId = response.razorpay_payment_id || "";
        setPaymentId(payId);
        setIsProcessingPayment(false);
        setIsRedirectingToBank(false);

        let generatedWaybill = "";
        try {
          const verifyRes = await fetch(getApiPath("/api/payments/verify"), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderId: orderData.orderId,
              razorpayOrderId: orderData.razorpayOrderId || orderData.id,
              razorpayPaymentId: payId,
              razorpaySignature: response.razorpay_signature,
              customer: {
                fullName: formData.fullName,
                phone: formData.phone,
                email: formData.email,
                deliveryAddress: formData.deliveryAddress,
                shippingAddress: formData.deliveryAddress,
                city: formData.city,
                state: formData.state,
                pincode: formData.pincode,
                altPhone: formData.altPhone,
                gstNumber: formData.gstNumber,
              },
            }),
          });
          const verifyData = await verifyRes.json();
          if (verifyData?.waybill) {
            generatedWaybill = verifyData.waybill;
          }
        } catch (vErr) {
          console.warn("Netbanking verify note:", vErr);
        }

        const targetThankYou = window.location.pathname.startsWith("/aquaforceforautocare")
          ? "/aquaforceforautocare/thank-you"
          : "/thank-you";
        window.location.href = `${targetThankYou}?payment_id=${encodeURIComponent(payId)}&order_id=${encodeURIComponent(orderData.orderId || orderData.id)}&amount=${encodeURIComponent(totalPrice)}&total_amount=${encodeURIComponent(totalPrice)}&name=${encodeURIComponent(formData.fullName)}&method=${encodeURIComponent(`${bank.name} Netbanking`)}${generatedWaybill ? `&waybill=${encodeURIComponent(generatedWaybill)}` : ""}`;
      };

      const options: any = {
        key: activeKeyId,
        amount: orderData.amount,
        currency: "INR",
        name: "PROMEC Aquaforce",
        description: `${bank.name} Netbanking`,
        image: "https://files.catbox.moe/jpksbs.png",
        order_id: orderData.razorpayOrderId || orderData.id,
        prefill: {
          name: formData.fullName,
          email: formData.email,
          contact: formData.phone.startsWith("+91") ? formData.phone : `+91${formData.phone}`,
          method: "netbanking",
        },
        theme: { color: "#005a9c" },
        config: {
          display: {
            blocks: {
              nb_single_bank: {
                name: `${bank.name} Netbanking`,
                instruments: [
                  { method: "netbanking", banks: [bank.code] },
                ],
              },
            },
            sequence: ["block.nb_single_bank"],
            preferences: {
              show_default_blocks: false,
            },
          },
        },
        handler: onNetbankingSuccess,
        modal: {
          ondismiss: function () {
            setIsRedirectingToBank(false);
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);

      if (typeof rzp.on === "function") {
        rzp.on("payment.success", onNetbankingSuccess);
        rzp.on("payment.error", (err: any) => {
          console.error("Netbanking error event:", err);
          setIsRedirectingToBank(false);
          setPaymentErrorMessage(
            err?.error?.description || err?.description || err?.message || "Netbanking transaction failed. Please try another bank."
          );
        });
        rzp.on("payment.failure", (err: any) => {
          console.error("Netbanking failure event:", err);
          setIsRedirectingToBank(false);
          setPaymentErrorMessage(
            err?.error?.description || err?.description || err?.message || "Netbanking transaction failed. Please try another bank."
          );
        });
      }

      if (typeof rzp.createPayment === "function") {
        // Pre-calculate CFB convenience fee for netbanking
        let nbAmount = orderData.amount;
        let nbFee = 0;
        let nbTax = 0;
        try {
          const nbFeesRes = await fetch(getApiPath("/api/payments/calculate-fees"), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              amount: orderData.amount,
              currency: "INR",
              method: "netbanking",
              order_id: orderData.razorpayOrderId || orderData.id,
              bank: bank.code,
              email: formData.email,
              contact: formData.phone.startsWith("+91") ? formData.phone : `+91${formData.phone}`,
            }),
          });
          const nbFeesData = await nbFeesRes.json();
          if (nbFeesData?.input?.amount) {
            nbAmount = nbFeesData.input.amount;
          }
          if (nbFeesData?.input?.fee) {
            nbFee = nbFeesData.input.fee;
          }
          if (nbFeesData?.input?.tax) {
            nbTax = nbFeesData.input.tax;
          }
          console.log("[Netbanking] CFB calculated:", { amount: nbAmount, fee: nbFee, tax: nbTax });
        } catch (feeErr) {
          console.warn("[Netbanking] Fee calculation failed, proceeding with default amount:", feeErr);
        }

        const nbPayload: any = {
          amount: nbAmount,
          currency: "INR",
          order_id: orderData.razorpayOrderId || orderData.id,
          email: formData.email,
          contact: formData.phone.startsWith("+91") ? formData.phone : `+91${formData.phone}`,
          method: "netbanking",
          bank: bank.code,
        };
        if (nbFee > 0) {
          nbPayload.fee = nbFee;
        }
        if (nbTax > 0) {
          nbPayload.tax = nbTax;
        }
        rzp.createPayment(nbPayload);
      } else {
        throw new Error("Netbanking gateway is currently unavailable. Please try again.");
      }
    } catch (err: any) {
      console.error("Netbanking initiation error:", err);
      setIsRedirectingToBank(false);
      setPaymentErrorMessage(err.message || "Failed to initiate Netbanking payment.");
    }
  };

  const handleCheckoutSubmit = async (
    eOrOptions?: React.FormEvent | CheckoutSubmitOptions,
    optionsArg?: CheckoutSubmitOptions
  ) => {
    let options: CheckoutSubmitOptions | undefined;
    if (eOrOptions && "preventDefault" in eOrOptions) {
      eOrOptions.preventDefault();
      options = optionsArg;
    } else if (eOrOptions && typeof eOrOptions === "object") {
      options = eOrOptions as CheckoutSubmitOptions;
    }

    const effectivePaymentMethod = options?.paymentMethod ?? paymentMethod;
    const effectiveOnlinePaymentMode = options?.onlinePaymentMode ?? onlinePaymentMode;
    const effectiveCustomPayment = options?.selectedCustomPayment ?? selectedCustomPayment;
    const effectiveEmiBank = options?.selectedEmiBank ?? selectedEmiBank;
    const effectiveTenure = options?.selectedTenure ?? selectedTenure;
    const effectiveUpiApp = options?.selectedUpiApp ?? selectedUpiApp;

    if (!currentColor.inStock) return;

    if (!validateFormFields()) {
      setCheckoutStep("details");
      return;
    }

    const isCodOrder = effectivePaymentMethod === "10_PERCENT_COD";

    if (!isCodOrder && effectiveCustomPayment === "card") {
      if (!cardHolderName && formData.fullName) {
        setCardHolderName(formData.fullName);
      }
      setCardErrorMessage(null);
      setCheckoutStep("card_payment");
      loadRazorpayScript().catch(() => {});
      return;
    }

    if (!isCodOrder && effectiveCustomPayment === "netbanking") {
      setNetbankingSearchQuery("");
      setSelectedNetbankingTab("popular");
      setSelectedBankForSheet(null);
      setCheckoutStep("select_netbanking");
      loadRazorpayScript().catch(() => {});
      return;
    }

    setPaymentErrorMessage("");
    setIsProcessingPayment(true);

    try {
      // Non-blocking SDK preload
      loadRazorpayScript().catch(() => {});

      const isEmiMode = effectiveOnlinePaymentMode === "EMI" && !isCodOrder;

      // 1. Authoritative Server-Side Order Creation (Server calculates true pricing)
      const res = await fetch(getApiPath("/api/orders/create"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: {
            fullName: formData.fullName,
            phone: formData.phone,
            altPhone: formData.altPhone || "N/A",
            email: formData.email,
            deliveryAddress: formData.deliveryAddress,
            city: formData.city,
            state: formData.state,
            pincode: formData.pincode,
            gstNumber: formData.gstNumber?.trim() ? formData.gstNumber.trim().toUpperCase() : "N/A",
            customerType: "retail",
            companyName: formData.companyName?.trim() || undefined,
          },
          variantId: selectedVacuumOption === "without" ? "without-vacuum" : "with-vacuum",
          colorName: currentColor.name,
          quantity: quantity,
          paymentMethod: isCodOrder ? "COD_ADVANCE" : isEmiMode ? "EMI" : "FULL_ONLINE",
          emiDetails: isEmiMode
            ? {
                bank: effectiveEmiBank,
                tenure: effectiveTenure,
                monthlyAmount: Math.round(totalPrice / (effectiveTenure || 1)),
              }
            : undefined,
          idempotencyKey: `promec_${formData.phone.replace(/\D/g, "")}_${Date.now()}`,
        }),
      });

      let orderData: any = null;
      const textResponse = await res.text();
      try {
        orderData = JSON.parse(textResponse);
      } catch (err) {
        throw new Error(textResponse || "Failed to parse order response from server.");
      }

      if (!res.ok || !orderData || orderData.error) {
        throw new Error(orderData?.error || `Order creation failed (${res.status})`);
      }

      const activeKeyId =
        orderData.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
      if (!activeKeyId) {
        throw new Error("Razorpay Key ID is not configured on the server.");
      }
      const totalAmount = currentOfferPrice * quantity;
      const advanceAmountPaid = orderData.advanceAmount ?? (isCodOrder ? advanceAmount : totalAmount);
      const codBalanceDue = orderData.codBalance ?? (isCodOrder ? codBalance : 0);

      // Central Success & Server-Side Verification + Idempotent Fulfillment Handler
      const handlePaymentSuccess = async (response: any) => {
        const payId = response.razorpay_payment_id || "";
        setPaymentId(payId);
        setIsProcessingPayment(false);

        let generatedWaybill = "";

        // Verify payment signature and trigger server-side fulfillment (with double-run protection)
        try {
          const verifyRes = await fetch(getApiPath("/api/payments/verify"), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderId: orderData.orderId,
              razorpayOrderId: orderData.razorpayOrderId || orderData.id,
              razorpayPaymentId: payId,
              razorpaySignature: response.razorpay_signature,
              customer: {
                fullName: formData.fullName,
                phone: formData.phone,
                email: formData.email,
                deliveryAddress: formData.deliveryAddress,
                shippingAddress: formData.deliveryAddress,
                city: formData.city,
                state: formData.state,
                pincode: formData.pincode,
                altPhone: formData.altPhone,
                gstNumber: formData.gstNumber,
              },
            }),
          });
          const verifyData = await verifyRes.json();

          if (!verifyRes.ok || !verifyData?.success) {
            throw new Error(verifyData?.error || "Payment verification failed.");
          }

          if (verifyData?.waybill) {
            generatedWaybill = verifyData.waybill;
          }

          setIsCodSuccess(isCodOrder);
          setIsSubmitted(true);

          if (typeof window !== "undefined" && (window as any).fbq) {
            (window as any).fbq("track", "Purchase", {
              value: advanceAmountPaid,
              currency: "INR",
              content_name: `${PRODUCT_DATA.name} (${currentColor.name})`,
              content_type: "product",
              num_items: quantity,
            });
          }

          const targetThankYou = window.location.pathname.startsWith("/aquaforceforautocare")
            ? "/aquaforceforautocare/thank-you"
            : "/thank-you";
          setTimeout(() => {
            window.location.href = `${targetThankYou}?payment_id=${encodeURIComponent(payId)}&order_id=${encodeURIComponent(orderData.orderId || orderData.id)}&amount=${encodeURIComponent(advanceAmountPaid)}&total_amount=${encodeURIComponent(totalAmount)}&cod_balance=${encodeURIComponent(codBalanceDue)}&name=${encodeURIComponent(formData.fullName)}&method=${encodeURIComponent(isCodOrder ? "10% Cash on Delivery" : isEmiMode ? "No Cost EMI" : "Full Online Payment")}${generatedWaybill ? `&waybill=${encodeURIComponent(generatedWaybill)}` : ""}`;
          }, 3000);
        } catch (verifyErr: any) {
          console.error("Payment verification error:", verifyErr);
          setIsSubmitted(false);
          setIsCodSuccess(false);
          setIsProcessingPayment(false);
          setPaymentErrorMessage(
            verifyErr?.message || "Payment verification failed. Please contact customer support."
          );
        }
      };

      // If No Cost EMI is selected, launch Razorpay Standard Checkout with the order_id created with Promec India PayLater offers
      if (isEmiMode) {
        await loadRazorpayScript();
        if (typeof (window as any).Razorpay !== "function") {
          throw new Error("Razorpay gateway is initializing. Please try again in a few moments.");
        }

        const emiOptions: any = {
          key: activeKeyId,
          amount: orderData.amount,
          currency: "INR",
          name: "PROMEC Aquaforce",
          description: "Promec India PayLater • No Cost EMI",
          image: "https://files.catbox.moe/jpksbs.png",
          order_id: orderData.razorpayOrderId || orderData.id,
          ...(Array.isArray(orderData.offers) && orderData.offers.length > 0 ? { offers: orderData.offers } : {}),
          prefill: {
            name: formData.fullName,
            email: formData.email,
            contact: formData.phone.startsWith("+91") ? formData.phone : `+91${formData.phone}`,
          },
          config: {
            display: {
              blocks: {
                emi: {
                  name: "Promec India PayLater (No Cost EMI)",
                  instruments: [
                    { method: "emi" },
                    { method: "card" },
                  ],
                },
              },
              sequence: ["block.emi", "block.other"],
              preferences: {
                show_default_blocks: true,
              },
            },
          },
          theme: {
            color: "#0066cc",
          },
          handler: handlePaymentSuccess,
          modal: {
            ondismiss: () => {
              setIsProcessingPayment(false);
            },
          },
        };

        const rzp = new (window as any).Razorpay(emiOptions);
        if (typeof rzp.on === "function") {
          rzp.on("payment.failed", (errResp: any) => {
            console.error("Razorpay No-Cost EMI payment failed:", errResp);
            setPaymentErrorMessage(errResp?.error?.description || "Payment was canceled or declined.");
            setIsProcessingPayment(false);
          });
        }
        rzp.open();
        return;
      }

      // === UNIFIED IN-MODAL PAYMENT HUB (SCREEN C) ROUTING (For UPI & COD) ===
      let paymentTitle = "UPI Payment";
      let paymentSubtitle = "Scan QR code or use any UPI app below to pay";
      let emiMonthlyDisplay = "";
      let bankNameDisplay = "";

      if (isCodOrder) {
        paymentTitle = "COD 10% Advance Deposit";
        paymentSubtitle = "Scan QR code or pay via UPI to confirm your Cash on Delivery order";
      } else if (effectiveCustomPayment === "wallet") {
        paymentTitle = "Wallet / Online Payment";
        paymentSubtitle = "Pay using your wallet or UPI app below";
      }

      const displayAmount = isCodOrder ? advanceAmountPaid : totalAmount;
      const displayCodBalance = isCodOrder ? codBalanceDue : 0;

      const fallbackUpiUrl = `upi://pay?pa=amectechnology.rzp@rxairtel&pn=AMECTECHNOLOGY&mc=5013&tr=${orderData.orderId || upiSessionRef}&am=${displayAmount}&cu=INR&tn=PROMEC%20Aquaforce%20${orderData.orderId || upiSessionRef}`;
      const effectiveUpiIntentUrl = orderData.upiIntentUrl || fallbackUpiUrl;

      setAwaitingPaymentData({
        orderId: orderData.orderId,
        razorpayOrderId: orderData.razorpayOrderId || orderData.id,
        qrCodeUrl: orderData.qrCodeUrl || "",
        upiIntentUrl: effectiveUpiIntentUrl,
        amountInPaise: orderData.amount,
        amountDisplay: `₹${displayAmount.toLocaleString("en-IN")}`,
        isCod: isCodOrder,
        codBalanceDisplay: isCodOrder ? `₹${displayCodBalance.toLocaleString("en-IN")}` : "",
        totalDisplay: `₹${totalAmount.toLocaleString("en-IN")}`,
        paymentTitle,
        paymentSubtitle,
        emiMonthlyDisplay,
        bankName: bankNameDisplay,
      });

      awaitingPaymentTimerRef.current = 900;
      setAwaitingPaymentCountdown(900);
      setCheckoutStep("awaiting_payment");
      setIsProcessingPayment(false);
      setIsAwaitingUpi(true);

      const isMobileDevice = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        typeof navigator !== "undefined" ? navigator.userAgent : ""
      );
      if (isMobileDevice && (effectiveCustomPayment === "upi" || isCodOrder)) {
        const targetUrl = getAppSpecificUpiUrl(effectiveUpiIntentUrl, effectiveUpiApp);
        window.location.href = targetUrl;
      }

      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }

      const pollStartTime = Date.now();
      pollingIntervalRef.current = setInterval(async () => {
        const elapsedSecs = Math.floor((Date.now() - pollStartTime) / 1000);
        const remainingSecs = Math.max(0, 900 - elapsedSecs);
        awaitingPaymentTimerRef.current = remainingSecs;
        setAwaitingPaymentCountdown(remainingSecs);

        if (Date.now() - pollStartTime > 900000) {
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
          setIsProcessingPayment(false);
          setIsAwaitingUpi(false);
          setCheckoutStep("details");
          setPaymentErrorMessage("Payment timed out. Please try again.");
          return;
        }

        try {
          const verifyRes = await fetch(getApiPath("/api/payments/verify"), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderId: orderData.orderId,
              razorpayOrderId: orderData.razorpayOrderId || orderData.id,
              customer: {
                fullName: formData.fullName,
                phone: formData.phone,
                email: formData.email,
                deliveryAddress: formData.deliveryAddress,
                shippingAddress: formData.deliveryAddress,
                city: formData.city,
                state: formData.state,
                pincode: formData.pincode,
                altPhone: formData.altPhone,
                gstNumber: formData.gstNumber,
              },
            }),
          });
          const verifyData = await verifyRes.json();
          if (verifyData?.success) {
            if (pollingIntervalRef.current) {
              clearInterval(pollingIntervalRef.current);
              pollingIntervalRef.current = null;
            }
            setIsAwaitingUpi(false);
            handlePaymentSuccess({
              razorpay_payment_id: verifyData.paymentId,
              razorpay_order_id: orderData.razorpayOrderId || orderData.id,
            });
          }
        } catch (pollErr) {
          console.warn("UPI status check error:", pollErr);
        }
      }, 2500);
    } catch (err: any) {
      console.error("Payment error:", err);
      setPaymentErrorMessage(err.message || "Payment initiation failed. Please try again.");
      setIsProcessingPayment(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 lg:p-6 overflow-hidden overscroll-contain bg-white lg:bg-transparent">
      {/* Dark Blur Backdrop (Desktop Only) */}
      <div
        className="hidden lg:block fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={handleClose}
      />

      {/* Modal Dialog Card (Full screen separate page on mobile, popup modal on desktop) */}
      <div
        ref={modalCardRef}
        className={`relative w-full ${
          isCheckingOut
            ? "h-full lg:h-auto max-w-full sm:max-w-[720px] md:max-w-[820px] lg:max-w-[900px] xl:max-w-[960px] flex flex-col overflow-hidden max-h-[100dvh] lg:max-h-[92vh] p-0"
            : isSubmitted
            ? "h-full lg:h-auto max-w-full lg:max-w-[600px] p-4 xs:p-5 sm:p-7 md:p-8 overflow-y-auto max-h-none lg:max-h-[90vh]"
            : "h-full lg:h-auto max-w-full lg:max-w-[1040px] flex flex-col overflow-hidden max-h-none lg:max-h-[90vh]"
        } bg-white rounded-none lg:rounded-[24px] shadow-none lg:shadow-2xl border-0 lg:border lg:border-slate-100 z-10 my-0 lg:my-auto overscroll-contain animate-in fade-in duration-200 lg:zoom-in-95`}
      >
        {/* Top Close Button for Product Detail and Success Views */}
        {!isCheckingOut && (
          <button
            onClick={handleClose}
            className="absolute top-3.5 right-3.5 sm:top-5 sm:right-5 w-9 h-9 bg-[#f1f5f9] hover:bg-slate-200 text-slate-500 hover:text-slate-900 rounded-full flex items-center justify-center transition-colors focus:outline-none z-30 cursor-pointer shadow-xs"
            aria-label="Close modal"
          >
            <X size={16} />
          </button>
        )}

        {isSubmitted ? (
          /* ========================================================= */
          /* Exact Confirmation View from Reference Screenshot         */
          /* ========================================================= */
          <div className="relative flex flex-col items-center text-center py-2 sm:py-4">
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
              Order Placed Successfully!
            </h3>

            {/* Personalized Message */}
            <p className="text-[#475569] font-open-sans text-xs xs:text-[13.5px] sm:text-[14px] max-w-[430px] mx-auto mt-2 sm:mt-2.5 leading-relaxed font-normal">
              Thank you, <strong className="text-[#0f172a] font-bold font-open-sans">{formData.fullName || "Valued Customer"}</strong>.
              Your order for <strong className="text-[#005DA6] font-bold font-open-sans">Aquaforce® 1400</strong> has been confirmed and our
              dispatch team is preparing your package for express delivery.
            </p>

            {/* Summary Details Card */}
            <div className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-[16px] p-4 sm:p-5 mt-5 sm:mt-6 text-left font-open-sans space-y-3 divide-y divide-[#e2e8f0]/80 shadow-2xs">
              {/* Row 1: Product */}
              <div className="flex items-center justify-between text-[13px] pt-0 font-open-sans">
                <span className="text-[#64748b] font-medium font-open-sans">Product</span>
                <span className="text-[#0f172a] font-bold font-open-sans truncate max-w-[180px] sm:max-w-[240px]">
                  Aquaforce® 1400 ({currentColor.name})
                </span>
              </div>

              {/* Row 2: Order Status */}
              <div className="flex items-center justify-between text-[13px] pt-3 font-open-sans">
                <span className="text-[#64748b] font-medium font-open-sans">Order Status</span>
                <span className="bg-[#f0f9ff] border border-[#005DA6]/35 text-[#005DA6] text-xs font-bold font-open-sans px-3 py-0.5 rounded-full leading-none">
                  {isCodSuccess ? "10% Advance Paid • COD Confirmed" : "Paid & Confirmed"}
                </span>
              </div>

              {/* Row 3: Total Amount / Advance */}
              <div className="flex items-center justify-between text-[13px] pt-3 font-open-sans">
                <span className="text-[#64748b] font-medium font-open-sans">
                  {isCodSuccess ? "10% Advance Paid" : "Amount Paid"}
                </span>
                <span className="text-[#0f172a] font-bold font-open-sans tracking-wide">
                  ₹{(isCodSuccess ? advanceAmount : currentOfferPrice * quantity).toLocaleString("en-IN")}
                </span>
              </div>

              {isCodSuccess && (
                <div className="flex items-center justify-between text-[13px] pt-3 font-open-sans bg-amber-50/80 -mx-4 px-4 py-2 rounded-lg border border-amber-200/70">
                  <span className="text-amber-800 font-bold font-open-sans">Balance on Delivery</span>
                  <span className="text-amber-900 font-extrabold font-open-sans tracking-wide">
                    ₹{codBalance.toLocaleString("en-IN")}
                  </span>
                </div>
              )}

              {/* Row 4: Contact Number */}
              <div className="flex items-center justify-between text-[13px] pt-3 font-open-sans">
                <span className="text-[#64748b] font-medium font-open-sans">Contact Number</span>
                <span className="text-[#0f172a] font-bold font-open-sans tracking-wide">{formData.phone}</span>
              </div>

              {formData.altPhone && (
                <div className="flex items-center justify-between text-[13px] pt-3 font-open-sans">
                  <span className="text-[#64748b] font-medium font-open-sans">Alt. Contact Number</span>
                  <span className="text-[#0f172a] font-bold font-open-sans tracking-wide">{formData.altPhone}</span>
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
            </div>

            {/* Bottom Action Button */}
            <button
              type="button"
              onClick={resetAll}
              className="mt-6 sm:mt-8 w-full bg-[#0077c8] hover:bg-[#0066b3] active:bg-[#005599] text-white font-bold font-montserrat uppercase tracking-wider py-3.5 sm:py-4 rounded-[12px] shadow-sm hover:shadow-md transition-all cursor-pointer text-xs sm:text-sm"
            >
              CONTINUE BROWSING
            </button>
          </div>
        ) : isCheckingOut ? (
          checkoutStep === "awaiting_payment" && awaitingPaymentData ? (
            /* ========================================================= */
            /* SCREEN C: AWAITING UPI PAYMENT (In-Modal QR Payment Hub)  */
            /* ========================================================= */
            <div className="flex flex-col h-full flex-1 overflow-hidden">
              {/* Header */}
              <div className="shrink-0 px-4 sm:px-8 md:px-10 lg:px-12 pt-3.5 sm:pt-4 pb-3 border-b border-slate-100 flex items-center justify-between bg-white z-20">
                <button
                  type="button"
                  onClick={() => {
                    if (pollingIntervalRef.current) {
                      clearInterval(pollingIntervalRef.current);
                      pollingIntervalRef.current = null;
                    }
                    setIsProcessingPayment(false);
                    setIsAwaitingUpi(false);
                    setCheckoutStep("details");
                    setAwaitingPaymentData(null);
                  }}
                  className="flex items-center gap-1.5 text-slate-700 hover:text-slate-900 font-bold text-xs sm:text-sm font-montserrat cursor-pointer hover:bg-slate-100 px-2 py-1 rounded-lg transition-colors"
                  aria-label="Back to checkout"
                >
                  <ArrowLeft size={16} />
                  <span>Back to Checkout</span>
                </button>

                <button
                  type="button"
                  onClick={handleClose}
                  className="w-8 h-8 bg-slate-100/80 hover:bg-slate-200 text-slate-500 hover:text-slate-900 rounded-full flex items-center justify-center transition-colors focus:outline-none cursor-pointer shadow-2xs shrink-0"
                  aria-label="Close modal"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto px-4 sm:px-8 md:px-10 lg:px-12 py-5 sm:py-6 space-y-5 no-scrollbar">

                {/* Order Summary Pill */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 sm:p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-[#005a9c]/10 flex items-center justify-center shrink-0">
                        <ShoppingCart size={18} className="text-[#005a9c]" />
                      </div>
                      <div>
                        <div className="font-bold text-sm text-slate-900 font-montserrat">
                          {awaitingPaymentData.paymentTitle || (awaitingPaymentData.isCod ? "COD 10% Advance Deposit" : "UPI Payment")}
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium font-open-sans">
                          Order ID: {awaitingPaymentData.orderId}
                        </div>
                        {awaitingPaymentData.emiMonthlyDisplay && (
                          <div className="text-[11px] font-bold text-emerald-600 font-montserrat mt-0.5">
                            {awaitingPaymentData.emiMonthlyDisplay}
                          </div>
                        )}
                        {awaitingPaymentData.paymentSubtitle && !awaitingPaymentData.emiMonthlyDisplay && (
                          <div className="text-[11px] text-slate-500 font-open-sans mt-0.5">
                            {awaitingPaymentData.paymentSubtitle}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg sm:text-xl font-extrabold text-slate-900 font-montserrat">
                        {awaitingPaymentData.amountDisplay}
                      </div>
                      {awaitingPaymentData.isCod && (
                        <div className="text-[10.5px] text-slate-400 font-open-sans">
                          10% of {awaitingPaymentData.totalDisplay}
                        </div>
                      )}
                    </div>
                  </div>

                  {awaitingPaymentData.isCod && (
                    <div className="p-2.5 rounded-xl bg-[#ecfdf5] border border-[#a7f3d0] flex items-center justify-between text-xs font-bold text-[#065f46]">
                      <span>Balance on Delivery:</span>
                      <span className="text-sm font-extrabold text-emerald-700">
                        {awaitingPaymentData.codBalanceDisplay}
                      </span>
                    </div>
                  )}
                </div>

                {/* QR Code Section */}
                <div className="flex flex-col items-center space-y-4">
                  <div className="text-center space-y-1">
                    <div className="text-sm sm:text-base font-bold text-slate-900 font-montserrat">
                      Scan QR Code to Pay {awaitingPaymentData.amountDisplay}
                    </div>
                    <div className="text-xs text-slate-500 font-open-sans">
                      Use any UPI app (Google Pay, PhonePe, Paytm, BHIM) or scan to pay with linked Card/Bank
                    </div>
                  </div>

                  {/* QR Code Image (No Border) */}
                  <div className="relative w-56 h-56 sm:w-64 sm:h-64 bg-white flex items-center justify-center shrink-0">
                    {awaitingPaymentData.upiIntentUrl ? (
                      <QRCodeSVG
                        value={awaitingPaymentData.upiIntentUrl}
                        size={220}
                        level="M"
                        className="w-full h-full"
                      />
                    ) : awaitingPaymentData.qrCodeUrl ? (
                      <img
                        src={awaitingPaymentData.qrCodeUrl}
                        alt="Razorpay UPI QR Code"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-center space-y-2">
                        <span className="w-8 h-8 border-3 border-[#005a9c] border-t-transparent rounded-full animate-spin block" />
                        <span className="text-xs text-slate-500 font-open-sans">Generating QR Code...</span>
                      </div>
                    )}
                  </div>

                  {/* Tooltip Pill: QR valid for 14:58 mins with upward arrow */}
                  <div className="relative -mt-1 flex flex-col items-center">
                    <div className="w-0 h-0 border-x-[5px] border-x-transparent border-b-[5px] border-b-slate-100" />
                    <div className="bg-slate-100 text-slate-700 text-[11.5px] font-semibold px-3 py-1 rounded-lg select-none whitespace-nowrap shadow-2xs font-open-sans">
                      QR valid for <span className="font-bold text-slate-900">{formatQrTimer(awaitingPaymentCountdown)}</span> mins
                    </div>
                  </div>

                  {/* UPI App Quick-Launch Buttons (Overlapping Circular Stack) */}
                  <div className="flex items-center -space-x-2.5 justify-center py-1">
                    {UPI_APP_OPTIONS.map((app, idx) => (
                      <div
                        key={app.id}
                        onClick={() => {
                          setSelectedUpiApp(app.id);
                          if (awaitingPaymentData.upiIntentUrl) {
                            window.location.href = getAppSpecificUpiUrl(awaitingPaymentData.upiIntentUrl, app.id);
                          }
                        }}
                        style={{ zIndex: 10 * (idx + 1) }}
                        className={`relative w-11 h-11 rounded-full ${app.avatarBg} ring-2 ring-white flex items-center justify-center p-2 shadow-2xs shrink-0 select-none overflow-hidden cursor-pointer hover:scale-110 active:scale-95 transition-all`}
                        title={`Pay with ${app.name}`}
                      >
                        <img src={getApiPath(app.logo)} alt={app.name} className="w-full h-full object-contain" />
                      </div>
                    ))}
                  </div>

                  {/* Mobile UPI Intent Button */}
                  {awaitingPaymentData.upiIntentUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        if (awaitingPaymentData.upiIntentUrl) {
                          window.location.href = getAppSpecificUpiUrl(awaitingPaymentData.upiIntentUrl, selectedUpiApp);
                        }
                      }}
                      className="w-full max-w-xs bg-[#005a9c] hover:bg-[#004f8a] active:bg-[#004478] text-white font-bold font-montserrat text-sm py-3.5 rounded-xl shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2 uppercase tracking-wider sm:hidden"
                    >
                      <span>⚡</span>
                      <span>Pay via {UPI_APP_OPTIONS.find((a) => a.id === selectedUpiApp)?.name || "UPI App"}</span>
                    </button>
                  )}
                </div>

                {/* Live Status Indicator */}
                <div className="bg-[#fffbeb] border border-[#fde68a] rounded-2xl p-4 space-y-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse shrink-0" />
                    <span className="text-sm font-bold text-amber-900 font-montserrat">
                      Waiting for payment confirmation...
                    </span>
                  </div>
                  <div className="text-xs text-amber-800/80 font-open-sans leading-relaxed">
                    Complete the payment in your UPI app. This page will update automatically once your payment is received. Please do not close or refresh this window.
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <span className="w-4 h-4 border-2 border-amber-600 border-t-transparent rounded-full animate-spin block shrink-0" />
                    <span className="text-[11px] text-amber-700 font-semibold font-open-sans">
                      Checking payment status...
                    </span>
                  </div>
                </div>

                {/* Security Badge */}
                <div className="flex items-center justify-center gap-2 text-xs text-slate-400 font-open-sans py-2">
                  <Lock size={12} className="text-slate-400" />
                  <span>Secured by Razorpay • 256-bit SSL Encryption</span>
                </div>
              </div>
            </div>
          ) : checkoutStep === "choose_emi" ? (
            /* ========================================================= */
            /* SCREEN B: CHOOSE EMI OPTIONS (Exact Match to media_1790416132263.png) */
            /* ========================================================= */
            <div className="flex flex-col h-full flex-1 overflow-hidden bg-white">
              {/* Header with Back Arrow: ← Choose EMI Options */}
              <div className="shrink-0 px-4 sm:px-8 py-3.5 sm:py-4 border-b border-slate-100 flex items-center justify-between bg-white z-20">
                <button
                  type="button"
                  onClick={() => setCheckoutStep("details")}
                  className="flex items-center gap-2 text-slate-900 hover:text-slate-950 font-bold text-sm sm:text-base font-montserrat cursor-pointer hover:bg-slate-100 px-2 py-1 rounded-lg transition-colors"
                  aria-label="Back to checkout"
                >
                  <ArrowLeft size={18} className="text-slate-800" />
                  <span className="font-extrabold text-[#002d62]">Choose EMI Options</span>
                </button>

                <button
                  type="button"
                  onClick={handleClose}
                  className="w-8 h-8 bg-slate-100/80 hover:bg-slate-200 text-slate-500 hover:text-slate-900 rounded-full flex items-center justify-center transition-colors focus:outline-none cursor-pointer shadow-2xs shrink-0"
                  aria-label="Close modal"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-4 space-y-4 no-scrollbar">
                {/* Available Offers Compact Pill Bar (Exact match to media_1790942039403.png) */}
                <div className="space-y-2">
                  <div className="text-xs sm:text-[13px] font-semibold text-slate-700 font-montserrat">
                    Available Offers
                  </div>
                  <div className="flex items-center gap-2 sm:gap-2.5 overflow-x-auto no-scrollbar py-0.5">
                    {/* Pill 1: Featured Yes Bank Offer */}
                    <button
                      type="button"
                      onClick={() => setIsOffersModalOpen(true)}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#edeefc] hover:bg-[#e4e6fb] active:scale-[0.98] transition-all cursor-pointer border border-[#d8dbfa]/50 shrink-0 text-left"
                    >
                      <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white flex items-center justify-center overflow-hidden shrink-0 shadow-xs border border-white">
                        <img
                          src="https://cashfreelogo.cashfree.com/assets_images/pg/nb/64/yes.png"
                          alt="Yes Bank"
                          className="w-full h-full object-contain p-0.5"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://cashfreelogo.cashfree.com/assets_images/pg/nb/64/yesb.png";
                          }}
                        />
                      </div>
                      <span className="text-[12px] sm:text-[13px] font-medium text-slate-800 truncate max-w-[200px] sm:max-w-[240px]">
                        5% Cashback on Yes Bank Credit C...
                      </span>
                    </button>

                    {/* Pill 2: View All (+3 offers) */}
                    <button
                      type="button"
                      onClick={() => setIsOffersModalOpen(true)}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#f4f5f7] hover:bg-[#eaecee] active:scale-[0.98] transition-all cursor-pointer border border-slate-200/60 shrink-0"
                    >
                      <div className="flex items-center">
                        {/* HSBC Logo */}
                        <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white flex items-center justify-center overflow-hidden shrink-0 shadow-xs border border-white z-10">
                          <img
                            src="https://cashfreelogo.cashfree.com/assets_images/pg/nb/64/hsb.png"
                            alt="HSBC"
                            className="w-full h-full object-contain p-0.5"
                          />
                        </div>
                        {/* +3 circle */}
                        <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white text-[10px] sm:text-[11px] font-bold text-slate-700 flex items-center justify-center -ml-2 shrink-0 shadow-xs border border-slate-200 z-20">
                          +3
                        </div>
                      </div>
                      <span className="text-[12px] sm:text-[13px] font-medium text-slate-700 whitespace-nowrap">
                        View all
                      </span>
                    </button>
                  </div>
                </div>

                {/* Search your bank */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search your bank"
                    value={bankSearchQuery}
                    onChange={(e) => setBankSearchQuery(e.target.value)}
                    className="w-full bg-white border border-slate-200 focus:border-slate-800 rounded-2xl pl-4 pr-10 py-3 text-xs sm:text-sm placeholder-slate-400 font-medium outline-none transition-all"
                  />
                  <Search size={16} className="absolute right-3.5 top-3.5 text-slate-400 pointer-events-none" />
                </div>

                {/* Filter Chips: No Cost EMI | Credit Card | Debit Card | Bajaj Finserv */}
                {/* Filter Chips: No Cost EMI | Credit Card | Debit Card | Bajaj Finserv (only if enabled) */}
                {(() => {
                  const availableBanks = (liveEmiBanks && liveEmiBanks.length > 0) ? liveEmiBanks : DEFAULT_EMI_BANKS;
                  const hasCredit = availableBanks.some((b) => b.type === "credit" || b.type === "both");
                  const hasDebit = availableBanks.some((b) => b.type === "debit" || b.type === "both");
                  const hasBajaj = availableBanks.some((b) => b.type === "cardless" || b.id === "bajaj");

                  return (
                    <div className="flex items-center gap-2 flex-wrap text-xs">
                      <button
                        type="button"
                        onClick={() => setSelectedEmiFilter(selectedEmiFilter === "no_cost" ? "all" : "no_cost")}
                        className={`px-3 py-1.5 rounded-full font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                          selectedEmiFilter === "no_cost"
                            ? "bg-slate-900 text-white shadow-xs"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        <span>No Cost EMI</span>
                        {selectedEmiFilter === "no_cost" && (
                          <X size={13} className="text-white/80 hover:text-white" />
                        )}
                      </button>
                      {hasCredit && (
                        <button
                          type="button"
                          onClick={() => setSelectedEmiFilter(selectedEmiFilter === "credit" ? "all" : "credit")}
                          className={`px-3 py-1.5 rounded-full font-semibold transition-all cursor-pointer ${
                            selectedEmiFilter === "credit"
                              ? "bg-slate-900 text-white shadow-xs"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          Credit Card
                        </button>
                      )}
                      {hasDebit && (
                        <button
                          type="button"
                          onClick={() => setSelectedEmiFilter(selectedEmiFilter === "debit" ? "all" : "debit")}
                          className={`px-3 py-1.5 rounded-full font-semibold transition-all cursor-pointer ${
                            selectedEmiFilter === "debit"
                              ? "bg-slate-900 text-white shadow-xs"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          Debit Card
                        </button>
                      )}
                      {hasBajaj && (
                        <button
                          type="button"
                          onClick={() => setSelectedEmiFilter(selectedEmiFilter === "bajaj" ? "all" : "bajaj")}
                          className={`px-3 py-1.5 rounded-full font-semibold transition-all cursor-pointer ${
                            selectedEmiFilter === "bajaj"
                              ? "bg-slate-900 text-white shadow-xs"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          Bajaj Finserv
                        </button>
                      )}
                    </div>
                  );
                })()}

                {/* Section 1: Credit Cards */}
                {selectedEmiFilter !== "debit" && selectedEmiFilter !== "bajaj" && (() => {
                  const availableBanks = (liveEmiBanks && liveEmiBanks.length > 0) ? liveEmiBanks : DEFAULT_EMI_BANKS;
                  const creditBanks = availableBanks.filter((b) => b.type === "credit" || b.type === "both")
                    .filter((b) => {
                      if (selectedEmiFilter === "no_cost") return Boolean(b.isNoCost);
                      return true;
                    })
                    .filter((b) => {
                      if (!bankSearchQuery.trim()) return true;
                      return b.name.toLowerCase().includes(bankSearchQuery.toLowerCase()) || b.code.toLowerCase().includes(bankSearchQuery.toLowerCase());
                    });
                  if (creditBanks.length === 0) return null;
                  return (
                    <div className="space-y-2 pt-1">
                      <h3 className="font-bold text-xs sm:text-sm text-slate-900 font-montserrat">
                        Credit Cards
                      </h3>
                      <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-2xs">
                        {creditBanks.map((bank) => {
                          const startingEmi = (bank.plans && bank.plans.length > 0)
                            ? (bank.plans.find((p) => p.months === 6)?.monthlyAmount || bank.plans[0]?.monthlyAmount || bank.startingEmi)
                            : calculateStartingEmi(bank.id, bank.code, bank.name, totalPrice);
                          return (
                            <div
                              key={bank.id}
                              onClick={() => {
                                setSelectedEmiBankObj(bank);
                                setSelectedEmiBank(bank.name);
                                const plans = (bank.plans && bank.plans.length > 0)
                                  ? bank.plans
                                  : calculateBankEmiPlans(bank.id, bank.code, bank.name, totalPrice);
                                const popular = plans.find((p) => (p as any).isMostPopular) || plans[0];
                                setSelectedTenure(popular ? popular.months : 6);
                                setSelectedEmiPlan(popular || null);
                                setCheckoutStep("emi_plan_select");
                              }}
                              className="p-3.5 flex items-center justify-between hover:bg-slate-50/80 cursor-pointer select-none transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-white border border-slate-100 p-1 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
                                  <img
                                    src={bank.logo}
                                    alt={bank.name}
                                    className="w-full h-full object-contain"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = "https://cashfreelogo.cashfree.com/assets_images/pg/nb/64/axis.png";
                                    }}
                                  />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-bold text-xs sm:text-sm text-slate-900 font-montserrat">
                                      {bank.name}
                                    </span>
                                    {bank.hasOffer && bank.offerText ? (
                                      <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10.5px] font-bold px-2 py-0.5 rounded leading-tight flex items-center gap-1">
                                        <span>🏷️</span>
                                        <span>{bank.offerText}</span>
                                      </span>
                                    ) : bank.isNoCost ? (
                                      <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded leading-tight">
                                        No Cost EMI
                                      </span>
                                    ) : null}
                                  </div>
                                  <div className="text-[11.5px] text-slate-500 font-open-sans mt-0.5">
                                    {bank.cashbackText ? `${bank.cashbackText} • ` : ""}EMI starts from ₹{startingEmi.toLocaleString("en-IN")}/m • {bank.isNoCost ? "0% Interest Subsidized" : "Standard Bank Rates"}
                                  </div>
                                </div>
                              </div>
                              <ChevronRight size={18} className="text-slate-400 shrink-0" />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}

                {/* Section 2: Debit Cards */}
                {selectedEmiFilter !== "credit" && selectedEmiFilter !== "bajaj" && (() => {
                  const availableBanks = (liveEmiBanks && liveEmiBanks.length > 0) ? liveEmiBanks : DEFAULT_EMI_BANKS;
                  const debitBanks = availableBanks.filter((b) => b.type === "debit" || b.type === "both")
                    .filter((b) => {
                      if (selectedEmiFilter === "no_cost") return Boolean(b.isNoCost);
                      return true;
                    })
                    .filter((b) => {
                      if (!bankSearchQuery.trim()) return true;
                      return b.name.toLowerCase().includes(bankSearchQuery.toLowerCase()) || b.code.toLowerCase().includes(bankSearchQuery.toLowerCase());
                    });
                  if (debitBanks.length === 0) return null;
                  return (
                    <div className="space-y-2 pt-2">
                      <h3 className="font-bold text-xs sm:text-sm text-slate-900 font-montserrat">
                        Debit Cards
                      </h3>
                      <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-2xs">
                        {debitBanks.map((bank) => {
                          const startingEmi = (bank.plans && bank.plans.length > 0)
                            ? (bank.plans.find((p) => p.months === 6)?.monthlyAmount || bank.plans[0]?.monthlyAmount || bank.startingEmi)
                            : calculateStartingEmi(bank.id, bank.code, bank.name, totalPrice);
                          return (
                            <div
                              key={bank.id}
                              onClick={() => {
                                setSelectedEmiBankObj(bank);
                                setSelectedEmiBank(bank.name);
                                const plans = (bank.plans && bank.plans.length > 0)
                                  ? bank.plans
                                  : calculateBankEmiPlans(bank.id, bank.code, bank.name, totalPrice);
                                const popular = plans.find((p) => (p as any).isMostPopular) || plans[0];
                                setSelectedTenure(popular ? popular.months : 6);
                                setSelectedEmiPlan(popular || null);
                                setCheckoutStep("emi_plan_select");
                              }}
                              className="p-3.5 flex items-center justify-between hover:bg-slate-50/80 cursor-pointer select-none transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-white border border-slate-100 p-1 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
                                  <img
                                    src={bank.logo}
                                    alt={bank.name}
                                    className="w-full h-full object-contain"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = "https://cashfreelogo.cashfree.com/assets_images/pg/nb/64/hdfc.png";
                                    }}
                                  />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-bold text-xs sm:text-sm text-slate-900 font-montserrat">
                                      {bank.name}
                                    </span>
                                    {bank.hasOffer && bank.offerText ? (
                                      <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10.5px] font-bold px-2 py-0.5 rounded leading-tight flex items-center gap-1">
                                        <span>🏷️</span>
                                        <span>{bank.offerText}</span>
                                      </span>
                                    ) : bank.isNoCost ? (
                                      <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded leading-tight">
                                        No Cost EMI
                                      </span>
                                    ) : null}
                                  </div>
                                  <div className="text-[11.5px] text-slate-500 font-open-sans mt-0.5">
                                    EMI starts from ₹{startingEmi.toLocaleString("en-IN")}/m • {bank.isNoCost ? "0% Interest Subsidized" : "Standard Bank Rates"}
                                  </div>
                                </div>
                              </div>
                              <ChevronRight size={18} className="text-slate-400 shrink-0" />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}

                {/* Section 3: Bajaj Finserv (Matching media_1790418307016.png) */}
                {selectedEmiFilter !== "credit" && selectedEmiFilter !== "debit" && (() => {
                  const availableBanks = (liveEmiBanks && liveEmiBanks.length > 0) ? liveEmiBanks : DEFAULT_EMI_BANKS;
                  const bajajBanks = availableBanks.filter((b) => b.type === "cardless" || b.id === "bajaj")
                    .filter((b) => {
                      if (selectedEmiFilter === "no_cost") return Boolean(b.isNoCost);
                      return true;
                    })
                    .filter((b) => {
                      if (!bankSearchQuery.trim()) return true;
                      return b.name.toLowerCase().includes(bankSearchQuery.toLowerCase()) || b.code.toLowerCase().includes(bankSearchQuery.toLowerCase());
                    });
                  if (bajajBanks.length === 0) return null;
                  return (
                    <div className="space-y-2 pt-2">
                      <h3 className="font-bold text-xs sm:text-sm text-slate-900 font-montserrat">
                        Bajaj Finserv
                      </h3>
                      <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-2xs">
                        {bajajBanks.map((bank) => {
                          const startingEmi = (bank.plans && bank.plans.length > 0)
                            ? (bank.plans.find((p) => p.months === 6)?.monthlyAmount || bank.plans[0]?.monthlyAmount || bank.startingEmi)
                            : calculateStartingEmi(bank.id, bank.code, bank.name, totalPrice);
                          return (
                            <div
                              key={bank.id}
                              onClick={() => {
                                setSelectedEmiBankObj(bank);
                                setSelectedEmiBank(bank.name);
                                const plans = (bank.plans && bank.plans.length > 0)
                                  ? bank.plans
                                  : calculateBankEmiPlans(bank.id, bank.code, bank.name, totalPrice);
                                const popular = plans.find((p) => (p as any).isMostPopular) || plans[0];
                                setSelectedTenure(popular ? popular.months : 6);
                                setSelectedEmiPlan(popular || null);
                                setCheckoutStep("emi_plan_select");
                              }}
                              className="p-3.5 flex items-center justify-between hover:bg-slate-50/80 cursor-pointer select-none transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-white border border-slate-100 p-1 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
                                  <img
                                    src={bank.logo}
                                    alt={bank.name}
                                    className="w-full h-full object-contain"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = "https://cdn.razorpay.com/app/bajaj.png";
                                    }}
                                  />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-bold text-xs sm:text-sm text-slate-900 font-montserrat">
                                      {bank.name}
                                    </span>
                                    {bank.hasOffer && bank.offerText ? (
                                      <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10.5px] font-bold px-2 py-0.5 rounded leading-tight flex items-center gap-1">
                                        <span>🏷️</span>
                                        <span>{bank.offerText}</span>
                                      </span>
                                    ) : bank.isNoCost ? (
                                      <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded leading-tight">
                                        No Cost EMI
                                      </span>
                                    ) : null}
                                  </div>
                                  <div className="text-[11.5px] text-slate-500 font-open-sans mt-0.5">
                                    EMI starts from ₹{startingEmi.toLocaleString("en-IN")}/m • {bank.isNoCost ? "0% Interest Subsidized" : "Standard Bank Rates"}
                                  </div>
                                </div>
                              </div>
                              <ChevronRight size={18} className="text-slate-400 shrink-0" />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}

                {/* Empty State when search has no matches */}
                {(() => {
                  const availableBanks = (liveEmiBanks && liveEmiBanks.length > 0) ? liveEmiBanks : DEFAULT_EMI_BANKS;
                  const matches = availableBanks.filter((b) => {
                    if (!bankSearchQuery.trim()) return true;
                    return (
                      b.name.toLowerCase().includes(bankSearchQuery.toLowerCase()) ||
                      b.code.toLowerCase().includes(bankSearchQuery.toLowerCase())
                    );
                  });
                  if (bankSearchQuery.trim() && matches.length === 0) {
                    return (
                      <div className="text-center py-8 px-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        <p className="text-xs font-semibold text-slate-600">No banks found matching "{bankSearchQuery}"</p>
                        <button
                          type="button"
                          onClick={() => setBankSearchQuery("")}
                          className="mt-2 text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                        >
                          Clear search
                        </button>
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>
            </div>
          ) : checkoutStep === "emi_plan_select" && selectedEmiBankObj ? (
            /* ========================================================= */
            /* SCREEN C: EMI PLAN SELECTION (Exact Match to media_1790416212882.png) */
            /* ========================================================= */
            <div className="flex flex-col h-full flex-1 overflow-hidden bg-white">
              {/* Header: ← [Bank Logo] [Bank Name] */}
              <div className="shrink-0 px-4 sm:px-8 py-3.5 sm:py-4 border-b border-slate-100 flex items-center justify-between bg-white z-20">
                <button
                  type="button"
                  onClick={() => setCheckoutStep("choose_emi")}
                  className="flex items-center gap-2.5 text-slate-900 hover:text-slate-950 font-bold text-sm sm:text-base font-montserrat cursor-pointer hover:bg-slate-100 px-2 py-1 rounded-lg transition-colors"
                  aria-label="Back to EMI options"
                >
                  <ArrowLeft size={18} className="text-slate-800" />
                  <div className="w-6 h-6 rounded-md bg-white border border-slate-200/80 p-0.5 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
                    <img
                      src={selectedEmiBankObj.logo}
                      alt={selectedEmiBankObj.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span className="font-extrabold text-[#002d62]">{selectedEmiBankObj.name}</span>
                </button>

                <button
                  type="button"
                  onClick={handleClose}
                  className="w-8 h-8 bg-slate-100/80 hover:bg-slate-200 text-slate-500 hover:text-slate-900 rounded-full flex items-center justify-center transition-colors focus:outline-none cursor-pointer shadow-2xs shrink-0"
                  aria-label="Close modal"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-4 space-y-4 no-scrollbar">




                {/* Plans Table */}
                {(() => {
                  const plans = (selectedEmiBankObj?.plans && selectedEmiBankObj.plans.length > 0)
                    ? selectedEmiBankObj.plans
                    : calculateBankEmiPlans(
                        selectedEmiBankObj.id,
                        selectedEmiBankObj.code,
                        selectedEmiBankObj.name,
                        totalPrice
                      );

                  return (
                    <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-2xs">
                      {/* Table Header */}
                      <div className="bg-[#eef2f6] px-3.5 sm:px-4 py-2.5 grid grid-cols-[28px_1fr_1fr_1fr_1fr] items-center text-xs font-semibold text-slate-500 font-montserrat">
                        <div />
                        <div className="text-left font-semibold">EMI</div>
                        <div className="text-left font-semibold">Duration</div>
                        <div className="text-left font-semibold">Interest</div>
                        <div className="text-right font-semibold">Total Cost</div>
                      </div>

                      {/* Plan Rows */}
                      <div className="divide-y divide-slate-100">
                        {plans.map((plan) => {
                          const isSelected = selectedTenure === plan.months;

                          return (
                            <div key={plan.months}>
                              {/* Most Popular full-width banner */}
                              {plan.isMostPopular && (
                                <div className="bg-[#e6fbf0] text-[#059669] text-xs font-bold py-1.5 text-center font-montserrat tracking-wide">
                                  Most Popular
                                </div>
                              )}

                              <div
                                onClick={() => {
                                  setSelectedTenure(plan.months);
                                  setSelectedEmiPlan(plan);
                                  if (!cardHolderName && formData.fullName) {
                                    setCardHolderName(formData.fullName);
                                  }
                                  setCheckoutStep("emi_add_card");
                                }}
                                className={`px-3.5 sm:px-4 py-3 grid grid-cols-[28px_1fr_1fr_1fr_1fr] items-center cursor-pointer transition-colors select-none ${
                                  isSelected ? "bg-slate-50/80" : "hover:bg-slate-50/50"
                                }`}
                              >
                                {/* Radio Indicator */}
                                <div className="flex items-center">
                                  <div
                                    className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                                      isSelected
                                        ? "border-slate-800 bg-white"
                                        : "border-slate-300 bg-white"
                                    }`}
                                  >
                                    {isSelected && (
                                      <div className="w-2 h-2 rounded-full bg-slate-800" />
                                    )}
                                  </div>
                                </div>

                                {/* EMI */}
                                <div className="text-xs sm:text-sm font-semibold text-slate-900 font-montserrat">
                                  ₹{plan.monthlyAmount.toLocaleString("en-IN")}
                                </div>

                                {/* Duration */}
                                <div className="text-xs sm:text-sm font-medium text-slate-800 font-montserrat">
                                  {String(plan.months).padStart(2, "0")} months
                                </div>

                                {/* Interest */}
                                <div>
                                  {plan.isNoCost ? (
                                    <div className="flex flex-col">
                                      <span className="text-[#059669] bg-[#e6fbf0] px-2 py-0.5 rounded text-[11px] font-bold inline-block font-montserrat w-fit">
                                        0% Interest
                                      </span>
                                      <span className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                                        ₹0 (Free)
                                      </span>
                                    </div>
                                  ) : (
                                    <span className="text-xs sm:text-sm font-medium text-slate-800 font-montserrat">
                                      {plan.interestRate}% pa
                                    </span>
                                  )}
                                </div>

                                {/* Total Cost */}
                                <div className="text-xs sm:text-sm font-semibold text-slate-900 font-montserrat text-right">
                                  ₹{plan.totalPayable.toLocaleString("en-IN")}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          ) : checkoutStep === "emi_add_card" && selectedEmiBankObj ? (
            /* ========================================================= */
            /* SCREEN D: EMI ADD CARD (Exact Match to media_1790416234898.png & media_1790416313187.png) */
            /* ========================================================= */
            <div className="flex flex-col h-full flex-1 overflow-hidden bg-white">
              {/* Header: ← [Bank Logo] Add Card */}
              <div className="shrink-0 px-4 sm:px-8 py-3.5 sm:py-4 border-b border-slate-100 flex items-center justify-between bg-white z-20">
                <button
                  type="button"
                  onClick={() => setCheckoutStep("emi_plan_select")}
                  className="flex items-center gap-2.5 text-slate-900 hover:text-slate-950 font-bold text-sm sm:text-base font-montserrat cursor-pointer hover:bg-slate-100 px-2 py-1 rounded-lg transition-colors"
                  aria-label="Back to EMI plans"
                >
                  <ArrowLeft size={18} className="text-slate-800" />
                  <div className="w-6 h-6 rounded-md bg-white border border-slate-200/80 p-0.5 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
                    <img
                      src={selectedEmiBankObj.logo}
                      alt={selectedEmiBankObj.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span className="font-extrabold text-[#002d62]">Add Card</span>
                </button>

                <button
                  type="button"
                  onClick={handleClose}
                  className="w-8 h-8 bg-slate-100/80 hover:bg-slate-200 text-slate-500 hover:text-slate-900 rounded-full flex items-center justify-center transition-colors focus:outline-none cursor-pointer shadow-2xs shrink-0"
                  aria-label="Close modal"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-4 space-y-4 no-scrollbar">
                {/* Promec India PayLater - No Cost EMI Applied Banner OR Standard EMI Banner */}
                {selectedEmiPlan?.isNoCost ? (
                  <div className="p-3.5 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200/90 rounded-2xl flex items-center justify-between gap-3 shadow-2xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-2xs">
                        %
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs sm:text-[13px] font-extrabold text-emerald-950 font-montserrat tracking-tight">
                            Promec India PayLater
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-600 text-white uppercase tracking-wider shadow-2xs">
                            No Cost EMI Applied
                          </span>
                        </div>
                        <p className="text-[11px] text-emerald-800 font-open-sans mt-0.5">
                          {liveRazorpayOffers.length > 0
                            ? `Live on Razorpay (${liveRazorpayOffers.length} Active Offers) • Zero Interest Subsidized by Promec India`
                            : "Zero interest charges. 100% of interest cost is subsidized by Promec India at checkout."}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-3.5 bg-slate-50 border border-slate-200/90 rounded-2xl flex items-center justify-between gap-3 shadow-2xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-slate-700 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                        <CreditCard size={16} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs sm:text-[13px] font-extrabold text-slate-900 font-montserrat tracking-tight">
                            {selectedEmiBankObj?.name} Standard EMI
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700 uppercase tracking-wider shadow-2xs">
                            {selectedEmiPlan?.interestRate ? `${selectedEmiPlan.interestRate}% pa` : "Standard Bank Rates"}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 font-open-sans mt-0.5">
                          Commercial bank interest of {selectedEmiPlan?.interestRate || 15}% per annum will be charged by your bank.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Debit Card Pre-Approval Advisory */}
                {selectedEmiBankObj.type === "debit" && !cardErrorMessage && !debitEmiDeclinedMsg && (
                  <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-amber-900 text-xs flex items-start gap-2.5">
                    <span className="text-amber-600 text-sm font-bold shrink-0 mt-0.5">ℹ️</span>
                    <div className="leading-relaxed">
                      <span className="font-bold">Debit Card Pre-Approval:</span> HDFC requires your debit card to be pre-approved for EMI (SMS <span className="font-mono font-bold bg-amber-100 px-1 py-0.5 rounded text-amber-950">MYHDFC to 56767</span>). If not pre-approved, you can use a Credit Card or pay in full with this Card.
                    </div>
                  </div>
                )}

                {/* Dedicated Debit EMI Pre-Approval Failure Alert & Fallback */}
                {debitEmiDeclinedMsg && (
                  <div className="p-4 bg-amber-50/90 border border-amber-300 rounded-2xl text-xs text-amber-950 flex flex-col gap-3 animate-in fade-in shadow-sm">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5">
                        <span className="text-amber-600 text-base shrink-0 mt-0.5">⚠️</span>
                        <div className="space-y-1">
                          <p className="font-bold text-amber-900 text-[13px]">Bank Pre-Approval Required</p>
                          <p className="leading-relaxed text-slate-700">{debitEmiDeclinedMsg}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setDebitEmiDeclinedMsg(null)}
                        className="text-amber-500 hover:text-amber-800 font-bold p-1 cursor-pointer shrink-0"
                      >
                        ✕
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (failedCardPayload) {
                          setCardNumber(failedCardPayload["card[number]"] || cardNumber);
                          const m = failedCardPayload["card[expiry_month]"] || "";
                          const y = failedCardPayload["card[expiry_year]"] || "";
                          if (m && y) setCardExpiry(`${m}/${y}`);
                          setCardCvv(failedCardPayload["card[cvv]"] || cardCvv);
                          setCardHolderName(failedCardPayload["card[name]"] || cardHolderName);
                        }
                        setPaymentMethod("FULL_ONLINE");
                        setOnlinePaymentMode("FULL");
                        setSelectedCustomPayment("card");
                        setCheckoutStep("card_payment");
                        setDebitEmiDeclinedMsg(null);
                        setCardErrorMessage(null);
                      }}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold rounded-xl text-xs sm:text-sm transition cursor-pointer shadow-md"
                    >
                      ⚡ Pay ₹{totalPrice.toLocaleString("en-IN")} in Full with this Card →
                    </button>
                  </div>
                )}

                {/* Optional Card Error Alert */}
                {cardErrorMessage && (
                  <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex flex-col gap-2.5 animate-in fade-in shadow-2xs">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2">
                        <span className="text-red-500 text-sm shrink-0 mt-0.5">⚠️</span>
                        <span className="font-semibold leading-relaxed">{cardErrorMessage}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setCardErrorMessage(null)}
                        className="text-red-400 hover:text-red-700 font-bold ml-1 cursor-pointer shrink-0"
                      >
                        ✕
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setPaymentMethod("FULL_ONLINE");
                        setOnlinePaymentMode("FULL");
                        setSelectedCustomPayment("card");
                        setCheckoutStep("card_payment");
                        setCardErrorMessage(null);
                      }}
                      className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold rounded-lg text-xs transition cursor-pointer shadow-2xs"
                    >
                      ⚡ Pay ₹{totalPrice.toLocaleString("en-IN")} in Full with this Card →
                    </button>
                  </div>
                )}

                {/* Collapsible EMI Plan Box */}
                {(() => {
                  const availablePlans = (selectedEmiBankObj?.plans && selectedEmiBankObj.plans.length > 0)
                    ? selectedEmiBankObj.plans
                    : calculateBankEmiPlans(
                        selectedEmiBankObj.id,
                        selectedEmiBankObj.code,
                        selectedEmiBankObj.name,
                        totalPrice
                      );
                  const currentPlan =
                    selectedEmiPlan ||
                    availablePlans.find((p) => p.months === selectedTenure) ||
                    availablePlans[0];

                  return (
                    <div className="border border-slate-200 rounded-2xl p-4 bg-white shadow-2xs space-y-2">
                      <div
                        onClick={() => setIsEmiPlanCollapsed(!isEmiPlanCollapsed)}
                        className="flex items-center justify-between cursor-pointer select-none"
                      >
                        <div className="flex items-center gap-2">
                          <EmiCardPercentIcon className="w-5 h-5 text-slate-800 shrink-0" />
                          <span className="font-extrabold text-sm sm:text-base text-slate-900 font-montserrat">
                            EMI Plan
                          </span>
                        </div>
                        <ChevronDown
                          size={18}
                          className={`text-slate-600 transition-transform duration-200 ${
                            isEmiPlanCollapsed ? "-rotate-90" : "rotate-0"
                          }`}
                        />
                      </div>

                      {!isEmiPlanCollapsed && currentPlan && (
                        <div className="grid grid-cols-4 gap-2 pt-3 border-t border-slate-100 text-left font-montserrat">
                          <div>
                            <div className="text-[11px] text-slate-400 font-semibold">EMI</div>
                            <div className="text-xs sm:text-sm font-bold text-slate-900 mt-1">
                              ₹{currentPlan.monthlyAmount.toLocaleString("en-IN")}
                            </div>
                          </div>
                          <div>
                            <div className="text-[11px] text-slate-400 font-semibold">Duration</div>
                            <div className="text-xs sm:text-sm font-bold text-slate-900 mt-1">
                              {String(currentPlan.months).padStart(2, "0")} months
                            </div>
                          </div>
                          <div>
                            <div className="text-[11px] text-slate-400 font-semibold">Interest</div>
                            <div className="text-xs sm:text-sm font-bold text-slate-900 mt-1">
                              {currentPlan.isNoCost ? "No Cost" : `${currentPlan.interestRate}% pa`}
                            </div>
                          </div>
                          <div>
                            <div className="text-[11px] text-slate-400 font-semibold">Total cost</div>
                            <div className="text-xs sm:text-sm font-bold text-slate-900 mt-1">
                              ₹{currentPlan.totalPayable.toLocaleString("en-IN")}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Card Fields Form with Live Bank Eligibility Validation */}
                {(() => {
                  const rawDigits = cardNumber.replace(/\D/g, "");
                  const isEligible =
                    rawDigits.length < 6 ||
                    (backendCardEligibility.checkedCardBin === rawDigits.slice(0, 8) &&
                    backendCardEligibility.checkedBankCode === selectedEmiBankObj.code
                      ? backendCardEligibility.isEligible
                      : isCardEligibleForEmiBank(
                          cardNumber,
                          selectedEmiBankObj.code,
                          selectedEmiBankObj.name
                        ));

                  const effectiveNetwork =
                    (backendCardEligibility.checkedCardBin === rawDigits.slice(0, 8) &&
                    backendCardEligibility.network) ||
                    detectedNetwork;

                  const [expMonth, expYear] = cardExpiry.split("/");
                  const isExpiryValid =
                    cardExpiry.length === 5 &&
                    Boolean(expMonth && expYear) &&
                    parseInt(expMonth, 10) >= 1 &&
                    parseInt(expMonth, 10) <= 12;

                  const isFormValid =
                    isEligible &&
                    rawDigits.length >= 15 &&
                    isExpiryValid &&
                    cardCvv.length >= 3 &&
                    cardHolderName.trim().length > 0;

                  return (
                    <div className="space-y-4 pt-1">
                      {/* Field 1: Card Number */}
                      <fieldset
                        className={`rounded-2xl px-3.5 pb-2.5 pt-0 transition-colors bg-white ${
                          !isEligible
                            ? "border-2 border-red-500"
                            : "border border-slate-200 focus-within:border-slate-800"
                        }`}
                      >
                        <legend
                          className={`text-xs font-normal px-1.5 ml-2 select-none ${
                            !isEligible ? "text-red-500 font-semibold" : "text-slate-400"
                          }`}
                        >
                          {!isEligible
                            ? (backendCardEligibility.error || "This card is not eligible for EMI")
                            : "Card Number"}
                        </legend>
                        <div className="flex items-center justify-between gap-2 px-1">
                          <input
                            type="text"
                            inputMode="numeric"
                            value={cardNumber}
                            onChange={handleCardNumberChange}
                            placeholder="XXXX XXXX XXXX XXXX"
                            maxLength={19}
                            className={`w-full font-mono tracking-widest text-sm outline-none bg-transparent ${
                              !isEligible ? "text-slate-900 font-bold" : "text-slate-900 placeholder:text-slate-300"
                            }`}
                          />

                          {/* Dynamic Card Badges */}
                          <div className="flex items-center shrink-0 pointer-events-none select-none pr-0.5">
                            {effectiveNetwork === "visa" ? (
                              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#eff4fe] border border-blue-200/90 shadow-2xs">
                                <span className="text-[13px] font-black italic tracking-tighter text-[#1434cb]">
                                  VISA
                                </span>
                              </div>
                            ) : effectiveNetwork === "mastercard" ? (
                              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#fff7ed] border border-orange-200/90 shadow-2xs">
                                <div className="flex items-center -space-x-1.5">
                                  <span className="w-3.5 h-3.5 rounded-full bg-[#eb001b] inline-block shadow-2xs" />
                                  <span className="w-3.5 h-3.5 rounded-full bg-[#f79e1b] inline-block opacity-95 shadow-2xs" />
                                </div>
                                <span className="text-[11px] font-bold text-slate-900 font-montserrat">
                                  Mastercard
                                </span>
                              </div>
                            ) : effectiveNetwork === "rupay" ? (
                              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#f0fdf4] border border-emerald-200/90 shadow-2xs">
                                <span className="text-[11.5px] font-black italic text-[#0c4a9e] tracking-tight">
                                  RuPay
                                </span>
                                <span className="text-[11.5px] font-black text-[#00a859]">›</span>
                              </div>
                            ) : effectiveNetwork === "amex" ? (
                              <div className="flex items-center px-2 py-0.5 rounded-md bg-[#0077a6] text-white shadow-2xs">
                                <span className="text-[10px] font-black tracking-wider">AMEX</span>
                              </div>
                            ) : (
                              /* Idle / 3 Overlapping Brand Badges */
                              <div className="flex items-center -space-x-1.5 transition-all">
                                <div className="w-7 h-7 rounded-full bg-[#f1f8fe] border border-slate-200/80 shadow-2xs flex items-center justify-center overflow-hidden">
                                  <div className="flex items-center -space-x-1">
                                    <span className="w-3.5 h-3.5 rounded-full bg-[#eb001b] inline-block shadow-2xs" />
                                    <span className="w-3.5 h-3.5 rounded-full bg-[#00a2e8] inline-block opacity-90 shadow-2xs" />
                                  </div>
                                </div>
                                <div className="w-7 h-7 rounded-full bg-[#eff4fe] border border-slate-200/80 shadow-2xs flex items-center justify-center overflow-hidden">
                                  <span className="text-[13px] font-black italic tracking-tighter text-[#1434cb] pl-0.5">
                                    V
                                  </span>
                                </div>
                                <div className="w-8 h-7 rounded-full bg-[#f0fdf4] border border-slate-200/80 shadow-2xs flex items-center justify-center px-1 overflow-hidden">
                                  <span className="text-[9px] font-black italic text-[#0c4a9e] tracking-tight flex items-center">
                                    RuPay<span className="text-[8px] text-[#00a859] font-bold ml-0.5">›</span>
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </fieldset>

                      {/* Field 2: Full Name */}
                      <fieldset className="border border-slate-200 rounded-2xl px-3.5 pb-2.5 pt-0 focus-within:border-slate-800 transition-colors bg-white">
                        <legend className="text-xs text-slate-400 font-normal px-1.5 ml-2 select-none">
                          Full Name
                        </legend>
                        <div className="flex items-center justify-between gap-2 px-1">
                          <input
                            type="text"
                            value={cardHolderName}
                            onChange={(e) => {
                              const val = e.target.value;
                              setCardHolderName(val);
                              setFormData((prev) => ({ ...prev, fullName: val }));
                              if (cardErrorMessage) setCardErrorMessage(null);
                            }}
                            placeholder="Name on card"
                            className="w-full text-slate-900 font-semibold text-sm outline-none bg-transparent placeholder:text-slate-400 font-montserrat"
                          />
                          {cardHolderName ? (
                            <button
                              type="button"
                              onClick={() => {
                                setCardHolderName("");
                                setFormData((prev) => ({ ...prev, fullName: "" }));
                              }}
                              className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 cursor-pointer transition-colors"
                              title="Clear name to edit"
                              aria-label="Clear name"
                            >
                              <X size={14} />
                            </button>
                          ) : null}
                        </div>
                      </fieldset>

                      {/* Fields 3 & 4: Expiry Date & Enter CVV */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="border border-slate-200 focus-within:border-slate-800 rounded-2xl px-4 py-3 bg-white transition-colors">
                          <input
                            type="text"
                            inputMode="numeric"
                            value={cardExpiry}
                            onChange={handleExpiryChange}
                            placeholder="Expiry Date"
                            maxLength={5}
                            className="w-full text-slate-900 font-medium text-sm outline-none bg-transparent placeholder:text-slate-300 font-mono"
                          />
                        </div>

                        <div className="border border-slate-200 focus-within:border-slate-800 rounded-2xl px-4 py-3 bg-white flex items-center justify-between transition-colors">
                          <input
                            type={showCvv ? "text" : "password"}
                            inputMode="numeric"
                            value={cardCvv}
                            onChange={handleCvvChange}
                            placeholder="Enter CVV"
                            maxLength={4}
                            className="w-full text-slate-900 font-medium text-sm outline-none bg-transparent placeholder:text-slate-300 font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => setShowCvv(!showCvv)}
                            className="text-slate-900 hover:text-slate-600 p-0.5 cursor-pointer ml-1 shrink-0"
                            aria-label="Toggle CVV visibility"
                          >
                            <Eye className="w-5 h-5 text-slate-900" strokeWidth={2.2} />
                          </button>
                        </div>
                      </div>

                      {/* Subtext */}
                      <p className="text-xs text-slate-400 font-open-sans leading-relaxed pt-2">
                        Please get in touch with your bank for interest rate, processing fees, refund or pre-closure related queries
                      </p>

                      {/* Sticky Bottom Action Button */}
                      <div
                        style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom, 0px))" }}
                        className="pt-4"
                      >
                        <button
                          type="button"
                          disabled={!isFormValid || isProcessingCard || !isEligible}
                          onClick={() => {
                            setPaymentMethod("FULL_ONLINE");
                            setOnlinePaymentMode("EMI");
                            handleProceedCardPayment();
                          }}
                          className={`w-full font-bold font-montserrat text-sm sm:text-base py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm ${
                            !isFormValid || isProcessingCard || !isEligible
                              ? "bg-[#94a3b8] text-white cursor-not-allowed"
                              : "bg-[#1e293b] hover:bg-black active:bg-slate-900 text-white cursor-pointer active:scale-[0.99]"
                          }`}
                        >
                          {isProcessingCard ? (
                            <>
                              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              <span>Processing EMI Order...</span>
                            </>
                          ) : (
                            <span>Pay ₹{totalPrice.toLocaleString("en-IN")}</span>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          ) : checkoutStep === "card_payment" ? (
            /* ========================================================= */
            /* SCREEN D: CREDIT/DEBIT CARD PAYMENT (Exact Match to User) */
            /* ========================================================= */
            <div className="flex flex-col h-full flex-1 overflow-hidden bg-white">
              {/* Header row: Back button on left, 100% Secured Payment & Close on right */}
              <div className="shrink-0 px-4 sm:px-8 py-3.5 sm:py-4 border-b border-slate-100 flex items-center justify-between bg-white z-20">
                <button
                  type="button"
                  onClick={() => {
                    setCheckoutStep("details");
                    setCardErrorMessage(null);
                  }}
                  className="flex items-center gap-2 text-slate-800 hover:text-slate-950 font-bold text-sm sm:text-base font-montserrat cursor-pointer hover:bg-slate-100 px-2 py-1 rounded-lg transition-colors"
                  aria-label="Back to checkout"
                >
                  <ArrowLeft size={18} />
                  <span className="font-black text-sm tracking-wider font-montserrat">PROMEC</span>
                </button>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium font-open-sans">
                    <span>100% Secured Payment</span>
                    <Lock size={13} className="text-slate-400" />
                  </div>

                  <button
                    type="button"
                    onClick={handleClose}
                    className="w-8 h-8 bg-slate-100/80 hover:bg-slate-200 text-slate-500 hover:text-slate-900 rounded-full flex items-center justify-center transition-colors focus:outline-none cursor-pointer shadow-2xs shrink-0"
                    aria-label="Close modal"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Scrollable Card Form View (Exact Match to media_1790404390005.png) */}
              <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-5 space-y-4 no-scrollbar">
                {/* 1. Dynamic Live Bank Offer Banner */}
                {(() => {
                  const detectedOffer = detectCardBankAndOffer(cardNumber, liveEmiBanks);
                  const currentOffer = detectedOffer || DEFAULT_BANK_OFFERS[cardOfferCarouselIndex % DEFAULT_BANK_OFFERS.length];

                  return (
                    <div className={`p-3 sm:p-3.5 rounded-2xl flex items-center justify-between gap-3 shadow-2xs transition-all duration-300 ${
                      detectedOffer
                        ? `${currentOffer.accentBg} ${currentOffer.accentBorder} border-2`
                        : "bg-white border border-slate-200/90"
                    }`}>
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={currentOffer.logo}
                          alt={currentOffer.bankName}
                          className="w-5 h-5 object-contain rounded shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://cashfreelogo.cashfree.com/assets_images/pg/nb/64/sbi.png";
                          }}
                        />
                        <span className="text-xs sm:text-[13px] font-semibold text-slate-900 font-montserrat truncate">
                          {currentOffer.offerText}
                        </span>
                      </div>

                      {detectedOffer && (
                        <span className="shrink-0 px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-emerald-100 text-emerald-800 font-montserrat flex items-center gap-1">
                          <Check size={11} strokeWidth={3} />
                          <span>Applied</span>
                        </span>
                      )}
                    </div>
                  );
                })()}

                {/* Optional Card Error Alert */}
                {cardErrorMessage && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center justify-between">
                    <span>{cardErrorMessage}</span>
                    <button
                      type="button"
                      onClick={() => setCardErrorMessage(null)}
                      className="text-red-500 font-bold ml-2 cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                )}

                {/* 2. Section Title */}
                <div className="flex items-center gap-2 text-slate-900 font-bold text-xs sm:text-sm font-montserrat pt-1">
                  <svg className="w-5 h-5 text-slate-700 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="14" x="2" y="5" rx="2" />
                    <line x1="2" x2="22" y1="10" y2="10" />
                  </svg>
                  <span>Credit/Debit Card</span>
                </div>

                {/* 3. Form Fields (Exact fieldset border lines to Screenshot) */}
                <div className="space-y-4 pt-0.5">
                  {/* Field 1: Full Name */}
                  <fieldset className="border border-slate-200 rounded-2xl px-3.5 pb-2.5 pt-0 focus-within:border-slate-800 transition-colors bg-white">
                    <legend className="text-xs text-slate-400 font-normal px-1.5 ml-2 select-none">
                      Full Name
                    </legend>
                    <div className="flex items-center justify-between gap-2 px-1">
                      <input
                        type="text"
                        value={cardHolderName}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCardHolderName(val);
                          setFormData((prev) => ({ ...prev, fullName: val }));
                          if (cardErrorMessage) setCardErrorMessage(null);
                        }}
                        placeholder="Name on card"
                        className="w-full text-slate-900 font-semibold text-sm outline-none bg-transparent placeholder:text-slate-400 font-montserrat"
                      />
                      {cardHolderName ? (
                        <button
                          type="button"
                          onClick={() => {
                            setCardHolderName("");
                            setFormData((prev) => ({ ...prev, fullName: "" }));
                          }}
                          className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 cursor-pointer transition-colors"
                          title="Clear name to edit"
                          aria-label="Clear name"
                        >
                          <X size={14} />
                        </button>
                      ) : null}
                    </div>
                  </fieldset>

                  {/* Field 2: Card Number */}
                  <fieldset className="border border-slate-200 rounded-2xl px-3.5 pb-2.5 pt-0 focus-within:border-slate-800 transition-colors bg-white">
                    <legend className="text-xs text-slate-400 font-normal px-1.5 ml-2 select-none">
                      Card Number
                    </legend>
                    <div className="flex items-center justify-between gap-2 px-1">
                      <input
                        type="text"
                        inputMode="numeric"
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                        placeholder="XXXX XXXX XXXX XXXX"
                        maxLength={19}
                        className="w-full text-slate-900 font-mono tracking-widest text-sm outline-none bg-transparent placeholder:text-slate-300"
                      />
                      {/* Card Network Logos (Dynamic & Live based on entered card number) */}
                      <div className="flex items-center shrink-0 pointer-events-none select-none pr-0.5">
                        {detectedNetwork === "visa" ? (
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#eff4fe] border border-blue-200/90 shadow-2xs animate-in fade-in zoom-in-95 duration-200">
                            <span className="text-[13px] font-black italic tracking-tighter text-[#1434cb]">
                              VISA
                            </span>
                          </div>
                        ) : detectedNetwork === "mastercard" ? (
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#fff7ed] border border-orange-200/90 shadow-2xs animate-in fade-in zoom-in-95 duration-200">
                            <div className="flex items-center -space-x-1.5">
                              <span className="w-3.5 h-3.5 rounded-full bg-[#eb001b] inline-block shadow-2xs" />
                              <span className="w-3.5 h-3.5 rounded-full bg-[#f79e1b] inline-block opacity-95 shadow-2xs" />
                            </div>
                            <span className="text-[11px] font-bold text-slate-900 font-montserrat">
                              Mastercard
                            </span>
                          </div>
                        ) : detectedNetwork === "rupay" ? (
                          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#f0fdf4] border border-emerald-200/90 shadow-2xs animate-in fade-in zoom-in-95 duration-200">
                            <span className="text-[11.5px] font-black italic text-[#0c4a9e] tracking-tight">
                              RuPay
                            </span>
                            <span className="text-[11.5px] font-black text-[#00a859]">›</span>
                          </div>
                        ) : detectedNetwork === "amex" ? (
                          <div className="flex items-center px-2 py-0.5 rounded-md bg-[#0077a6] text-white shadow-2xs animate-in fade-in zoom-in-95 duration-200">
                            <span className="text-[10px] font-black tracking-wider">AMEX</span>
                          </div>
                        ) : detectedNetwork === "maestro" ? (
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sky-50/90 border border-sky-200/90 shadow-2xs animate-in fade-in zoom-in-95 duration-200">
                            <div className="flex items-center -space-x-1.5">
                              <span className="w-3.5 h-3.5 rounded-full bg-[#eb001b] inline-block" />
                              <span className="w-3.5 h-3.5 rounded-full bg-[#00a2e8] inline-block" />
                            </div>
                            <span className="text-[11px] font-bold text-slate-900 font-montserrat">
                              Maestro
                            </span>
                          </div>
                        ) : (
                          /* Idle / Default 3 Brand Badges (Exact match to media_1790414692790.png) */
                          <div className="flex items-center -space-x-1.5 transition-all">
                            {/* Mastercard Circle Badge */}
                            <div className="w-7 h-7 rounded-full bg-[#f1f8fe] border border-slate-200/80 shadow-2xs flex items-center justify-center overflow-hidden">
                              <div className="flex items-center -space-x-1">
                                <span className="w-3.5 h-3.5 rounded-full bg-[#eb001b] inline-block shadow-2xs" />
                                <span className="w-3.5 h-3.5 rounded-full bg-[#00a2e8] inline-block opacity-90 shadow-2xs" />
                              </div>
                            </div>

                            {/* Visa Circle Badge */}
                            <div className="w-7 h-7 rounded-full bg-[#eff4fe] border border-slate-200/80 shadow-2xs flex items-center justify-center overflow-hidden">
                              <span className="text-[13px] font-black italic tracking-tighter text-[#1434cb] pl-0.5">
                                V
                              </span>
                            </div>

                            {/* RuPay Circle Badge */}
                            <div className="w-8 h-7 rounded-full bg-[#f0fdf4] border border-slate-200/80 shadow-2xs flex items-center justify-center px-1 overflow-hidden">
                              <span className="text-[9px] font-black italic text-[#0c4a9e] tracking-tight flex items-center">
                                RuPay<span className="text-[8px] text-[#00a859] font-bold ml-0.5">›</span>
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </fieldset>

                  {/* Field 3 & 4: Expiry Date & Enter CVV (2 Columns) */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* Expiry Date */}
                    <div className="border border-slate-200 focus-within:border-slate-800 rounded-2xl px-4 py-3 bg-white transition-colors">
                      <input
                        type="text"
                        inputMode="numeric"
                        value={cardExpiry}
                        onChange={handleExpiryChange}
                        placeholder="Expiry Date"
                        maxLength={5}
                        className="w-full text-slate-900 font-medium text-sm outline-none bg-transparent placeholder:text-slate-300 font-mono"
                      />
                    </div>

                    {/* Enter CVV */}
                    <div className="border border-slate-200 focus-within:border-slate-800 rounded-2xl px-4 py-3 bg-white flex items-center justify-between transition-colors">
                      <input
                        type={showCvv ? "text" : "password"}
                        inputMode="numeric"
                        value={cardCvv}
                        onChange={handleCvvChange}
                        placeholder="Enter CVV"
                        maxLength={4}
                        className="w-full text-slate-900 font-medium text-sm outline-none bg-transparent placeholder:text-slate-300 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCvv(!showCvv)}
                        className="text-slate-900 hover:text-slate-600 p-0.5 cursor-pointer ml-1 shrink-0"
                        aria-label="Toggle CVV visibility"
                      >
                        <Eye className="w-5 h-5 text-slate-900" strokeWidth={2.2} />
                      </button>
                    </div>
                  </div>


                  {/* Save Card Checkbox */}
                  <label className="flex items-center gap-2.5 cursor-pointer select-none pt-1">
                    <input
                      type="checkbox"
                      checked={saveCardAsPerRbi}
                      onChange={(e) => setSaveCardAsPerRbi(e.target.checked)}
                      className="w-5 h-5 rounded-md border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
                    />
                    <span className="text-xs sm:text-[13px] text-slate-900 font-medium font-open-sans">
                      Save card as per RBI guidelines
                    </span>
                  </label>
                </div>
              </div>

              {/* 4. Sticky Bottom Continue Button (Exact Match to Screenshot) */}
              <div
                style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom, 0px))" }}
                className="shrink-0 bg-white/95 backdrop-blur-md px-4 sm:px-8 py-3.5 shadow-[0_-4px_12px_rgba(0,0,0,0.03)] z-20"
              >
                <button
                  type="button"
                  disabled={!isCardValid || isProcessingCard}
                  onClick={handleProceedCardPayment}
                  className={`w-full font-bold font-montserrat text-sm sm:text-base py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm ${
                    !isCardValid || isProcessingCard
                      ? "bg-[#8e8e93] text-white cursor-not-allowed"
                      : "bg-black hover:bg-slate-900 active:bg-slate-800 text-white cursor-pointer active:scale-[0.99]"
                  }`}
                >
                  {isProcessingCard ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Processing Details...</span>
                    </>
                  ) : (
                    <span>Continue</span>
                  )}
                </button>
              </div>
            </div>
          ) : checkoutStep === "card_otp" ? (
            /* ========================================================= */
            /* SCREEN E: CARD OTP VERIFICATION (Exact Match to Image 2)  */
            /* ========================================================= */
            <div className="flex flex-col h-full flex-1 overflow-hidden bg-white">
              {/* Header */}
              <div className="shrink-0 px-4 sm:px-8 py-3.5 sm:py-4 border-b border-slate-100 flex items-center justify-between bg-white z-20">
                <button
                  type="button"
                  onClick={() => {
                    setCheckoutStep(onlinePaymentMode === "EMI" ? "emi_add_card" : "card_payment");
                    setCardErrorMessage(null);
                  }}
                  className="flex items-center gap-2 text-slate-800 hover:text-slate-950 font-bold text-sm sm:text-base font-montserrat cursor-pointer hover:bg-slate-100 px-2 py-1 rounded-lg transition-colors"
                  aria-label="Back to card payment"
                >
                  <ArrowLeft size={18} />
                  <span className="font-black text-sm tracking-wider font-montserrat">PROMEC</span>
                </button>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium font-open-sans">
                    <span>100% Secured Payment</span>
                    <Lock size={13} className="text-slate-400" />
                  </div>

                  <button
                    type="button"
                    onClick={handleClose}
                    className="w-8 h-8 bg-slate-100/80 hover:bg-slate-200 text-slate-500 hover:text-slate-900 rounded-full flex items-center justify-center transition-colors focus:outline-none cursor-pointer shadow-2xs shrink-0"
                    aria-label="Close modal"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Main Content Area */}
              <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 flex flex-col items-center justify-center no-scrollbar">
                {/* Optional Error Alert */}
                {cardErrorMessage && (
                  <div className="w-full max-w-sm mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center justify-between">
                    <span>{cardErrorMessage}</span>
                    <button
                      type="button"
                      onClick={() => setCardErrorMessage(null)}
                      className="text-red-500 font-bold ml-2 cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                )}

                {/* 1. Credit Card Illustration with Lock inside Light Blue Container (Exact Match to media_1790406822318.png) */}
                <div className="w-full max-w-sm bg-[#eaf4fe] rounded-3xl py-7 px-8 flex items-center justify-center shadow-xs">
                  <svg width="128" height="90" viewBox="0 0 128 90" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-sm">
                    {/* Blue Card Body */}
                    <rect x="8" y="10" width="102" height="64" rx="9" fill="url(#card_blue_grad)" />
                    {/* Magnetic Stripe / Surface reflection */}
                    <path d="M8 25h102v7H8z" fill="white" fillOpacity="0.14" />
                    {/* Card Chip */}
                    <rect x="18" y="40" width="17" height="13" rx="2.5" fill="#f8e71c" stroke="#e0c200" strokeWidth="0.5" />
                    <path d="M18 44.5h17M18 48.5h17M26.5 40v13" stroke="#b39700" strokeWidth="0.8" />
                    {/* Contactless Wifi Icon */}
                    <path d="M88 20a10 10 0 0 1 0 13M92 17a15 15 0 0 1 0 19M96 14a20 20 0 0 1 0 25" stroke="white" strokeWidth="1.7" strokeLinecap="round" opacity="0.85" />
                    {/* Lock Body */}
                    <rect x="74" y="44" width="36" height="30" rx="6" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1.2" />
                    {/* Lock Shackle */}
                    <path d="M82 44V34a10 10 0 0 1 20 0v10" stroke="#0070ba" strokeWidth="3.8" strokeLinecap="round" fill="none" />
                    {/* Lock Keyhole */}
                    <circle cx="92" cy="56.5" r="2.8" fill="#0070ba" />
                    <path d="M92 59v4" stroke="#0070ba" strokeWidth="2" strokeLinecap="round" />
                    <defs>
                      <linearGradient id="card_blue_grad" x1="8" y1="10" x2="110" y2="74" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#3b8ff3" />
                        <stop offset="1" stopColor="#1e64c8" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>

                {/* 2. Heading & Subtitle */}
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 text-center font-montserrat mt-5 tracking-tight">
                  Bank OTP Verification
                </h3>
                <p className="text-xs sm:text-[13.5px] text-slate-600 text-center font-open-sans mt-2 max-w-[360px] leading-relaxed">
                  Enter the OTP sent to{" "}
                  <span className="font-semibold text-slate-900">
                    {cardOtpRecipient || "your bank-registered mobile number"}
                  </span>{" "}
                  for card ending with{" "}
                  <span className="font-semibold text-slate-900">
                    ****{cardLast4 || rawCardDigits.slice(-4) || "card"}
                  </span>
                </p>

                {/* 3. Six OTP Input Boxes */}
                <div className="flex items-center justify-center gap-2 sm:gap-2.5 mt-6 w-full max-w-sm">
                  {cardOtp.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => {
                        cardOtpInputsRef.current[idx] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      onPaste={handleOtpPaste}
                      className="w-10 sm:w-12 h-12 sm:h-14 text-center text-lg sm:text-xl font-bold text-slate-900 bg-white border border-slate-300 rounded-xl focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition-all shadow-2xs"
                    />
                  ))}
                </div>

                {/* 4. Action Links: Skip OTP & Resend OTP */}
                <div className="w-full max-w-sm flex items-center justify-between mt-3 px-1 text-xs sm:text-[13px] font-open-sans">
                  <button
                    type="button"
                    onClick={() => handleConfirmCardOtp(true)}
                    className="text-slate-600 hover:text-slate-950 font-medium cursor-pointer transition-colors"
                  >
                    Skip OTP
                  </button>
                  {cardOtpTimer > 0 ? (
                    <span className="text-slate-500 font-medium">
                      Resend OTP in <span className="font-semibold text-slate-700">{cardOtpTimer}s</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      className="text-[#005a9c] hover:underline font-semibold cursor-pointer"
                    >
                      Resend OTP
                    </button>
                  )}
                </div>
              </div>

              {/* 5. Sticky Bottom Action Bar with Navy Continue Button & Secured by Razorpay */}
              <div
                style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom, 0px))" }}
                className="shrink-0 bg-white/95 backdrop-blur-md px-4 sm:px-8 py-4 shadow-[0_-4px_12px_rgba(0,0,0,0.03)] z-20 flex flex-col items-center"
              >
                <button
                  type="button"
                  disabled={isVerifyingCardOtp}
                  onClick={() => handleConfirmCardOtp(false)}
                  className="w-full max-w-sm bg-[#0c192c] hover:bg-[#07111f] active:bg-black text-white font-bold font-montserrat text-sm sm:text-base py-3.5 rounded-xl shadow-md transition-all active:scale-[0.99] cursor-pointer flex items-center justify-center tracking-wider disabled:opacity-75 disabled:cursor-not-allowed"
                >
                  {isVerifyingCardOtp ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>CONFIRMING PAYMENT...</span>
                    </span>
                  ) : (
                    <span>Continue</span>
                  )}
                </button>

                {/* Secured by Razorpay footer */}
                <div className="mt-3.5 flex items-center justify-center gap-1.5 text-xs text-slate-500 font-open-sans select-none">
                  <span>Secured by</span>
                  <div className="flex items-center gap-1 font-bold italic tracking-tighter text-[#0c2340]">
                    <span className="text-[#005a9c] text-sm not-italic font-black">◢</span>
                    <span className="text-sm font-black font-montserrat tracking-tight text-[#0c2340]">Razorpay</span>
                  </div>
                </div>
              </div>
            </div>
          ) : checkoutStep === "select_netbanking" ? (
            /* ========================================================= */
            /* SCREEN C: SELECT YOUR BANK (Matches User Images 1, 2, 3)  */
            /* ========================================================= */
            <div className="flex flex-col h-full flex-1 overflow-hidden bg-white relative">
              {/* Header with Back Arrow and Bank Title */}
              <div className="shrink-0 px-4 sm:px-8 py-3.5 sm:py-4 border-b border-slate-100 flex items-center justify-between bg-white z-20">
                <button
                  type="button"
                  onClick={() => {
                    setCheckoutStep("details");
                    setSelectedBankForSheet(null);
                  }}
                  className="flex items-center gap-2 text-slate-800 hover:text-slate-950 font-bold text-sm sm:text-base font-montserrat cursor-pointer hover:bg-slate-100 px-2 py-1 rounded-lg transition-colors"
                  aria-label="Back to checkout"
                >
                  <ArrowLeft size={18} />
                  <Landmark size={18} className="text-slate-700" />
                  <span>Select Your Bank</span>
                </button>

                <button
                  type="button"
                  onClick={handleClose}
                  className="w-8 h-8 bg-slate-100/80 hover:bg-slate-200 text-slate-500 hover:text-slate-900 rounded-full flex items-center justify-center transition-colors focus:outline-none cursor-pointer shadow-2xs shrink-0"
                  aria-label="Close modal"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Scrollable Banks List View (Image 1) */}
              <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-5 space-y-4 no-scrollbar">
                {/* Search Bank Input */}
                <div className="relative">
                  <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search Bank"
                    value={netbankingSearchQuery}
                    onChange={(e) => setNetbankingSearchQuery(e.target.value)}
                    className="w-full bg-white border border-slate-200 focus:border-slate-400 rounded-xl pl-10 pr-9 py-2.5 sm:py-3 text-xs sm:text-sm placeholder-slate-400 font-medium outline-none transition-all shadow-2xs"
                  />
                  {netbankingSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setNetbankingSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Filter Chips: Popular Banks | Other Banks */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedNetbankingTab("popular");
                      setNetbankingSearchQuery("");
                    }}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      selectedNetbankingTab === "popular" && !netbankingSearchQuery
                        ? "bg-slate-200/90 text-slate-900 font-bold shadow-2xs"
                        : "bg-slate-100/80 text-slate-600 hover:bg-slate-200/60"
                    }`}
                  >
                    Popular Banks
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedNetbankingTab("other");
                      setNetbankingSearchQuery("");
                    }}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      selectedNetbankingTab === "other" && !netbankingSearchQuery
                        ? "bg-slate-200/90 text-slate-900 font-bold shadow-2xs"
                        : "bg-slate-100/80 text-slate-600 hover:bg-slate-200/60"
                    }`}
                  >
                    Other Banks
                  </button>
                </div>

                {/* Section Title */}
                <div className="text-xs sm:text-sm font-bold text-slate-800 pt-1">
                  {netbankingSearchQuery.trim()
                    ? `Search Results (${filteredNetbankingBanks.length})`
                    : selectedNetbankingTab === "popular"
                    ? "Popular Banks"
                    : "Other Banks"}
                </div>

                {/* Banks List */}
                <div className="space-y-2.5 pb-6">
                  {filteredNetbankingBanks.length > 0 ? (
                    filteredNetbankingBanks.map((bank) => (
                      <div
                        key={bank.code}
                        onClick={() => setSelectedBankForSheet(bank)}
                        className="w-full bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-3 sm:p-3.5 flex items-center justify-between cursor-pointer transition-all hover:shadow-xs active:scale-[0.99] select-none"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white border border-slate-100 flex items-center justify-center p-1 shrink-0 overflow-hidden shadow-2xs relative">
                            <img
                              src={bank.logo}
                              alt={bank.name}
                              className="w-full h-full object-contain relative z-10"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = "none";
                              }}
                            />
                            <Landmark size={16} className="text-slate-400 absolute" />
                          </div>
                          <span className="text-xs sm:text-sm font-semibold text-slate-900 truncate">
                            {bank.name}
                          </span>
                        </div>
                        <ChevronRight size={18} className="text-slate-800 shrink-0" strokeWidth={2.2} />
                      </div>
                    ))
                  ) : (
                    <div className="py-12 text-center text-slate-500 text-xs sm:text-sm space-y-2">
                      <p>No banks found matching &quot;{netbankingSearchQuery}&quot;</p>
                      <button
                        type="button"
                        onClick={() => setNetbankingSearchQuery("")}
                        className="text-[#005a9c] font-semibold text-xs underline cursor-pointer"
                      >
                        Clear search
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Sheet Confirmation Overlay (Exact Match to User Image 2) */}
              {selectedBankForSheet && (
                <div
                  className="absolute inset-0 bg-black/60 backdrop-blur-[2px] z-30 flex flex-col justify-end p-0 sm:p-4 animate-in fade-in duration-200"
                  onClick={(e) => {
                    if (e.target === e.currentTarget && !isRedirectingToBank) {
                      setSelectedBankForSheet(null);
                    }
                  }}
                >
                  {/* Center circular Close button directly above bottom card (Image 2) */}
                  <div className="flex justify-center pb-3">
                    <button
                      type="button"
                      disabled={isRedirectingToBank}
                      onClick={() => setSelectedBankForSheet(null)}
                      className="w-10 h-10 rounded-full bg-slate-200/90 hover:bg-slate-300 text-slate-700 flex items-center justify-center shadow-lg transition-transform active:scale-95 cursor-pointer disabled:opacity-50"
                      aria-label="Close"
                    >
                      <X size={18} strokeWidth={2.5} />
                    </button>
                  </div>

                  {/* Floating Bottom Card (Image 2) */}
                  <div
                    className="bg-white rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-100 animate-in slide-in-from-bottom duration-200"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Bank Info Row */}
                    <div className="flex items-center gap-3.5 mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 p-2 flex items-center justify-center shrink-0 shadow-2xs overflow-hidden relative">
                        <img
                          src={selectedBankForSheet.logo}
                          alt={selectedBankForSheet.name}
                          className="w-full h-full object-contain relative z-10"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = "none";
                          }}
                        />
                        <Landmark size={22} className="text-slate-400 absolute" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-slate-500">Paying with</div>
                        <div className="text-sm sm:text-base font-bold text-slate-900 truncate">
                          {selectedBankForSheet.name} Netbanking
                        </div>
                      </div>
                    </div>

                    {/* Helper Subtitle with Open Arrow (Image 2) */}
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-5">
                      <ArrowUpRight size={14} className="shrink-0 text-slate-600" />
                      <span>Continue opens {selectedBankForSheet.name}&apos;s page to approve payment</span>
                    </div>

                    {/* Full-width Black Continue Button (Image 2) */}
                    <button
                      type="button"
                      disabled={isRedirectingToBank}
                      onClick={() => handleProceedNetbankingDirect(selectedBankForSheet)}
                      className="w-full bg-black hover:bg-slate-900 active:bg-slate-800 text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 text-sm sm:text-base transition-all active:scale-[0.99] cursor-pointer shadow-md disabled:opacity-75 disabled:cursor-not-allowed"
                    >
                      {isRedirectingToBank ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Connecting to {selectedBankForSheet.shortName || selectedBankForSheet.name}...</span>
                        </>
                      ) : (
                        <>
                          <span>Continue</span>
                          <ArrowRight size={16} />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* ========================================================= */
            /* SCREEN A: MAIN CHECKOUT FORM (Exact Match to Screenshot)  */
            /* ========================================================= */
            <div className="flex flex-col h-full flex-1 overflow-hidden">
              {/* Header row: Back button on left, Close button right */}
              <div className="shrink-0 px-4 sm:px-8 md:px-10 lg:px-12 pt-3.5 sm:pt-4 pb-3 border-b border-slate-100 flex items-center justify-between bg-white z-20">
                <button
                  type="button"
                  onClick={handleBackToProduct}
                  className="flex items-center gap-1.5 text-slate-700 hover:text-slate-900 font-bold text-xs sm:text-sm font-montserrat cursor-pointer hover:bg-slate-100 px-2 py-1 rounded-lg transition-colors"
                  aria-label="Back"
                >
                  <ArrowLeft size={16} />
                  <span>PROMEC</span>
                </button>

                <button
                  type="button"
                  onClick={handleClose}
                  className="w-8 h-8 bg-slate-100/80 hover:bg-slate-200 text-slate-500 hover:text-slate-900 rounded-full flex items-center justify-center transition-colors focus:outline-none cursor-pointer shadow-2xs shrink-0"
                  aria-label="Close modal"
                >
                  <X size={16} />
                </button>
              </div>

              <form
                id="checkout-form"
                onSubmit={handleCheckoutSubmit}
                className="flex-1 overflow-y-auto px-4 sm:px-8 md:px-10 lg:px-12 py-5 sm:py-6 space-y-5 no-scrollbar"
              >
                {/* Optional Payment Error Alert */}
                {paymentErrorMessage && (
                  <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold">⚠️</span>
                      <span>{paymentErrorMessage}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPaymentErrorMessage(null)}
                      className="text-red-500 hover:text-red-800 font-bold text-xs cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                )}

                {/* Section 1: Personal Information */}
                <div>
                  <div className="text-[11px] sm:text-xs font-bold tracking-wider text-slate-500 uppercase font-montserrat mb-2 sm:mb-2.5">
                    CUSTOMER &amp; DELIVERY DETAILS
                  </div>

                  <div className="space-y-3 sm:space-y-3.5">
                    {/* Row 1: Full Name & Mobile Number */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5">
                      <div>
                        <label className="block text-xs sm:text-[13px] font-bold text-slate-800 mb-1.5 font-open-sans">
                          Full Name
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Enter your full name"
                          value={formData.fullName}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormData((prev) => ({ ...prev, fullName: val }));
                            if (formErrors.fullName && val.trim().length > 0) {
                              setFormErrors((prev) => ({ ...prev, fullName: undefined }));
                            }
                          }}
                          className={`w-full bg-white border ${
                            formErrors.fullName
                              ? "border-red-500 ring-1 ring-red-500"
                              : "border-slate-200 focus:border-[#005a9c] focus:ring-1 focus:ring-[#005a9c]"
                          } rounded-lg px-3.5 py-2 sm:py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all font-open-sans`}
                        />
                        {formErrors.fullName && (
                          <p className="text-red-500 text-[11px] mt-1 font-open-sans font-medium">
                            {formErrors.fullName}
                          </p>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="block text-xs sm:text-[13px] font-bold text-slate-800 font-open-sans">
                            Mobile Number
                          </label>
                          {verifiedUser?.phone && formData.phone === verifiedUser.phone && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full select-none">
                              <CheckCircle2 size={12} className="text-emerald-600" />
                              <span>Verified</span>
                            </span>
                          )}
                        </div>
                        <input
                          type="tel"
                          inputMode="numeric"
                          maxLength={10}
                          required
                          placeholder="10-digit mobile number"
                          value={formData.phone}
                          onChange={handlePhoneChange}
                          className={`w-full bg-white border ${
                            formErrors.phone
                              ? "border-red-500 ring-1 ring-red-500"
                              : "border-slate-200 focus:border-[#005a9c] focus:ring-1 focus:ring-[#005a9c]"
                          } rounded-lg px-3.5 py-2 sm:py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all font-open-sans`}
                        />
                        {formErrors.phone && (
                          <p className="text-red-500 text-[11px] mt-1 font-open-sans font-medium">
                            {formErrors.phone}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Row 2: Email Address & Alternative Mobile Number */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5">
                      <div>
                        <label className="block text-xs sm:text-[13px] font-bold text-slate-800 mb-1.5 font-open-sans">
                          Email Address
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="name@example.com"
                          value={formData.email}
                          onChange={handleEmailChange}
                          className={`w-full bg-white border ${
                            formErrors.email
                              ? "border-red-500 ring-1 ring-red-500"
                              : "border-slate-200 focus:border-[#005a9c] focus:ring-1 focus:ring-[#005a9c]"
                          } rounded-lg px-3.5 py-2 sm:py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all font-open-sans`}
                        />
                        {formErrors.email && (
                          <p className="text-red-500 text-[11px] mt-1 font-open-sans font-medium">
                            {formErrors.email}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs sm:text-[13px] font-bold text-slate-800 mb-1.5 font-open-sans">
                          Alt. Mobile Number <span className="text-slate-400 font-normal">(Optional)</span>
                        </label>
                        <input
                          type="tel"
                          inputMode="numeric"
                          maxLength={10}
                          placeholder="Optional 10-digit number"
                          value={formData.altPhone}
                          onChange={handleAltPhoneChange}
                          className={`w-full bg-white border ${
                            formErrors.altPhone
                              ? "border-red-500 ring-1 ring-red-500"
                              : "border-slate-200 focus:border-[#005a9c] focus:ring-1 focus:ring-[#005a9c]"
                          } rounded-lg px-3.5 py-2 sm:py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all font-open-sans`}
                        />
                        {formErrors.altPhone && (
                          <p className="text-red-500 text-[11px] mt-1 font-open-sans font-medium">
                            {formErrors.altPhone}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 2: Delivery Address */}
                <div className="pt-1">
                  <div className="text-[11px] sm:text-xs font-bold tracking-wider text-slate-500 uppercase font-montserrat mb-2.5 sm:mb-3">
                    DELIVERY ADDRESS
                  </div>

                  <div className="space-y-3 sm:space-y-3.5">
                    {/* Complete Delivery Address */}
                    <div>
                      <label className="block text-xs sm:text-[13px] font-bold text-slate-800 mb-1.5 font-open-sans">
                        Complete Delivery Address
                      </label>
                      <textarea
                        rows={2}
                        required
                        placeholder="House / Flat no., Building, Street address"
                        value={formData.deliveryAddress}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData((prev) => ({ ...prev, deliveryAddress: val }));
                          if (formErrors.deliveryAddress && val.trim().length > 0) {
                            setFormErrors((prev) => ({ ...prev, deliveryAddress: undefined }));
                          }
                        }}
                        className={`w-full bg-white border ${
                          formErrors.deliveryAddress
                            ? "border-red-500 ring-1 ring-red-500"
                            : "border-slate-200 focus:border-[#005a9c] focus:ring-1 focus:ring-[#005a9c]"
                        } rounded-lg px-3.5 py-2 sm:py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all resize-none h-[64px] sm:h-[68px] font-open-sans`}
                      />
                      {formErrors.deliveryAddress && (
                        <p className="text-red-500 text-[11px] mt-1 font-open-sans font-medium">
                          {formErrors.deliveryAddress}
                        </p>
                      )}
                    </div>

                    {/* Row 3: Pincode, City, State */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-3.5">
                      <div>
                        <label className="block text-xs sm:text-[13px] font-bold text-slate-800 mb-1.5 font-open-sans">
                          Pincode
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            required
                            inputMode="numeric"
                            maxLength={6}
                            placeholder="Enter 6-digit pincode"
                            value={formData.pincode}
                            onChange={handlePincodeChange}
                            className={`w-full bg-white border ${
                              formErrors.pincode
                                ? "border-red-500 ring-1 ring-red-500"
                                : "border-slate-200 focus:border-[#005a9c] focus:ring-1 focus:ring-[#005a9c]"
                            } rounded-lg px-3.5 py-2 sm:py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all font-open-sans`}
                          />
                          {isLoadingPincode && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
                              <span className="w-3.5 h-3.5 border-2 border-[#005a9c] border-t-transparent rounded-full animate-spin block" />
                            </div>
                          )}
                        </div>
                        {formErrors.pincode && (
                          <p className="text-red-500 text-[11px] mt-1 font-open-sans font-medium">
                            {formErrors.pincode}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs sm:text-[13px] font-bold text-slate-800 mb-1.5 font-open-sans">
                          City
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="City"
                          value={formData.city}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormData((prev) => ({ ...prev, city: val }));
                            if (formErrors.city && val.trim().length > 0) {
                              setFormErrors((prev) => ({ ...prev, city: undefined }));
                            }
                          }}
                          className={`w-full bg-white border ${
                            formErrors.city
                              ? "border-red-500 ring-1 ring-red-500"
                              : "border-slate-200 focus:border-[#005a9c] focus:ring-1 focus:ring-[#005a9c]"
                          } rounded-lg px-3.5 py-2 sm:py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all font-open-sans`}
                        />
                        {formErrors.city && (
                          <p className="text-red-500 text-[11px] mt-1 font-open-sans font-medium">
                            {formErrors.city}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs sm:text-[13px] font-bold text-slate-800 mb-1.5 font-open-sans">
                          State
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="State"
                          value={formData.state}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormData((prev) => ({ ...prev, state: val }));
                            if (formErrors.state && val.trim().length > 0) {
                              setFormErrors((prev) => ({ ...prev, state: undefined }));
                            }
                          }}
                          className={`w-full bg-white border ${
                            formErrors.state
                              ? "border-red-500 ring-1 ring-red-500"
                              : "border-slate-200 focus:border-[#005a9c] focus:ring-1 focus:ring-[#005a9c]"
                          } rounded-lg px-3.5 py-2 sm:py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all font-open-sans`}
                        />
                        {formErrors.state && (
                          <p className="text-red-500 text-[11px] mt-1 font-open-sans font-medium">
                            {formErrors.state}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Row 4: Company Name & GST Number (Optional) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5">
                      <div>
                        <label className="block text-xs sm:text-[13px] font-bold text-slate-800 mb-1.5 font-open-sans">
                          Company / Workshop Name <span className="text-slate-400 font-normal">(Optional)</span>
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Apex Auto Detailing Studio"
                          value={formData.companyName}
                          onChange={(e) => setFormData((prev) => ({ ...prev, companyName: e.target.value }))}
                          className="w-full bg-white border border-slate-200 focus:border-[#005a9c] focus:ring-1 focus:ring-[#005a9c] rounded-lg px-3.5 py-2 sm:py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all font-open-sans"
                        />
                      </div>

                      <div>
                        <label className="block text-xs sm:text-[13px] font-bold text-slate-800 mb-1.5 font-open-sans">
                          GST Number (GSTIN) <span className="text-slate-400 font-normal">(Optional)</span>
                        </label>
                        <input
                          type="text"
                          placeholder="E.g: 27AAAAA0000A1Z5"
                          maxLength={15}
                          value={formData.gstNumber}
                          onChange={(e) => setFormData((prev) => ({ ...prev, gstNumber: e.target.value.toUpperCase() }))}
                          className="w-full bg-white border border-slate-200 focus:border-[#005a9c] focus:ring-1 focus:ring-[#005a9c] rounded-lg px-3.5 py-2 sm:py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all font-open-sans uppercase"
                        />
                      </div>
                    </div>

                  </div>
                </div>

                {/* Section 3: Select Payment Method */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm sm:text-base font-bold text-slate-900 font-montserrat">
                      Select Payment Method:
                    </label>
                    <span className="bg-[#eafaf1] text-[#0a8961] border border-[#a7f3d0]/70 text-[10px] sm:text-[11.5px] font-bold px-2.5 sm:px-3 py-1 rounded-full flex items-center gap-1.5 font-montserrat tracking-tight shrink-0">
                      <Lock size={12} className="text-[#0a8961] shrink-0 stroke-[2.5]" />
                      <span>100% SECURE CHECKOUT</span>
                    </span>
                  </div>

                  {/* Segmented Full vs. EMI Button */}
                  <div className="relative pt-2 sm:pt-2.5">
                    <div className="bg-[#edf2f7] p-1.5 rounded-[18px] sm:rounded-[22px] grid grid-cols-2 gap-1.5 relative">
                      {/* Segment 1: Pay in full */}
                      <button
                        type="button"
                        onClick={() => {
                          setPaymentMethod("FULL_ONLINE");
                          setOnlinePaymentMode("FULL");
                          if (selectedCustomPayment === "cod") {
                            setSelectedCustomPayment("upi");
                          }
                        }}
                        className={`h-[56px] sm:h-[60px] px-2 sm:px-4 rounded-[14px] sm:rounded-[18px] flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                          paymentMethod === "FULL_ONLINE" && onlinePaymentMode === "FULL"
                            ? "bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08)]"
                            : "hover:bg-white/40"
                        }`}
                      >
                        <span
                          className={`text-xs sm:text-[13px] font-medium font-montserrat leading-tight ${
                            paymentMethod === "FULL_ONLINE" && onlinePaymentMode === "FULL"
                              ? "text-slate-500"
                              : "text-slate-400"
                          }`}
                        >
                          Pay in full
                        </span>
                        <span
                          className={`text-sm sm:text-base font-extrabold font-montserrat mt-0.5 leading-tight ${
                            paymentMethod === "FULL_ONLINE" && onlinePaymentMode === "FULL"
                              ? "text-slate-900"
                              : "text-slate-600"
                          }`}
                        >
                          ₹{totalPrice.toLocaleString("en-IN")}.00
                        </span>
                      </button>

                      {/* Segment 2: EMI on Cards */}
                      <button
                        type="button"
                        onClick={() => {
                          setPaymentMethod("FULL_ONLINE");
                          setOnlinePaymentMode("EMI");
                        }}
                        className={`relative h-[56px] sm:h-[60px] px-2 sm:px-4 rounded-[14px] sm:rounded-[18px] flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                          paymentMethod === "FULL_ONLINE" && onlinePaymentMode === "EMI"
                            ? "bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08)]"
                            : "hover:bg-white/40"
                        }`}
                      >
                        {/* No Cost EMI Floating Green Badge */}
                        <span className="absolute -top-3.5 right-6 px-3 py-0.5 rounded-full text-[10px] font-extrabold bg-[#059669] text-white shadow-xs tracking-tight">
                          No Cost EMI
                        </span>

                        <span
                          className={`text-xs sm:text-[13px] font-medium font-montserrat leading-tight ${
                            paymentMethod === "FULL_ONLINE" && onlinePaymentMode === "EMI"
                              ? "text-slate-600"
                              : "text-slate-400"
                          }`}
                        >
                          EMI on Cards
                        </span>
                        <span
                          className={`text-sm sm:text-base font-extrabold font-montserrat mt-0.5 leading-tight ${
                            paymentMethod === "FULL_ONLINE" && onlinePaymentMode === "EMI"
                              ? "text-slate-900"
                              : "text-slate-600"
                          }`}
                        >
                          3/6/9+ mo. EMI
                        </span>
                      </button>
                    </div>

                    {/* EMI View Mode: Exact Accordion Box (Matches media_1790415930939.png) */}
                    {onlinePaymentMode === "EMI" && paymentMethod !== "10_PERCENT_COD" && (
                      <div className="mt-3.5 border border-slate-200/90 rounded-2xl p-4 sm:p-5 bg-white shadow-xs space-y-3.5 animate-in fade-in duration-200">
                        {/* Header Row */}
                        <div
                          onClick={() => setIsEmiAccordionOpen(!isEmiAccordionOpen)}
                          className="flex items-center justify-between cursor-pointer select-none"
                        >
                          <div className="flex items-center gap-3">
                            <EmiCardPercentIcon className="w-6 h-6 text-slate-700 shrink-0" />
                            <div>
                              <div className="font-extrabold text-sm sm:text-base text-slate-900 font-montserrat">
                                EMI
                              </div>
                              <div className="text-xs font-bold text-[#059669] font-montserrat">
                                No Cost EMI
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-sm sm:text-base text-slate-900 font-montserrat">
                              ₹{totalPrice.toLocaleString("en-IN")}
                            </span>
                            <ChevronUp
                              size={18}
                              className={`text-slate-400 transition-transform duration-200 ${
                                isEmiAccordionOpen ? "rotate-0" : "rotate-180"
                              }`}
                            />
                          </div>
                        </div>

                        {/* Collapsible Content */}
                        {isEmiAccordionOpen && (
                          <div className="space-y-3 pt-1">
                            {/* Available Offers Compact Pill Bar (Exact match to media_1790942039403.png) */}
                            <div className="space-y-2">
                              <div className="text-xs sm:text-[13px] font-semibold text-slate-700 font-montserrat">
                                Available Offers
                              </div>
                              <div className="flex items-center gap-2 sm:gap-2.5 overflow-x-auto no-scrollbar py-0.5">
                                {/* Pill 1: Featured Yes Bank Offer */}
                                <button
                                  type="button"
                                  onClick={() => setIsOffersModalOpen(true)}
                                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#edeefc] hover:bg-[#e4e6fb] active:scale-[0.98] transition-all cursor-pointer border border-[#d8dbfa]/50 shrink-0 text-left"
                                >
                                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white flex items-center justify-center overflow-hidden shrink-0 shadow-xs border border-white">
                                    <img
                                      src="https://cashfreelogo.cashfree.com/assets_images/pg/nb/64/yes.png"
                                      alt="Yes Bank"
                                      className="w-full h-full object-contain p-0.5"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).src = "https://cashfreelogo.cashfree.com/assets_images/pg/nb/64/yesb.png";
                                      }}
                                    />
                                  </div>
                                  <span className="text-[12px] sm:text-[13px] font-medium text-slate-800 truncate max-w-[200px] sm:max-w-[240px]">
                                    5% Cashback on Yes Bank Credit C...
                                  </span>
                                </button>

                                {/* Pill 2: View All (+3 offers) */}
                                <button
                                  type="button"
                                  onClick={() => setIsOffersModalOpen(true)}
                                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#f4f5f7] hover:bg-[#eaecee] active:scale-[0.98] transition-all cursor-pointer border border-slate-200/60 shrink-0"
                                >
                                  <div className="flex items-center">
                                    {/* HSBC Logo */}
                                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white flex items-center justify-center overflow-hidden shrink-0 shadow-xs border border-white z-10">
                                      <img
                                        src="https://cashfreelogo.cashfree.com/assets_images/pg/nb/64/hsb.png"
                                        alt="HSBC"
                                        className="w-full h-full object-contain p-0.5"
                                      />
                                    </div>
                                    {/* +3 circle */}
                                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white text-[10px] sm:text-[11px] font-bold text-slate-700 flex items-center justify-center -ml-2 shrink-0 shadow-xs border border-slate-200 z-20">
                                      +3
                                    </div>
                                  </div>
                                  <span className="text-[12px] sm:text-[13px] font-medium text-slate-700 whitespace-nowrap">
                                    View all
                                  </span>
                                </button>
                              </div>
                            </div>

                            {/* Quick Recommended Banks with Verified Active Offers */}
                            <div className="space-y-2.5">
                              {(() => {
                                const availableBanks = (liveEmiBanks && liveEmiBanks.length > 0) ? liveEmiBanks : DEFAULT_EMI_BANKS;
                                const offerBanks = availableBanks.filter((b) => b.hasOffer || b.isNoCost);
                                const quickBanks = (offerBanks.length > 0 ? offerBanks : availableBanks).slice(0, 3);

                                return quickBanks.map((bank) => (
                                  <div
                                    key={bank.id}
                                    onClick={() => {
                                      setSelectedEmiBankObj(bank);
                                      setSelectedEmiBank(bank.name);
                                      const plans = calculateBankEmiPlans(bank.id, bank.code, bank.name, totalPrice);
                                      const popular = plans.find((p) => p.isMostPopular) || plans[0];
                                      setSelectedTenure(popular ? popular.months : 6);
                                      setSelectedEmiPlan(popular || null);
                                      setCheckoutStep("emi_plan_select");
                                    }}
                                    className="p-3 sm:p-3.5 border border-slate-200 hover:border-slate-300 rounded-2xl flex items-center justify-between cursor-pointer transition-all hover:bg-slate-50/60 select-none shadow-2xs"
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 rounded-full bg-white border border-slate-100 p-1 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
                                        <img
                                          src={bank.logo}
                                          alt={bank.name}
                                          className="w-full h-full object-contain"
                                          onError={(e) => {
                                            (e.target as HTMLImageElement).src = "https://cashfreelogo.cashfree.com/assets_images/pg/nb/64/axis.png";
                                          }}
                                        />
                                      </div>
                                      <div>
                                        <div className="flex items-center gap-2 flex-wrap">
                                          <span className="font-bold text-xs sm:text-sm text-slate-900 font-montserrat">
                                            {bank.name}
                                          </span>
                                          {bank.offerText ? (
                                            <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded leading-tight">
                                              {bank.offerText}
                                            </span>
                                          ) : bank.isNoCost ? (
                                            <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded leading-tight">
                                              No Cost EMI
                                            </span>
                                          ) : null}
                                        </div>
                                        <div className="text-[11.5px] text-slate-500 font-open-sans mt-0.5">
                                          EMI starts from ₹{calculateStartingEmi(bank.id, bank.code, bank.name, totalPrice).toLocaleString("en-IN")}/m • {bank.isNoCost ? "0% Interest Subsidized" : "Standard Bank Rates"}
                                        </div>
                                      </div>
                                    </div>
                                    <ChevronRight size={18} className="text-slate-400 shrink-0" />
                                  </div>
                                ));
                              })()}
                            </div>

                            {/* View all banks Button */}
                            <button
                              type="button"
                              onClick={() => setCheckoutStep("choose_emi")}
                              className="w-full py-3 border border-slate-200 hover:border-slate-400 rounded-2xl bg-white text-slate-900 font-bold text-sm text-center font-montserrat shadow-2xs transition-colors cursor-pointer flex items-center justify-center gap-2"
                            >
                              <span>View all {liveRazorpayOffers.length > 0 ? liveRazorpayOffers.length : 14} bank offers & plans</span>
                              <span>&rarr;</span>
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Payment Methods Accordion (Exact Icons & Structure) */}
                  <div className="space-y-2.5 pt-1">
                    
                    {/* Method 1: UPI (Expanded by default) */}
                    <div
                      className={`rounded-2xl overflow-hidden transition-all bg-white ${
                        selectedCustomPayment === "upi" && paymentMethod !== "10_PERCENT_COD"
                          ? "border-2 border-[#005a9c] shadow-xs"
                          : "border border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div
                        onClick={() => {
                          setPaymentMethod("FULL_ONLINE");
                          setOnlinePaymentMode("FULL");
                          setSelectedCustomPayment((prev) => (prev === "upi" ? "" : "upi"));
                        }}
                        className="h-[54px] sm:h-[58px] px-3.5 sm:px-4 flex items-center justify-between cursor-pointer select-none hover:bg-slate-50/70 transition-colors"
                      >
                        <div className="flex items-center gap-2.5 sm:gap-3">
                          <UpiPaymentIcon className="w-5 h-5 text-[#005DA6] shrink-0" />
                          <span className="font-bold text-xs sm:text-sm text-slate-900 font-montserrat tracking-tight">
                            UPI
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-right">
                          <span className="text-[11px] text-slate-400 line-through font-normal font-open-sans">
                            ₹{totalMRP.toLocaleString("en-IN")}
                          </span>
                          <span className="text-xs sm:text-sm font-extrabold text-slate-900 font-montserrat">
                            ₹{totalPrice.toLocaleString("en-IN")}
                          </span>
                          <ChevronRight className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-200 ${selectedCustomPayment === "upi" && paymentMethod !== "10_PERCENT_COD" ? "rotate-90" : ""}`} strokeWidth={2.5} />
                        </div>
                      </div>

                      {/* UPI Expanded Content with Real QR and Real Icons */}
                      {selectedCustomPayment === "upi" && paymentMethod !== "10_PERCENT_COD" && (
                        <div className="px-4 pb-5 pt-2 bg-white">
                          {/* Desktop Layout: Exactly matching Image media_1790176929349.png */}
                          <div className="hidden sm:flex items-center justify-center gap-10 py-2">
                            {/* Left: Dynamic QR Code + 15 min Validity Pill Badge */}
                            <div className="flex flex-col items-center">
                              <div className="relative w-36 h-36 bg-white flex items-center justify-center shrink-0">
                                <QRCodeSVG
                                  value={`upi://pay?pa=amectechnology.rzp@rxairtel&pn=AMECTECHNOLOGY&mc=5013&tr=${upiSessionRef}&am=${totalPrice}&cu=INR&tn=PROMEC%20Aquaforce%20${upiSessionRef}`}
                                  size={144}
                                  level="M"
                                  className={`w-full h-full transition-all duration-300 ${
                                    !showQrCode ? "blur-[5px] select-none pointer-events-none opacity-85" : "blur-none"
                                  }`}
                                />

                                {/* Show QR Button Overlay (Exact Match to media_1790177917865.png) */}
                                {!showQrCode && (
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setQrCountdownSecs(900);
                                        setUpiSessionRef(`AMEC${Date.now().toString(36).toUpperCase()}`);
                                        setShowQrCode(true);
                                      }}
                                      className="bg-white border border-slate-700/80 hover:border-black text-slate-900 rounded-[8px] px-3.5 py-1.5 flex items-center gap-2 shadow-xs hover:bg-slate-50 transition-all cursor-pointer font-montserrat active:scale-95"
                                    >
                                      <svg className="w-4 h-4 text-slate-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
                                        <circle cx="12" cy="12" r="3.2" fill="currentColor" />
                                      </svg>
                                      <span className="text-xs sm:text-[13px] font-semibold tracking-tight text-slate-900 select-none">
                                        Show QR
                                      </span>
                                    </button>
                                  </div>
                                )}
                              </div>

                              {/* Tooltip Pill: QR valid for 14:58 mins with upward arrow (Only appears after clicking Show QR) */}
                              {showQrCode && (
                                <div className="relative mt-2.5 flex flex-col items-center">
                                  <div className="w-0 h-0 border-x-[5px] border-x-transparent border-b-[5px] border-b-slate-100" />
                                  <div className="bg-slate-100 text-slate-700 text-[11.5px] font-semibold px-3 py-1 rounded-lg select-none whitespace-nowrap shadow-2xs font-open-sans">
                                    QR valid for <span className="font-bold text-slate-900">{formatQrTimer(qrCountdownSecs)}</span> mins
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Right: Text + 5 Overlapping UPI Partner Brand Icons (Exact match to screenshot) */}
                            <div className="flex flex-col items-center space-y-3.5">
                              <div className="text-xs sm:text-[13px] font-semibold text-slate-800 font-open-sans text-center">
                                Scan the QR using any UPI App
                              </div>
                              <div className="flex items-center -space-x-2">
                                <div className="relative z-10 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#e8f7fd] ring-2 ring-white flex items-center justify-center p-1.5 shadow-2xs shrink-0 select-none overflow-hidden" title="Paytm">
                                  <img src={getApiPath("/UPI options/paytm_logo.svg.png")} alt="Paytm" className="w-full h-full object-contain" />
                                </div>
                                <div className="relative z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#5f259f] ring-2 ring-white flex items-center justify-center shrink-0 select-none overflow-hidden shadow-2xs" title="PhonePe">
                                  <img src={getApiPath("/UPI options/phonepe_symbol.svg.png")} alt="PhonePe" className="w-full h-full object-cover" />
                                </div>
                                <div className="relative z-30 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#f0f4f9] ring-2 ring-white flex items-center justify-center p-1.5 shadow-2xs shrink-0 select-none overflow-hidden" title="Google Pay">
                                  <img src={getApiPath("/UPI options/google.png")} alt="Google Pay" className="w-full h-full object-contain" />
                                </div>
                                <div className="relative z-40 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#232f3e] ring-2 ring-white flex items-center justify-center p-1.5 shadow-2xs shrink-0 select-none overflow-hidden" title="Amazon Pay">
                                  <img src={getApiPath("/UPI options/amazonpay.png")} alt="Amazon Pay" className="w-full h-full object-contain" />
                                </div>
                                <div className="relative z-50 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#eef8ee] ring-2 ring-white flex items-center justify-center p-1.5 shadow-2xs shrink-0 select-none overflow-hidden" title="BHIM UPI">
                                  <img src={getApiPath("/UPI options/bhim_logo.svg.png")} alt="BHIM UPI" className="w-full h-full object-contain" />
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Mobile Layout: UPI App Cards */}
                          <div className="sm:hidden py-1 space-y-2.5">
                            <div className="flex items-stretch gap-2.5 overflow-x-auto no-scrollbar py-1.5 px-0.5 scroll-smooth snap-x">
                              {UPI_APP_OPTIONS.map((app) => {
                                const isSelected = selectedUpiApp === app.id;
                                const isThisAppLoading = isProcessingPayment && selectedUpiApp === app.id;
                                return (
                                  <div
                                    key={app.id}
                                    onClick={() => handleUpiAppSelectAndPay(app.id)}
                                    className={`relative shrink-0 w-[84px] xs:w-[92px] h-[106px] rounded-2xl flex flex-col items-center justify-between cursor-pointer transition-all duration-200 select-none snap-start overflow-hidden active:scale-95 ${
                                      isSelected
                                        ? "border-2 border-[#005a9c] ring-2 ring-[#005a9c]/15 shadow-sm scale-[1.02]"
                                        : `border ${app.borderClass} hover:border-slate-300`
                                    } ${app.bgClass}`}
                                  >
                                    {/* Top Cashback Badge if present */}
                                    {app.badge ? (
                                      <div className="w-full text-center py-0.5 text-[9px] font-bold text-[#0a8961] bg-[#eafaf1] border-b border-[#a7f3d0]/60 uppercase tracking-tight">
                                        {app.badge}
                                      </div>
                                    ) : (
                                      <div className="h-[18px] w-full" />
                                    )}

                                    {/* App Logo Avatar */}
                                    <div
                                      className={`w-11 h-11 rounded-full ${app.avatarBg} ring-1 ring-black/5 flex items-center justify-center p-1.5 shadow-2xs shrink-0 overflow-hidden my-auto`}
                                    >
                                      <img
                                        src={getApiPath(app.logo)}
                                        alt={app.name}
                                        className="w-full h-full object-contain"
                                      />
                                    </div>

                                    {/* App Name Label */}
                                    <div className="w-full text-center pb-2 px-1">
                                      <span
                                        className={`text-xs font-bold font-montserrat truncate block ${
                                          isSelected ? "text-[#005a9c]" : "text-slate-800"
                                        }`}
                                      >
                                        {app.shortName}
                                      </span>
                                    </div>

                                    {/* Selected Checkmark Badge / Loading Spinner */}
                                    {isSelected && (
                                      <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#005a9c] text-white flex items-center justify-center shadow-xs">
                                        {isThisAppLoading ? (
                                          <span className="w-2.5 h-2.5 border-2 border-white border-t-transparent rounded-full animate-spin block" />
                                        ) : (
                                          <Check size={10} strokeWidth={3.5} />
                                        )}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>


                          </div>
                        </div>
                      )}
                    </div>

                    {/* Method 2: Cash on Delivery */}
                    <div
                      onClick={() => {
                        setPaymentMethod("10_PERCENT_COD");
                        setOnlinePaymentMode("FULL");
                        setSelectedCustomPayment("cod");
                      }}
                      className={`relative !mt-6 sm:!mt-7 rounded-2xl transition-all bg-white cursor-pointer select-none ${
                        paymentMethod === "10_PERCENT_COD"
                          ? "border-2 border-[#16a34a] shadow-xs"
                          : "border border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      {/* Green Folded Ribbon on Top Edge */}
                      <RibbonBadge text="Pay Just 10% Now, Rest on Delivery" />

                      <div className="h-[54px] sm:h-[58px] px-3.5 sm:px-4 flex items-center justify-between">
                        <div className="flex items-center gap-2.5 sm:gap-3">
                          <CodPaymentIcon className="w-5 h-5 sm:w-6 sm:h-6 text-[#005a9c] shrink-0" />
                          <div className="flex flex-col text-left">
                            <span className="font-bold text-xs sm:text-sm text-slate-900 font-montserrat tracking-tight leading-tight">
                              Cash on Delivery
                            </span>
                            <span className="text-[10px] sm:text-xs text-slate-400 font-medium font-montserrat leading-tight mt-0.5">
                              Safe Upfront Payment
                            </span>
                          </div>
                        </div>

                        <div>
                          <span className="text-sm sm:text-base font-extrabold text-slate-900 font-montserrat">
                            ₹{advanceAmount.toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Method 3: Debit/Credit Cards */}
                    <div
                      className={`rounded-2xl overflow-hidden transition-all bg-white ${
                        selectedCustomPayment === "card" && paymentMethod !== "10_PERCENT_COD"
                          ? "border-2 border-[#005a9c] shadow-xs"
                          : "border border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div
                        onClick={handleDebitCreditCardClick}
                        className="h-[54px] sm:h-[58px] px-3.5 sm:px-4 flex items-center justify-between cursor-pointer select-none hover:bg-slate-50/70 transition-colors"
                      >
                        <div className="flex items-center gap-2.5 sm:gap-3">
                          <CardPaymentIcon className="w-5 h-5 text-[#005a9c] shrink-0" />
                          <span className="font-bold text-xs sm:text-sm text-slate-900 font-montserrat tracking-tight">
                            Debit/Credit Cards
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs sm:text-sm font-extrabold text-slate-900 font-montserrat">
                            ₹{totalPrice.toLocaleString("en-IN")}
                          </span>
                          {isProcessingPayment && selectedCustomPayment === "card" ? (
                            <span className="w-4 h-4 border-2 border-[#005a9c] border-t-transparent rounded-full animate-spin shrink-0" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-slate-400 shrink-0" strokeWidth={2.5} />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Method 4: Netbanking */}
                    <div
                      className={`rounded-2xl overflow-hidden transition-all bg-white ${
                        selectedCustomPayment === "netbanking" && paymentMethod !== "10_PERCENT_COD"
                          ? "border-2 border-[#005a9c] shadow-xs"
                          : "border border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div
                        onClick={() => {
                          setPaymentMethod("FULL_ONLINE");
                          setOnlinePaymentMode("FULL");
                          setSelectedCustomPayment("netbanking");
                          setNetbankingSearchQuery("");
                          setSelectedNetbankingTab("popular");
                          setSelectedBankForSheet(null);
                          setCheckoutStep("select_netbanking");
                        }}
                        className="h-[54px] sm:h-[58px] px-3.5 sm:px-4 flex items-center justify-between cursor-pointer select-none hover:bg-slate-50/70 transition-colors"
                      >
                        <div className="flex items-center gap-2.5 sm:gap-3">
                          <BankPaymentIcon className="w-5 h-5 text-[#005a9c] shrink-0" />
                          <span className="font-bold text-xs sm:text-sm text-slate-900 font-montserrat tracking-tight">
                            Netbanking
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs sm:text-sm font-extrabold text-slate-900 font-montserrat">
                            ₹{totalPrice.toLocaleString("en-IN")}
                          </span>
                          <ChevronRight className="w-5 h-5 text-slate-400 shrink-0" strokeWidth={2.5} />
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Section 4: Price Breakdown Card */}
                <div className="bg-[#fafbfc] border border-slate-200/90 rounded-2xl p-4 sm:p-5 space-y-2.5 font-open-sans shadow-2xs">
                  <div className="flex items-center justify-between pb-1">
                    <span className="text-xs sm:text-[13px] font-bold text-slate-900 font-montserrat uppercase tracking-wide">
                      PRICE BREAKDOWN
                    </span>
                    <span className="bg-[#eff6ff] text-[#2563eb] border border-blue-200/70 text-[11px] font-semibold px-2.5 py-0.5 rounded-full font-open-sans">
                      {selectedVacuumOption === "without" ? "Without Vacuum" : "With Vacuum"}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs sm:text-[13px] font-open-sans">
                    {/* MRP Total */}
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">MRP Total</span>
                      <span className="text-slate-400 line-through font-normal text-right">
                        ₹{totalMRP.toLocaleString("en-IN")}
                      </span>
                    </div>

                    {/* Discount on MRP */}
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Discount on MRP</span>
                      <span className="text-emerald-600 font-bold text-right">
                        -₹{totalSavings.toLocaleString("en-IN")}
                      </span>
                    </div>

                    {/* Subtotal */}
                    <div className="flex items-center justify-between">
                      <span className="text-slate-900 font-bold">Subtotal</span>
                      <span className="text-slate-900 font-bold text-right">
                        ₹{totalPrice.toLocaleString("en-IN")}
                      </span>
                    </div>

                    {/* Shipping */}
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Shipping</span>
                      <div className="flex items-center justify-end gap-1.5 text-right shrink-0">
                        <span className="text-slate-400 line-through font-normal">₹1,500</span>
                        <span className="text-emerald-600 font-bold uppercase">
                          FREE (DELHIVERY EXPRESS)
                        </span>
                      </div>
                    </div>

                    {/* Handling & Packaging Fee */}
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Handling &amp; Packaging Fee</span>
                      <div className="flex items-center justify-end gap-1.5 text-right shrink-0">
                        <span className="text-slate-400 line-through font-normal">₹550</span>
                        <span className="text-emerald-600 font-bold uppercase">FREE</span>
                      </div>
                    </div>
                  </div>

                  <div className="w-full h-px bg-slate-200/80 my-2" />

                  {/* Total Order Value */}
                  <div className="flex items-center justify-between text-sm sm:text-base font-bold text-slate-900 font-montserrat">
                    <span>Total Order Value</span>
                    <span className="font-extrabold text-base sm:text-lg text-right">
                      ₹{totalPrice.toLocaleString("en-IN")}
                    </span>
                  </div>

                  {paymentMethod === "10_PERCENT_COD" && (
                    <div className="pt-2 border-t border-slate-200/80 space-y-2 font-open-sans">
                      <div className="flex items-start justify-between text-xs sm:text-[13px]">
                        <span className="font-bold text-slate-800 font-montserrat">Pay on Delivery</span>
                        <div className="flex flex-col items-end text-right">
                          <span className="text-xs sm:text-sm font-extrabold text-slate-900 font-montserrat">
                            90% Balance ₹{codBalance.toLocaleString("en-IN")}
                          </span>
                          <span className="text-[10.5px] text-slate-400 font-open-sans">
                            COD fee of <span className="font-semibold text-slate-700">₹{codFee}</span> is added
                          </span>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-[#ecfdf5] border border-[#a7f3d0] flex items-center justify-between text-xs font-bold text-[#065f46]">
                        <span>Pay Now:</span>
                        <span className="text-sm font-extrabold text-emerald-700">
                          10% Advance Deposit ₹{advanceAmount.toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Savings Banner */}
                <div className="p-3 bg-[#ecfdf5] border border-[#a7f3d0] rounded-xl text-center text-emerald-800 font-bold text-xs sm:text-[13px] font-open-sans flex items-center justify-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  <span>
                    You are Saving ₹{totalSavings.toLocaleString("en-IN")} ({savingsPercentage}% OFF) on this order.
                  </span>
                </div>

                {/* Agreement Checkbox */}
                <label className="flex items-center gap-2.5 pt-1 cursor-pointer select-none font-open-sans">
                  <input
                    type="checkbox"
                    checked={formData.agreedToTerms}
                    onChange={(e) => setFormData({ ...formData, agreedToTerms: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 accent-emerald-600 cursor-pointer shrink-0"
                    required
                  />
                  <span className="text-[11.5px] sm:text-xs text-slate-600 font-medium leading-tight">
                    I agree to receive order confirmation &amp; delivery updates via Email and WhatsApp.
                  </span>
                </label>
              </form>

              {/* Sticky Bottom Action Bar */}
              <div
                style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom, 0px))" }}
                className="shrink-0 bg-white/95 backdrop-blur-md border-t border-slate-100 px-4 sm:px-8 md:px-10 lg:px-12 pt-3.5 pb-3.5 sm:pb-4 shadow-[0_-6px_20px_rgba(0,0,0,0.06)] z-20"
              >
                <button
                  type="submit"
                  form="checkout-form"
                  disabled={isProcessingPayment}
                  className="w-full bg-[#005a9c] hover:bg-[#004f8a] active:bg-[#004478] text-white font-bold font-montserrat text-sm sm:text-base tracking-wider py-3.5 sm:py-4 rounded-xl shadow-sm transition-all active:scale-[0.99] cursor-pointer flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed uppercase"
                >
                  {isProcessingPayment ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      PROCESSING ORDER...
                    </span>
                  ) : paymentMethod === "10_PERCENT_COD" ? (
                    <span>PAY ₹{advanceAmount.toLocaleString("en-IN")} &amp; CONFIRM ORDER</span>
                  ) : onlinePaymentMode === "EMI" ? (
                    <span>PAY ₹{totalPrice.toLocaleString("en-IN")} ON NO-COST EMI</span>
                  ) : selectedCustomPayment === "upi" ? (
                    <span>PAY ₹{totalPrice.toLocaleString("en-IN")} VIA ANY UPI</span>
                  ) : selectedCustomPayment === "card" ? (
                    <span>PAY ₹{totalPrice.toLocaleString("en-IN")} VIA CARD</span>
                  ) : selectedCustomPayment === "netbanking" ? (
                    <span>PAY ₹{totalPrice.toLocaleString("en-IN")} VIA NETBANKING</span>
                  ) : (
                    <span>PAY ₹{totalPrice.toLocaleString("en-IN")} &amp; CONFIRM ORDER</span>
                  )}
                </button>
              </div>
            </div>
          )
        ) : (
          /* Main Product Detail Layout */
          <>
            <div className="flex-1 overflow-y-auto lg:overflow-hidden p-4 sm:p-6 lg:p-7 no-scrollbar">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-stretch h-full">
                {/* ========================================================= */}
                {/* LEFT COLUMN: Gallery & Thumbnails */}
                {/* ========================================================= */}
                <div className="lg:col-span-6 flex flex-col justify-between select-none h-full lg:min-h-[540px]">
                  {/* Main Image Container with Touch Swipe Support */}
                  <div
                    onTouchStart={handleModalTouchStart}
                    onTouchMove={handleModalTouchMove}
                    onTouchEnd={handleModalTouchEnd}
                    className="relative w-full aspect-square max-h-[280px] xs:max-h-[320px] sm:max-h-[380px] lg:max-h-[430px] flex items-center justify-center bg-white rounded-[16px] overflow-hidden group touch-pan-y"
                  >
                    {/* Out of Stock Ribbon/Badge */}
                    {!currentColor.inStock && (
                      <div className="absolute top-3 left-3 z-20 bg-red-600 text-white text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-[6px] shadow-md">
                        Out of Stock
                      </div>
                    )}

                    <Image
                      src={images[activeImageIndex]}
                      alt={`${PRODUCT_DATA.name} ${currentColor.name} view ${activeImageIndex + 1}`}
                      fill
                      priority
                      quality={100}
                      sizes="(max-width: 768px) 100vw, 500px"
                      className={`object-contain p-2 transition-all duration-300 ${
                        !currentColor.inStock ? "opacity-75 grayscale-[20%]" : ""
                      }`}
                    />

                    {/* Left Navigation Chevron */}
                    <button
                      onClick={prevImage}
                      className="hidden lg:flex absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 border border-slate-200 shadow-md items-center justify-center text-slate-700 hover:bg-white hover:scale-105 transition-all cursor-pointer z-10"
                      aria-label="Previous image"
                    >
                      <ChevronLeft size={18} />
                    </button>

                    {/* Right Navigation Chevron */}
                    <button
                      onClick={nextImage}
                      className="hidden lg:flex absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 border border-slate-200 shadow-md items-center justify-center text-slate-700 hover:bg-white hover:scale-105 transition-all cursor-pointer z-10"
                      aria-label="Next image"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>

                  {/* Clickable Thumbnails (4 visible at a time, scrollable for 5, 6, etc.) */}
                  <div
                    ref={thumbnailContainerRef}
                    className="flex items-center gap-2.5 sm:gap-3 w-full mt-3 sm:mt-3.5 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory py-1"
                  >
                    {images.map((img, idx) => (
                      <button
                        key={img}
                        ref={(el) => {
                          thumbnailRefs.current[idx] = el;
                        }}
                        onClick={() => {
                          setActiveImageIndex(idx);
                          thumbnailRefs.current[idx]?.scrollIntoView({
                            behavior: "smooth",
                            block: "nearest",
                            inline: "center",
                          });
                        }}
                        className={`relative shrink-0 w-[calc(25%-7.5px)] sm:w-[calc(25%-9px)] aspect-square rounded-[12px] bg-white p-1 transition-all overflow-hidden cursor-pointer snap-start ${
                          activeImageIndex === idx
                            ? "border-2 border-[#0066cc] shadow-xs"
                            : "border border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <Image
                          src={img}
                          alt={`Thumbnail ${idx + 1}`}
                          fill
                          quality={100}
                          sizes="120px"
                          className="object-contain p-1"
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* ========================================================= */}
                {/* RIGHT COLUMN: Info with Bottom-Anchored Buy Now Button */}
                {/* ========================================================= */}
                <div className="lg:col-span-6 flex flex-col justify-between h-full lg:min-h-[540px] lg:max-h-[540px] mt-4 lg:mt-0 pl-0 lg:pl-1 pr-0 lg:pr-1">
                  {/* Scrollable Content Area */}
                  <div
                    ref={scrollContainerRef}
                    className="lg:flex-1 lg:overflow-y-auto pr-0 lg:pr-2 no-scrollbar space-y-3"
                  >
                    {/* Product Title */}
                    <h2 className="text-xl sm:text-2xl lg:text-[25px] font-bold font-montserrat text-[#0F1729] leading-[1.2] tracking-tight mt-1 sm:mt-0">
                      {PRODUCT_DATA.name}
                    </h2>

                    {/* Description */}
                    <p className="text-slate-500 font-open-sans sm:text-slate-600 text-[12.5px] sm:text-sm leading-relaxed">
                      {PRODUCT_DATA.description}
                    </p>

                    {/* Ratings & Reviews */}
                    <div className="flex items-center gap-1.5 font-open-sans">
                      <div className="flex items-center gap-0.5">
                        {/* 4 Full Stars */}
                        {[...Array(4)].map((_, i) => (
                          <Star key={i} size={15} fill="#f59e0b" strokeWidth={0} className="text-[#f59e0b]" />
                        ))}
                        {/* 5th Star: 3/4 (80%) Gold Fill, 20% Gray */}
                        <div className="relative w-[15px] h-[15px]">
                          <Star size={15} fill="#e2e8f0" strokeWidth={0} className="text-[#e2e8f0] absolute inset-0" />
                          <div className="absolute inset-0 overflow-hidden w-[80%]">
                            <Star size={15} fill="#f59e0b" strokeWidth={0} className="text-[#f59e0b]" />
                          </div>
                        </div>
                      </div>
                      <span className="text-xs sm:text-[13px] font-medium text-slate-600 ml-1">
                        {PRODUCT_DATA.rating.toFixed(1)} ({PRODUCT_DATA.reviewsCount} Reviews)
                      </span>
                    </div>

                    {/* Price Line & Delivery Fee */}
                    <div className="space-y-1.5">
                      <div className="flex items-baseline gap-3 font-open-sans">
                        <span className="text-3xl sm:text-4xl font-bold text-[#0F1729] tracking-tight">
                          ₹{currentOfferPrice.toLocaleString("en-IN")}
                        </span>
                        <span className="text-slate-400 line-through text-lg font-normal">
                          ₹{currentMRP.toLocaleString("en-IN")}
                        </span>
                        <span className="bg-[#16a34a]/10 border border-[#16a34a]/30 text-[#16a34a] text-xs font-bold px-2.5 py-0.5 rounded-full font-open-sans">
                          {savingsPercentage}% OFF
                        </span>
                      </div>
                      <div className="flex items-center gap-2 font-open-sans text-xs sm:text-[13px] flex-wrap">
                        <span className="text-slate-500 font-medium">Delivery Fee:</span>
                        <span className="text-red-500 line-through font-semibold">₹1,500</span>
                        <span className="bg-[#16a34a] text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                          FREE Delivery
                        </span>
                      </div>
                    </div>

                    <div className="w-full h-px bg-slate-100 my-2" />

                    {/* Vacuum Package Option Selector (Without Vacuum vs With Vacuum) */}
                    <div>
                      <p className="text-xs sm:text-sm font-semibold text-[#0F1729] mb-2 font-open-sans">
                        Select Variant / Package:
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-3">
                        {/* Option 1: Without Vacuum */}
                        <button
                          type="button"
                          onClick={() => setSelectedVacuumOption("without")}
                          className={`pt-3.5 pb-3 px-3 sm:px-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                            selectedVacuumOption === "without"
                              ? "border-[#0066cc] bg-blue-50/60 ring-1 ring-[#0066cc]"
                              : "border-slate-200 hover:border-slate-300 bg-white"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1.5 sm:gap-2">
                            <span className="font-bold text-xs sm:text-[13px] text-slate-900 font-montserrat whitespace-nowrap">
                              Without Vacuum
                            </span>
                            <span className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ml-1 ${
                              selectedVacuumOption === "without" ? "border-[#0066cc] bg-[#0066cc]" : "border-slate-300"
                            }`}>
                              {selectedVacuumOption === "without" && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                            </span>
                          </div>
                          <div className="mt-1 flex items-baseline gap-1.5 font-open-sans">
                            <span className="text-sm font-bold text-slate-900">₹35,999</span>
                            <span className="text-[11px] text-slate-400 line-through">₹47,999</span>
                          </div>
                          <span className="text-[10.5px] font-bold text-emerald-600 mt-0.5 font-open-sans">Save ₹12,000 | 25% OFF</span>
                        </button>

                        {/* Option 2: With Vacuum */}
                        <button
                          type="button"
                          onClick={() => setSelectedVacuumOption("with")}
                          className={`pt-3.5 pb-3 px-3 sm:px-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between relative ${
                            selectedVacuumOption === "with"
                              ? "border-[#0066cc] bg-blue-50/60 ring-1 ring-[#0066cc]"
                              : "border-slate-200 hover:border-slate-300 bg-white"
                          }`}
                        >
                          <span className="absolute -top-2.5 right-2.5 sm:right-3 z-10 bg-[#0066cc] text-white text-[9.5px] font-extrabold uppercase tracking-wider px-2 sm:px-2.5 py-0.5 rounded-full shadow-xs flex items-center gap-1 font-montserrat select-none whitespace-nowrap">
                            <Star size={10} fill="#f59e0b" strokeWidth={0} className="text-[#f59e0b] shrink-0" />
                            <span>RECOMMENDED</span>
                          </span>
                          <div className="flex items-center justify-between gap-1.5 sm:gap-2">
                            <span className="font-bold text-xs sm:text-[13px] text-slate-900 font-montserrat whitespace-nowrap">
                              With Vacuum
                            </span>
                            <span className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ml-1 ${
                              selectedVacuumOption === "with" ? "border-[#0066cc] bg-[#0066cc]" : "border-slate-300"
                            }`}>
                              {selectedVacuumOption === "with" && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                            </span>
                          </div>
                          <div className="mt-1 flex items-baseline gap-1.5 font-open-sans">
                            <span className="text-sm font-bold text-slate-900">₹37,999</span>
                            <span className="text-[11px] text-slate-400 line-through">₹51,350</span>
                          </div>
                          <span className="text-[10.5px] font-bold text-emerald-600 mt-0.5 font-open-sans">Save ₹13,351 | 26% OFF</span>
                        </button>
                      </div>

                      {/* Savings Upsell Highlight Pill - Shown ONLY when With Vacuum option is selected */}
                      {selectedVacuumOption === "with" && (
                        <div className="mt-3 p-2.5 sm:p-3 bg-[#eafaf1] border border-[#bbf2d7] rounded-2xl flex items-center justify-between gap-2.5 text-[11px] xs:text-xs sm:text-[12.5px] font-open-sans shadow-2xs animate-in fade-in duration-150">
                          <div className="text-[#0e5235] font-bold leading-tight">
                            With Vacuum you are saving <span className="font-extrabold text-[#057a4a]">₹1,351/-</span> more!
                          </div>
                          <div className="bg-[#00965e] text-white px-2.5 py-1 rounded-xl font-extrabold text-[9.5px] sm:text-[10px] tracking-wider uppercase whitespace-nowrap shrink-0 font-montserrat shadow-xs">
                            BEST VALUE
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="w-full h-px bg-slate-100 my-2" />

                    {/* Color Selector */}
                    <div>
                      <p className="text-xs sm:text-sm font-semibold text-[#0F1729] mb-2 font-open-sans flex items-center gap-2">
                        <span>
                          Color: <strong className="font-medium text-slate-800">{currentColor.name}</strong>
                        </span>
                        {!currentColor.inStock && (
                          <span className="text-red-600 bg-red-50 border border-red-200 text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full">
                            Out of Stock
                          </span>
                        )}
                      </p>
                      <div className="flex items-center gap-3 py-0.5">
                        {PRODUCT_DATA.colors.map((c, idx) => (
                          <button
                            key={c.name}
                            onClick={() => handleColorChange(idx)}
                            className={`relative w-9.5 h-9.5 sm:w-10 sm:h-10 rounded-[12px] p-[3px] bg-white transition-colors cursor-pointer flex items-center justify-center ${
                              selectedColorIndex === idx
                                ? "border-[2.5px] border-[#0066cc]"
                                : "border-[1.5px] border-slate-200 hover:border-slate-300"
                            }`}
                            aria-label={`Select ${c.name} color${!c.inStock ? " (Out of Stock)" : ""}`}
                          >
                            <span
                              style={{ backgroundColor: c.hex }}
                              className="w-full h-full rounded-[7px] relative flex items-center justify-center overflow-hidden"
                            >
                              {!c.inStock && (
                                <span className="w-[140%] h-[2.5px] bg-red-500 rotate-45 absolute" />
                              )}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="w-full h-px bg-slate-100 my-2" />

                    {/* Quantity Stepper & Deliver within 4-6 Days (Same Row) */}
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      {/* Quantity Stepper */}
                      <div
                        className={`inline-flex items-center bg-[#f1f5f9] rounded-full px-3 py-1 sm:px-3.5 sm:py-1.5 transition-opacity ${
                          !currentColor.inStock ? "opacity-40 pointer-events-none" : ""
                        }`}
                      >
                        <button
                          onClick={() => handleQuantityChange(-1)}
                          disabled={quantity <= 1 || !currentColor.inStock}
                          className="text-slate-700 hover:text-slate-950 font-bold px-2 py-0.5 text-base disabled:opacity-30 cursor-pointer"
                          aria-label="Decrease quantity"
                        >
                          &minus;
                        </button>
                        <span className="px-3 text-sm font-bold text-slate-900 min-w-[20px] text-center select-none">
                          {quantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(1)}
                          disabled={quantity >= MAX_QUANTITY_LIMIT || !currentColor.inStock}
                          className="text-slate-700 hover:text-slate-950 font-bold px-2 py-0.5 text-base disabled:opacity-30 cursor-pointer"
                          aria-label="Increase quantity"
                        >
                          &#43;
                        </button>
                      </div>

                      {/* Delivery Info on right side */}
                      <div className="flex items-center gap-2 text-xs sm:text-[13px] text-slate-800 font-semibold font-open-sans">
                        <Image
                          src="/aquaforceforautocare/images/TRUCK-03.svg"
                          alt="Express Delivery Truck"
                          width={36}
                          height={36}
                          className="shrink-0 w-8 h-8 sm:w-9 sm:h-9 object-contain"
                        />
                        <span>Express delivery in 6 to 8 days</span>
                      </div>
                    </div>

                    {/* Collapsible Note: Personal Use Only */}
                    <div className="rounded-xl border border-amber-200/90 bg-amber-50/80 px-3 py-1.5 sm:py-2 text-xs font-open-sans text-amber-950 transition-all duration-200">
                      {!isImportantNoteOpen ? (
                        <div className="flex items-center gap-1.5 min-w-0 whitespace-nowrap overflow-hidden leading-tight">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <strong className="font-bold text-amber-950 shrink-0">Note – Personal Use Only:</strong>
                          <span className="text-amber-900/90 truncate min-w-0">
                            This model is exclusively designed for personal use &amp; is not intended for professional or business applications
                          </span>
                          <span className="text-slate-400 shrink-0">...</span>
                          <button
                            type="button"
                            onClick={() => setIsImportantNoteOpen(true)}
                            className="font-bold text-[#0066cc] hover:text-[#004d99] hover:underline cursor-pointer shrink-0"
                          >
                            Show more
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-start gap-1.5 leading-relaxed animate-in fade-in duration-150">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                          <div className="text-amber-900/90 flex-1">
                            <strong className="font-bold text-amber-950 mr-1">Note – Personal Use Only:</strong>
                            <span>
                              This model is exclusively designed for personal use &amp; is not intended for professional or business applications. Commercial usage &amp; support are not covered under this model.
                            </span>
                            <div className="pt-1">
                              For business use, please purchase our Commercial Model:{" "}
                              <a
                                href="https://promectools.in/aquaforceforgigworkers"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-bold text-[#0066cc] hover:text-[#004d99] hover:underline inline-flex items-center gap-0.5"
                              >
                                service partners
                                <ArrowUpRight className="w-3 h-3 inline shrink-0" />
                              </a>
                              .{" "}
                              <button
                                type="button"
                                onClick={() => setIsImportantNoteOpen(false)}
                                className="font-bold text-[#0066cc] hover:text-[#004d99] hover:underline cursor-pointer inline whitespace-nowrap ml-1"
                              >
                                Show less
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="w-full h-px bg-slate-100 my-2" />

                    {/* 1. Warranty & Returns */}
                    <div ref={replacementRef} className="space-y-2 pt-0.5 scroll-mt-4">
                      <h3 className="font-semibold text-xs sm:text-sm text-[#0F1729] font-open-sans">
                        Warranty &amp; Returns
                      </h3>
                      <ul className="space-y-1.5 text-xs text-slate-600 font-open-sans">
                        <li className="flex items-center gap-2">
                          <span className="text-slate-400 font-normal">-</span>
                          <span>1- year limited warranty on the product + 2-Years of Service Support</span>
                        </li>
                        <li className="space-y-2">
                          <button
                            type="button"
                            onClick={() => toggleSection(setIsReplacementOpen, replacementRef)}
                            className="flex items-center justify-between w-full text-left text-xs text-slate-600 hover:text-slate-900 font-normal font-open-sans cursor-pointer group py-0.5"
                          >
                            <span className="flex items-center gap-2">
                              <span className="text-slate-400 font-normal">-</span>
                              <span className="font-normal text-slate-600">10 Days Replacement by Brand</span>
                            </span>
                            <ChevronDown
                              size={14}
                              className={`text-slate-500 transition-transform duration-200 ${
                                isReplacementOpen ? "rotate-180" : ""
                              }`}
                            />
                          </button>

                          {isReplacementOpen && (
                            <div className="space-y-4 text-xs sm:text-[13px] font-open-sans animate-in fade-in duration-150 pt-2 text-slate-800 border-t border-slate-100 mt-2">
                              {/* Clean Amazon-Style Replacement Table */}
                              <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse text-xs sm:text-[13px]">
                                  <thead>
                                    <tr className="border-b border-slate-300 text-slate-900 font-bold font-open-sans">
                                      <th className="py-2.5 pr-3 font-bold text-slate-900 w-2/5">Replacement Reason</th>
                                      <th className="py-2.5 px-3 font-bold text-slate-900 w-3/10">Replacement Period</th>
                                      <th className="py-2.5 pl-3 font-bold text-slate-900 w-3/10">Replacement Policy</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-200">
                                    <tr>
                                      <td className="py-3 pr-3 text-slate-800 font-medium leading-snug">Physical Damage, Wrong and Missing Item</td>
                                      <td className="py-3 px-3 text-slate-700 font-normal">10 days from delivery</td>
                                      <td className="py-3 pl-3 text-slate-800 font-medium">Replacement</td>
                                    </tr>
                                    <tr>
                                      <td className="py-3 pr-3 text-slate-800 font-medium leading-snug">Defective Item</td>
                                      <td className="py-3 px-3 text-slate-700 font-normal">10 days from delivery</td>
                                      <td className="py-3 pl-3 text-slate-800 font-medium leading-snug">PROMEC warranty policy (Repair/Replacement by PROMEC)</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>

                              <div className="w-full h-px bg-slate-200 my-3" />

                              {/* Info Section with Blue Icon */}
                              <div className="flex items-start gap-2.5">
                                <Info size={18} className="text-[#0066cc] shrink-0 mt-0.5" />
                                <div className="space-y-2 text-xs sm:text-[13px] text-slate-800">
                                  <div>
                                    <strong className="font-bold text-slate-900">Defective item:</strong>
                                    <ul className="pl-4 space-y-1 mt-1 text-slate-700 list-disc">
                                      <li>PROMEC will provide On-call support followed by a Technician inspection at your location.</li>
                                      <li>PROMEC expert will repair the product or provide a replacement as applicable. The time taken for resolution will be as per PROMEC policies.</li>
                                    </ul>
                                  </div>

                                  <div className="pt-1">
                                    <strong className="font-bold text-slate-900">Physical Damage, Wrong, Missing Items:</strong>
                                    <ul className="pl-4 space-y-1 mt-1 text-slate-700 list-disc">
                                      <li>Returns will not be accepted if it is an Open Box Delivery order.</li>
                                      <li>Remote verification by image/video will be done by PROMEC</li>
                                    </ul>
                                  </div>
                                </div>
                              </div>

                              {/* Know More Sub-Section */}
                              <div className="pt-2 space-y-4">
                                <button
                                  type="button"
                                  onClick={() => setIsKnowMoreOpen((prev) => !prev)}
                                  className="font-semibold text-xs text-[#0066cc] flex items-center gap-1 cursor-pointer hover:underline select-none"
                                >
                                  <span>Know More</span>
                                  {isKnowMoreOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                </button>

                                {isKnowMoreOpen && (
                                  <div className="space-y-4 animate-in fade-in duration-150 pt-1">
                                    {/* Replacement verification Card */}
                                    <div className="space-y-1.5">
                                      <h4 className="font-bold text-sm text-slate-900 font-open-sans">Replacement verification</h4>
                                      <div className="flex items-start gap-3.5 pt-1">
                                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200/80">
                                          <Headphones size={28} className="text-slate-700 stroke-[1.5]" />
                                        </div>
                                        <p className="text-xs sm:text-[12.5px] text-slate-700 leading-relaxed font-open-sans">
                                          During on-call support, you may be prompted to upload an image for verification. Further inspection or repair will be done at your doorstep by PROMEC as per their warranty policies.
                                        </p>
                                      </div>
                                    </div>

                                    {/* Replacement Instructions Card */}
                                    <div className="space-y-1.5 pt-1">
                                      <h4 className="font-bold text-sm text-slate-900 font-open-sans">Replacement Instructions</h4>
                                      <div className="flex items-start gap-3.5 pt-1">
                                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200/80">
                                          <PackageCheck size={28} className="text-slate-700 stroke-[1.5]" />
                                        </div>
                                        <p className="text-xs sm:text-[12.5px] text-slate-700 leading-relaxed font-open-sans">
                                          Keep the item in its original condition and packaging along with MRP tag, warranty card and accessories for a successful pick-up.
                                        </p>
                                      </div>
                                    </div>

                                    {/* Read full returns policy > Link (Toggles Inline Dropdown inside Know More) */}
                                    <div className="pt-3 border-t border-slate-200/80">
                                      <button
                                        type="button"
                                        onClick={() => toggleSection(setIsFullReturnPolicyOpen, returnPolicyRef)}
                                        className="inline-flex items-center gap-1 text-[#0066cc] hover:text-[#0052b3] text-xs sm:text-[13px] font-semibold font-open-sans cursor-pointer hover:underline"
                                      >
                                        <span>Read full returns policy</span>
                                        <ChevronRight
                                          size={14}
                                          className={`stroke-[2.5] transition-transform duration-200 ${
                                            isFullReturnPolicyOpen ? "rotate-90" : ""
                                          }`}
                                        />
                                      </button>

                                      {isFullReturnPolicyOpen && (
                                        <div ref={returnPolicyRef} className="space-y-4 text-xs sm:text-[13px] font-open-sans text-slate-800 animate-in fade-in duration-150 pt-3 leading-relaxed border-t border-slate-100 mt-2">
                                          {/* Preamble Card */}
                                          <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-lg text-slate-700 font-medium">
                                            At <strong className="font-bold text-[#0066cc]">AquaForce®</strong>, we ensure that every product is properly checked and packed before dispatch. Returns and refunds are accepted only under the conditions mentioned below.
                                          </div>

                                          {/* Return Period */}
                                          <div className="space-y-1.5 border-b border-slate-100 pb-3">
                                            <h4 className="font-bold text-xs sm:text-sm text-slate-900 font-open-sans">
                                              Return Period
                                            </h4>
                                            <ul className="pl-4 space-y-1 text-slate-600 list-disc font-open-sans">
                                              <li>Return requests must be raised within <strong>7 days</strong> of delivery.</li>
                                              <li>Returns are accepted only for damaged, defective, incorrect, or incomplete products.</li>
                                            </ul>
                                          </div>

                                          {/* Product Condition */}
                                          <div className="space-y-1.5 border-b border-slate-100 pb-3">
                                            <h4 className="font-bold text-xs sm:text-sm text-slate-900 font-open-sans">
                                              Product Condition
                                            </h4>
                                            <p className="pl-4 font-semibold text-slate-800 font-open-sans">For a return to be accepted, the product must:</p>
                                            <ul className="pl-8 space-y-1 text-slate-600 list-disc font-open-sans">
                                              <li>Be unused or only tested for the reported issue.</li>
                                              <li>Have no scratches, dents, cracks, stains, or physical damage caused by the customer.</li>
                                              <li>Not be opened, dismantled, repaired, modified, or misused.</li>
                                              <li>Include all original parts, accessories, attachments, manuals, warranty card, and packaging.</li>
                                            </ul>
                                          </div>

                                          {/* Returns Not Accepted */}
                                          <div className="space-y-1.5 border-b border-slate-100 pb-3">
                                            <h4 className="font-bold text-xs sm:text-sm text-slate-900 font-open-sans">
                                              Returns Not Accepted
                                            </h4>
                                            <p className="pl-4 font-semibold text-slate-800 font-open-sans">Returns will not be accepted for:</p>
                                            <ul className="pl-8 space-y-1 text-slate-600 list-disc font-open-sans">
                                              <li>Customer-caused damage or improper use.</li>
                                              <li>Scratches, dents, cracks, or signs of excessive use.</li>
                                              <li>Missing parts or accessories.</li>
                                              <li>Products that have been opened, modified, repaired, or dismantled.</li>
                                              <li>Normal wear and tear.</li>
                                              <li>Return requests made after the return period.</li>
                                            </ul>
                                          </div>

                                          {/* Unboxing Video */}
                                          <div className="space-y-1.5 border-b border-slate-100 pb-3">
                                            <h4 className="font-bold text-xs sm:text-sm text-slate-900 font-open-sans">
                                              Unboxing Video
                                            </h4>
                                            <p className="pl-4 text-slate-600 leading-relaxed font-open-sans">
                                              Customers are strongly advised to record a complete unboxing video. It may be required for claims related to transit damage, missing parts, or incorrect products.
                                            </p>
                                          </div>

                                          {/* Return Request */}
                                          <div className="space-y-1.5 border-b border-slate-100 pb-3">
                                            <h4 className="font-bold text-xs sm:text-sm text-slate-900 font-open-sans">
                                              Return Request
                                            </h4>
                                            <p className="pl-4 font-semibold text-slate-800 font-open-sans">To request a return, contact AquaForce® Customer Support with:</p>
                                            <ul className="pl-8 space-y-1 text-slate-600 list-disc font-open-sans">
                                              <li>Order number</li>
                                              <li>Reason for return</li>
                                              <li>Photos/videos of the product and packaging</li>
                                              <li>Unboxing video, if available</li>
                                            </ul>
                                            <p className="pl-4 text-xs text-slate-500 font-medium italic mt-0.5 font-open-sans">
                                              All return requests are subject to verification and approval.
                                            </p>
                                          </div>

                                          {/* Refund / Replacement */}
                                          <div className="space-y-1.5 border-b border-slate-100 pb-3">
                                            <h4 className="font-bold text-xs sm:text-sm text-slate-900 font-open-sans">
                                              Refund / Replacement
                                            </h4>
                                            <p className="pl-4 font-semibold text-slate-800 font-open-sans">After inspection and approval:</p>
                                            <ul className="pl-8 space-y-1 text-slate-600 list-disc font-open-sans">
                                              <li>A replacement may be provided where applicable.</li>
                                              <li>If a refund is approved, it will be processed through the applicable payment method.</li>
                                              <li>Refunds may be adjusted for missing parts, customer-caused damage, or other applicable charges.</li>
                                            </ul>
                                          </div>

                                          {/* Warranty */}
                                          <div className="space-y-1.5">
                                            <h4 className="font-bold text-xs sm:text-sm text-slate-900 font-open-sans">
                                              Warranty
                                            </h4>
                                            <p className="pl-4 text-slate-600 leading-relaxed font-open-sans">
                                              Technical issues reported after the return period may be covered under the manufacturer warranty, subject to warranty terms and conditions.
                                            </p>
                                          </div>

                                          {/* Reserved Rights Banner */}
                                          <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-lg text-xs text-amber-900 font-medium leading-relaxed">
                                            AquaForce® reserves the right to approve or reject any return, replacement, or refund request based on product condition and verification.
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </li>
                      </ul>
                    </div>

                    <div className="w-full h-px bg-slate-100 my-4" />

                    {/* 2. Product Highlights (Accordion) */}
                    <div ref={highlightsRef} className="space-y-2.5 pt-0.5 scroll-mt-4">
                      <button
                        type="button"
                        onClick={() => toggleSection(setIsHighlightsOpen, highlightsRef)}
                        className="w-full flex items-center justify-between text-left font-semibold text-sm sm:text-[15px] text-[#0F1729] font-open-sans cursor-pointer group"
                      >
                        <span>Product Highlights</span>
                        <ChevronDown
                          size={16}
                          className={`text-slate-500 transition-transform duration-200 ${
                            isHighlightsOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      {isHighlightsOpen && (
                        <div className="space-y-3 text-xs sm:text-[13px] font-open-sans animate-in fade-in duration-150">
                          <div className="grid grid-cols-12 gap-3 items-start">
                            <div className="col-span-4 sm:col-span-4 text-slate-800 font-medium">Battery Powered</div>
                            <div className="col-span-8 sm:col-span-8 text-slate-500">no cables, no power sockets, no fixed setup needed</div>
                          </div>
                          <div className="grid grid-cols-12 gap-3 items-start">
                            <div className="col-span-4 sm:col-span-4 text-slate-800 font-medium">Lightweight Design</div>
                            <div className="col-span-8 sm:col-span-8 text-slate-500">portable and easy to carry and maneuver around the job</div>
                          </div>
                          <div className="grid grid-cols-12 gap-3 items-start">
                            <div className="col-span-4 sm:col-span-4 text-slate-800 font-medium">Go Cordless</div>
                            <div className="col-span-8 sm:col-span-8 text-slate-500">clean anywhere without being tethered to a wall outlet</div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="w-full h-px bg-slate-100 my-4" />

                    {/* 3. Technical Specifications (Accordion) */}
                    <div ref={specsRef} className="space-y-3 pt-1 scroll-mt-4">
                      <button
                        type="button"
                        onClick={() => toggleSection(setIsSpecsOpen, specsRef)}
                        className="w-full flex items-center justify-between text-left font-semibold text-sm sm:text-[15px] text-[#0F1729] font-open-sans cursor-pointer group"
                      >
                        <span>Technical Specifications</span>
                        <ChevronDown
                          size={16}
                          className={`text-slate-500 transition-transform duration-200 ${
                            isSpecsOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      {isSpecsOpen && (
                        <div className="space-y-3 text-xs sm:text-[13px] font-open-sans animate-in fade-in duration-150 pt-1">
                          <div className="grid grid-cols-12 gap-3 items-start">
                            <div className="col-span-5 sm:col-span-4 text-slate-800 font-medium">Water Pressure &amp; Flow Rate</div>
                            <div className="col-span-7 sm:col-span-8 text-slate-500">&gt;1,400 PSI pressure and 7 L/min flow rate for powerful cleaning</div>
                          </div>

                          <div className="grid grid-cols-12 gap-3 items-start">
                            <div className="col-span-5 sm:col-span-4 text-slate-800 font-medium">Vacuum Suction Power</div>
                            <div className="col-span-7 sm:col-span-8 text-slate-500">&gt;12 kPa suction pressure to easily pick up dirt and debris</div>
                          </div>

                          <div className="grid grid-cols-12 gap-3 items-start">
                            <div className="col-span-5 sm:col-span-4 text-slate-800 font-medium">Ultra-Quiet Operation</div>
                            <div className="col-span-7 sm:col-span-8 text-slate-500">noise levels kept low at 40–52 dBA for the pressure washer and 45–58 dBA for the vacuum</div>
                          </div>

                          <div className="grid grid-cols-12 gap-3 items-start">
                            <div className="col-span-5 sm:col-span-4 text-slate-800 font-medium">Power &amp; Performance</div>
                            <div className="col-span-7 sm:col-span-8 text-slate-500">580 W rated power for the pressure washer and 450 W for the vacuum cleaner</div>
                          </div>

                          <div className="grid grid-cols-12 gap-3 items-start">
                            <div className="col-span-5 sm:col-span-4 text-slate-800 font-medium">Hose &amp; Cable Reach</div>
                            <div className="col-span-7 sm:col-span-8 text-slate-500">includes a 22 ft washer hose and a 20 ft (6 m) vacuum cable for convenient movement</div>
                          </div>

                          <div className="grid grid-cols-12 gap-3 items-start">
                            <div className="col-span-5 sm:col-span-4 text-slate-800 font-medium">Fast &amp; Safe Charging</div>
                            <div className="col-span-7 sm:col-span-8 text-slate-500">84V / 6A charger with multi-layer safety protections (short circuit, over-voltage, over-temperature)</div>
                          </div>

                          <div className="grid grid-cols-12 gap-3 items-start">
                            <div className="col-span-5 sm:col-span-4 text-slate-800 font-medium">Total Kit Weight</div>
                            <div className="col-span-7 sm:col-span-8 text-slate-500">8 kg complete kit weight (6 kg washer, 2 kg vacuum)</div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="w-full h-px bg-slate-100 my-4" />

                    {/* 4. What's In The Box (Accordion) */}
                    <div ref={boxRef} className="space-y-3 pt-1 pb-2 scroll-mt-4">
                      <button
                        type="button"
                        onClick={() => toggleSection(setIsBoxOpen, boxRef)}
                        className="w-full flex items-center justify-between text-left font-semibold text-sm sm:text-[15px] text-[#0F1729] font-open-sans cursor-pointer group"
                      >
                        <span>What&apos;s In The Box</span>
                        <ChevronDown
                          size={16}
                          className={`text-slate-500 transition-transform duration-200 ${
                            isBoxOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      {isBoxOpen && (
                        <ul className="space-y-2 text-xs sm:text-[13px] text-slate-600 font-open-sans animate-in fade-in duration-150">
                          <li className="flex items-center gap-2">
                            <span className="text-slate-400 font-normal">-</span> Cordless Pressure Washer
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="text-slate-400 font-normal">-</span> Lance with Nozzle 0/15/25/45
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="text-slate-400 font-normal">-</span> Bucket 15ltr
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="text-slate-400 font-normal">-</span> Foam Gun
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="text-slate-400 font-normal">-</span> Pressure Hose Pipe
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="text-slate-400 font-normal">-</span> Pressure Gun
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="text-slate-400 font-normal">-</span> Charger
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="text-slate-400 font-normal">-</span> Corded Vacuum with Accessories
                          </li>
                        </ul>
                      )}
                    </div>
                  </div>

                  {/* Desktop Bottom Buy Now Action Button */}
                  <div className="hidden lg:block shrink-0 pt-3 pb-1 border-t border-slate-100 mt-2 bg-white/95 backdrop-blur-xs sticky bottom-0 z-20">
                    {currentColor.inStock ? (
                      <button
                        onClick={() => {
                          setPaymentMethod("FULL_ONLINE");
                          setOnlinePaymentMode("FULL");
                          setIsCheckingOut(true);
                        }}
                        className="w-full h-12 sm:h-12.5 bg-[#0066cc] hover:bg-[#0055b3] active:bg-[#004799] text-white font-bold font-montserrat text-sm tracking-wider uppercase rounded-[8px] shadow-[0_6px_18px_rgba(0,102,204,0.28)] transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                      >
                        BUY NOW
                      </button>
                    ) : (
                      <button
                        disabled
                        className="w-full h-12 bg-slate-100 border border-slate-200 text-slate-400 font-bold font-montserrat text-sm tracking-wider uppercase rounded-[8px] cursor-not-allowed flex items-center justify-center select-none"
                      >
                        OUT OF STOCK
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Bottom Buy Now Bar (Pinned at bottom of full-screen page, NO text below) */}
            <div
              style={{ paddingBottom: "calc(0.875rem + env(safe-area-inset-bottom, 0px))" }}
              className="block lg:hidden shrink-0 bg-white border-t border-slate-100 px-4 pt-3.5 sm:px-6 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] z-20"
            >
              {currentColor.inStock ? (
                <button
                  onClick={() => {
                    setPaymentMethod("FULL_ONLINE");
                    setOnlinePaymentMode("FULL");
                    setIsCheckingOut(true);
                  }}
                  className="w-full h-12 bg-[#0066cc] hover:bg-[#0055b3] active:bg-[#004799] text-white font-bold font-montserrat text-sm tracking-wider uppercase rounded-[8px] shadow-[0_6px_18px_rgba(0,102,204,0.28)] transition-all active:scale-[0.99] cursor-pointer"
                >
                  BUY NOW
                </button>
              ) : (
                <button
                  disabled
                  className="w-full h-12 bg-slate-100 border border-slate-200 text-slate-400 font-bold font-montserrat text-sm tracking-wider uppercase rounded-[8px] cursor-not-allowed flex items-center justify-center select-none"
                >
                  OUT OF STOCK
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {/* "Save more with payment offers" Modal / Sheet (Exact match to media_1790941958036.png) */}
      {isOffersModalOpen && (
        <div
          className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200"
          onClick={() => setIsOffersModalOpen(false)}
        >
          <div
            className="bg-white w-full sm:max-w-xl max-h-[88vh] rounded-t-3xl sm:rounded-2xl flex flex-col shadow-2xl overflow-hidden border border-slate-200 animate-in slide-in-from-bottom duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="shrink-0 px-4 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
              <div className="flex items-center gap-2.5 min-w-0">
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900 font-montserrat truncate">
                  Save more with payment offers
                </h3>
                <span className="shrink-0 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  {liveRazorpayOffers.length > 0 ? liveRazorpayOffers.length : (REAL_RAZORPAY_CASHBACK_OFFERS.length + PROMEC_PAYLATER_OFFERS_METADATA.length)} Offers Available
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsOffersModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                aria-label="Close offers"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body: Scrollable list of verified cards */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 no-scrollbar bg-slate-50/40">
              {(() => {
                const availableBanks = (liveEmiBanks && liveEmiBanks.length > 0) ? liveEmiBanks : DEFAULT_EMI_BANKS;
                const offersToDisplay =
                  liveRazorpayOffers.length > 0
                    ? liveRazorpayOffers
                    : [
                        ...REAL_RAZORPAY_CASHBACK_OFFERS.map((meta) => ({
                          id: meta.id,
                          name: meta.title,
                          displayName: meta.title,
                          bankCode: meta.bankCode,
                          bankName: meta.bankName,
                          bankLogo: meta.logo,
                          cardType: "credit",
                          description: meta.subtitle,
                          tnc: meta.tnc,
                          cashbackAmount: Math.min(
                            Math.round((totalPrice * meta.cashbackPercent) / 100),
                            meta.maxBenefitRupees
                          ),
                          cashbackText: `${meta.cashbackPercent}% Cashback`,
                          badgeText: `${meta.cashbackPercent}% Cashback`,
                        })),
                        ...PROMEC_PAYLATER_OFFERS_METADATA.map((meta) => ({
                          id: meta.id,
                          name: meta.displayName,
                          displayName: meta.displayName,
                          bankCode: meta.bankCode,
                          bankName: meta.bankName,
                          bankLogo: `https://cashfreelogo.cashfree.com/assets_images/pg/nb/64/${meta.bankCode.toLowerCase()}.png`,
                          cardType: meta.cardType,
                          description: meta.description,
                          tnc: meta.tnc,
                          cashbackAmount: 0,
                          cashbackText: "0% Interest No Cost EMI",
                          badgeText: "NO COST EMI",
                        })),
                      ];

                return offersToDisplay.map((off: any) => {
                  const matchingBank = availableBanks.find(
                    (b) =>
                      b.code === off.bankCode ||
                      b.id === off.bankCode?.toLowerCase() ||
                      (off.bankCode === "HDFC" && (b.id === "hdfc" || b.id === "hdfc_dc")) ||
                      b.name.toLowerCase().includes(off.bankCode?.toLowerCase())
                  );

                  const isNeuCard = off.bankCode === "HDFC" || off.name?.toLowerCase().includes("neu");

                  return (
                    <div
                      key={off.id}
                      className="p-3.5 sm:p-4 rounded-xl border border-slate-200/90 bg-white hover:border-slate-300 transition-all shadow-2xs"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-lg bg-white border border-slate-200/80 p-1 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs mt-0.5">
                            {(() => {
                              const bCode = (off.bankCode || "").toUpperCase();
                              const bName = (off.bankName || off.name || "").toLowerCase();

                              // 1. Tata NeuCard
                              if (bCode === "HDFC" || bName.includes("neu")) {
                                return (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none">
                                      <rect x="2.5" y="2.5" width="19" height="19" rx="4" stroke="#DC2626" strokeWidth="2.5" fill="none" />
                                      <path d="M7 8H10V16H7" stroke="#003366" strokeWidth="2.2" strokeLinecap="round" />
                                      <path d="M17 8H14V16H17" stroke="#003366" strokeWidth="2.2" strokeLinecap="round" />
                                    </svg>
                                  </div>
                                );
                              }

                              // 2. HSBC (Iconic Red Hexagon - Never Axis!)
                              if (bCode === "HSBC" || bName.includes("hsbc")) {
                                return (
                                  <div className="w-full h-full flex items-center justify-center p-0.5">
                                    <svg viewBox="0 0 32 32" className="w-full h-full" fill="none">
                                      <path d="M0 16L8 8V24L0 16Z" fill="#DB0011" />
                                      <path d="M32 16L24 8V24L32 16Z" fill="#DB0011" />
                                      <path d="M16 0L8 8H24L16 0Z" fill="#DB0011" />
                                      <path d="M16 32L8 24H24L16 32Z" fill="#DB0011" />
                                    </svg>
                                  </div>
                                );
                              }

                              // 3. Yes Bank (Official Razorpay Red Checkmark Icon)
                              if (bCode === "YESB" || bName.includes("yes")) {
                                return (
                                  <div className="w-full h-full flex items-center justify-center p-0.5">
                                    <svg viewBox="0 0 24 24" className="w-full h-full" fill="none">
                                      <path d="M5 12.5L9.5 17L19 7" stroke="#ED1C24" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                  </div>
                                );
                              }

                              // 4. IDFC FIRST Bank
                              if (bCode === "IDFB" || bName.includes("idfc")) {
                                return (
                                  <img
                                    src="https://cashfreelogo.cashfree.com/assets_images/pg/nb/64/idfc.png"
                                    alt="IDFC FIRST Bank"
                                    className="w-full h-full object-contain"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = "https://cashfreelogo.cashfree.com/assets_images/pg/nb/64/idfc.png";
                                    }}
                                  />
                                );
                              }

                              // 5. Axis Bank
                              if (bCode === "UTIB" || bName.includes("axis")) {
                                return (
                                  <img
                                    src="https://cashfreelogo.cashfree.com/assets_images/pg/nb/64/axis.png"
                                    alt="Axis Bank"
                                    className="w-full h-full object-contain"
                                  />
                                );
                              }

                              return (
                                <img
                                  src={off.bankLogo || matchingBank?.logo || "https://cashfreelogo.cashfree.com/assets_images/pg/nb/64/axis.png"}
                                  alt={off.bankName}
                                  className="w-full h-full object-contain"
                                />
                              );
                            })()}
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-bold text-xs sm:text-[13.5px] text-slate-900 leading-snug font-montserrat">
                              {off.displayName || off.name}
                            </h4>
                            <div className="mt-1 text-[11px] sm:text-[11.5px] text-slate-500 font-open-sans leading-relaxed">
                              <span>{off.description || off.subtitle || off.name}</span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setExpandedTncOfferId(expandedTncOfferId === off.id ? null : off.id);
                                }}
                                className="text-blue-600 hover:text-blue-800 font-semibold underline cursor-pointer ml-1.5"
                              >
                                • T&Cs
                              </button>
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            const targetBank = matchingBank || availableBanks[0];
                            if (targetBank) {
                              setSelectedEmiBankObj(targetBank);
                              setSelectedEmiBank(targetBank.name);
                              const plans =
                                targetBank.plans && targetBank.plans.length > 0
                                  ? targetBank.plans
                                  : calculateBankEmiPlans(
                                      targetBank.id,
                                      targetBank.code,
                                      targetBank.name,
                                      totalPrice
                                    );
                              const popular = plans.find((p: any) => p.isMostPopular) || plans[0];
                              setSelectedTenure(popular ? popular.months : 6);
                              setSelectedEmiPlan(popular || null);
                              setIsOffersModalOpen(false);
                              setCheckoutStep("emi_plan_select");
                            }
                          }}
                          className="shrink-0 px-4 py-1.5 rounded-lg text-xs font-bold text-[#005DA6] border border-[#005DA6]/40 hover:bg-[#005DA6]/10 active:bg-[#005DA6]/20 transition-all cursor-pointer shadow-2xs"
                        >
                          Apply
                        </button>
                      </div>

                      {expandedTncOfferId === off.id && (
                        <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-slate-600 font-open-sans bg-slate-50 p-2.5 rounded-lg">
                          <div className="font-bold text-slate-800 mb-0.5">Terms & Conditions:</div>
                          <p>{off.tnc || "Valid on eligible credit card EMI transactions above ₹5,000. Cashback is processed directly by the issuing bank."}</p>
                        </div>
                      )}
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Snapmint & All-Bank No-Cost EMI Plans Modal */}
      <EmiCalculatorModal
        isOpen={isEmiModalOpen}
        onClose={() => setIsEmiModalOpen(false)}
        price={currentOfferPrice}
        onSelectEmiOption={(method) => {
          setPaymentMethod(method as any);
          setIsCheckingOut(true);
        }}
      />
    </div>
  );
}
            