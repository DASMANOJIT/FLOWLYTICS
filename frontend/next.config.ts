import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },

  // REQUIRED for Render SSR deployment
  output: "standalone",
};

export default nextConfig;
