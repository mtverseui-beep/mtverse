import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Blocks, CheckCircle2, Code2, Layers3, Search } from 'lucide-react'
import PublicLayout from '@/components/layout/PublicLayout'
import { TemplateFaqList } from '@/components/content/template-faq-list'
import { SITE_URL } from '@/lib/site-url'
import { UI_COMPONENT_SEO_HUBS } from '@/lib/ui-component-seo-hubs'

const UI_LIBRARY_URL = (process.env.NEXT_PUBLIC_UI_LIBRARY_URL || 'https://ui.mtverse.dev').replace(/\/$/, '')

const FAQS = [
  {
    question: 'What UI components are included in the mtverse library?',
    answer: 'The library includes navigation, sidebars, buttons, forms, tables, dialogs, authentication screens, dashboard blocks, hero sections, pricing layouts, ecommerce patterns, backgrounds, and product workflow components.',
  },
  {
    question: 'Can I preview components before purchasing source access?',
    answer: 'Yes. Every component preview is public on ui.mtverse.dev. Lifetime access unlocks protected source code, implementation notes, dependency guidance, the complete dashboard project, and future component updates.',
  },
  {
    question: 'Do the components work with React and Next.js?',
    answer: 'The library is built for modern React and Next.js workflows. Review the implementation notes for client boundaries, dependencies, and any framework-specific integration details.',
  },
  {
    question: 'Are the components responsive and accessible?',
    answer: 'The patterns are designed for responsive product interfaces and include practical interaction states. You should still test the final implementation with your content, supported browsers, keyboard flows, and accessibility requirements.',
  },
]

export const metadata: Metadata = {
  title: 'Modern UI Components for React, Next.js & Tailwind',
  description: 'Browse modern React, Next.js, and Tailwind UI components for navbars, sidebars, buttons, forms, modals, dashboards, SaaS pages, and product interfaces.',
  keywords: [
    'modern UI components',
    'UI component library',
    'React UI components',
    'Next.js components',
    'Tailwind CSS components',
    'navbar components',
    'sidebar components',
    'button components',
    'dashboard UI components',
    'SaaS UI blocks',
    'React table components',
    'modern card UI',
    'dropdown components',
    'tabs and accordion components',
    'loading skeleton components',
    'pricing components',
    'hero section components',
    'authentication UI components',
    'toast notification components',
  ],
  alternates: { canonical: '/ui-components' },
  openGraph: {
    title: 'Modern UI Components for React, Next.js & Tailwind',
    description: 'Preview modern UI components and product blocks before unlocking protected source and implementation guidance.',
    url: `${SITE_URL}/ui-components`,
    type: 'website',
    siteName: 'mtverse',
    images: [{ url: '/SiteLogo.png', width: 512, height: 512, alt: 'mtverse UI component library' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Modern UI Components for React, Next.js & Tailwind',
    description: 'Preview modern UI components and product blocks for React, Next.js, Tailwind, dashboards, and SaaS products.',
  },
  robots: {
    index: true,
    follow: true,
    'max-image-preview': 'large',
    'max-snippet': -1,
  },
}

export default function UiComponentsPage() {
  const canonicalUrl = `${SITE_URL}/ui-components`
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${canonicalUrl}#collection`,
        name: 'mtverse UI Component Library',
        headline: 'Modern UI components for React, Next.js, and Tailwind',
        description: metadata.description,
        url: canonicalUrl,
        numberOfItems: UI_COMPONENT_SEO_HUBS.length,
        isPartOf: { '@id': `${SITE_URL}/#website` },
      },
      {
        '@type': 'ItemList',
        '@id': `${canonicalUrl}#itemlist`,
        itemListElement: UI_COMPONENT_SEO_HUBS.map((hub, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: hub.title,
          url: `${SITE_URL}/ui-components/${hub.slug}`,
        })),
      },
      {
        '@type': 'FAQPage',
        '@id': `${canonicalUrl}#faq`,
        mainEntity: FAQS.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: { '@type': 'Answer', text: faq.answer },
        })),
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${canonicalUrl}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'UI Components', item: canonicalUrl },
        ],
      },
    ],
  }

  return (
    <PublicLayout>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <main>
        <section className="border-b bg-background">
          <div className="ds-container py-14 sm:py-16 lg:py-20">
            <div className="max-w-4xl">
              <span className="ds-eyebrow ds-eyebrow-accent">
                <Blocks className="h-3.5 w-3.5" />
                UI component library
              </span>
              <h1 className="mt-5 max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                Modern UI components for React, Next.js, and Tailwind
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-8 text-muted-foreground sm:text-lg">
                Explore responsive navigation, forms, tables, dialogs, dashboard blocks, marketing sections, and product workflows. Preview every component publicly, then unlock source and implementation guidance when it fits your project.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href={UI_LIBRARY_URL} target="_blank" rel="noopener noreferrer" className="ds-btn ds-btn-primary ds-btn-lg">
                  <Search className="h-4 w-4" />
                  Browse all component previews
                </Link>
                <Link href="/pricing#ui-library" className="ds-btn ds-btn-secondary ds-btn-lg">
                  View lifetime access
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="mt-10 grid gap-3 border-t border-border/70 pt-8 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ['Preview first', 'Inspect responsive component behavior before choosing source access.'],
                ['Production focused', 'Use patterns with real states, stable layout, and practical product structure.'],
                ['Framework ready', 'Integrate components into modern React, Next.js, and Tailwind projects.'],
                ['Lifetime updates', 'Unlocked library access includes future component additions and improvements.'],
              ].map(([title, text]) => (
                <div key={title} className="rounded-lg border border-border/70 bg-card p-4">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  <h2 className="mt-3 text-sm font-bold">{title}</h2>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="ds-section-sm ds-bg-section">
          <div className="ds-container">
            <div className="max-w-3xl">
              <span className="ds-eyebrow">
                <Layers3 className="h-3.5 w-3.5" />
                Browse by use case
              </span>
              <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">Find components by interface problem</h2>
              <p className="mt-3 text-base leading-7 text-muted-foreground">
                Each collection explains where the pattern fits, what to verify before production, and which live examples are worth comparing.
              </p>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {UI_COMPONENT_SEO_HUBS.map((hub) => (
                <Link key={hub.slug} href={`/ui-components/${hub.slug}`} className="ds-card ds-card-hover group block h-full no-underline">
                  <p className="text-xs font-bold uppercase text-primary">{hub.eyebrow}</p>
                  <h2 className="mt-3 text-xl font-bold tracking-tight">{hub.title}</h2>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">{hub.description}</p>
                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-primary">
                    Explore collection
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="ds-section-sm">
          <div className="ds-container grid gap-6 lg:grid-cols-2">
            <div className="ds-card">
              <Code2 className="h-6 w-6 text-primary" />
              <h2 className="mt-4 text-2xl font-bold tracking-tight">Preview is public. Source stays protected.</h2>
              <p className="mt-3 text-sm leading-7 text-muted-foreground sm:text-base">
                Use the live library to inspect layout, responsive behavior, and interaction quality. Lifetime access unlocks the raw component source, implementation notes, required dependencies, the complete dashboard project, and future updates.
              </p>
              <Link href={UI_LIBRARY_URL} target="_blank" rel="noopener noreferrer" className="ds-btn ds-btn-secondary mt-6">
                Open ui.mtverse.dev
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="ds-card">
              <Blocks className="h-6 w-6 text-primary" />
              <h2 className="mt-4 text-2xl font-bold tracking-tight">Use components as a system</h2>
              <p className="mt-3 text-sm leading-7 text-muted-foreground sm:text-base">
                Choose shared tokens for color, typography, spacing, radius, and interaction states. Reuse primitives across screens, keep product logic separate, and test with real copy and data before release.
              </p>
              <Link href="/ui-components/modern-ui-components" className="ds-btn ds-btn-secondary mt-6">
                Read the production checklist
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        <section className="border-y bg-background">
          <div className="ds-container grid gap-10 py-14 lg:grid-cols-[minmax(0,0.72fr)_minmax(520px,1.28fr)] lg:py-16">
            <div>
              <span className="ds-eyebrow ds-eyebrow-accent">UI component FAQ</span>
              <h2 className="mt-4 text-3xl font-bold tracking-tight">Answers before you choose source access</h2>
              <p className="mt-3 max-w-md text-sm leading-7 text-muted-foreground">
                Preview scope, supported workflows, framework fit, and access boundaries are explained before checkout.
              </p>
            </div>
            <TemplateFaqList items={FAQS} />
          </div>
        </section>
      </main>
    </PublicLayout>
  )
}
