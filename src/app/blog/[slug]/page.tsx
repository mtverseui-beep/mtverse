import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Calendar, Clock, BookOpen } from 'lucide-react'
import PublicLayout from '@/components/layout/PublicLayout'
import { BLOG_POSTS, getBlogPost } from '@/lib/blog-posts'
import { SITE_URL } from '@/lib/site-url'
import { Reveal } from '@/components/design-system/animations'
import { BlogShareButton } from '@/components/blog/blog-share-button'

type Params = Promise<{ slug: string }>

export async function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params
  const post = getBlogPost(slug)
  if (!post) return { title: 'Post not found', robots: { index: false } }

  return {
    title: `${post.title} | mtverse Blog`,
    description: post.excerpt,
    keywords: [
      post.title,
      post.category,
      'website template guide',
      'dashboard template guide',
      'UI component library',
      'responsive website templates',
      'template source code',
      'production web development',
    ],
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `${SITE_URL}/blog/${post.slug}`,
      type: 'article',
      publishedTime: post.isoDate,
      authors: ['mtverse'],
      images: [{ url: post.coverImage, alt: post.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: [post.coverImage],
    },
  }
}

export default async function BlogPostPage({ params }: { params: Params }) {
  const { slug } = await params
  const post = getBlogPost(slug)

  if (!post) {
    notFound()
  }

  const currentIndex = BLOG_POSTS.findIndex((p) => p.slug === post.slug)
  const prevPost = currentIndex > 0 ? BLOG_POSTS[currentIndex - 1] : null
  const nextPost = currentIndex < BLOG_POSTS.length - 1 ? BLOG_POSTS[currentIndex + 1] : null

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    image: SITE_URL + post.coverImage,
    datePublished: post.isoDate,
    dateModified: post.isoDate,
    url: `${SITE_URL}/blog/${post.slug}`,
    author: { '@type': 'Organization', name: 'mtverse', url: SITE_URL },
    publisher: {
      '@type': 'Organization',
      name: 'mtverse',
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/SiteLogo.png` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL}/blog/${post.slug}` },
  }

  return (
    <PublicLayout>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <main>
        {/* Article Header */}
        <section className="ds-section-lg pb-0">
          <div className="ds-container max-w-3xl">
            <Reveal>
              <Link
                href="/blog"
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to blog
              </Link>
            </Reveal>

            <Reveal delay={0.05}>
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  {post.category}
                </span>
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <h1 className="ds-display-3 mb-4 ds-text-balance">{post.title}</h1>
            </Reveal>

            <Reveal delay={0.15}>
              <p className="ds-lead ds-muted ds-text-pretty mb-6">{post.excerpt}</p>
            </Reveal>

            <Reveal delay={0.2}>
              <div className="flex flex-wrap items-center gap-4 pb-8 border-b">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <BookOpen className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-sm font-medium">mtverse</span>
                </div>
                <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  {post.date}
                </span>
                <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  {post.readTime}
                </span>
              </div>
            </Reveal>
          </div>
        </section>

        <section className="pt-8">
          <div className="ds-container max-w-3xl">
            <figure className="relative aspect-[16/9] overflow-hidden rounded-lg border border-border bg-muted shadow-sm">
              <Image
                src={post.coverImage}
                alt={post.title}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 768px"
                className="object-cover object-top"
              />
            </figure>
          </div>
        </section>
        {/* Article Body */}
        <article className="ds-section-sm">
          <div className="ds-container max-w-3xl">
            <Reveal>
              <div className="prose prose-zinc dark:prose-invert max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-p:leading-relaxed prose-li:leading-relaxed prose-a:text-primary prose-a:no-underline hover:prose-a:underline">
                {/* Intro */}
                <p className="text-lg leading-relaxed text-muted-foreground">{post.intro}</p>

                {/* Sections */}
                {post.sections.map((section, i) => (
                  <section key={i} className="mt-10">
                    <h2 className="text-xl font-bold text-foreground mb-4">{section.heading}</h2>
                    {section.body.map((paragraph, j) => (
                      <p key={j} className="text-base leading-7 text-muted-foreground mb-4">
                        {paragraph}
                      </p>
                    ))}
                    {section.bullets && section.bullets.length > 0 && (
                      <ul className="mt-4 space-y-2">
                        {section.bullets.map((bullet, k) => (
                          <li key={k} className="flex items-start gap-2.5 text-base text-muted-foreground">
                            <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </section>
                ))}
              </div>
            </Reveal>

            {/* Share + Tags */}
            <Reveal delay={0.1}>
              <div className="mt-12 pt-8 border-t flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Category:</span>
                  <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                    {post.category}
                  </span>
                </div>
                <BlogShareButton title={post.title} />
              </div>
            </Reveal>

            {/* Prev/Next navigation */}
            <Reveal delay={0.15}>
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {prevPost ? (
                  <Link
                    href={`/blog/${prevPost.slug}`}
                    className="group ds-card p-4 hover:border-primary-300 transition-colors"
                  >
                    <span className="text-xs text-muted-foreground mb-1 block">Previous</span>
                    <span className="text-sm font-semibold group-hover:text-primary transition-colors line-clamp-2">
                      {prevPost.title}
                    </span>
                  </Link>
                ) : <div />}
                {nextPost ? (
                  <Link
                    href={`/blog/${nextPost.slug}`}
                    className="group ds-card p-4 hover:border-primary-300 transition-colors text-right"
                  >
                    <span className="text-xs text-muted-foreground mb-1 block">Next</span>
                    <span className="text-sm font-semibold group-hover:text-primary transition-colors line-clamp-2">
                      {nextPost.title}
                    </span>
                  </Link>
                ) : null}
              </div>
            </Reveal>

            {/* CTA */}
            <Reveal delay={0.2}>
              <div className="mt-12 ds-card bg-primary/5 border-primary/20 p-6 sm:p-8 text-center">
                <h3 className="text-lg font-bold mb-2">Explore more on mtverse</h3>
                <p className="text-sm text-muted-foreground mb-5">
                  Browse dashboard, ecommerce, SaaS, landing page, portfolio, and HTML templates, or explore reusable UI component source.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <Link href="/templates" className="ds-btn ds-btn-primary">
                    View templates
                  </Link>
                  <Link href="/pricing#ui-library" className="ds-btn ds-btn-secondary">
                    Explore UI Library
                  </Link>
                </div>
              </div>
            </Reveal>
          </div>
        </article>
      </main>
    </PublicLayout>
  )
}
