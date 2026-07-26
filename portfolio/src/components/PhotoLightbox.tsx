'use client';

import { useCallback, useEffect, useRef } from 'react';
import Image from 'next/image';

interface PhotoLightboxProps {
  photos: { key: string; url: string; alt: string }[];
  /** Index of the currently open photo, or null when closed */
  currentIndex: number | null;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

export function PhotoLightbox({
  photos,
  currentIndex,
  onClose,
  onPrev,
  onNext,
}: PhotoLightboxProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Focus the close button when modal opens
  useEffect(() => {
    if (currentIndex !== null) {
      closeButtonRef.current?.focus();
    }
  }, [currentIndex]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (currentIndex === null) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    },
    [currentIndex, onClose, onPrev, onNext],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Prevent body scroll while open
  useEffect(() => {
    if (currentIndex !== null) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [currentIndex]);

  if (currentIndex === null || !photos[currentIndex]) return null;

  const photo = photos[currentIndex];
  const total = photos.length;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Photo ${currentIndex + 1} of ${total}: ${photo.alt}`}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/92"
      onClick={onClose}
    >
      {/* Prevent click propagation on the inner photo area */}
      <div
        className="relative flex items-center justify-center w-full h-full max-w-6xl px-16"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Photo */}
        <div className="relative max-h-[90vh] max-w-full">
          <Image
            src={photo.url}
            alt={photo.alt}
            width={1600}
            height={1067}
            className="max-h-[90vh] w-auto object-contain select-none"
            priority
          />
        </div>

        {/* Prev arrow */}
        {total > 1 && (
          <button
            onClick={onPrev}
            aria-label="Previous photo"
            className="absolute left-2 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center bg-white/10 text-white backdrop-blur-sm transition hover:bg-white/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        )}

        {/* Next arrow */}
        {total > 1 && (
          <button
            onClick={onNext}
            aria-label="Next photo"
            className="absolute right-2 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center bg-white/10 text-white backdrop-blur-sm transition hover:bg-white/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        )}
      </div>

      {/* Close button */}
      <button
        ref={closeButtonRef}
        onClick={onClose}
        aria-label="Close lightbox"
        className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center bg-white/10 text-white backdrop-blur-sm transition hover:bg-white/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      {/* Counter */}
      {total > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/40 backdrop-blur-sm px-3 py-1 text-white text-xs tracking-widest">
          {currentIndex + 1} / {total}
        </div>
      )}
    </div>
  );
}
