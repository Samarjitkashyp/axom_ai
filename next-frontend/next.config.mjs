/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'aiaxom.co.in',
      },
      {
        protocol: 'https',
        hostname: 'chat.aiaxom.co.in',
      },
      {
        protocol: 'https',
        hostname: 'user.aiaxom.co.in',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      }
    ],
  },
  // Tools that were removed: keep the old (indexed) links alive
  async redirects() {
    return [
      { source: '/tools/ocr-pdf', destination: '/tools', permanent: true },
      { source: '/tools/summarize', destination: '/tools', permanent: true },
      { source: '/tools/translate-pdf', destination: '/tools', permanent: true },
      { source: '/tools/extract-pdf-pages', destination: '/tools', permanent: true },
      { source: '/tools/unlock-pdf', destination: '/tools', permanent: true },
      { source: '/tools/office-to-pdf', destination: '/tools', permanent: true },
      { source: '/tools/remove-watermark', destination: '/tools', permanent: true },
    ];
  },
  // Security headers for every page of the Next.js site (HSTS, CSP frame-ancestors and Permissions-Policy are added by nginx)
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        canvas: false,
        fs: false,
        path: false,
      };
    }
    return config;
  },
};

export default nextConfig;
