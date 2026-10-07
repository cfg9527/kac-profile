import type { NextConfig } from "next";

// Normal Next.js app on Vercel (Node.js runtime). The home page is still
// statically generated (force-static, Neon read at build time); only
// POST /api/recommend runs per request.
const nextConfig: NextConfig = {};

export default nextConfig;
