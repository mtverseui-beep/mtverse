import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Gauge, Store, Building2, Code2 } from 'lucide-react'
import { SITE_URL } from '@/lib/site-url'
import { Suspense } from 'react'
import PublicLayout from '@/components/layout/PublicLayout'
import { TemplatesHubClient } from '@/components/templates/templates-hub-client'
import { getAllTemplatesFromStore, getTemplateCategoriesFor, getTemplateStatsFor } from '@/lib/templates-data'
import { withAllTemplateSocial } from '@/lib/template-social-store'
import { TEMPLATE_SEO_HUBS } from '@/lib/template-seo-hubs'
import { TemplateFaqList } from '@/components/content/template-faq-list'

export const metadata: Metadata = {
  title: {
    default: 'Next.js Dashboards, Admin UI & HTML Templates',
    template: '%s | mtverse',
  },
  description:
    'Browse premium Next.js dashboards, React admin UI kits, ecommerce, SaaS, landing pages, and free responsive HTML templates with live previews.',
  keywords: [
    'Next.js dashboard templates',
    'Next.js admin dashboard template',
    'React admin dashboard template',
    'SaaS dashboard template',
    'enterprise dashboard template',
    'Radix UI dashboard',
    'TypeScript dashboard template',
    'AI SaaS dashboard template',
    'ecommerce admin dashboard',
    'CRM dashboard template',
    'analytics dashboard UI kit',
    'premium website templates',
    'free template previews',
    'free dashboard template preview',
    'website templates for SaaS',
    'dashboard template live preview',
    'startup dashboard template',
    'B2B SaaS admin template',
    'developer dashboard templates',
    'Figma dashboard UI inspiration',
    'admin UI kits',
    'React dashboard templates',
    'Tailwind CSS templates',
    'free HTML templates',
    'responsive HTML templates',
    'HTML website templates',
    'portfolio website templates',
    'SaaS HTML templates',
    'ecommerce HTML templates',
    'agency website templates',
    'restaurant website templates',
    'healthcare website templates',
    'education website templates',
    'fitness website templates',
    'crypto website templates',
    'real estate website templates',
    'all HTML templates bundle',
    'free website templates download',
  ],
  alternates: { canonical: '/templates' },
  openGraph: {
    title: 'Next.js Dashboards, Admin UI & HTML Templates',
    description:
      'Premium Next.js dashboards plus free responsive HTML website templates for portfolios, SaaS, ecommerce, agencies, restaurants, healthcare, education, fitness, crypto, and real estate.',
    url: `${SITE_URL}/templates`,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Next.js Dashboards, Admin UI & HTML Templates',
    description: 'Dashboard templates and free HTML website templates with live previews, screenshots, and protected account delivery from mtverse.',
  },
  robots: { index: true, follow: true, 'max-image-preview': 'large' },
}

export const dynamic = 'force-dynamic'
const TEMPLATE_FAQS = [
  { question: 'Which template should I choose?', answer: 'Use HTML templates for static websites and quick client launches. Choose a dashboard or application template when you need richer product screens, authenticated workflows, and reusable application structure.' },
  { question: 'Are these free website templates?', answer: 'HTML templates support free individual downloads with the account limit shown on the site. The separate HTML bundle provides the complete collection and unlimited individual HTML access.' },
  { question: 'Do templates include live previews and screenshots?', answer: 'Yes. Each template includes a detail page with screenshots and a live preview when available, so you can inspect the visual quality and page scope before checkout.' },
  { question: 'Can I use these templates in production?', answer: 'Yes, under the license stated on the product page. Paid packages generally cover one production project unless a different license is explicitly shown.' },
]

type SearchParams = Promise<{
  category?: string
  search?: string
  sort?: string
  subcategory?: string
  page?: string
}>

export default async function TemplatesPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams
  const category = sp.category ?? 'all'
  const search = sp.search ?? ''
  const sort = (sp.sort as 'featured' | 'trending' | 'new' | 'downloads' | 'price-low' | 'price-high' | 'rating') ?? 'featured'
  const subcategory = sp.subcategory ?? 'all'
  const page = Math.max(1, Math.floor(Number(sp.page) || 1))

  const baseTemplates = await getAllTemplatesFromStore()
  const templates = await withAllTemplateSocial(baseTemplates)
  const categoryOptions = getTemplateCategoriesFor(templates)
  const stats = getTemplateStatsFor(templates)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': SITE_URL + '/templates#collection',
        name: 'Premium Dashboard and Free HTML Website Templates',
        description: metadata.description,
        url: SITE_URL + '/templates',
        numberOfItems: templates.length,
      },
      {
        '@type': 'ItemList',
        '@id': SITE_URL + '/templates#itemlist',
        name: 'mtverse templates',
        itemListElement: templates.slice(0, 24).map((template, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          url: SITE_URL + '/templates/' + template.slug,
          name: template.title,
        })),
      },
    ],
  }

  return (
    <PublicLayout>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <main>
        <Suspense
          fallback={
            <div className="ds-container py-20 text-center ds-muted">Loading templates...</div>
          }
        >
          <TemplatesHubClient
            templates={templates}
            initialCategory={category}
            initialSearch={search}
            initialSort={sort}
            initialSubcategory={subcategory}
            initialPage={page}
            totalTemplates={stats.totalTemplates}
            categoryOptions={categoryOptions}
          />
        </Suspense>

        <section className="border-y border-border bg-background">
          <div className="ds-container py-12 sm:py-14">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-3xl">
                <span className="ds-eyebrow ds-eyebrow-accent mb-3">Choose by project type</span>
                <h2 className="ds-h2">Templates for product teams, agencies, and independent builders</h2>
                <p className="mt-3 text-sm leading-7 text-muted-foreground sm:text-base">
                  Compare the framework, included screens, live preview, license, and exact purchase scope before choosing a source package.
                </p>
              </div>
              <Link href="/pricing" className="ds-btn ds-btn-secondary shrink-0">Compare access options</Link>
            </div>

            <div className="mt-8 grid overflow-hidden rounded-lg border border-border sm:grid-cols-2 lg:grid-cols-4">
              {[
                { title: 'Free HTML templates', copy: 'Responsive static websites for portfolios, services, SaaS, ecommerce, and client launches.', icon: Code2, href: '/template-categories/html' },
                { title: 'SaaS dashboards', copy: 'Admin shells, billing, analytics, workspace, and team management screens.', icon: Gauge, href: '/template-hubs/saas-templates' },
                { title: 'Ecommerce templates', copy: 'Storefront, catalog, checkout, orders, inventory, and operations interfaces.', icon: Store, href: '/template-categories/ecommerce' },
                { title: 'Enterprise admin UI', copy: 'Data-rich dashboards, RBAC, settings, CRM, finance, and internal tools.', icon: Building2, href: '/template-hubs/react-admin-dashboard-templates' },
              ].map((item) => (
                <Link key={item.title} href={item.href} className="group border-b border-border bg-card p-5 no-underline transition-colors hover:bg-muted/35 sm:border-r sm:[&:nth-child(2n)]:border-r-0 sm:[&:nth-last-child(-n+2)]:border-b-0 lg:border-b-0 lg:[&:nth-child(2n)]:border-r lg:last:border-r-0">
                  <div className="mb-4 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary"><item.icon className="h-4 w-4" /></div>
                  <h3 className="text-sm font-bold text-foreground">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.copy}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">Explore <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" /></span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="ds-section-sm ds-bg-section">
          <div className="ds-container max-w-4xl">
            <div className="mb-8 text-center">
              <span className="ds-eyebrow mb-3">Template FAQ</span>
              <h2 className="ds-h2">What to know before choosing source</h2>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">Straight answers about previews, free access, production use, and package scope.</p>
            </div>
            <TemplateFaqList items={TEMPLATE_FAQS} />
          </div>
        </section>

        <section className="border-y border-border bg-background">
          <div className="ds-container grid lg:grid-cols-2">
            <div className="py-10 lg:border-r lg:border-border lg:pr-10">
              <h2 className="text-sm font-bold text-foreground">Explore template categories</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">Browse only the product format relevant to your current project.</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {categoryOptions.filter((category) => category.id !== 'all').map((category) => (
                  <Link key={category.id} href={`/template-categories/${category.id}`} className="ds-btn ds-btn-secondary ds-btn-sm">{category.label}</Link>
                ))}
              </div>
            </div>
            <div className="border-t border-border py-10 lg:border-t-0 lg:pl-10">
              <h2 className="text-sm font-bold text-foreground">Focused buyer guides</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">Use curated collections when you already know the framework or workflow you need.</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {TEMPLATE_SEO_HUBS.map((hub) => (
                  <Link key={hub.slug} href={`/template-hubs/${hub.slug}`} className="ds-btn ds-btn-secondary ds-btn-sm">{hub.title}</Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-muted/25">
          <div className="ds-container flex flex-wrap items-center gap-2 py-7 text-sm">
            <Link href="/html-templates" className="ds-btn ds-btn-ghost ds-btn-sm">Free HTML templates</Link>
            <Link href="/faq" className="ds-btn ds-btn-ghost ds-btn-sm">Template FAQ</Link>
            <Link href="/support" className="ds-btn ds-btn-ghost ds-btn-sm">Support</Link>
            <Link href="/refund-policy" className="ds-btn ds-btn-ghost ds-btn-sm">Refund policy</Link>
          </div>
        </section>
      </main>
    </PublicLayout>
  )
}
