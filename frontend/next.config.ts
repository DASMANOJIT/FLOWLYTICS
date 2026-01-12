import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Required on Render
  output: "standalone",

  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },

  // Prevent prerender errors
  skipTrailingSlashRedirect: true,
  trailingSlash: false,
};

export default nextConfig;
