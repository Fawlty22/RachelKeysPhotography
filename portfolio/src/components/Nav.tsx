'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface NavLink {
  label: string;
  href: string;
  /** If true, use a plain anchor (same-page hash scroll on the home page) */
  hash?: boolean;
}

const LINKS: NavLink[] = [
  { label: 'Home', href: '/' },
  { label: 'Portfolio', href: '/portfolio' },
  { label: 'Blog', href: '/blog' },
  { label: 'About', href: '/#about', hash: true },
  { label: 'Contact', href: '/#contact', hash: true },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  // On non-home pages, always show the opaque nav bar (no transparent state)
  const isHome = pathname === '/';

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handler, { passive: true });
    // Re-check on mount so the initial state is correct when navigating back
    handler();
    return () => window.removeEventListener('scroll', handler);
  }, []);

  // Non-home pages always render as "scrolled" (opaque)
  const opaque = !isHome || scrolled;

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        opaque
          ? 'bg-[var(--color-cream)]/95 backdrop-blur-sm shadow-sm'
          : 'bg-transparent',
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-12">
        {/* Logo */}
        <Link href="/" className="flex flex-col leading-none" aria-label="Rachel Keys Photography home">
          <span
            className={cn(
              'text-sm font-semibold tracking-[0.2em] uppercase transition-colors',
              opaque ? 'text-[var(--color-charcoal)]' : 'text-white',
            )}
          >
            Rachel Keys
          </span>
          <span
            className={cn(
              'font-serif italic text-xs tracking-wide transition-colors',
              opaque ? 'text-[var(--color-taupe-dark)]' : 'text-white/80',
            )}
          >
            photography
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8" aria-label="Main navigation">
          {LINKS.map(({ label, href, hash }) =>
            hash ? (
              <a
                key={href}
                href={href}
                className={cn(
                  'text-xs font-medium tracking-widest uppercase transition-colors hover:opacity-60',
                  opaque ? 'text-[var(--color-charcoal)]' : 'text-white',
                )}
              >
                {label}
              </a>
            ) : (
              <Link
                key={href}
                href={href}
                className={cn(
                  'text-xs font-medium tracking-widest uppercase transition-colors hover:opacity-60',
                  opaque ? 'text-[var(--color-charcoal)]' : 'text-white',
                  pathname === href && 'opacity-60',
                )}
              >
                {label}
              </Link>
            ),
          )}
        </nav>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
        >
          <span className={cn('block h-px w-6 transition-all', opaque ? 'bg-[var(--color-charcoal)]' : 'bg-white', menuOpen && 'translate-y-2 rotate-45')} />
          <span className={cn('block h-px w-6 transition-all', opaque ? 'bg-[var(--color-charcoal)]' : 'bg-white', menuOpen && 'opacity-0')} />
          <span className={cn('block h-px w-6 transition-all', opaque ? 'bg-[var(--color-charcoal)]' : 'bg-white', menuOpen && '-translate-y-2 -rotate-45')} />
        </button>
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <nav
          className="md:hidden bg-[var(--color-cream)] border-t border-[var(--color-taupe)]/30 px-6 py-4 flex flex-col gap-4"
          aria-label="Mobile navigation"
        >
          {LINKS.map(({ label, href, hash }) =>
            hash ? (
              <a
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className="text-xs font-medium tracking-widest uppercase text-[var(--color-charcoal)] hover:text-[var(--color-taupe-dark)] transition-colors"
              >
                {label}
              </a>
            ) : (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className="text-xs font-medium tracking-widest uppercase text-[var(--color-charcoal)] hover:text-[var(--color-taupe-dark)] transition-colors"
              >
                {label}
              </Link>
            ),
          )}
        </nav>
      )}
    </header>
  );
}
