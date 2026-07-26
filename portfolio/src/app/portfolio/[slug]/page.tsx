import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Nav } from '@/components/Nav';
import { Footer } from '@/sections/Footer';
import { PhotoWall } from '@/components/PhotoWall';
import { fetchContent, fetchEvents, PHOTOS_CDN } from '@/lib/content';

const SITE_URL = 'https://rachelkeysphotography.com';

const CATEGORY_LABELS: Record<string, string> = {
  weddings: 'Weddings',
  portraits: 'Portraits',
  families: 'Families',
  events: 'Events',
  other: 'Other',
};

interface Props {
  params: Promise<{ slug: string }>;
}

// Pre-render a page for every published event at build time.
// When there are no published events yet, this returns [] which is valid.
export const dynamicParams = false;

export async function generateStaticParams() {
  const events = await fetchEvents();
  const published = events.filter((ev) => ev.publishedAt !== null);
  // Next.js 15 with output:'export' errors if generateStaticParams returns [].
  // Return a sentinel slug so the route directory is generated; the page
  // body calls notFound() for any slug that doesn't match a real event.
  if (published.length === 0) return [{ slug: '__placeholder__' }];
  return published.map((ev) => ({ slug: ev.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const events = await fetchEvents();
  const event = events.find((ev) => ev.slug === slug && ev.publishedAt !== null);

  if (!event) {
    return { title: 'Gallery Not Found' };
  }

  const coverUrl = event.coverPhotoKey
    ? `${PHOTOS_CDN}/${event.coverPhotoKey}`
    : `${SITE_URL}/og-image.jpg`;

  return {
    title: event.name,
    description:
      event.description ||
      `Browse the ${event.name} gallery — ${event.photos.length} photos by Rachel Keys Photography.`,
    alternates: { canonical: `${SITE_URL}/portfolio/${event.slug}` },
    openGraph: {
      title: `${event.name} | Rachel Keys Photography`,
      description:
        event.description ||
        `Browse the ${event.name} gallery — photography by Rachel Keys.`,
      url: `${SITE_URL}/portfolio/${event.slug}`,
      images: [{ url: coverUrl, width: 1200, height: 800, alt: event.name }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${event.name} | Rachel Keys Photography`,
      description: event.description || `Browse the ${event.name} gallery.`,
      images: [coverUrl],
    },
  };
}

export default async function EventGalleryPage({ params }: Props) {
  const { slug } = await params;
  const [content, events] = await Promise.all([fetchContent(), fetchEvents()]);
  const event = events.find((ev) => ev.slug === slug && ev.publishedAt !== null);

  if (!event) notFound();

  const formattedDate = event.date
    ? new Date(event.date + 'T00:00:00').toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  const photos = event.photos.map((key, i) => ({
    key,
    url: `${PHOTOS_CDN}/${key}`,
    alt: `${event.name} — photo ${i + 1}`,
  }));

  return (
    <>
      <Nav />
      <main className="min-h-screen bg-[var(--color-warm-white)]">
        {/* Page header */}
        <section className="pt-32 pb-10 px-6 lg:px-12 text-center">
          <Link
            href="/portfolio"
            className="inline-flex items-center gap-1 text-xs text-[var(--color-taupe-dark)] hover:text-[var(--color-charcoal)] transition-colors tracking-widest uppercase mb-6"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            All Galleries
          </Link>

          <div className="space-y-2">
            <span className="inline-block bg-[var(--color-taupe)]/40 text-[var(--color-charcoal)] text-[10px] font-medium tracking-widest uppercase px-3 py-1">
              {CATEGORY_LABELS[event.category] ?? event.category}
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl font-normal text-[var(--color-charcoal)]">
              {event.name}
            </h1>
            {(formattedDate || event.location) && (
              <p className="text-[var(--color-taupe-dark)] text-sm tracking-wide">
                {[formattedDate, event.location].filter(Boolean).join(' · ')}
              </p>
            )}
            {event.description && (
              <p className="mt-4 text-[var(--color-charcoal-light)] text-sm max-w-xl mx-auto leading-relaxed">
                {event.description}
              </p>
            )}
            <p className="text-[var(--color-taupe-dark)] text-xs mt-2">
              {event.photos.length} photo{event.photos.length !== 1 ? 's' : ''}
            </p>
          </div>
        </section>

        {/* Masonry photo wall */}
        <section className="px-4 lg:px-8 pb-24 mx-auto max-w-7xl">
          <PhotoWall photos={photos} />
        </section>
      </main>
      <Footer content={content.contact} />
    </>
  );
}
