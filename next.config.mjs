/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  compress: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    qualities: [70, 75],
    deviceSizes: [384, 640, 750, 828, 1080, 1200],
    imageSizes: [64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
    staleTimes: {
      dynamic: 30,
      static: 180,
    },
    optimisticRouting: true,
    dynamicOnHover: true,
    serverActions: {
      bodySizeLimit: '6mb',
    },
  },
  // Next.js still ships Baseline polyfills (Array.at, Object.hasOwn, …) for every
  // visitor. Our browserslist matches Next 16's support matrix, so skip them.
  webpack(config) {
    config.resolve.alias = {
      ...config.resolve.alias,
      '../build/polyfills/polyfill-module': false,
      'next/dist/build/polyfills/polyfill-module': false,
    }
    return config
  },
  turbopack: {
    resolveAlias: {
      '../build/polyfills/polyfill-module': './lib/empty-polyfills.js',
      'next/dist/build/polyfills/polyfill-module': './lib/empty-polyfills.js',
    },
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [{ key: 'Content-Language', value: 'fr-TN' }],
      },
      {
        source: '/assets/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        source: '/icon.png',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=86400' }],
      },
    ]
  },
}

export default nextConfig
