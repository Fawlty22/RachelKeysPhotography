import type { PhotoEntry } from '@/lib/content';

interface HighlightsProps {
  photos: PhotoEntry[];
}

export function Highlights({ photos }: HighlightsProps) {
  // Show up to 5 photos in the strip, matching the mockup layout
  const strip = photos.slice(0, 5);

  return (
    <section
      id="highlights"
      className="bg-[var(--color-warm-white)] py-20 px-6 lg:px-12"
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

        {/* Photo strip */}
        {strip.length > 0 ? (
          <div
            className="grid gap-1"
            style={{ gridTemplateColumns: `repeat(${strip.length}, 1fr)` }}
            role="list"
            aria-label="Recent highlight photos"
          >
            {strip.map((photo, i) => (
              <div
                key={photo.key}
                className="aspect-[2/3] overflow-hidden bg-[var(--color-taupe)]/20"
                role="listitem"
              >
                <img
                  src={photo.url}
                  alt={`Recent highlight ${i + 1}`}
                  className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                  loading="lazy"
                  width={400}
                  height={600}
                />
              </div>
            ))}
          </div>
        ) : (
          /* Placeholder skeleton when no photos loaded yet */
          <div className="grid grid-cols-5 gap-1" aria-hidden="true">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="aspect-[2/3] bg-[var(--color-taupe)]/20" />
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="mt-10 text-center">
          <a
            href="#contact"
            className="inline-block border border-[var(--color-charcoal)] px-9 py-3 text-xs font-medium tracking-widest uppercase text-[var(--color-charcoal)] transition hover:bg-[var(--color-charcoal)] hover:text-white"
          >
            View Full Galleries
          </a>
        </div>
      </div>
    </section>
  );
}
