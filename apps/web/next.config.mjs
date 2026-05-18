import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

const isCloudBuild = process.env.SLOTHING_CLOUD === '1';
const baseExtensions = ['tsx', 'ts', 'jsx', 'js'];
const cloudExtensions = ['cloud.tsx', 'cloud.ts'];

/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: process.env.NEXT_DIST_DIR || '.next',
  pageExtensions: isCloudBuild
    ? [...cloudExtensions, ...baseExtensions]
    : baseExtensions,
  async redirects() {
    return [
      {
        source: '/:locale/jobs',
        destination: '/:locale/opportunities',
        permanent: true,
      },
      {
        source: '/:locale/jobs/research/:id',
        destination: '/:locale/opportunities/:id/research',
        permanent: true,
      },
      {
        source: '/:locale/jobs/:id',
        destination: '/:locale/opportunities/:id',
        permanent: true,
      },
    ];
  },
  experimental: {
    instrumentationHook: true,
    // `pdfjs-dist` must be treated as an external Node module — its top-of-file
    // `Object.defineProperty(module.exports, '__esModule', ...)` blows up when
    // Next.js's (rsc) webpack layer hands it a non-object `module.exports`.
    // Symptom: `TypeError: Object.defineProperty called on non-object` inside
    // any server route that imports it.
    serverComponentsExternalPackages: ['better-sqlite3', 'pdfjs-dist'],
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

export default withNextIntl(nextConfig);
