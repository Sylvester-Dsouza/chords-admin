import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ['vglfzwcblteoevqqornt.supabase.co'],
  },
  // Disable ESLint during builds for deployment
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Disable TypeScript type checking during builds for deployment
  typescript: {
    ignoreBuildErrors: true,
  },
  // Disable static generation for all routes
  output: 'standalone',
};

export default nextConfig;
