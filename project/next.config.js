/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { 
    unoptimized: true 
  },
  // Remove output: 'export' for Vercel deployment
  // Vercel handles the build process automatically
};

module.exports = nextConfig;
