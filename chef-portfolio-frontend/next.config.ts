import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Image optimization for Strapi uploads
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '1337',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: '**', // Allow any hostname for production Strapi instances
        pathname: '/uploads/**',
      },
    ],
  },
  
  // Environment variables validation
  env: {
    NEXT_PUBLIC_STRAPI_API_URL: process.env.NEXT_PUBLIC_STRAPI_API_URL,
    NEXT_PUBLIC_STRAPI_BASE_URL: process.env.NEXT_PUBLIC_STRAPI_BASE_URL,
  },
  
  // Performance optimizations
  experimental: {
    optimizeCss: true,
  },
  
  // Output configuration for Vercel
  output: 'standalone',
};

export default nextConfig;
