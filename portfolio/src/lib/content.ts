/**
 * Content fetching lib for the portfolio site.
 *
 * All content lives in the photos bucket, served publicly via the photos CDN.
 * The CMS writes to these same paths, so changes are reflected immediately.
 *
 * Photos CDN: https://photos.rachelkeysphotography.com
 *   content/site-content.json       — editable copy (hero, about, contact)
 *   content/manifest-hero.json      — array of S3 keys for hero photos
 *   content/manifest-gallery.json   — array of S3 keys for gallery photos
 *   content/manifest-carousel.json  — array of S3 keys for carousel photos
 */

export const PHOTOS_CDN = 'https://photos.rachelkeysphotography.com';

// ---------------------------------------------------------------------------
// Site content (copy)
// ---------------------------------------------------------------------------

export interface SiteContent {
  hero: {
    headline: string;
    subheading: string;
  };
  about: {
    body: string;
  };
  contact: {
    blurb: string;
  };
}

export const DEFAULT_CONTENT: SiteContent = {
  hero: {
    headline: 'Timeless photographs of the moments that matter most',
    subheading: 'Weddings. Couples. Families. Motherhood.',
  },
  about: {
    body: "I'm a photographer based in Upstate New York, passionate about capturing genuine emotion and beautiful, timeless imagery.\n\nWhether it's the quiet in-between moments or the big celebrations, I'm here to document your story in a way that feels natural and true to you.",
  },
  contact: {
    blurb: "I'd love to learn more about you and your vision. Let's create something beautiful together.",
  },
};

/**
 * Fetch site copy from the CDN. Safe to call in React Server Components.
 * Falls back to DEFAULT_CONTENT if the file is missing or the fetch fails.
 */
export async function fetchContent(): Promise<SiteContent> {
  try {
    const res = await fetch(`${PHOTOS_CDN}/content/site-content.json`, {
      // Revalidate every 60 s so edits appear promptly without hammering the CDN
      next: { revalidate: 60 },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as SiteContent;
  } catch {
    return DEFAULT_CONTENT;
  }
}

// ---------------------------------------------------------------------------
// Photo listings
// ---------------------------------------------------------------------------

export interface PhotoEntry {
  key: string;
  url: string;
}

export type PhotoLocation = 'hero' | 'gallery' | 'carousel';

/**
 * Fetch a photo manifest from the CDN. Safe to call in React Server Components.
 * Returns an empty array if the manifest is missing or the fetch fails.
 */
export async function fetchPhotos(location: PhotoLocation): Promise<PhotoEntry[]> {
  try {
    const res = await fetch(`${PHOTOS_CDN}/content/manifest-${location}.json`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const keys = (await res.json()) as string[];
    return keys.map((key) => ({ key, url: `${PHOTOS_CDN}/${key}` }));
  } catch {
    return [];
  }
}
