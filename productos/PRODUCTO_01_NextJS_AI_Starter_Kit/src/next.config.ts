import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
  images: {
    domains: ["avatars.githubusercontent.com", "lh3.googleusercontent.com"],
  },
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  },
  headers: async () => [
    {
      source: "/:path*",
      headers: [
        { key: "X-Frame-Options", value: "DENY" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "X-DNS-Prefetch-Control", value: "on" },
      ],
    },
  ],
  logging: {
    fetches: { fullUrl: true },
  },
};

export default nextConfig;
