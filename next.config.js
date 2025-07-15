/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // GitHub Pages deployment configuration
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // Set base path for GitHub Pages only in production
  basePath: process.env.NODE_ENV === 'production' ? '/gdayaisupporthub' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/gdayaisupporthub' : '',
}

module.exports = nextConfig 