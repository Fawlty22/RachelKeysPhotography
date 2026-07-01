import { useEffect, useState } from 'react';
import {
  fetchContent,
  fetchPhotos,
  DEFAULT_CONTENT,
  type SiteContent,
  type PhotoEntry,
} from '@/lib/content';

import { Nav } from '@/components/Nav';
import { Hero } from '@/sections/Hero';
import { About } from '@/sections/About';
import { Highlights } from '@/sections/Highlights';
import { Testimonial } from '@/sections/Testimonial';
import { Footer } from '@/sections/Footer';

export default function App() {
  const [content, setContent] = useState<SiteContent>(DEFAULT_CONTENT);
  const [heroPhotos, setHeroPhotos] = useState<PhotoEntry[]>([]);
  const [galleryPhotos, setGalleryPhotos] = useState<PhotoEntry[]>([]);

  useEffect(() => {
    // Fetch all data in parallel — failures fall back to defaults gracefully
    Promise.all([
      fetchContent().then(setContent),
      fetchPhotos('hero').then(setHeroPhotos),
      fetchPhotos('gallery').then(setGalleryPhotos),
    ]).catch(() => {
      // Silently ignore — each fetcher already handles its own fallback
    });
  }, []);

  return (
    <>
      <Nav />
      <main>
        <Hero content={content.hero} photos={heroPhotos} />
        <About content={content.about} photos={galleryPhotos} />
        <Highlights photos={galleryPhotos} />
        <Testimonial photos={galleryPhotos} />
      </main>
      <Footer content={content.contact} />
    </>
  );
}
