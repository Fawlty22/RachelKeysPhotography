import { useEffect, useRef, useState } from 'react';
import type { PhotoEntry } from '@/lib/content';
import { cn } from '@/lib/utils';

interface CarouselProps {
  photos: PhotoEntry[];
}

export function Carousel({ photos }: CarouselProps) {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const count = photos.length;

  function goTo(index: number) {
    setCurrent((index + count) % count);
  }

  // Auto-advance every 5 seconds
  useEffect(() => {
    if (count < 2) return;
    timerRef.current = setInterval(() => setCurrent(c => (c + 1) % count), 5000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [count]);

  if (count === 0) return null;

  return (
    <section
      id="investment"
      className="bg-[var(--color-charcoal)] py-0 overflow-hidden"
      aria-label="Photo carousel"
      aria-roledescription="carousel"
    >
      <div className="relative h-[60vh] min-h-[400px]">
        {photos.map((photo, i) => (
          <div
            key={photo.key}
            className={cn(
              'absolute inset-0 transition-opacity duration-1000',
              i === current ? 'opacity-100' : 'opacity-0',
            )}
            aria-hidden={i !== current}
          >
            <img
              src={photo.url}
              alt={`Portfolio photo ${i + 1}`}
              className="h-full w-full object-cover"
              loading={i === 0 ? 'eager' : 'lazy'}
            />
            {/* Subtle vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          </div>
        ))}

        {/* Dot indicators */}
        {count > 1 && (
          <div
            className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2"
            role="tablist"
            aria-label="Carousel slides"
          >
            {photos.map((_, i) => (
              <button
                key={i}
                role="tab"
                aria-selected={i === current}
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => {
                  goTo(i);
                  // Reset auto-advance timer on manual interaction
                  if (timerRef.current) clearInterval(timerRef.current);
                  timerRef.current = setInterval(() => setCurrent(c => (c + 1) % count), 5000);
                }}
                className={cn(
                  'h-1.5 rounded-full transition-all duration-300',
                  i === current ? 'w-6 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/60',
                )}
              />
            ))}
          </div>
        )}

        {/* Prev / Next arrows */}
        {count > 1 && (
          <>
            <button
              onClick={() => goTo(current - 1)}
              className="absolute left-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition hover:bg-black/50"
              aria-label="Previous photo"
            >
              ‹
            </button>
            <button
              onClick={() => goTo(current + 1)}
              className="absolute right-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition hover:bg-black/50"
              aria-label="Next photo"
            >
              ›
            </button>
          </>
        )}
      </div>
    </section>
  );
}
