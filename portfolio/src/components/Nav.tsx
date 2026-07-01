import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

const LINKS = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'Portfolio', href: '#highlights' },
  { label: 'Experience', href: '#experience' },
  { label: 'Investment', href: '#investment' },
  { label: 'Contact', href: '#contact' },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-[var(--color-cream)]/95 backdrop-blur-sm shadow-sm'
          : 'bg-transparent',
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-12">
        {/* Logo */}
        <a href="#home" className="flex flex-col leading-none" aria-label="Rachel Keys Photography home">
          <span
            className={cn(
              'text-sm font-semibold tracking-[0.2em] uppercase transition-colors',
              scrolled ? 'text-[var(--color-charcoal)]' : 'text-white',
            )}
          >
            Rachel Keys
          </span>
          <span
            className={cn(
              'font-serif italic text-xs tracking-wide transition-colors',
              scrolled ? 'text-[var(--color-taupe-dark)]' : 'text-white/80',
            )}
          >
            photography
          </span>
        </a>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8" aria-label="Main navigation">
          {LINKS.map(({ label, href }) => (
            <a
              key={href}
              href={href}
              className={cn(
                'text-xs font-medium tracking-widest uppercase transition-colors hover:opacity-60',
                scrolled ? 'text-[var(--color-charcoal)]' : 'text-white',
              )}
            >
              {label}
            </a>
          ))}
        </nav>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setMenuOpen(v => !v)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
        >
          <span className={cn('block h-px w-6 transition-all', scrolled ? 'bg-[var(--color-charcoal)]' : 'bg-white', menuOpen && 'translate-y-2 rotate-45')} />
          <span className={cn('block h-px w-6 transition-all', scrolled ? 'bg-[var(--color-charcoal)]' : 'bg-white', menuOpen && 'opacity-0')} />
          <span className={cn('block h-px w-6 transition-all', scrolled ? 'bg-[var(--color-charcoal)]' : 'bg-white', menuOpen && '-translate-y-2 -rotate-45')} />
        </button>
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <nav
          className="md:hidden bg-[var(--color-cream)] border-t border-[var(--color-taupe)]/30 px-6 py-4 flex flex-col gap-4"
          aria-label="Mobile navigation"
        >
          {LINKS.map(({ label, href }) => (
            <a
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              className="text-xs font-medium tracking-widest uppercase text-[var(--color-charcoal)] hover:text-[var(--color-taupe-dark)] transition-colors"
            >
              {label}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}
