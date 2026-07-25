import Image from 'next/image';
import type { PhotoEntry } from '@/lib/content';

interface TestimonialProps {
  photos: PhotoEntry[];
  portraitPhotos: PhotoEntry[];
}

// Static testimonial for now — can be moved to site-content.json later
const TESTIMONIAL = {
  quote:
    'Rachel truly captured our day perfectly. Every photo feels so timeless and genuine. We are beyond grateful!',
  attribution: '— Noel & Taylor',
};

export function Testimonial({ photos, portraitPhotos }: TestimonialProps) {
  // Dedicated landscape photo for desktop; dedicated portrait photo for mobile.
  // If either slot is empty the section still renders — just no background image.
  const landscape = photos[0];
  const portrait = portraitPhotos[0] ?? landscape;

  return (
    <section
      className="relative py-20 md:py-28 px-6 lg:px-12 overflow-hidden"
      aria-label="Client testimonial"
    >
      {/* Background photo — two variants swapped at the md breakpoint */}
      <div className="absolute inset-0 bg-[var(--color-charcoal)]">
        {/* Landscape: hidden on mobile, shown on md+ */}
        {landscape && (
          <Image
            src={landscape.url}
            alt=""
            aria-hidden="true"
            fill
            className="object-cover opacity-40 hidden md:block"
            sizes="100vw"
          />
        )}
        {/* Portrait: shown on mobile, hidden on md+ */}
        {portrait && (
          <Image
            src={portrait.url}
            alt=""
            aria-hidden="true"
            fill
            className="object-cover opacity-40 block md:hidden"
            sizes="100vw"
          />
        )}
        <div className="absolute inset-0 bg-[var(--color-taupe)]/30" />
      </div>

      <div className="relative z-10 mx-auto max-w-2xl text-center">
        {/* Opening quote mark */}
        <span
          className="font-serif text-6xl text-white/60 leading-none block mb-4"
          aria-hidden="true"
        >
          &ldquo;
        </span>

        <blockquote>
          <p className="font-serif text-lg sm:text-2xl text-white font-normal leading-relaxed italic">
            {TESTIMONIAL.quote}
          </p>
          <footer className="mt-6 text-xs tracking-widest uppercase text-white/70">
            {TESTIMONIAL.attribution}
          </footer>
        </blockquote>
      </div>
    </section>
  );
}
