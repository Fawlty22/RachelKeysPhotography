import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Nav } from '@/components/Nav';
import { Footer } from '@/sections/Footer';
import { fetchContent, fetchEvents, PHOTOS_CDN } from '@/lib/content';
import type { Event } from '@/types/content';

const SITE_URL = 'https://rachelkeysphotography.com';

export const metadata: Metadata = {
  title: 'Portfolio',
  description:
    'Browse Rachel Keys Photography galleries — weddings, portraits, families, and more. Each gallery is a window into a real moment, beautifully preserved.',
  alternates: { canonical: `${SITE_URL}/portfolio` },
  openGraph: {
    title: 'Portfolio | Rachel Keys Photography',
    description:
      'Browse galleries from weddings, portraits, families, and events photographed by Rachel Keys.',
    url: `${SITE_URL}/portfolio`,
    images: [{ url: `${SITE_URL}/og-image.jpg`, width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Portfolio | Rachel Keys Photography',
    description: 'Browse galleries from weddings, portraits, families, and events.',
  },
};

const CATEGORY_LABELS: Record<Event['category'], string> = {
  weddings: 'Weddings',
  portraits: 'Portraits',
  families: 'Families',
  events: 'Events',
  other: 'Other',
};

export default async function PortfolioPage() {
  const [content, allEvents] = await Promise.all([fetchContent(), fetchEvents()]);

  // Only show published events, newest first
  const events = allEvents
    .filter((ev) => ev.publishedAt !== null)
    .sort((a, b) => {
      if (!a.date && !b.date) return 0;
      if (!a.date) return 1;
      if (!b.date) return -1;
      return b.date.localeCompare(a.date);
    });

  return (
    <>
      <Nav />
      <main className="min-h-screen bg-[var(--color-warm-white)]">
        {/* Page header */}
        <section className="pt-32 pb-12 px-6 lg:px-12 text-center">
          <p className="font-serif italic text-[var(--color-taupe-dark)] text-base mb-2">
            the work
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl font-normal uppercase tracking-widest text-[var(--color-charcoal)]">
            Portfolio
          </h1>
          <p className="mt-4 text-[var(--color-taupe-dark)] text-sm max-w-md mx-auto leading-relaxed">
            A collection of sessions that tell real stories — moments worth holding onto forever.
          </p>
        </section>

        {/* Event grid */}
        <section className="px-6 lg:px-12 pb-24 mx-auto max-w-7xl">
          {events.length === 0 ? (
            <p className="text-center text-[var(--color-taupe-dark)] text-sm py-20">
              Galleries coming soon.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((ev) => (
                <EventCard key={ev.id} event={ev} />
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer content={content.contact} />
    </>
  );
}

function EventCard({ event }: { event: Event }) {
  const coverUrl = event.coverPhotoKey
    ? `${PHOTOS_CDN}/${event.coverPhotoKey}`
    : null;

  const formattedDate = event.date
    ? new Date(event.date + 'T00:00:00').toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
      })
    : null;

  return (
    <Link
      href={`/portfolio/${event.slug}`}
      className="group relative block overflow-hidden bg-[var(--color-taupe)]/20 aspect-[3/4]"
      aria-label={`View ${event.name} gallery`}
    >
      {/* Cover photo */}
      {coverUrl ? (
        <Image
          src={coverUrl}
          alt={`${event.name} — cover photo`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0 bg-[var(--color-taupe)]/30" />
      )}

      {/* Dark gradient overlay — always visible at bottom, deepens on hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent transition-opacity duration-300 group-hover:from-black/80" />

      {/* Category badge */}
      <div className="absolute top-4 left-4">
        <span className="bg-white/20 backdrop-blur-sm text-white text-[10px] font-medium tracking-widest uppercase px-2.5 py-1">
          {CATEGORY_LABELS[event.category]}
        </span>
      </div>

      {/* Text — slides up slightly on hover */}
      <div className="absolute bottom-0 left-0 right-0 p-5 translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
        <h2 className="text-white font-serif text-xl font-normal leading-snug">
          {event.name}
        </h2>
        {(formattedDate || event.location) && (
          <p className="text-white/70 text-xs tracking-wide mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {[formattedDate, event.location].filter(Boolean).join(' · ')}
          </p>
        )}
      </div>
    </Link>
  );
}
