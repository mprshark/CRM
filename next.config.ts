import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required for Supabase image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  // Turbopack root for monorepo usage
  turbopack: {
    root: '/Users/pranshu/Desktop/shark',
  },
};

export default nextConfig;
