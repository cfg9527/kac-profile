import type { NextConfig } from "next";

// Static export: pure static HTML/CSS/JS, deployable on Vercel free Hobby
// (or any static host) with no server required.
const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
};

export default nextConfig;
