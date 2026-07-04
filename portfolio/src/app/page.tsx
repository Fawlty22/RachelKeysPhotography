import { fetchContent, fetchPhotos } from '@/lib/content';
import { Nav } from '@/components/Nav';
import { Hero } from '@/sections/Hero';
import { About } from '@/sections/About';
import { Highlights } from '@/sections/Highlights';
import { Carousel } from '@/sections/Carousel';
import { Testimonial } from '@/sections/Testimonial';
import { Footer } from '@/sections/Footer';

/**
 * Home page — React Server Component.
 * All data is fetched on the server so the full HTML is sent to the browser
 * (and to search engine crawlers) on first load.
 */
export default async function HomePage() {
  // Fetch all data in parallel — each call falls back gracefully if the CDN
  // file doesn't exist yet (CMS not yet populated).
  const [content, heroPhotos, galleryPhotos, carouselPhotos] = await Promise.all([
    fetchContent(),
    fetchPhotos('hero'),
    fetchPhotos('gallery'),
    fetchPhotos('carousel'),
  ]);

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
