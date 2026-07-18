import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, BookOpen, Calendar, Clock } from 'lucide-react'
import PublicLayout from '@/components/layout/PublicLayout'
import { BLOG_POSTS } from '@/lib/blog-posts'
import { SITE_URL } from '@/lib/site-url'

export const metadata: Metadata = {
  title: 'Template Guides, Next.js UI & Web Development Blog',
  description: 'Practical guides for choosing, customizing, testing, and deploying website templates, UI component libraries, dashboards, ecommerce sites, landing pages, and responsive HTML projects.',
  alternates: { canonical: '/blog' },
  openGraph: {
    title: 'Template and UI Engineering Guides - mtverse',
    description: 'Practical guides on dashboard templates, React architecture, HTML websites, and production web development.',
    url: SITE_URL + '/blog',
    type: 'website',
    images: [{ url: '/template-previews/pipeline-pilot-production.png', width: 1200, height: 630, alt: 'mtverse template engineering guides' }],
  },
  robots: { index: true, follow: true },
}

const CATEGORY_COLORS: Record<string, string> = {
  'Template Guides': 'bg-cyan-50 text-cyan-800 dark:bg-cyan-950/40 dark:text-cyan-200',
  Engineering: 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200',
}

function getCategoryColor(category: string) {
  return CATEGORY_COLORS[category] || 'bg-muted text-foreground'
}

export default function BlogPage() {
  const [featured, ...rest] = BLOG_POSTS

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'mtverse Blog',
    description: 'Practical guides on dashboard templates, HTML websites, UI components, and web development.',
    url: SITE_URL + '/blog',
    publisher: {
      '@type': 'Organization',
      name: 'mtverse',
      logo: SITE_URL + '/SiteLogo.png',
    },
    blogPost: BLOG_POSTS.map((post) => ({
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.excerpt,
      image: SITE_URL + post.coverImage,
      datePublished: post.isoDate,
      url: SITE_URL + '/blog/' + post.slug,
      author: { '@type': 'Organization', name: 'mtverse' },
    })),
  }

  return (
    <PublicLayout>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <main>
        <section className="relative flex min-h-[430px] items-center overflow-hidden border-b bg-background">
          <div aria-hidden className="ds-line-grid absolute inset-0 opacity-20" />
          <div aria-hidden className="absolute inset-y-0 left-[14%] w-px bg-border/60" />
          <div aria-hidden className="absolute inset-y-0 right-[14%] w-px bg-border/60" />
          <div aria-hidden className="absolute inset-x-0 top-1/2 h-px bg-border/40" />
          <div className="ds-container relative py-14 text-center sm:py-16">
            <div className="mx-auto max-w-3xl">
              <span className="ds-eyebrow ds-eyebrow-accent mb-4">
                <BookOpen className="h-3.5 w-3.5" />
                mtverse field notes
              </span>
              <h1 className="ds-display-2 ds-text-balance">Practical guides for choosing and shipping better interfaces</h1>
              <p className="ds-lead ds-text-pretty mx-auto mt-5 max-w-2xl">
                Useful guidance for evaluating website templates, building maintainable component systems, and taking dashboard, ecommerce, landing page, and HTML source to production.
              </p>
            </div>
          </div>
        </section>

        {featured ? (
          <section className="ds-section-sm">
            <div className="ds-container max-w-6xl">
              <p className="mb-4 text-xs font-bold uppercase tracking-wide text-muted-foreground">Featured guide</p>
              <Link
                href={'/blog/' + featured.slug}
                className="group grid overflow-hidden rounded-lg border border-border bg-card no-underline shadow-sm lg:grid-cols-[0.9fr_1.1fr]"
              >
                <div className="relative aspect-[16/10] min-h-64 overflow-hidden bg-muted lg:aspect-auto">
                  <Image
                    src={featured.coverImage}
                    alt={featured.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 45vw"
                    className="object-cover object-top"
                  />
                </div>
                <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
                  <div className="mb-4 flex flex-wrap items-center gap-3">
                    <span className={'inline-flex rounded-full px-3 py-1 text-xs font-semibold ' + getCategoryColor(featured.category)}>
                      {featured.category}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      {featured.readTime}
                    </span>
                  </div>
                  <h2 className="ds-h1 ds-text-balance group-hover:text-primary">{featured.title}</h2>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground sm:text-base">{featured.excerpt}</p>
                  <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                    Read the guide
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </Link>
            </div>
          </section>
        ) : null}

        <section className="ds-section ds-bg-section border-y">
          <div className="ds-container max-w-6xl">
            <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Knowledge base</p>
                <h2 className="ds-h1 mt-2">All practical guides</h2>
              </div>
              <Link href="/templates" className="text-sm font-semibold text-primary hover:underline">
                Browse the template catalog
              </Link>
            </div>

            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {rest.map((post) => (
                <article key={post.slug} className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
                  <Link href={'/blog/' + post.slug} className="group flex h-full flex-col no-underline">
                    <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                      <Image
                        src={post.coverImage}
                        alt={post.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover object-top"
                      />
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <span className={'inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ' + getCategoryColor(post.category)}>
                          {post.category}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {post.readTime}
                        </span>
                      </div>
                      <h3 className="text-base font-bold leading-6 group-hover:text-primary">{post.title}</h3>
                      <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">{post.excerpt}</p>
                      <div className="mt-auto flex items-center justify-between border-t pt-4 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {post.date}
                        </span>
                        <ArrowRight className="h-3.5 w-3.5 text-primary" />
                      </div>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="ds-section-sm">
          <div className="ds-container max-w-5xl">
            <div className="flex flex-col gap-5 border-y border-border py-8 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="ds-h2">Put the guidance into practice</h2>
                <p className="mt-2 text-sm text-muted-foreground">Inspect real template previews, package scope, and framework details before choosing.</p>
              </div>
              <Link href="/templates" className="ds-btn ds-btn-primary shrink-0">
                View templates
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>
    </PublicLayout>
  )
}
