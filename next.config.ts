import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // AVIF first, WebP as the fallback — both are far below PNG for screenshots.
    formats: ["image/avif", "image/webp"],
  },
  // Trim the icon barrel so only the icons actually used are bundled.
  experimental: {
    optimizePackageImports: ["lucide-react", "motion"],
  },
  poweredByHeader: false,
  reactStrictMode: true,
};

export default nextConfig;
