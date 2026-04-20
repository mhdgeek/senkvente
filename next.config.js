/** @type {import('next').NextConfig} */
const nextConfig = {
  // Compress responses
  compress: true,

  // Aggressive prefetching
  experimental: {
    optimisticClientCache: true,
  },

  images: {
    remotePatterns: [{ protocol: 'https', hostname: '*.supabase.co' }],
  },

  // Cache headers for static assets
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
        ],
      },
    ]
  },
}

module.exports = nextConfig
