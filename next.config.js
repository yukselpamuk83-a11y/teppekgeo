/** @type {import('next').NextConfig} */
const nextConfig = {
  // Cloudflare Pages optimization
  output: 'export',
  distDir: 'out',
  trailingSlash: true,
  
  // Disable image optimization for Cloudflare
  images: { 
    unoptimized: true 
  },
  
  // Build optimizations
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  
  // Environment handling
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  
  // API routes için runtime config (Cloudflare Workers ile uyumlu)
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
  }
};

module.exports = nextConfig;