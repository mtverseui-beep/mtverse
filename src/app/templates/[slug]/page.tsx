import type { Metadata } from 'next'
import { SITE_URL } from '@/lib/site-url'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  Star,
  Eye,
  ShoppingCart,
  Check,
  Code,
  FileText,
  Layers,
  Shield,
  Zap,
  Sparkles,
  ChevronRight,
  TrendingUp,
  Package,
} from 'lucide-react'
import PublicLayout from '@/components/layout/PublicLayout'
import { getTemplateBySlugFromStore, getRelatedTemplatesFromStore, getTemplateCategoriesFromStore } from '@/lib/templates-data'
import { withAllTemplateSocial, withTemplateSocial } from '@/lib/template-social-store'
import { TemplateCard } from '@/components/templates/template-card'
import { TemplateDetailClient } from '@/components/templates/template-detail-client'
import { TemplateTabs } from '@/components/templates/template-tabs'
import { TemplateFrameworkRequest } from '@/components/templates/template-framework-request'
import { Reveal, Stagger, StaggerItem } from '@/components/design-system/animations'
import { SectionBackground, CtaBackground } from '@/components/design-system/backgrounds'

type Params = Promise<{ slug: string }>

const TEMPLATE_SLUG_ALIASES: Record<string, string> = {
  'ooster-admin-dashboard-template': 'ooster',
  'ooster-dashboard-template': 'ooster',
  'mt-ooster-dxb4': 'ooster',
  'nova-ig-landing-page-template': 'nova-rig-gaming-ecommerce-template',
  'nova-ig-template': 'nova-rig-gaming-ecommerce-template',
  'mt-nova-ig': 'nova-rig-gaming-ecommerce-template',
  'lumina-landing-page-template': 'lumina-fragrance',
  'mt-lumina': 'lumina-fragrance',
  'pagepulse-landing-page-template': 'pagepulse',
  'mt-pagepulse0': 'pagepulse',
  'volthaus-landing-page-template': 'volthaus-streetwear-ecommerce-template',
  'mt-volthaus': 'volthaus-streetwear-ecommerce-template',
  'sentinelgrid-dashboard-template': 'sentinelgrid',
  'mt-sentinelgrid-zw5j': 'sentinelgrid',
  'planna-dashboard-template': 'planna-dashboard',
  'mt-planna-z3pv': 'planna-dashboard',
  'nexusgrid-admin-dashboard-template': 'nexusgrid-premium-admin-dashboard',
  'mt-nexusgrid': 'nexusgrid-premium-admin-dashboard',
}

export const dynamic = 'force-dynamic'

function resolveTemplateSlug(slug: string) {
  return TEMPLATE_SLUG_ALIASES[slug] || slug
}

function uniqueKeywords(values: Array<string | undefined>) {
  return Array.from(new Set(values.map((value) => value?.trim()).filter(Boolean) as string[])).slice(0, 30)
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params
  const resolvedSlug = resolveTemplateSlug(slug)
  const template = await getTemplateBySlugFromStore(resolvedSlug)
  if (!template) {
    return { title: 'Template not found', robots: { index: false, follow: false } }
  }

  const categoryLabel = template.categoryLabel || template.category
  const description = template.metaDescription || template.summary
  const title = template.seoTitle || template.title + ' - Premium Template'
  const keywords = uniqueKeywords([
    template.title,
    template.subcategory,
    categoryLabel + ' template',
    categoryLabel + ' website template',
    template.frameworkLabel || 'Next.js template',
    'premium website templates',
    'dashboard templates with live preview',
    'admin dashboard template',
    'SaaS dashboard template',
    'ecommerce dashboard template',
    'React admin template',
    ...(template.keywords || []),
    ...template.tags,
    ...template.techStack,
  ])

  return {
    title,
    description,
    keywords,
    alternates: { canonical: '/templates/' + template.slug },
    openGraph: {
      title,
      description,
      url: SITE_URL + '/templates/' + template.slug,
      type: 'website',
      siteName: 'mtverse',
      images: [{ url: template.screenshotUrl, width: 1900, height: 900, alt: template.title }],
    },
    twitter: { card: 'summary_large_image', title, description, images: [template.screenshotUrl] },
    robots: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
    },
  }
}

const HIGHLIGHT_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Zap, Code, FileText, Layers, Shield, Sparkles, Eye, Package, ShoppingCart, TrendingUp,
}

export default async function TemplateDetailPage({ params }: { params: Params }) {
  const { slug } = await params
  const resolvedSlug = resolveTemplateSlug(slug)

  if (resolvedSlug !== slug) {
    redirect(`/templates/${resolvedSlug}`)
  }

  const baseTemplate = await getTemplateBySlugFromStore(resolvedSlug)
  if (!baseTemplate) notFound()

  const [template, related, categories] = await Promise.all([
    withTemplateSocial(baseTemplate),
    getRelatedTemplatesFromStore(resolvedSlug, 4).then((items) => withAllTemplateSocial(items)),
    getTemplateCategoriesFromStore(),
  ])
  const category = categories.find((c) => c.id === template.category)

  const canonicalUrl = SITE_URL + '/templates/' + template.slug
  const pageDescription = template.metaDescription || template.summary
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Product',
        '@id': canonicalUrl + '#product',
        name: template.title,
        description: pageDescription,
        image: [template.screenshotUrl],
        sku: template.id,
        category: template.categoryLabel || template.category,
        brand: { '@type': 'Brand', name: template.author.name },
        ...(template.reviewCount > 0 ? { aggregateRating: { '@type': 'AggregateRating', ratingValue: template.rating, reviewCount: template.reviewCount, bestRating: 5 } } : {}),
        offers: {
          '@type': 'Offer',
          url: canonicalUrl,
          price: template.price,
          priceCurrency: template.currency,
          availability: 'https://schema.org/InStock',
          itemCondition: 'https://schema.org/NewCondition',
        },
      },
      {
        '@type': 'SoftwareApplication',
        '@id': canonicalUrl + '#software',
        name: template.title,
        applicationCategory: 'DeveloperApplication',
        operatingSystem: 'Web',
        description: pageDescription,
        image: template.screenshotUrl,
        offers: { '@type': 'Offer', price: template.price, priceCurrency: template.currency },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': canonicalUrl + '#breadcrumb',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'Templates', item: SITE_URL + '/templates' },
          { '@type': 'ListItem', position: 3, name: template.title, item: canonicalUrl },
        ],
      },
    ],
  }

  return (
    <PublicLayout>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <main>
        {/* ═══ Breadcrumb ═══ */}
        <div className="ds-container pt-6">
          <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link href="/templates" className="hover:text-foreground">Templates</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            {category && (
              <>
                <Link href={`/template-categories/${category.id}`} className="hover:text-foreground">{category.label}</Link>
                <ChevronRight className="h-3.5 w-3.5" />
              </>
            )}
            <span className="text-foreground truncate max-w-[200px]">{template.title}</span>
          </nav>
        </div>

        {/* ═══ HERO: Large screenshot + sticky buy box ═══ */}
        <section className="ds-section-sm">
          <div className="ds-container">
            {/* Title + meta row */}
            <Reveal>
              <div className="mb-4 sm:mb-6 space-y-2 sm:space-y-3">
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  {template.featured && (
                    <span className="ds-badge ds-badge-primary"><Sparkles className="h-3 w-3" /> Featured</span>
                  )}
                  {template.new && (
                    <span className="ds-badge ds-badge-success"><Zap className="h-3 w-3" /> New</span>
                  )}
                  {template.trending && (
                    <span className="ds-badge ds-badge-accent"><TrendingUp className="h-3 w-3" /> Trending</span>
                  )}
                  <span className="text-xs text-muted-foreground capitalize">{template.category}</span>
                </div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight ds-text-balance">{template.title}</h1>
                <p className="text-sm sm:text-base text-muted-foreground ds-text-pretty max-w-3xl">{template.summary}</p>
                <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                  {template.reviewCount > 0 ? (
                    <span className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 sm:h-4 sm:w-4 fill-amber-400 text-amber-400" />
                      <strong className="text-foreground">{template.rating}</strong>
                      ({template.reviewCount} reviews)
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 font-medium text-foreground">
                      <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                      New release
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Package className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    {template.components}+ components
                  </span>
                </div>
              </div>
            </Reveal>

            {/* Screenshot + Buy box grid — side-by-side from sm (640px) */}
            <div className="grid grid-cols-1 gap-4 items-start sm:grid-cols-[1fr_280px] md:grid-cols-[1fr_320px] lg:grid-cols-[1fr_360px]">
              {/* Left: full screenshot preview */}
              <Reveal>
                <div className="overflow-hidden rounded-xl border border-border/80 bg-muted/35 p-1.5 sm:p-2 shadow-lg">
                  <div className="group relative overflow-hidden rounded-lg border border-border/70 bg-background">
                      <Image
                        src={template.screenshotUrl}
                        alt={template.title}
                        width={1900}
                        height={900}
                        sizes="(max-width: 1024px) 100vw, 760px"
                        quality={80}
                        className="block h-auto w-full object-contain transition duration-500 group-hover:scale-[1.01]"
                        priority
                      />
                      <Link
                        href={`/preview/${template.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Open live preview for ${template.title}`}
                        className="absolute inset-0 flex items-center justify-center bg-zinc-950/0 opacity-0 transition-all duration-300 ease-out group-hover:bg-zinc-950/25 group-hover:opacity-100 focus-visible:bg-zinc-950/25 focus-visible:opacity-100 focus-visible:outline-none"
                      >
                        <span className="inline-flex translate-y-2 scale-95 items-center gap-2 rounded-full bg-background/95 px-5 py-2.5 text-sm font-semibold text-foreground shadow-2xl ring-1 ring-border backdrop-blur transition-all duration-300 ease-out group-hover:translate-y-0 group-hover:scale-100">
                          <Eye className="h-4 w-4" />
                          Live preview
                        </span>
                      </Link>
                    </div>
                  </div>
              </Reveal>

              {/* Right: Buy box */}
              <Reveal delay={0.1}>
                <TemplateDetailClient template={template} />
              </Reveal>
            </div>

            {!template.isFree ? (
              <Reveal delay={0.14}>
                <TemplateFrameworkRequest slug={template.slug} title={template.title} />
              </Reveal>
            ) : null}
          </div>
        </section>

        {/* ═══ Highlights — bento-style grid ═══ */}
        <section className="ds-section-sm">
          <div className="ds-container">
            <Stagger className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
              {template.highlights.map((h, i) => {
                const Icon = HIGHLIGHT_ICONS[h.icon] ?? Sparkles
                const gradients = [
                  'from-violet-50 to-indigo-50 dark:from-violet-950/20 dark:to-indigo-950/20 border-violet-100 dark:border-violet-900/30',
                  'from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 border-emerald-100 dark:border-emerald-900/30',
                  'from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-100 dark:border-amber-900/30',
                  'from-sky-50 to-blue-50 dark:from-sky-950/20 dark:to-blue-950/20 border-sky-100 dark:border-sky-900/30',
                ]
                const iconColors = [
                  'bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-300',
                  'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300',
                  'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-300',
                  'bg-sky-100 text-sky-600 dark:bg-sky-900/40 dark:text-sky-300',
                ]
                return (
                  <StaggerItem key={i}>
                    <div className={`h-full rounded-xl border bg-gradient-to-br p-3 sm:p-4 group hover:shadow-md transition-all ${gradients[i % 4]}`}>
                      <div className={`inline-flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg mb-2 group-hover:scale-110 transition-transform ${iconColors[i % 4]}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <h3 className="text-xs sm:text-sm font-semibold mb-0.5">{h.title}</h3>
                      <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed line-clamp-2">{h.description}</p>
                    </div>
                  </StaggerItem>
                )
              })}
            </Stagger>
          </div>
        </section>

        {/* ═══ Description + Features with Tabs (About + Reviews) ═══ */}
        <section className="ds-section-sm ds-bg-section relative overflow-hidden">
          <SectionBackground />
          <div className="ds-container relative max-w-5xl">
            <Reveal>
              <TemplateTabs template={template} />
            </Reveal>

            {/* What's included — below tabs */}
            <Reveal delay={0.1}>
              <div className="mt-8 sm:mt-10 pt-6 sm:pt-8 border-t">
                <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">What&apos;s included</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  {template.features.map((f, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="inline-flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 shrink-0 mt-0.5">
                        <Check className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                      </span>
                      <span className="text-xs sm:text-sm">{f}</span>
                    </div>
                  ))}
                </div>

                {/* Pages */}
                <h3 className="text-sm sm:text-base font-semibold mb-2 sm:mb-3 mt-5 sm:mt-6">Pages included</h3>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {template.pages.map((p, i) => (
                    <span key={`${p}-${i}`} className="text-[11px] sm:text-xs px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full border bg-background">{p}</span>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        <section className="ds-section-sm ds-bg-section">
          <div className="ds-container max-w-4xl">
            <Reveal>
              <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6">Template details</h2>
              <div className="ds-card overflow-hidden p-0">
                <dl className="divide-y divide-border">
                  {[
                    { label: 'Pages', value: `${template.pages.length} ready pages` },
                    { label: 'Components', value: `${template.components}+ reusable sections` },
                    { label: 'License', value: template.license },
                    { label: 'Last updated', value: new Date(template.lastUpdated).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) },
                    { label: 'Responsive', value: 'Desktop, tablet, and mobile' },
                  ].map((spec) => (
                    <div key={spec.label} className="flex items-center justify-between px-4 sm:px-5 py-2.5 sm:py-3 hover:bg-accent/30 transition-colors">
                      <dt className="text-xs sm:text-sm text-muted-foreground">{spec.label}</dt>
                      <dd className="text-xs sm:text-sm font-medium text-foreground">{spec.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </Reveal>
          </div>
        </section>
        {/* ═══ Changelog ═══ */}
        <section className="ds-section-sm">
          <div className="ds-container max-w-4xl">
            <Reveal>
              <h2 className="ds-h2 mb-6">What&apos;s new</h2>
              <div className="space-y-4">
                {[
                  { version: 'v1.0.0', date: template.lastUpdated, changes: ['Initial release', 'All pages built and tested', 'Documentation complete'], latest: true },
                  { version: 'v0.9.0', date: '2026-05-15', changes: ['Beta release for early testers', 'Bug fixes and polish'], latest: false },
                ].map((release, i) => (
                  <Reveal key={i} delay={i * 0.05}>
                    <div className="ds-card">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="ds-badge ds-badge-primary">{release.version}</span>
                          <span className="text-sm text-muted-foreground">
                            {new Date(release.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                        {release.latest && <span className="ds-badge ds-badge-success">Latest</span>}
                      </div>
                      <ul className="space-y-1.5">
                        {release.changes.map((change, j) => (
                          <li key={j} className="flex items-start gap-2 text-sm">
                            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary-500 shrink-0" />
                            <span>{change}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </Reveal>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* ═══ FAQ ═══ */}
        <section className="ds-section-sm ds-bg-section relative overflow-hidden">
          <SectionBackground />
          <div className="ds-container relative max-w-3xl">
            <Reveal className="text-center mb-8">
              <h2 className="ds-h2 mb-2">FAQ</h2>
              <p className="ds-muted">Frequently asked questions about this template</p>
            </Reveal>
            <div className="space-y-3">
              {template.faq.map((item, i) => (
                <Reveal key={i} delay={i * 0.05}>
                  <div className="ds-card group">
                    <details>
                      <summary className="flex items-center justify-between gap-3 cursor-pointer list-none font-medium text-foreground">
                        {item.question}
                        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-90" />
                      </summary>
                      <p className="mt-3 text-sm text-muted-foreground">{item.answer}</p>
                    </details>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ Support ═══ */}
        <section className="ds-section-sm">
          <div className="ds-container max-w-4xl">
            <Reveal>
              <div className="ds-card">
                <div className="flex items-start gap-4">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300 shrink-0">
                    <Shield className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="ds-h3 mb-2">Support &amp; guarantees</h2>
                    <p className="text-sm text-muted-foreground mb-4">
                      Every purchase comes with our full support package. Email support within 24 hours.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {['12 months of free updates', '14-day no-questions refund', 'Email support (24h)', 'Single project license', 'Template package included', 'Documentation included'].map((item) => (
                        <div key={item} className="flex items-center gap-2 text-sm">
                          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 shrink-0">
                            <Check className="h-3 w-3" />
                          </span>
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ═══ Related ═══ */}
        {related.length > 0 && (
          <section className="ds-section-sm">
            <div className="ds-container">
              <div className="flex items-center justify-between mb-6">
                <h2 className="ds-h2">More in {category?.label}</h2>
                <Link href={`/template-categories/${template.category}`} className="text-sm font-medium text-primary-600 hover:underline">
                  View all
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {related.map((t) => <TemplateCard key={t.id} template={t} />)}
              </div>
            </div>
          </section>
        )}

        {/* ═══ Final CTA ═══ */}
        <section className="ds-section-lg ds-bg-section relative overflow-hidden">
          <CtaBackground />
          <div className="ds-container relative text-center max-w-2xl">
            <Reveal>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-3 sm:mb-4">Ready to ship?</h2>
            </Reveal>
            <Reveal delay={0.08}>
              <p className="text-sm sm:text-base text-muted-foreground mb-5 sm:mb-6">Get instant access to {template.title} and start building today.</p>
            </Reveal>
            <Reveal delay={0.16}>
              <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
                <Link href="#buy" className="ds-btn ds-btn-accent ds-btn-lg text-sm sm:text-base">
                  <ShoppingCart className="h-4 w-4" />
                  Buy now — ${template.price}
                </Link>
                <Link href={`/preview/${template.slug}`} target="_blank" className="ds-btn ds-btn-secondary ds-btn-lg text-sm sm:text-base">
                  <Eye className="h-4 w-4" />
                  Live preview
                </Link>
              </div>
            </Reveal>
          </div>
        </section>
      </main>
    </PublicLayout>
  )
}
