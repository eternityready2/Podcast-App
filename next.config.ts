import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "keystone.eternityready.com",
        port: "",
        pathname: "/images/**",
      },
    ],
  },
};

export default nextConfig;
