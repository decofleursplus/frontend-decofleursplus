import type { NextConfig } from 'next';

// Backend ciblé par le proxy /api/v1 (même origine côté navigateur, donc pas de CORS).
// En local : API_PROXY_TARGET=http://localhost:5050 pnpm dev
const API_PROXY_TARGET = (
  process.env.API_PROXY_TARGET || 'https://backend-decofleursplus-staging.up.railway.app'
).replace(/\/+$/, '');

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Permet de lancer une seconde instance de dev (ex. branchée sur un backend local) sans conflit de cache
  ...(process.env.NEXT_DIST_DIR ? { distDir: process.env.NEXT_DIST_DIR } : {}),
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 2592000,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
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
        destination: `${API_PROXY_TARGET}/api/v1/:path*`,
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/favoris',
        destination: '/compte/favoris',
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=604800',
          },
        ],
      },
      {
        source: '/icons/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=604800',
          },
        ],
      },
      {
        source: '/manifest.webmanifest',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, stale-while-revalidate=86400',
          },
        ],
      },
      {
        source: '/sitemap.xml',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, stale-while-revalidate=86400',
          },
        ],
      },
      {
        source: '/robots.txt',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, stale-while-revalidate=86400',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
