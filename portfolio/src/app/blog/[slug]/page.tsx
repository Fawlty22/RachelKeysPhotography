import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Nav } from '@/components/Nav';
import { Footer } from '@/sections/Footer';
import { fetchContent, fetchPosts, PHOTOS_CDN } from '@/lib/content';

const SITE_URL = 'https://rachelkeysphotography.com';

interface Props {
  params: Promise<{ slug: string }>;
}

// Pre-render a page for every published post at build time.
// When there are no published posts yet, this returns [] which is valid.
export const dynamicParams = false;

export async function generateStaticParams() {
  const posts = await fetchPosts();
  const published = posts.filter((p) => p.publishedAt !== null);
  // Next.js 15 with output:'export' errors if generateStaticParams returns [].
  // Return a sentinel slug so the route directory is generated; the page
  // body calls notFound() for any slug that doesn't match a real post.
  if (published.length === 0) return [{ slug: '__placeholder__' }];
  return published.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const posts = await fetchPosts();
  const post = posts.find((p) => p.slug === slug && p.publishedAt !== null);

  if (!post) return { title: 'Post Not Found' };

  const coverUrl = post.coverPhotoKey
    ? `${PHOTOS_CDN}/${post.coverPhotoKey}`
    : `${SITE_URL}/og-image.jpg`;

  return {
    title: post.title,
    description: post.excerpt || `Read ${post.title} on the Rachel Keys Photography blog.`,
    alternates: { canonical: `${SITE_URL}/blog/${post.slug}` },
    openGraph: {
      title: `${post.title} | Rachel Keys Photography`,
      description: post.excerpt || `Read ${post.title} on the Rachel Keys Photography blog.`,
      url: `${SITE_URL}/blog/${post.slug}`,
      images: [{ url: coverUrl, width: 1200, height: 800, alt: post.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${post.title} | Rachel Keys Photography`,
      description: post.excerpt || post.title,
      images: [coverUrl],
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const [content, posts] = await Promise.all([fetchContent(), fetchPosts()]);
  const post = posts.find((p) => p.slug === slug && p.publishedAt !== null);

  if (!post) notFound();

  const coverUrl = post.coverPhotoKey ? `${PHOTOS_CDN}/${post.coverPhotoKey}` : null;
  const formattedDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  return (
    <>
      <Nav />
      <main className="min-h-screen bg-[var(--color-warm-white)]">
        {/* Hero cover image */}
        {coverUrl && (
          <div className="relative w-full aspect-[16/7] overflow-hidden bg-[var(--color-taupe)]/20">
            <Image
              src={coverUrl}
              alt={`${post.title} cover photo`}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </div>
        )}

        {/* Article */}
        <article className="mx-auto max-w-2xl px-6 lg:px-0 py-16">
          {/* Back link */}
          <Link
            href="/blog"
            className="inline-flex items-center gap-1 text-xs text-[var(--color-taupe-dark)] hover:text-[var(--color-charcoal)] transition-colors tracking-widest uppercase mb-8"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            All Posts
          </Link>

          {/* Post header */}
          <header className="mb-10 space-y-3">
            {formattedDate && (
              <p className="text-[var(--color-taupe-dark)] text-xs tracking-widest uppercase">
                {formattedDate}
              </p>
            )}
            <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[var(--color-charcoal)] leading-tight">
              {post.title}
            </h1>
            {post.excerpt && (
              <p className="text-[var(--color-charcoal-light)] text-base leading-relaxed border-l-2 border-[var(--color-taupe)] pl-4">
                {post.excerpt}
              </p>
            )}
          </header>

          {/* Rich text body */}
          {post.bodyHtml && (
            <div
              className="prose prose-stone max-w-none prose-headings:font-serif prose-headings:font-normal prose-p:text-[var(--color-charcoal-light)] prose-p:leading-relaxed prose-a:text-[var(--color-charcoal)] prose-a:underline prose-blockquote:border-[var(--color-taupe)] prose-blockquote:text-[var(--color-taupe-dark)] prose-img:rounded"
              // Safe: only Rachel (authenticated CMS user) can author this content
              dangerouslySetInnerHTML={{ __html: post.bodyHtml }}
            />
          )}

          {/* Selected photos gallery */}
          {post.photoKeys.length > 0 && (
            <section className="mt-14" aria-label="Post photos">
              <h2 className="font-serif text-2xl font-normal text-[var(--color-charcoal)] mb-6">
                Photos
              </h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {post.photoKeys.map((key, i) => (
                  <div
                    key={key}
                    className="relative aspect-square overflow-hidden bg-[var(--color-taupe)]/20"
                  >
                    <Image
                      src={`${PHOTOS_CDN}/${key}`}
                      alt={`${post.title} — photo ${i + 1}`}
                      fill
                      sizes="(max-width: 640px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 hover:scale-105"
                    />
                  </div>
                ))}
              </div>
            </section>
          )}
        </article>
      </main>
      <Footer content={content.contact} />
    </>
  );
}
