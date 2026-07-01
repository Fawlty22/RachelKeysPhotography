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
import { Carousel } from '@/sections/Carousel';
import { Testimonial } from '@/sections/Testimonial';
import { Footer } from '@/sections/Footer';

export default function App() {
  const [content, setContent] = useState<SiteContent>(DEFAULT_CONTENT);
  const [heroPhotos, setHeroPhotos] = useState<PhotoEntry[]>([]);
  const [galleryPhotos, setGalleryPhotos] = useState<PhotoEntry[]>([]);
  const [carouselPhotos, setCarouselPhotos] = useState<PhotoEntry[]>([]);

  useEffect(() => {
    Promise.all([
      fetchContent().then(setContent),
      fetchPhotos('hero').then(setHeroPhotos),
      fetchPhotos('gallery').then(setGalleryPhotos),
      fetchPhotos('carousel').then(setCarouselPhotos),
    ]).catch(() => {
      // Each fetcher handles its own fallback
    });
  }, []);

  return (
    <>
      <Nav />
      <main>
        <Hero content={content.hero} photos={heroPhotos} />
        <About content={content.about} photos={galleryPhotos} />
        <Highlights photos={galleryPhotos} />
        <Carousel photos={carouselPhotos} />
        <Testimonial photos={galleryPhotos} />
      </main>
      <Footer content={content.contact} />
    </>
  );
}
