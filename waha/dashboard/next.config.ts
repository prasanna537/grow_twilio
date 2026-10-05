import type { NextConfig } from "next";

const WAHA_BASE_URL =
  process.env.NEXT_PUBLIC_WAHA_BASE_URL || "http://localhost:3000";

const isExport = process.env.NEXT_EXPORT === "true";

const nextConfig: NextConfig = {
  ...(isExport ? { output: "export", basePath: "/dashboard" } : {}),
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "**" },
      { protocol: "https", hostname: "**" },
    ],
    unoptimized: true,
  },
  async rewrites() {
    if (isExport) return [];
    return [
      {
        source: "/waha-api/:path*",
        destination: `${WAHA_BASE_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
