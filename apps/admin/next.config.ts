import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@golfapp/shared'],
  // Ledenimport: tot 5000 leden in één keer
  experimental: { serverActions: { bodySizeLimit: '6mb' } },
};

export default nextConfig;
