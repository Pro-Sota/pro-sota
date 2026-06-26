import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  images: {
    unoptimized: true,
    qualities: [75, 100]
  },
};

export default nextConfig;
