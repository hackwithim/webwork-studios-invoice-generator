import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output: "standalone", // Removed because it causes Server Action 404s on Vercel
  serverExternalPackages: ["whatsapp-web.js", "puppeteer"],
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
