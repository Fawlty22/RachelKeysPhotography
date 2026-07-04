import type { MetadataRoute } from 'next';

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
