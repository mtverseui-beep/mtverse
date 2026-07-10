import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, Code2, LayoutDashboard, LayoutGrid, Sparkles } from 'lucide-react'
import PublicLayout from '@/components/layout/PublicLayout'
import { TemplateCard } from '@/components/templates/template-card'
import { Reveal, Stagger, StaggerItem } from '@/components/design-system/animations'
import { SITE_URL } from '@/lib/site-url'
import { getAllTemplatesFromStore, getTemplateCategoriesFor } from '@/lib/templates-data'
import { withAllTemplateSocial } from '@/lib/template-social-store'

type Params = Promise<{ category: string }>

export const dynamic = 'force-dynamic'

type CategoryPageInfo = { id: string; label: string; description: string; icon: string }

const PRIORITY_CATEGORY_LABELS: Record<string, string> = {
  dashboards: 'Dashboards',
  ecommerce: 'Ecommerce',
  landing: 'Landing Pages',
  html: 'HTML',
}

const CATEGORY_SEO: Record<string, { title: string; description: string; keywords: string[] }> = {
  dashboards: {
    title: 'Next.js Dashboard Templates & Admin UI Kits',
    description: 'Browse premium Next.js dashboard templates, React admin UI kits, SaaS dashboards, ecommerce admin panels, analytics dashboards, CRM screens, and production-ready dashboard source code.',
    keywords: [
      'Next.js dashboard templates',
      'React admin dashboard templates',
      'admin UI kits',
      'SaaS dashboard template',
      'ecommerce admin template',
      'analytics dashboard UI',
      'premium dashboard source code',
      'TypeScript dashboard template',
    ],
  },
  ecommerce: {
    title: 'Ecommerce Website Templates & Storefront UI Kits',
    description: 'Browse ecommerce templates with storefronts, product pages, cart, checkout, customer accounts, order management, inventory screens, and secure source-code delivery.',
    keywords: [
      'ecommerce templates',
      'online store template',
      'Next.js ecommerce template',
      'React ecommerce template',
      'storefront UI kit',
      'shopping cart template',
      'checkout template',
    ],
  },
  landing: {
    title: 'Landing Page Templates for SaaS, Apps & Products',
    description: 'Browse landing page templates for SaaS products, mobile apps, product launches, agencies, creators, ecommerce campaigns, and conversion-focused marketing pages.',
    keywords: [
      'landing page templates',
      'SaaS landing page template',
      'product landing page template',
      'app landing page template',
      'marketing landing page template',
      'conversion landing page UI',
      'startup landing page template',
    ],
  },
  html: {
    title: 'Free HTML Website Templates',
    description: 'Browse responsive HTML website templates for portfolios, SaaS sites, ecommerce pages, agencies, restaurants, healthcare, education, fitness, crypto, and real estate.',
    keywords: [
      'free HTML templates',
      'responsive HTML website templates',
      'portfolio website templates',
      'free website templates download',
      'SaaS HTML templates',
      'agency website templates',
      'static website templates',
    ],
  },
}

function fallbackTitle(categoryLabel: string) {
  return `${categoryLabel} Templates`
}

function fallbackDescription(categoryLabel: string) {
  return `Browse ${categoryLabel.toLowerCase()} templates with live previews, screenshots, reusable pages, secure ZIP delivery, and source-code access from mtverse.`
}
function resolveCategoryInfo(category: string, categories: CategoryPageInfo[]) {
  return categories.find((item) => item.id === category) || (
    PRIORITY_CATEGORY_LABELS[category]
      ? {
          id: category,
          label: PRIORITY_CATEGORY_LABELS[category],
          description: fallbackDescription(PRIORITY_CATEGORY_LABELS[category]),
          icon: category === 'dashboards' ? 'LayoutDashboard' : category === 'html' ? 'Code2' : 'LayoutGrid',
        }
      : null
  )
}

function templateMatchesCategory(templateCategory: string, category: string) {
  if (templateCategory === category) return true
  if (category === 'landing') return ['landing', 'landings', 'landing-pages'].includes(templateCategory)
  if (category === 'dashboards') return ['dashboards', 'dashboard-kits', 'dashboard-kit'].includes(templateCategory)
  return false
}

function categoryIcon(category: string) {
  if (category === 'dashboards') return LayoutDashboard
  if (category === 'html') return Code2
  return LayoutGrid
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { category } = await params
  const templates = await getAllTemplatesFromStore().catch(() => [])
  const categories = getTemplateCategoriesFor(templates).filter((item) => item.id !== 'all')
  const selected = resolveCategoryInfo(category, categories)

  if (!selected) return { title: 'Template category not found', robots: { index: false, follow: false } }

  const seo = CATEGORY_SEO[category]
  const title = seo?.title || fallbackTitle(selected.label)
  const description = seo?.description || fallbackDescription(selected.label)

  return {
    title,
    description,
    keywords: [
      ...(seo?.keywords || []),
      selected.label,
      `${selected.label} templates`,
      'mtverse templates',
      'template live preview',
      'website template source code',
    ],
    alternates: { canonical: `/template-categories/${category}` },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/template-categories/${category}`,
      type: 'website',
      siteName: 'mtverse',
    },
    twitter: { card: 'summary_large_image', title, description },
    robots: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
    },
  }
}

export default async function TemplateCategoryPage({ params }: { params: Params }) {
  const { category } = await params
  const baseTemplates = await getAllTemplatesFromStore()
  const categories = getTemplateCategoriesFor(baseTemplates).filter((item) => item.id !== 'all')
  const selected = resolveCategoryInfo(category, categories)
  if (!selected) notFound()

  const templates = await withAllTemplateSocial(baseTemplates.filter((template) => templateMatchesCategory(template.category, category)))
  const Icon = categoryIcon(category)
  const seo = CATEGORY_SEO[category]
  const title = seo?.title || fallbackTitle(selected.label)
  const description = seo?.description || fallbackDescription(selected.label)
  const canonicalUrl = `${SITE_URL}/template-categories/${category}`
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': canonicalUrl + '#collection',
        name: title,
        description,
        url: canonicalUrl,
        numberOfItems: templates.length,
      },
      {
        '@type': 'ItemList',
        '@id': canonicalUrl + '#itemlist',
        name: `${selected.label} templates`,
        itemListElement: templates.slice(0, 30).map((template, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          url: `${SITE_URL}/templates/${template.slug}`,
          name: template.title,
        })),
      },
      {
        '@type': 'BreadcrumbList',
        '@id': canonicalUrl + '#breadcrumb',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'Templates', item: `${SITE_URL}/templates` },
          { '@type': 'ListItem', position: 3, name: selected.label, item: canonicalUrl },
        ],
      },
    ],
  }

  return (
    <PublicLayout>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <main>
        <section className="ds-section-sm">
          <div className="ds-container">
            <Reveal>
              <div className="max-w-4xl">
                <Link href="/templates" className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:underline">
                  Templates
                  <ArrowRight className="h-3.5 w-3.5" />
                  {selected.label}
                </Link>
                <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-primary-700 dark:text-primary-300">
                  <Icon className="h-3.5 w-3.5" />
                  Template category
                </span>
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">{title}</h1>
                <p className="mt-4 max-w-3xl text-base leading-8 text-muted-foreground sm:text-lg">{description}</p>
                <div className="mt-5 flex flex-wrap gap-2 text-sm">
                  <span className="rounded-full border bg-background px-3 py-1 font-semibold">{templates.length} templates</span>
                  <span className="rounded-full border bg-background px-3 py-1 font-semibold">Live previews</span>
                  <span className="rounded-full border bg-background px-3 py-1 font-semibold">Secure ZIP delivery</span>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        <section className="ds-section-sm ds-bg-section">
          <div className="ds-container">
            <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {templates.map((template, index) => (
                <StaggerItem key={template.id}>
                  <TemplateCard template={template} priority={index < 6} />
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>

        <section className="ds-section-sm">
          <div className="ds-container max-w-5xl">
            <div className="grid gap-4 md:grid-cols-3">
              {[
                ['Live preview first', 'Open every template preview before purchase or download so you can inspect the layout, pages, and responsive behavior.'],
                ['Source-code delivery', 'Paid templates unlock protected ZIP downloads after checkout. Free HTML templates support free account downloads and bundle unlocks.'],
                ['Production-friendly', 'Use mtverse templates for dashboards, storefronts, landing pages, admin panels, portfolios, and client websites.'],
              ].map(([heading, copy]) => (
                <div key={heading} className="ds-card">
                  <Sparkles className="mb-3 h-5 w-5 text-primary-600" />
                  <h2 className="text-base font-bold">{heading}</h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{copy}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </PublicLayout>
  )
}