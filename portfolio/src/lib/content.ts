/**
 * Content fetching lib for the portfolio site.
 *
 * All content lives in the photos bucket, served publicly via the photos CDN.
 * The CMS writes to these same paths, so changes are reflected immediately.
 *
 * Photos CDN: https://photos.rachelkeysphotography.com
 *   content/site-content.json  — editable copy (hero, about, contact)
 *   photos/hero/               — hero background image(s)
 *   photos/gallery/            — recent highlights grid photos
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

export async function fetchContent(): Promise<SiteContent> {
  try {
    const res = await fetch(`${PHOTOS_CDN}/content/site-content.json`, {
      // Bust CloudFront's cache for the JSON file so edits show up promptly
      cache: 'no-cache',
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as SiteContent;
  } catch {
    // Fall back to defaults if the file doesn't exist yet or fetch fails
    return DEFAULT_CONTENT;
  }
}

// ---------------------------------------------------------------------------
// Photo listings
// ---------------------------------------------------------------------------

/**
 * The CMS stores photos under photos/{location}/{timestamp}-{filename}.
 * We can't list S3 directly from the portfolio (no auth), so the CMS is
 * expected to write a manifest alongside the photos.
 *
 * For now we return a best-effort list by fetching a known manifest file.
 * If the manifest doesn't exist we return an empty array — the site degrades
 * gracefully (sections with no photos are hidden or show a placeholder).
 */
export interface PhotoEntry {
  key: string;
  url: string;
}

export type PhotoLocation = 'hero' | 'gallery' | 'carousel';

export async function fetchPhotos(location: PhotoLocation): Promise<PhotoEntry[]> {
  try {
    const res = await fetch(`${PHOTOS_CDN}/content/manifest-${location}.json`, {
      cache: 'no-cache',
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const keys = (await res.json()) as string[];
    return keys.map(key => ({ key, url: `${PHOTOS_CDN}/${key}` }));
  } catch {
    return [];
  }
}
