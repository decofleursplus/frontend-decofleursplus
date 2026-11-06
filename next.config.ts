import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    qualities: [75, 90],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'pub-69eb0dcdef4244f49946a2556c863719.r2.dev',
      },
      {
        protocol: 'https',
        hostname: '*.r2.dev',
      },
      {
        protocol: 'https',
        hostname: '**.decofleursplus.com',
      },
      {
        protocol: 'https',
        hostname: '**.decofleurplus.com',
      },
      {
        protocol: 'https',
        hostname: '**.decofleurplus.sn',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: 'https://backend-decofleursplus-staging.up.railway.app/api/v1/:path*',
      },
    ];
  },
};

export default nextConfig;
