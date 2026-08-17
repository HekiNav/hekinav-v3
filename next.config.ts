import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  experimental: {
    globalNotFound: true
  },
  trailingSlash: true,
  reactStrictMode: true
};

export default nextConfig;
