import type { MetadataRoute } from 'next';

// Required for `output: 'export'` — tells Next.js to pre-render this route
// at build time rather than treating it as a dynamic API route.
export const dynamic = 'force-static';

const SITE_URL = 'https://rachelkeysphotography.com';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
  ];
}
