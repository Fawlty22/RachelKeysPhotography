import type { MetadataRoute } from 'next';

// Required for `output: 'export'` — tells Next.js to pre-render this route
// at build time rather than treating it as a dynamic API route.
export const dynamic = 'force-static';

const SITE_URL = 'https://rachelkeysphotography.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        // Allow all crawlers on the public portfolio
        userAgent: '*',
        allow: '/',
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    // The CMS is at a separate domain (admin.rachelkeysphotography.com)
    // and has its own robots handling — no need to disallow it here.
  };
}
