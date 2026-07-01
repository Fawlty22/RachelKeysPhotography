import type { SiteContent, PhotoEntry } from '@/lib/content';

interface AboutProps {
  content: SiteContent['about'];
  photos: PhotoEntry[];
}

export function About({ content, photos }: AboutProps) {
  const portrait = photos[0]?.url;
  const paragraphs = content.body.split('\n\n').filter(Boolean);

  return (
    <section
      id="about"
      className="bg-[var(--color-cream)] py-24 px-6 lg:px-12"
      aria-label="About Rachel"
    >
      <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 items-center">
        {/* Text */}
        <div>
          <p className="font-serif italic text-[var(--color-taupe-dark)] text-lg mb-2">
            hey there, I'm Rachel
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl font-normal uppercase tracking-wide text-[var(--color-charcoal)] leading-tight mb-6">
            The Heart Behind<br />the Lens
          </h2>
          <div className="space-y-4">
            {paragraphs.map((p, i) => (
              <p key={i} className="text-sm text-[var(--color-charcoal-light)] leading-relaxed">
                {p}
              </p>
            ))}
          </div>
          <a
            href="#contact"
            className="mt-8 inline-block border border-[var(--color-charcoal)] px-7 py-3 text-xs font-medium tracking-widest uppercase text-[var(--color-charcoal)] transition hover:bg-[var(--color-charcoal)] hover:text-white"
          >
            Learn More About Me
          </a>
        </div>

        {/* Portrait */}
        <div className="aspect-[3/4] overflow-hidden bg-[var(--color-warm-white)]">
          {portrait ? (
            <img
              src={portrait}
              alt="Portrait of Rachel Keys"
              className="h-full w-full object-cover"
              width={600}
              height={800}
              loading="lazy"
            />
          ) : (
            <div className="h-full w-full bg-[var(--color-warm-white)]" aria-hidden="true" />
          )}
        </div>
      </div>
    </section>
  );
}
