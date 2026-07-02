import type { Metadata } from 'next'
import Link from 'next/link'
import { Gauge, Store, Building2, ChevronDown } from 'lucide-react'
import { SITE_URL } from '@/lib/site-url'
import { Suspense } from 'react'
import PublicLayout from '@/components/layout/PublicLayout'
import { TemplatesHubClient } from '@/components/templates/templates-hub-client'
import { getAllTemplatesFromStore, getTemplateCategoriesFor, getTemplateStatsFor } from '@/lib/templates-data'
import { withAllTemplateSocial } from '@/lib/template-social-store'

export const metadata: Metadata = {
  title: {
    default: 'Premium Next.js Dashboard Templates and Admin UI Kits',
    template: '%s | mtverse',
  },
  description:
    'Premium Next.js, React, SaaS, ecommerce, CRM, analytics, and admin dashboard templates with live previews, screenshots, secure download access, and production-ready source packages.',
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
  ],
  alternates: { canonical: '/templates' },
  openGraph: {
    title: 'Premium Next.js Dashboard Templates and Admin UI Kits',
    description:
      'Premium Next.js and React dashboard templates for SaaS, enterprise, analytics, ecommerce, CRM, and admin products. Real source packages, live previews, secure delivery.',
    url: `${SITE_URL}/templates`,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Premium Next.js Dashboard Templates and Admin UI Kits',
    description: 'SaaS, enterprise, analytics, ecommerce, CRM, and admin dashboard templates with live previews from mtverse.',
  },
  robots: { index: true, follow: true, 'max-image-preview': 'large' },
}

export const dynamic = 'force-dynamic'

type SearchParams = Promise<{
  category?: string
  search?: string
  sort?: string
  subcategory?: string
}>

export default async function TemplatesPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams
  const category = sp.category ?? 'all'
  const search = sp.search ?? ''
  const sort = (sp.sort as 'featured' | 'trending' | 'new' | 'downloads' | 'price-low' | 'price-high' | 'rating') ?? 'featured'
  const subcategory = sp.subcategory ?? 'all'

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
        name: 'Premium Next.js Dashboard Templates',
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
            totalTemplates={stats.totalTemplates}
            categoryOptions={categoryOptions}
          />
        </Suspense>

        <section className="ds-section-sm ds-bg-section">
          <div className="ds-container max-w-5xl">
            {/* Heading + description */}
            <div className="max-w-3xl">
              <h2 className="ds-h2 mb-3">
                Next.js templates for SaaS, ecommerce, CRM, and admin products
              </h2>
              <p className="text-sm leading-7 text-muted-foreground sm:text-base sm:leading-8">
                mtverse templates are curated source packages for teams building production dashboards, internal tools, analytics products, ecommerce back offices, AI SaaS apps, and B2B admin portals. Each template includes screenshots, a live preview, reusable sections, and secure download access after purchase.
              </p>
            </div>

            {/* Category cards — ds-card style matching site */}
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                { title: 'SaaS dashboards', copy: 'Admin shells, metrics, billing, workspace, and team management screens for subscription products.', icon: 'gauge' },
                { title: 'Ecommerce templates', copy: 'Storefront, product catalog, cart, checkout, order management, coupons, reviews, and inventory UI.', icon: 'store' },
                { title: 'Enterprise admin UI', copy: 'Analytics, RBAC, audit logs, integrations, API keys, finance, CRM, and operations dashboards.', icon: 'building' },
              ].map((item) => {
                const Icon = item.icon === 'gauge' ? Gauge : item.icon === 'store' ? Store : Building2
                return (
                  <div key={item.title} className="ds-card p-5">
                    <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="h-4 w-4" />
                    </div>
                    <h3 className="text-sm font-bold text-foreground">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.copy}</p>
                  </div>
                )
              })}
            </div>

            {/* FAQ — site-wide ds-card group pattern */}
            <div className="mt-10 space-y-3">
              {[
                { q: 'Which dashboard template should I choose?', a: 'Choose MTVerse Modular for broad AI SaaS and CRM coverage, MT Box for enterprise SaaS admin flows, Mat Dash for a large admin studio, and Lumiere for ecommerce storefront plus admin workflows.' },
                { q: 'Are these free website templates?', a: 'Some templates are free (up to 5 downloads). Premium templates are one-time purchase with live previews, secure download access, and instant delivery.' },
                { q: 'Do templates include live preview and screenshots?', a: 'Yes. Each template includes a preview page and full-width screenshot so you can inspect the visual quality before checkout.' },
                { q: 'Can I use these templates in production?', a: 'Yes. The license is for one production project, and the template package is delivered after checkout through protected access.' },
              ].map((item) => (
                <details key={item.q} className="ds-card group">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-medium text-foreground">
                    {item.q}
                    <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
                  </summary>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.a}</p>
                </details>
              ))}
            </div>

            {/* Footer links */}
            <div className="mt-8 flex flex-wrap gap-2 text-sm">
              <Link href="/prompts" className="ds-btn ds-btn-ghost ds-btn-sm">Free AI prompts</Link>
              <Link href="/faq" className="ds-btn ds-btn-ghost ds-btn-sm">Template FAQ</Link>
              <Link href="/support" className="ds-btn ds-btn-ghost ds-btn-sm">Support</Link>
              <Link href="/refund-policy" className="ds-btn ds-btn-ghost ds-btn-sm">Refund policy</Link>
            </div>
          </div>
        </section>
      </main>
    </PublicLayout>
  )
}

