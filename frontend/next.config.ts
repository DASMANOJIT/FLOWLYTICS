import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,

  // Remove standalone, it triggers prerendering of static pages
  output: undefined,

  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },

  skipTrailingSlashRedirect: true,
  trailingSlash: false,
};

export default nextConfig;
