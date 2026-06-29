import type { Metadata } from 'next'
import Link from 'next/link'
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
}>

export default async function TemplatesPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams
  const category = sp.category ?? 'all'
  const search = sp.search ?? ''
  const sort = (sp.sort as 'featured' | 'trending' | 'new' | 'price-low' | 'price-high' | 'rating') ?? 'featured'

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
            totalTemplates={stats.totalTemplates}
            categoryOptions={categoryOptions}
          />
        </Suspense>

        <section className="border-t border-border bg-[var(--surface-sunken)]">
          <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-12">
            <div className="max-w-3xl">
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">Next.js dashboard templates for SaaS, ecommerce, CRM, and admin products</h2>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                mtverse templates are curated source packages for teams building production dashboards, internal tools, analytics products, ecommerce back offices, AI SaaS apps, and B2B admin portals. Each template includes screenshots, a live preview, reusable sections, and secure download access after purchase.
              </p>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {[
                ['SaaS dashboards', 'Admin shells, metrics, billing, workspace, and team management screens for subscription products.'],
                ['Ecommerce templates', 'Storefront, product catalog, cart, checkout, order management, coupons, reviews, and inventory UI.'],
                ['Enterprise admin UI', 'Analytics, RBAC, audit logs, integrations, API keys, finance, CRM, and operations dashboards.'],
              ].map(([title, copy]) => (
                <div key={title} className="rounded-lg border border-border bg-card p-4">
                  <h3 className="text-sm font-bold text-foreground">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{copy}</p>
                </div>
              ))}
            </div>

            <div className="mt-7 divide-y divide-border rounded-lg border border-border bg-card px-4">
              {[
                { q: 'Which dashboard template should I choose?', a: 'Choose MTVerse Modular for broad AI SaaS and CRM coverage, MT Box for enterprise SaaS admin flows, Mat Dash for a large admin studio, and Lumiere for ecommerce storefront plus admin workflows.' },
                { q: 'Are these free website templates?', a: 'The public prompt library is free. Dashboard templates are premium source packages with live previews, secure download access, and one-time pricing.' },
                { q: 'Do templates include live preview and screenshots?', a: 'Yes. Each listed dashboard template includes a preview page and full-width screenshot so you can inspect the visual quality before checkout.' },
                { q: 'Can I use these templates in production?', a: 'Yes. The license is for one production project, and the template package is delivered after checkout through protected checkout access.' },
              ].map((item) => (
                <details key={item.q} className="group py-3">
                  <summary className="cursor-pointer list-none text-sm font-semibold text-foreground">{item.q}</summary>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.a}</p>
                </details>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-2 text-sm">
              <Link href="/prompts" className="rounded-full border border-border bg-background px-3 py-1.5 font-medium hover:border-primary/40">Free AI prompts</Link>
              <Link href="/faq" className="rounded-full border border-border bg-background px-3 py-1.5 font-medium hover:border-primary/40">Template FAQ</Link>
              <Link href="/support" className="rounded-full border border-border bg-background px-3 py-1.5 font-medium hover:border-primary/40">Support</Link>
              <Link href="/refund-policy" className="rounded-full border border-border bg-background px-3 py-1.5 font-medium hover:border-primary/40">Refund policy</Link>
            </div>
          </div>
        </section>
      </main>
    </PublicLayout>
  )
}

