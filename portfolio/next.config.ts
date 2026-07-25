import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Output a fully static site for S3 + CloudFront deployment.
  // The automated build pipeline runs `next build` and syncs the `out/`
  // directory to the portfolio S3 bucket.
  output: 'export',

  images: {
    // next/image's built-in optimizer requires a server runtime, which we
    // don't have. Images are served from the photos CDN (CloudFront + S3)
    // which already delivers optimised WebP/AVIF at the edge, so disabling
    // the optimizer here has no meaningful quality impact.
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'photos.rachelkeysphotography.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
