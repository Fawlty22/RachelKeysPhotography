import type { MetadataRoute } from 'next';
import { fetchEvents, fetchPosts } from '@/lib/content';

// Required for `output: 'export'` — tells Next.js to pre-render this route
// at build time rather than treating it as a dynamic API route.
export const dynamic = 'force-static';

const SITE_URL = 'https://rachelkeysphotography.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [events, posts] = await Promise.all([fetchEvents(), fetchPosts()]);

  const publishedEvents = events.filter((ev) => ev.publishedAt !== null);
  const publishedPosts = posts.filter((p) => p.publishedAt !== null);

  const eventUrls: MetadataRoute.Sitemap = publishedEvents.map((ev) => ({
    url: `${SITE_URL}/portfolio/${ev.slug}`,
    lastModified: new Date(ev.publishedAt!),
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  const postUrls: MetadataRoute.Sitemap = publishedPosts.map((p) => ({
    url: `${SITE_URL}/blog/${p.slug}`,
    lastModified: new Date(p.publishedAt!),
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${SITE_URL}/portfolio`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    ...eventUrls,
    ...postUrls,
  ];
}
