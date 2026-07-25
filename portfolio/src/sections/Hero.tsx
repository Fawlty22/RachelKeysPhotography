import Image from 'next/image';
import type { SiteContent, PhotoEntry } from '@/lib/content';

interface HeroProps {
  content: SiteContent['hero'];
  photos: PhotoEntry[];
  portraitPhotos: PhotoEntry[];
}

export function Hero({ content, photos, portraitPhotos }: HeroProps) {
  const landscape = photos[0];
  // Fall back to landscape if no portrait has been uploaded yet
  const portrait = portraitPhotos[0] ?? landscape;

  // Split headline to allow italic styling on the last line
  const lines = content.headline.split('\n');
  const mainLines = lines.slice(0, -1);
  const lastLine = lines[lines.length - 1];

  return (
    <section
      id="home"
      className="relative h-screen min-h-[600px] flex items-end"
      aria-label="Hero"
    >
      {/* Background image — two variants swapped at the md breakpoint */}
      <div className="absolute inset-0 bg-[var(--color-charcoal)]">
        {/* Landscape: hidden on mobile, shown on md+ */}
        {landscape && (
          <Image
            src={landscape.url}
            alt="Rachel Keys Photography — hero"
            fill
            className="object-cover hidden md:block"
            style={{ opacity: 0.85 }}
            priority
            sizes="100vw"
          />
        )}
        {/* Portrait: shown on mobile, hidden on md+ */}
        {portrait && (
          <Image
            src={portrait.url}
            alt="Rachel Keys Photography — hero"
            fill
            className="object-cover block md:hidden"
            style={{ opacity: 0.85 }}
            priority
            sizes="100vw"
          />
        )}
        {/* Gradient overlay — darkens the bottom-left where text sits */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
      </div>

      {/* Copy */}
      <div className="relative z-10 max-w-7xl w-full mx-auto px-6 lg:px-12 pb-16 md:pb-24">
        <h1 className="font-serif text-white max-w-lg">
          {mainLines.length > 0 && (
            <span className="block text-3xl sm:text-5xl lg:text-6xl font-normal uppercase tracking-tight leading-tight">
              {mainLines.join('\n')}
            </span>
          )}
          <span className="block text-3xl sm:text-5xl lg:text-6xl font-normal italic leading-tight">
            {lastLine}
          </span>
        </h1>

        <p className="mt-3 text-xs tracking-[0.25em] uppercase text-white/80">
          {content.subheading}
        </p>

        <a
          href="#highlights"
          className="mt-8 inline-block border border-white/60 bg-white/10 px-7 py-3.5 text-xs font-medium tracking-widest uppercase text-white backdrop-blur-sm transition hover:bg-white/20"
        >
          View Portfolio
        </a>
      </div>
    </section>
  );
}
