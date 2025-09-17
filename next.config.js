/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove static export to enable API routes
  // output: 'export',
  // distDir: 'out',
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
  },
  // Custom build ID for tracking
  async generateBuildId() {
    return 'teppekgeo-dynamic';
  }
};

module.exports = nextConfig;
