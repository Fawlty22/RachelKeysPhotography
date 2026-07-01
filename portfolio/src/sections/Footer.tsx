import type { SiteContent } from '@/lib/content';

interface FooterProps {
  content: SiteContent['contact'];
}

export function Footer({ content }: FooterProps) {
  return (
    <>
      {/* Contact CTA strip */}
      <section
        id="contact"
        className="bg-[var(--color-cream)] py-20 px-6 lg:px-12"
        aria-label="Contact"
      >
        <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-3 gap-10 items-start">
          {/* Left — CTA */}
          <div>
            <h2 className="font-serif text-xl font-normal uppercase tracking-widest text-[var(--color-charcoal)] mb-3">
              Ready to Tell Your Story?
            </h2>
            <p className="text-sm text-[var(--color-charcoal-light)] leading-relaxed mb-6">
              {content.blurb}
            </p>
            <a
              href="mailto:rachelkeysphotography@gmail.com"
              className="inline-block border border-[var(--color-charcoal)] px-7 py-3 text-xs font-medium tracking-widest uppercase text-[var(--color-charcoal)] transition hover:bg-[var(--color-charcoal)] hover:text-white"
            >
              Inquire Here
            </a>
          </div>

          {/* Center — monogram */}
          <div className="flex flex-col items-center justify-center text-center">
            <div
              className="font-serif text-4xl font-normal text-[var(--color-charcoal)] tracking-widest select-none"
              aria-label="RK monogram"
            >
              R &nbsp;|&nbsp; K
            </div>
            <div
              className="mt-1 text-xs text-[var(--color-taupe-dark)] tracking-widest font-serif italic"
              aria-hidden="true"
            >
              ✦
            </div>
          </div>

          {/* Right — contact details */}
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase text-[var(--color-charcoal)] mb-3">
              Based in Upstate New York
            </p>
            <p className="text-sm text-[var(--color-charcoal-light)] mb-1">
              Serving Upstate NY and surrounding areas
            </p>
            <ul className="mt-3 space-y-2 text-sm text-[var(--color-charcoal-light)]">
              <li className="flex items-center gap-2">
                <span aria-hidden="true">✉</span>
                <a
                  href="mailto:rachelkeysphotography@gmail.com"
                  className="hover:text-[var(--color-charcoal)] transition-colors"
                >
                  rachelkeysphotography@gmail.com
                </a>
              </li>
              <li className="flex items-center gap-2">
                <span aria-hidden="true">◎</span>
                <a
                  href="https://instagram.com/rachelkeysphotography"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[var(--color-charcoal)] transition-colors"
                >
                  @rachelkeysphotography
                </a>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Footer bar */}
      <footer className="bg-[var(--color-warm-white)] border-t border-[var(--color-taupe)]/30 py-5 px-6 text-center">
        <p className="text-xs text-[var(--color-taupe-dark)] tracking-widest uppercase">
          © {new Date().getFullYear()} Rachel Keys Photography&nbsp;|&nbsp;All Rights Reserved
        </p>
      </footer>
    </>
  );
}
