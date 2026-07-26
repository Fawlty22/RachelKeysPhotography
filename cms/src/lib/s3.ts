import { S3Client, ListObjectsV2Command, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { fromCognitoIdentityPool } from '@aws-sdk/credential-providers';
import { getIdToken } from './auth';

const REGION = 'us-east-1';
const BUCKET = 'rachelkeysphotographystack-photosbucket0a0467f9-fvaw0fcrd6ih';
const IDENTITY_POOL_ID = import.meta.env.VITE_IDENTITY_POOL_ID as string;
const USER_POOL_ID = 'us-east-1_xEoOg1QOx';

export const LOCATIONS = ['hero', 'hero-portrait', 'gallery', 'about', 'testimonial', 'testimonial-portrait'] as const;
export type PhotoLocation = (typeof LOCATIONS)[number];

export interface PhotoObject {
  key: string;
  url: string;
  lastModified?: Date;
  size?: number;
}

function getS3Client(): S3Client {
  const idToken = getIdToken();
  if (!idToken) throw new Error('Not authenticated');

  return new S3Client({
    region: REGION,
    credentials: fromCognitoIdentityPool({
      clientConfig: { region: REGION },
      identityPoolId: IDENTITY_POOL_ID,
      logins: {
        [`cognito-idp.${REGION}.amazonaws.com/${USER_POOL_ID}`]: idToken,
      },
    }),
  });
}

function keyPrefix(location: PhotoLocation) {
  return `photos/${location}/`;
}

const PHOTOS_CDN = 'https://photos.rachelkeysphotography.com';

function objectUrl(key: string) {
  return `${PHOTOS_CDN}/${key}`;
}

export async function listPhotos(location: PhotoLocation): Promise<PhotoObject[]> {
  const client = getS3Client();
  const result = await client.send(
    new ListObjectsV2Command({ Bucket: BUCKET, Prefix: keyPrefix(location) }),
  );

  return (result.Contents ?? [])
    .filter(o => o.Key && o.Key !== keyPrefix(location)) // skip the folder placeholder
    .map(o => ({
      key: o.Key!,
      url: objectUrl(o.Key!),
      lastModified: o.LastModified,
      size: o.Size,
    }));
}

export async function uploadPhoto(location: PhotoLocation, file: File): Promise<PhotoObject> {
  const client = getS3Client();
  const key = `${keyPrefix(location)}${Date.now()}-${file.name}`;
  const body = await file.arrayBuffer();

  await client.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: new Uint8Array(body),
      ContentType: file.type,
    }),
  );

  // Refresh the manifest so the portfolio site reflects the new photo
  await refreshManifest(client, location);

  return { key, url: objectUrl(key) };
}

export async function deletePhoto(key: string, location: PhotoLocation): Promise<void> {
  const client = getS3Client();
  await client.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));

  // Refresh the manifest so the portfolio site no longer shows the deleted photo
  await refreshManifest(client, location);
}

/**
 * Lists all photos for a location and writes an updated manifest to
 * content/manifest-{location}.json so the public portfolio can read them
 * without needing S3 ListObjects access.
 */
async function refreshManifest(client: S3Client, location: PhotoLocation): Promise<void> {
  const result = await client.send(
    new ListObjectsV2Command({ Bucket: BUCKET, Prefix: keyPrefix(location) }),
  );

  const keys = (result.Contents ?? [])
    .map(o => o.Key!)
    .filter(k => k && k !== keyPrefix(location));

  await client.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: `content/manifest-${location}.json`,
      Body: new TextEncoder().encode(JSON.stringify(keys)),
      ContentType: 'application/json',
      CacheControl: 'no-cache',
    }),
  );
}

const CONTENT_KEY = 'content/site-content.json';

export interface SiteContent {
  hero: { headline: string; subheading: string };
  about: { body: string };
  contact: { blurb: string };
}

export const DEFAULT_CONTENT: SiteContent = {
  hero: { headline: 'Capturing moments that last forever', subheading: 'Available for weddings, portraits, and events' },
  about: { body: 'Hi, I\'m Rachel — a photographer based in [location] with a passion for authentic, candid moments.' },
  contact: { blurb: 'I\'d love to hear about your event. Reach out and let\'s create something beautiful together.' },
};

export async function getContent(): Promise<SiteContent> {
  const client = getS3Client();
  const result = await client.send(new GetObjectCommand({ Bucket: BUCKET, Key: CONTENT_KEY }));
  const text = await result.Body!.transformToString();
  return JSON.parse(text) as SiteContent;
}

export async function saveContent(content: SiteContent): Promise<void> {
  const client = getS3Client();
  await client.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: CONTENT_KEY,
    Body: new TextEncoder().encode(JSON.stringify(content, null, 2)),
    ContentType: 'application/json',
    // Prevent browsers and CloudFront from caching content JSON so edits
    // are visible immediately after saving without requiring a hard refresh.
    CacheControl: 'no-cache',
  }));
}

// =============================================================================
// Events
// =============================================================================

import type { Event, BlogPost } from './types';

const EVENTS_KEY = 'content/events.json';

export async function getEvents(): Promise<Event[]> {
  const client = getS3Client();
  try {
    const result = await client.send(new GetObjectCommand({ Bucket: BUCKET, Key: EVENTS_KEY }));
    const text = await result.Body!.transformToString();
    return JSON.parse(text) as Event[];
  } catch (e: unknown) {
    // File doesn't exist yet — return empty array
    if ((e as { name?: string }).name === 'NoSuchKey') return [];
    throw e;
  }
}

export async function saveEvents(events: Event[]): Promise<void> {
  const client = getS3Client();
  await client.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: EVENTS_KEY,
    Body: new TextEncoder().encode(JSON.stringify(events, null, 2)),
    ContentType: 'application/json',
    CacheControl: 'no-cache',
  }));
}

/**
 * Upload a photo for a specific event.
 * Returns the S3 key of the uploaded photo.
 */
export async function uploadEventPhoto(eventId: string, file: File): Promise<string> {
  const client = getS3Client();
  const key = `photos/events/${eventId}/${Date.now()}-${file.name}`;
  const body = await file.arrayBuffer();

  await client.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: new Uint8Array(body),
    ContentType: file.type,
  }));

  return key;
}

/**
 * Delete a single event photo from S3.
 */
export async function deleteEventPhoto(key: string): Promise<void> {
  const client = getS3Client();
  await client.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
}

// =============================================================================
// Blog Posts
// =============================================================================

const POSTS_KEY = 'content/posts.json';

export async function getPosts(): Promise<BlogPost[]> {
  const client = getS3Client();
  try {
    const result = await client.send(new GetObjectCommand({ Bucket: BUCKET, Key: POSTS_KEY }));
    const text = await result.Body!.transformToString();
    return JSON.parse(text) as BlogPost[];
  } catch (e: unknown) {
    if ((e as { name?: string }).name === 'NoSuchKey') return [];
    throw e;
  }
}

export async function savePosts(posts: BlogPost[]): Promise<void> {
  const client = getS3Client();
  await client.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: POSTS_KEY,
    Body: new TextEncoder().encode(JSON.stringify(posts, null, 2)),
    ContentType: 'application/json',
    CacheControl: 'no-cache',
  }));
}
