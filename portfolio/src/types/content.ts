/**
 * Shared content types for the portfolio site.
 * These match the JSON stored at:
 *   https://photos.rachelkeysphotography.com/content/events.json
 *   https://photos.rachelkeysphotography.com/content/posts.json
 */

export type EventCategory = 'weddings' | 'portraits' | 'families' | 'events' | 'other';

export interface Event {
  id: string;
  slug: string;
  name: string;
  /** ISO date string, e.g. "2025-06-14" */
  date: string;
  location: string;
  description: string;
  category: EventCategory;
  /** S3 key of the cover image */
  coverPhotoKey: string;
  /** Ordered array of S3 keys */
  photos: string[];
  /** null = draft */
  publishedAt: string | null;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  bodyHtml: string;
  /** S3 key of the cover image */
  coverPhotoKey: string;
  /** S3 keys of selected photos */
  photoKeys: string[];
  eventId: string | null;
  publishedAt: string | null;
  createdAt: string;
}
