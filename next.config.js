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
  // Disable caching for smaller build size
  webpack: (config) => {
    config.cache = false;
    return config;
  }
};

module.exports = nextConfig;
