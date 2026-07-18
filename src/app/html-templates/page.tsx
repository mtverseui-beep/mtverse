import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Check, Code2, Download, FolderOpen, Globe2, Infinity, Layers, Search, Sparkles } from 'lucide-react'
import PublicLayout from '@/components/layout/PublicLayout'
import { SITE_URL } from '@/lib/site-url'
import { getAllTemplatesFromStore } from '@/lib/templates-data'
import { withAllTemplateSocial } from '@/lib/template-social-store'
import { TemplateCard } from '@/components/templates/template-card'
import { Reveal, Stagger, StaggerItem } from '@/components/design-system/animations'
import { CtaBackground, SectionBackground } from '@/components/design-system/backgrounds'

export const metadata: Metadata = {
  title: 'Free HTML Website Templates & $5 Bundle',
  description:
    'Browse free responsive HTML website templates for portfolios, SaaS, ecommerce, agencies, restaurants, healthcare, education, fitness, crypto, and real estate. Download individual templates or unlock the all HTML templates ZIP bundle for $5.',
  keywords: [
    'free HTML templates',
    'HTML website templates',
    'responsive website templates',
    'portfolio HTML templates',
    'SaaS HTML templates',
    'ecommerce HTML templates',
    'agency HTML templates',
    'restaurant HTML templates',
    'healthcare HTML templates',
    'education HTML templates',
    'fitness HTML templates',
    'crypto HTML templates',
    'real estate HTML templates',
    'all HTML templates bundle',
    'HTML CSS JavaScript templates',
    'Tailwind CSS HTML templates',
  ],
  alternates: { canonical: '/html-templates' },
  openGraph: {
    title: 'Free HTML Website Templates | mtverse',
    description: 'Responsive HTML templates with live previews, screenshots, ZIP downloads, and a $5 all HTML bundle unlock.',
    url: SITE_URL + '/html-templates',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free HTML Website Templates | mtverse',
    description: 'Browse free responsive HTML templates and unlock the all HTML templates ZIP bundle for $5.',
  },
  robots: { index: true, follow: true, 'max-image-preview': 'large' },
}

function normalizeSubcategory(value: string | undefined) {
  return (value || 'others')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'others'
}

export default async function HtmlTemplatesPage() {
  const allTemplates = await getAllTemplatesFromStore()
  const htmlTemplates = await withAllTemplateSocial(allTemplates.filter((template) => template.category === 'html'))
  const featuredHtmlTemplates = htmlTemplates
    .slice()
    .sort((a, b) => b.salesCount - a.salesCount)
    .slice(0, 8)

  const subcategoryMap = new Map<string, { label: string; count: number }>()
  for (const template of htmlTemplates) {
    const label = template.subcategory?.trim() || 'Others'
    const id = normalizeSubcategory(label)
    const current = subcategoryMap.get(id)
    subcategoryMap.set(id, { label, count: (current?.count || 0) + 1 })
  }

  const subcategories = Array.from(subcategoryMap, ([id, value]) => ({ id, ...value }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': SITE_URL + '/html-templates#collection',
        name: 'Free HTML Website Templates',
        description: 'Browse free responsive HTML website templates for portfolios, SaaS, ecommerce, agencies, restaurants, healthcare, education, fitness, crypto, and real estate. Download individual templates or unlock the all HTML templates ZIP bundle for $5.',
        url: SITE_URL + '/html-templates',
        numberOfItems: htmlTemplates.length,
      },
      {
        '@type': 'ItemList',
        '@id': SITE_URL + '/html-templates#itemlist',
        name: 'HTML template categories',
        itemListElement: subcategories.slice(0, 12).map((category, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: category.label,
          url: SITE_URL + '/templates?category=html&subcategory=' + category.id,
        })),
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'Are mtverse HTML templates free?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes. You can download individual HTML templates with a free account up to the free download limit. The $5 HTML bundle unlock gives unlimited individual HTML downloads and one ZIP containing every HTML template.',
            },
          },
          {
            '@type': 'Question',
            name: 'What is included in each HTML template?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Each HTML template includes editable HTML, Tailwind CSS styling, JavaScript where needed, screenshots, a live preview, and a ZIP package for quick launch.',
            },
          },
          {
            '@type': 'Question',
            name: 'Do HTML templates need a build setup?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'No. These are static HTML, CSS, and JavaScript templates designed for simple hosting and fast client launches.',
            },
          },
        ],
      },
    ],
  }

  return (
    <PublicLayout>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <main>
        <section className="ds-section-lg ds-bg-section relative overflow-hidden">
          <CtaBackground />
          <div className="ds-container relative max-w-5xl text-center">
            <Reveal>
              <span className="ds-eyebrow ds-eyebrow-accent">
                <Code2 className="h-3.5 w-3.5" />
                {htmlTemplates.length} responsive HTML templates
              </span>
            </Reveal>
            <Reveal delay={0.08}>
              <h1 className="ds-display-1 ds-text-balance mt-5">
                Free HTML website templates for fast launches
              </h1>
            </Reveal>
            <Reveal delay={0.16}>
              <p className="ds-lead ds-text-pretty mx-auto mt-5 max-w-3xl">
                Browse ready-to-edit HTML templates for portfolios, SaaS, ecommerce, agencies, restaurants, healthcare, education, fitness, crypto, and real estate. Preview each template, download individual ZIP files, or unlock the all HTML templates bundle for $5.
              </p>
            </Reveal>
            <Reveal delay={0.24}>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Link href="/templates?category=html" className="ds-btn ds-btn-primary ds-btn-lg">
                  <Search className="h-4 w-4" />
                  Browse HTML Templates
                </Link>
                <Link href="/pricing" className="ds-btn ds-btn-secondary ds-btn-lg">
                  <Infinity className="h-4 w-4" />
                  Unlock $5 Bundle
                </Link>
              </div>
            </Reveal>
          </div>
        </section>

        <section className="ds-section-sm border-y bg-background">
          <div className="ds-container">
            <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { icon: Download, title: 'Free downloads', copy: 'Start with individual HTML template ZIP downloads using a free account.' },
                { icon: Infinity, title: '$5 bundle unlock', copy: 'Unlock unlimited individual HTML downloads and one all-template ZIP.' },
                { icon: Globe2, title: 'Static hosting ready', copy: 'Launch on any static host without a complex build setup.' },
                { icon: Layers, title: '10+ categories', copy: 'Portfolio, SaaS, ecommerce, agency, restaurant, healthcare, and more.' },
              ].map((item) => {
                const Icon = item.icon
                return (
                  <StaggerItem key={item.title}>
                    <div className="ds-card h-full p-5">
                      <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h2 className="text-sm font-bold text-foreground">{item.title}</h2>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.copy}</p>
                    </div>
                  </StaggerItem>
                )
              })}
            </Stagger>
          </div>
        </section>

        <section className="ds-section ds-bg-section relative overflow-hidden">
          <SectionBackground />
          <div className="ds-container relative">
            <Reveal className="ds-section-head ds-section-head-left mb-8">
              <span className="ds-eyebrow">HTML categories</span>
              <h2 className="ds-h1 ds-text-balance">Choose by website type</h2>
              <p className="ds-lead ds-text-pretty mt-2">
                Category links open the HTML catalog with the matching filter applied.
              </p>
            </Reveal>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {subcategories.map((category) => (
                <Link
                  key={category.id}
                  href={`/templates?category=html&subcategory=${category.id}`}
                  className="group rounded-xl border border-border/70 bg-card p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-bold text-foreground group-hover:text-primary">{category.label}</h3>
                      <p className="mt-1 text-xs text-muted-foreground">{category.count} templates</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="ds-section ds-bg-section">
          <div className="ds-container">
            <Reveal className="ds-section-head ds-section-head-left mb-8">
              <span className="ds-eyebrow ds-eyebrow-accent">
                <Sparkles className="h-3.5 w-3.5" />
                Popular HTML templates
              </span>
              <h2 className="ds-h1 ds-text-balance">Preview before you download</h2>
              <p className="ds-lead ds-text-pretty mt-2">
                These are the most downloaded HTML templates from the catalog.
              </p>
            </Reveal>
            <Stagger className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {featuredHtmlTemplates.map((template) => (
                <StaggerItem key={template.id}>
                  <TemplateCard template={template} />
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>

        <section className="ds-section ds-bg-section">
          <div className="ds-container max-w-4xl">
            <Reveal>
              <h2 className="ds-h2 mb-5">What the HTML bundle is for</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {[
                  'Quick client demos and MVP landing pages',
                  'Portfolio sites for designers, developers, creators, and agencies',
                  'Static ecommerce, SaaS, education, restaurant, and local business websites',
                  'Reusable HTML sections for hero, features, trust blocks, pricing, FAQ, and contact pages',
                ].map((item) => (
                  <div key={item} className="flex gap-3 rounded-xl border border-border/70 bg-card p-4">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    <p className="text-sm leading-6 text-muted-foreground">{item}</p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        <section className="ds-section-lg ds-bg-section relative overflow-hidden">
          <CtaBackground />
          <div className="ds-container relative max-w-2xl text-center">
            <Reveal>
              <FolderOpen className="mx-auto mb-4 h-8 w-8 text-primary" />
              <h2 className="ds-display-3 mb-4">Need all HTML templates?</h2>
              <p className="ds-lead mb-6">
                The $5 unlock gives unlimited individual HTML downloads and prepares one ZIP containing every HTML template package.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link href="/pricing" className="ds-btn ds-btn-accent ds-btn-lg">View bundle pricing</Link>
                <Link href="/templates?category=html" className="ds-btn ds-btn-secondary ds-btn-lg">Browse catalog</Link>
              </div>
            </Reveal>
          </div>
        </section>
      </main>
    </PublicLayout>
  )
}
