import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // assetPrefix is intentionally omitted for static export
  // Static files must use relative paths to work with Tauri's file:// protocol
};

export default nextConfig;
