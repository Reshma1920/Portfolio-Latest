import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: '/okto',
        destination: '/latch',
        permanent: true,
      },
    ]
  },
}

export default nextConfig

