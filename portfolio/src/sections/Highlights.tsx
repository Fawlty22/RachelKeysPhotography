'use client';

import { useCallback, useRef, useState } from 'react';
import Image from 'next/image';
import type { PhotoEntry } from '@/lib/content';

interface HighlightsProps {
  photos: PhotoEntry[];
}

export function Highlights({ photos }: HighlightsProps) {
  // Show up to 5 photos in the strip, matching the mockup layout
  const strip = photos.slice(0, 5);

  const [current, setCurrent] = useState(0);
  const touchStartX = useRef<number | null>(null);

  const prev = useCallback(() => {
    setCurrent((i) => (i === 0 ? strip.length - 1 : i - 1));
  }, [strip.length]);

  const next = useCallback(() => {
    setCurrent((i) => (i === strip.length - 1 ? 0 : i + 1));
  }, [strip.length]);

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const delta = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(delta) > 40) {
      delta > 0 ? next() : prev();
    }
    touchStartX.current = null;
  }

  return (
    <section
      id="highlights"
      className="bg-[var(--color-warm-white)] py-16 md:py-20 px-6 lg:px-12"
      aria-label="Recent Highlights"
    >
      <div className="mx-auto max-w-7xl">
        {/* Section label */}
        <div className="text-center mb-10">
          <p className="font-serif italic text-[var(--color-taupe-dark)] text-base mb-1">
            the work
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl font-normal uppercase tracking-widest text-[var(--color-charcoal)]">
            Recent Highlights
          </h2>
        </div>

        {strip.length > 0 ? (
          <>
            {/* ── Mobile: one-at-a-time carousel ── */}
            <div className="md:hidden">
              <div
                className="relative aspect-[2/3] overflow-hidden bg-[var(--color-taupe)]/20"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                aria-label={`Photo ${current + 1} of ${strip.length}`}
                aria-roledescription="carousel"
              >
                <Image
                  key={strip[current].key}
                  src={strip[current].url}
                  alt={`Recent highlight photo ${current + 1}`}
                  fill
                  className="object-cover transition-opacity duration-300"
                  sizes="100vw"
                  priority={current === 0}
                />

                {/* Left arrow */}
                <button
                  onClick={prev}
                  aria-label="Previous photo"
                  className="absolute left-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center bg-black/30 text-white backdrop-blur-sm transition hover:bg-black/50"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>

                {/* Right arrow */}
                <button
                  onClick={next}
                  aria-label="Next photo"
                  className="absolute right-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center bg-black/30 text-white backdrop-blur-sm transition hover:bg-black/50"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>

                {/* Counter */}
                <div className="absolute bottom-3 right-3 bg-black/30 backdrop-blur-sm px-2 py-1 text-white text-xs tracking-widest">
                  {current + 1} / {strip.length}
                </div>
              </div>
            </div>

            {/* ── Desktop: 5-column strip ── */}
            <div
              className="hidden md:grid md:grid-cols-5 gap-1"
              role="list"
              aria-label="Recent highlight photos"
            >
              {strip.map((photo, i) => (
                <div
                  key={photo.key}
                  className="relative aspect-[2/3] overflow-hidden bg-[var(--color-taupe)]/20"
                  role="listitem"
                >
                  <Image
                    src={photo.url}
                    alt={`Recent highlight photo ${i + 1}`}
                    fill
                    className="object-cover transition-transform duration-500 hover:scale-105"
                    sizes="20vw"
                  />
                </div>
              ))}
            </div>
          </>
        ) : (
          /* Placeholder skeleton */
          <>
            <div className="md:hidden aspect-[2/3] bg-[var(--color-taupe)]/20" aria-hidden="true" />
            <div className="hidden md:grid md:grid-cols-5 gap-1" aria-hidden="true">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="aspect-[2/3] bg-[var(--color-taupe)]/20" />
              ))}
            </div>
          </>
        )}

        {/* CTA */}
        <div className="mt-10 text-center">
          <a
            href="#contact"
            className="inline-block border border-[var(--color-charcoal)] px-9 py-3.5 text-xs font-medium tracking-widest uppercase text-[var(--color-charcoal)] transition hover:bg-[var(--color-charcoal)] hover:text-white"
          >
            View Full Galleries
          </a>
        </div>
      </div>
    </section>
  );
}

