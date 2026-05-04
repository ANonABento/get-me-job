/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: process.env.NEXT_DIST_DIR || '.next',
  async redirects() {
    return [
      {
        source: '/jobs',
        destination: '/opportunities',
        permanent: true,
      },
      {
        source: '/jobs/research/:id',
        destination: '/opportunities/:id/research',
        permanent: true,
      },
      {
        source: '/jobs/:id',
        destination: '/opportunities/:id',
        permanent: true,
      },
    ];
  },
  experimental: {
    serverComponentsExternalPackages: ['better-sqlite3'],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.googleusercontent.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
