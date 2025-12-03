/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    DATA_DIR: process.env.DATA_DIR
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
