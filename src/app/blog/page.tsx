import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Calendar, Clock, Sparkles, BookOpen } from 'lucide-react'
import PublicLayout from '@/components/layout/PublicLayout'
import { BLOG_POSTS } from '@/lib/blog-posts'
import { SITE_URL } from '@/lib/site-url'
import { Reveal, Stagger, StaggerItem } from '@/components/design-system/animations'
import { SectionBackground } from '@/components/design-system/backgrounds'

export const metadata: Metadata = {
  title: 'Blog - AI Prompts, Templates & Web Development Guides | mtverse',
  description: 'Practical guides on AI prompt engineering, Next.js dashboard templates, React architecture, Tailwind CSS design systems, and modern web development.',
  alternates: { canonical: '/blog' },
  openGraph: {
    title: 'Blog - mtverse',
    description: 'Practical guides on AI prompts, dashboard templates, and modern web development.',
    url: SITE_URL + '/blog',
    type: 'website',
  },
}

const CATEGORY_COLORS: Record<string, string> = {
  'AI Prompts': 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
  'React': 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
  'CSS': 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
  'Next.js': 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
  'AI Tools': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
}

function getCategoryColor(category: string) {
  return CATEGORY_COLORS[category] || 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
}

export default function BlogPage() {
  const [featured, ...rest] = BLOG_POSTS

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'mtverse Blog',
    description: 'Practical guides on AI prompts, dashboard templates, and web development.',
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
      datePublished: post.isoDate,
      url: `${SITE_URL}/blog/${post.slug}`,
      author: { '@type': 'Organization', name: 'mtverse' },
    })),
  }

  return (
    <PublicLayout>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <main>
        {/* Hero */}
        <section className="ds-section-lg relative overflow-hidden">
          <SectionBackground />
          <div className="ds-container relative text-center max-w-4xl">
            <Reveal>
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-4">
                <BookOpen className="h-4 w-4" />
                Blog
              </div>
            </Reveal>
            <Reveal delay={0.08}>
              <h1 className="ds-display-2 mb-4">Guides for builders</h1>
            </Reveal>
            <Reveal delay={0.16}>
              <p className="ds-lead ds-text-pretty">
                Practical articles on AI prompt engineering, Next.js templates, React patterns, and modern web development.
              </p>
            </Reveal>
          </div>
        </section>

        {/* Featured Post */}
        {featured && (
          <section className="ds-section-sm">
            <div className="ds-container max-w-5xl">
              <Reveal>
                <Link
                  href={`/blog/${featured.slug}`}
                  className="group block ds-card overflow-hidden hover:border-primary-300 transition-all duration-300"
                >
                  <div className="p-6 sm:p-8 lg:p-10">
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${getCategoryColor(featured.category)}`}>
                        {featured.category}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <Sparkles className="h-3 w-3" />
                        Featured
                      </span>
                    </div>
                    <h2 className="ds-display-3 mb-3 group-hover:text-primary transition-colors">
                      {featured.title}
                    </h2>
                    <p className="ds-lead ds-muted ds-text-pretty max-w-3xl">
                      {featured.excerpt}
                    </p>
                    <div className="mt-6 flex flex-wrap items-center gap-4">
                      <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        {featured.date}
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        {featured.readTime}
                      </span>
                      <span className="ml-auto inline-flex items-center gap-1.5 text-sm font-medium text-primary group-hover:gap-2.5 transition-all">
                        Read article
                        <ArrowRight className="h-4 w-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              </Reveal>
            </div>
          </section>
        )}

        {/* All Posts Grid */}
        <section className="ds-section-sm ds-bg-section">
          <div className="ds-container max-w-6xl">
            <Reveal className="mb-8">
              <h2 className="ds-h2">All articles</h2>
            </Reveal>

            <Stagger className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {rest.map((post) => (
                <StaggerItem key={post.slug}>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="group flex flex-col h-full ds-card hover:border-primary-300 transition-all duration-300"
                  >
                    <div className="p-5 flex flex-col flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${getCategoryColor(post.category)}`}>
                          {post.category}
                        </span>
                        <span className="text-[11px] text-muted-foreground">{post.readTime}</span>
                      </div>
                      <h3 className="text-base font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-3 flex-1">
                        {post.excerpt}
                      </p>
                      <div className="mt-4 pt-4 border-t flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">{post.date}</span>
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                          Read
                          <ArrowRight className="h-3 w-3" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>

        {/* CTA */}
        <section className="ds-section-sm">
          <div className="ds-container max-w-3xl text-center">
            <Reveal>
              <h2 className="ds-h2 mb-3">Want to explore more?</h2>
              <p className="ds-muted mb-6">Browse our prompt library or check out premium dashboard templates.</p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link href="/prompts" className="ds-btn ds-btn-primary ds-btn-lg">
                  Browse prompts
                </Link>
                <Link href="/templates" className="ds-btn ds-btn-secondary ds-btn-lg">
                  View templates
                </Link>
              </div>
            </Reveal>
          </div>
        </section>
      </main>
    </PublicLayout>
  )
}
