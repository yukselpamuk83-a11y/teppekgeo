/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    unoptimized: true
  },
  // Use standard build for Cloudflare Pages
  experimental: {
    runtime: 'nodejs',
  }
};

module.exports = nextConfig;
