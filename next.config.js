/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  distDir: 'out',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    unoptimized: true
  },
  trailingSlash: true,
  // Disable caching for smaller build size
  webpack: (config) => {
    config.cache = false;
    return config;
  }
};

module.exports = nextConfig;
