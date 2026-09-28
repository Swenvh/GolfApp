import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@golfapp/shared'],
  // Ledenimport: tot 5000 leden in één keer (± 2 MB)
  experimental: { serverActions: { bodySizeLimit: '3mb' } },
  poweredByHeader: false,
  async headers() {
    return [{
      source: '/:path*',
      headers: [
        // Niet in een frame van een andere site (clickjacking)
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'Content-Security-Policy', value: "frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'" },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
        { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
      ],
    }];
  },
};

export default nextConfig;
