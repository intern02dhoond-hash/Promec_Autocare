import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Inter, Montserrat, Montserrat_Alternates, Open_Sans, Unbounded } from "next/font/google";
import "./globals.css";
import { OrderModalProvider } from "@/context/OrderModalContext";
import { BulkEnquiryProvider } from "@/context/BulkEnquiryContext";
import Preloader from "@/components/Preloader";
import GoogleAnalytics from "@/components/GoogleAnalytics";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#ffffff",
};

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const montserratAlternates = Montserrat_Alternates({
  subsets: ["latin"],
  variable: "--font-montserrat-alternates",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const openSans = Open_Sans({
  subsets: ["latin"],
  variable: "--font-open-sans",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

const unbounded = Unbounded({
  subsets: ["latin"],
  variable: "--font-unbounded",
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://promectools.in"),
  title: "Aquaforce® 1400 | Cordless. Powerful. Portable.",
  description:
    "Wash your car anywhere with the Aquaforce® 1400 - a powerful, battery-powered portable pressure washer. No cables, no power socket, no fixed setup needed.",
  verification: {
    google: "chwYmglPbeV2UvIMJ7y1GhjaKnfr8xfIUUIvRl5ekmI",
  },
  icons: {
    icon: [
      { url: "/aquaforceforautocare/images/favicon.ico" },
      { url: "/aquaforceforautocare/favicon.ico" },
    ],
    shortcut: "/aquaforceforautocare/images/favicon.ico",
    apple: "/aquaforceforautocare/images/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        {/* Google tag (gtag.js) - GTM-W9LLLTN9 */}
        <script
          async
          src="https://www.googletagmanager.com/gtm.js?id=GTM-W9LLLTN9"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
            `,
          }}
        />
        {/* Meta Pixel Code */}
        <Script
          id="meta-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '1598152518363621');
              fbq('track', 'PageView');
            `,
          }}
        />
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=1598152518363621&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
        {/* Google Analytics 4 (GA4) */}
        <GoogleAnalytics />
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes preloader-slide {
            0% { transform: translateX(-10%); }
            50% { transform: translateX(130%); }
            100% { transform: translateX(290%); }
          }
        ` }} />
      </head>
      <body className={`${inter.variable} ${montserrat.variable} ${montserratAlternates.variable} ${openSans.variable} ${unbounded.variable} antialiased font-sans`}>
        <Preloader />
        <OrderModalProvider>
          <BulkEnquiryProvider>{children}</BulkEnquiryProvider>
        </OrderModalProvider>
      </body>
    </html>
  );
}
