/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { 
    unoptimized: true 
  },
  output: 'export',
  trailingSlash: true,
  distDir: 'out'
};

module.exports = nextConfig;
