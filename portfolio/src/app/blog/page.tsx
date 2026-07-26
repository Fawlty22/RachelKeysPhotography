import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Nav } from '@/components/Nav';
import { Footer } from '@/sections/Footer';
import { fetchContent, fetchPosts, PHOTOS_CDN } from '@/lib/content';

const SITE_URL = 'https://rachelkeysphotography.com';

export const metadata: Metadata = {
  title: 'Blog',
  description:
    'Stories, behind-the-scenes moments, and reflections from Rachel Keys Photography.',
  alternates: { canonical: `${SITE_URL}/blog` },
  openGraph: {
    title: 'Blog | Rachel Keys Photography',
    description:
      'Stories, behind-the-scenes moments, and reflections from Rachel Keys Photography.',
    url: `${SITE_URL}/blog`,
    images: [{ url: `${SITE_URL}/og-image.jpg`, width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog | Rachel Keys Photography',
    description: 'Stories and behind-the-scenes moments from Rachel Keys Photography.',
  },
};

export default async function BlogPage() {
  const [content, allPosts] = await Promise.all([fetchContent(), fetchPosts()]);

  const posts = allPosts
    .filter((p) => p.publishedAt !== null)
    .sort((a, b) => {
      if (!a.publishedAt || !b.publishedAt) return 0;
      return b.publishedAt.localeCompare(a.publishedAt);
    });

  return (
    <>
      <Nav />
      <main className="min-h-screen bg-[var(--color-warm-white)]">
        {/* Page header */}
        <section className="pt-32 pb-12 px-6 lg:px-12 text-center">
          <p className="font-serif italic text-[var(--color-taupe-dark)] text-base mb-2">
            stories
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl font-normal uppercase tracking-widest text-[var(--color-charcoal)]">
            Blog
          </h1>
          <p className="mt-4 text-[var(--color-taupe-dark)] text-sm max-w-md mx-auto leading-relaxed">
            Behind-the-scenes moments, tips, and stories from sessions with real people.
          </p>
        </section>

        {/* Post grid */}
        <section className="px-6 lg:px-12 pb-24 mx-auto max-w-5xl">
          {posts.length === 0 ? (
            <p className="text-center text-[var(--color-taupe-dark)] text-sm py-20">
              Posts coming soon.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {posts.map((post) => {
                const coverUrl = post.coverPhotoKey
                  ? `${PHOTOS_CDN}/${post.coverPhotoKey}`
                  : null;
                const formattedDate = post.publishedAt
                  ? new Date(post.publishedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : null;

                return (
                  <Link
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    className="group block"
                    aria-label={`Read ${post.title}`}
                  >
                    {/* Cover image */}
                    <div className="relative aspect-[3/2] overflow-hidden bg-[var(--color-taupe)]/20 mb-4">
                      {coverUrl ? (
                        <Image
                          src={coverUrl}
                          alt={`${post.title} cover photo`}
                          fill
                          sizes="(max-width: 640px) 100vw, 50vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-[var(--color-taupe)]/30" />
                      )}
                    </div>

                    {/* Text */}
                    <div className="space-y-2">
                      {formattedDate && (
                        <p className="text-[var(--color-taupe-dark)] text-xs tracking-widest uppercase">
                          {formattedDate}
                        </p>
                      )}
                      <h2 className="font-serif text-xl text-[var(--color-charcoal)] group-hover:text-[var(--color-taupe-dark)] transition-colors leading-snug">
                        {post.title}
                      </h2>
                      {post.excerpt && (
                        <p className="text-[var(--color-charcoal-light)] text-sm leading-relaxed line-clamp-3">
                          {post.excerpt}
                        </p>
                      )}
                      <span className="inline-block text-xs tracking-widest uppercase text-[var(--color-charcoal)] border-b border-[var(--color-charcoal)] pb-px group-hover:border-[var(--color-taupe-dark)] group-hover:text-[var(--color-taupe-dark)] transition-colors">
                        Read More
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </main>
      <Footer content={content.contact} />
    </>
  );
}
