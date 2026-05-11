import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
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
  outputFileTracingIncludes: {
    '/**/*': [
      './node_modules/.prisma/client/**/*',
      './node_modules/@prisma/client/**/*',
      './node_modules/prisma/**/*',
    ],
  },
  async headers() {
    const SUPABASE_HOST = 'https://iixuvhjhhtfsioqhmqkx.supabase.co';
    // Tight CSP: allow our own origin, Google Fonts, Supabase storage, Vercel
    // analytics, and inline styles (required by next-intl + Tailwind preflight).
    // Inline scripts are needed only for the theme-init snippet in layout.tsx —
    // use 'unsafe-inline' as a pragmatic baseline; tighten with nonces later.
    const csp = [
      "default-src 'self'",
      `img-src 'self' data: blob: https: ${SUPABASE_HOST}`,
      `media-src 'self' blob: ${SUPABASE_HOST}`,
      "font-src 'self' https://fonts.gstatic.com data:",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com",
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
