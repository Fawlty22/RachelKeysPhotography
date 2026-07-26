'use client';

import { useState } from 'react';
import Image from 'next/image';
import { PhotoLightbox } from './PhotoLightbox';

interface PhotoEntry {
  key: string;
  url: string;
  alt: string;
}

interface PhotoWallProps {
  photos: PhotoEntry[];
}

export function PhotoWall({ photos }: PhotoWallProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  function openLightbox(index: number) {
    setLightboxIndex(index);
  }

  function closeLightbox() {
    setLightboxIndex(null);
  }

  function prevPhoto() {
    setLightboxIndex((i) => (i === null ? null : i === 0 ? photos.length - 1 : i - 1));
  }

  function nextPhoto() {
    setLightboxIndex((i) => (i === null ? null : i === photos.length - 1 ? 0 : i + 1));
  }

  if (photos.length === 0) {
    return (
      <p className="text-center text-[var(--color-taupe-dark)] text-sm py-20">
        No photos in this gallery yet.
      </p>
    );
  }

  return (
    <>
      {/* Masonry columns layout */}
      <div className="columns-2 md:columns-3 gap-3 space-y-3">
        {photos.map((photo, index) => (
          <button
            key={photo.key}
            onClick={() => openLightbox(index)}
            aria-label={`Open ${photo.alt} fullscreen`}
            className="group relative block w-full overflow-hidden break-inside-avoid bg-[var(--color-taupe)]/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-charcoal)]"
          >
            <Image
              src={photo.url}
              alt={photo.alt}
              width={800}
              height={600}
              className="w-full h-auto block transition-transform duration-500 ease-out group-hover:scale-105"
              sizes="(max-width: 768px) 50vw, 33vw"
              loading={index < 6 ? 'eager' : 'lazy'}
            />
            {/* Hover overlay */}
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors duration-300 flex items-center justify-center"
            >
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  <line x1="11" y1="8" x2="11" y2="14" />
                  <line x1="8" y1="11" x2="14" y2="11" />
                </svg>
              </div>
            </div>
          </button>
        ))}
      </div>

      <PhotoLightbox
        photos={photos}
        currentIndex={lightboxIndex}
        onClose={closeLightbox}
        onPrev={prevPhoto}
        onNext={nextPhoto}
      />
    </>
  );
}
