import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: "/aquaforceforautocare",
  devIndicators: false,
  async redirects() {
    return [
      {
        source: "/inquiry-form",
        destination: "/inquiryform",
        permanent: false,
      },
      {
        source: "/inquiry",
        destination: "/inquiryform",
        permanent: false,
      },
      {
        source: "/enquiryform",
        destination: "/inquiryform",
        permanent: false,
      },
      {
        source: "/enquiry",
        destination: "/inquiryform",
        permanent: false,
      },
      {
        source: "/aquaforceforhomecare",
        destination: "/aquaforceforautocare?enquiry=bulk&category=homecare",
        basePath: false,
        permanent: false,
      },
      {
        source: "/aquaforceforcorporatecare",
        destination: "/aquaforceforautocare?enquiry=bulk&category=corporate",
        basePath: false,
        permanent: false,
      },
      {
        source: "/aquaforceforhome",
        destination: "/aquaforceforautocare?enquiry=bulk&category=homecare",
        basePath: false,
        permanent: false,
      },
      {
        source: "/aquaforceforcorporate",
        destination: "/aquaforceforautocare?enquiry=bulk&category=corporate",
        basePath: false,
        permanent: false,
      },
      {
        source: "/homecare",
        destination: "/aquaforceforautocare?enquiry=bulk&category=homecare",
        basePath: false,
        permanent: false,
      },
      {
        source: "/corporatecare",
        destination: "/aquaforceforautocare?enquiry=bulk&category=corporate",
        basePath: false,
        permanent: false,
      },
      {
        source: "/aquaforceforhomecare",
        destination: "/aquaforceforautocare?enquiry=bulk&category=homecare",
        permanent: false,
      },
      {
        source: "/aquaforceforcorporatecare",
        destination: "/aquaforceforautocare?enquiry=bulk&category=corporate",
        permanent: false,
      },
      {
        source: "/homecare",
        destination: "/aquaforceforautocare?enquiry=bulk&category=homecare",
        permanent: false,
      },
      {
        source: "/corporatecare",
        destination: "/aquaforceforautocare?enquiry=bulk&category=corporate",
        permanent: false,
      },
      {
        source: "/:path((?!aquaforceforautocare|aquaforceforgigworkers|aquaforceforservicepartner|servicepartner|_next|favicon.ico).+)",
        destination: "/aquaforceforautocare/:path*",
        basePath: false,
        permanent: false,
      },
    ];
  },
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/aquaforceforgigworkers",
          destination: "https://promec-gig-workers.vercel.app/aquaforceforgigworkers",
          basePath: false,
        },
        {
          source: "/aquaforceforgigworkers/:path*",
          destination: "https://promec-gig-workers.vercel.app/aquaforceforgigworkers/:path*",
          basePath: false,
        },
        {
          source: "/aquaforceforservicepartner",
          destination: "https://promec-gig-workers.vercel.app/aquaforceforgigworkers",
          basePath: false,
        },
        {
          source: "/aquaforceforservicepartner/:path*",
          destination: "https://promec-gig-workers.vercel.app/aquaforceforgigworkers/:path*",
          basePath: false,
        },
        {
          source: "/servicepartner",
          destination: "https://promec-gig-workers.vercel.app/aquaforceforgigworkers",
          basePath: false,
        },
      ],
    };
  },
  images: {
    unoptimized: true,
    qualities: [75, 100],
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
};

export default nextConfig;
