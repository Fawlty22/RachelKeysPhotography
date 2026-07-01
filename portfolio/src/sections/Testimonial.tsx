import type { PhotoEntry } from '@/lib/content';

interface TestimonialProps {
  photos: PhotoEntry[];
}

// Static testimonial for now — can be moved to site-content.json later
const TESTIMONIAL = {
  quote:
    'Rachel truly captured our day perfectly. Every photo feels so timeless and genuine. We are beyond grateful!',
  attribution: '— Noel & Taylor',
};

export function Testimonial({ photos }: TestimonialProps) {
  // Use a gallery photo as the background if available
  const bg = photos[1]?.url ?? photos[0]?.url;

  return (
    <section
      id="experience"
      className="relative py-28 px-6 lg:px-12 overflow-hidden"
      aria-label="Client testimonial"
    >
      {/* Background photo with heavy overlay for legibility */}
      <div className="absolute inset-0 bg-[var(--color-charcoal)]">
        {bg && (
          <img
            src={bg}
            alt=""
            aria-hidden="true"
            className="h-full w-full object-cover opacity-40"
            loading="lazy"
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
          <p className="font-serif text-xl sm:text-2xl text-white font-normal leading-relaxed italic">
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
