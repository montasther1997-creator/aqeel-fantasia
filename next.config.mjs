import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Production: Supabase only. Stock-photo hosts are kept for non-prod so
    // local demo seed data renders, but never on the live domain.
    remotePatterns: process.env.NODE_ENV === 'production'
      ? [
          { protocol: 'https', hostname: 'iixuvhjhhtfsioqhmqkx.supabase.co' },
          { protocol: 'https', hostname: 'images.unsplash.com' },
        ]
      : [
          { protocol: 'https', hostname: 'images.unsplash.com' },
          { protocol: 'https', hostname: 'picsum.photos' },
          { protocol: 'https', hostname: 'cdn.pixabay.com' },
          { protocol: 'https', hostname: 'iixuvhjhhtfsioqhmqkx.supabase.co' },
        ],
  },
  experimental: {
    serverActions: { bodySizeLimit: '10mb' },
    serverComponentsExternalPackages: ['@prisma/client', 'prisma'],
  },
  // Strip console.* calls (except errors/warns) from production client bundles.
  compiler: process.env.NODE_ENV === 'production'
    ? { removeConsole: { exclude: ['error', 'warn'] } }
    : undefined,
  outputFileTracingIncludes: {
    '/**/*': [
      './node_modules/.prisma/client/**/*',
      './node_modules/@prisma/client/**/*',
      './node_modules/prisma/**/*',
    ],
  },
  async headers() {
    const SUPABASE_HOST = 'https://iixuvhjhhtfsioqhmqkx.supabase.co';
    const isDev = process.env.NODE_ENV !== 'production';
    // unsafe-eval is required by Next.js HMR in dev. In production we drop it
    // so any reflected XSS cannot be escalated to in-browser code execution.
    const scriptSrc = isDev
      ? "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com"
      : "script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com";
    const csp = [
      "default-src 'self'",
      `img-src 'self' data: blob: https: ${SUPABASE_HOST}`,
      `media-src 'self' blob: ${SUPABASE_HOST}`,
      "font-src 'self' https://fonts.gstatic.com data:",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      scriptSrc,
      `connect-src 'self' ${SUPABASE_HOST} https://va.vercel-scripts.com`,
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
    ].join('; ');

    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'Content-Security-Policy', value: csp },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
