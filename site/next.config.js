/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
}

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
  // enabled: true,
  openAnalyzer: false,
})

module.exports = withBundleAnalyzer({})
// module.exports = nextConfig
