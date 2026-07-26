/**
 * Shared content types for the CMS.
 * These match the JSON stored in the photos S3 bucket:
 *   content/events.json   — array of Event
 *   content/posts.json    — array of BlogPost
 */

export type EventCategory = 'weddings' | 'portraits' | 'families' | 'events' | 'other';

export const EVENT_CATEGORIES: EventCategory[] = [
  'weddings',
  'portraits',
  'families',
  'events',
  'other',
];

export interface Event {
  /** UUID */
  id: string;
  /** URL-safe slug, e.g. "summer-wedding-2025" */
  slug: string;
  /** Display name */
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
  /** null = draft; ISO string = published */
  publishedAt: string | null;
}

export interface BlogPost {
  /** UUID */
  id: string;
  /** URL-safe slug */
  slug: string;
  title: string;
  /** Short plain-text summary for cards and meta description */
  excerpt: string;
  /** TipTap HTML output */
  bodyHtml: string;
  /** S3 key of the cover image */
  coverPhotoKey: string;
  /** S3 keys of photos selected from events to display in the post */
  photoKeys: string[];
  /** Optional link to a source event */
  eventId: string | null;
  /** null = draft; ISO string = published */
  publishedAt: string | null;
  /** ISO string */
  createdAt: string;
}
