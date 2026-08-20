import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  experimental: {
    staleTimes: {
      dynamic: 300
    },
    globalNotFound: true
  },
  trailingSlash: true,
  reactStrictMode: true
};

export default nextConfig;
