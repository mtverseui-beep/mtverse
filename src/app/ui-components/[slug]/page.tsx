import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, Blocks, CheckCircle2, ExternalLink, Layers3, Search, ShieldCheck } from 'lucide-react'
import PublicLayout from '@/components/layout/PublicLayout'
import { TemplateFaqList } from '@/components/content/template-faq-list'
import { SITE_URL } from '@/lib/site-url'
import {
  getUiComponentPreviewUrl,
  getUiComponentSeoHub,
  UI_COMPONENT_SEO_HUBS,
} from '@/lib/ui-component-seo-hubs'

type Params = Promise<{ slug: string }>

export function generateStaticParams() {
  return UI_COMPONENT_SEO_HUBS.map((hub) => ({ slug: hub.slug }))
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params
  const hub = getUiComponentSeoHub(slug)

  if (!hub) {
    return {
      title: 'UI component collection not found',
      robots: { index: false, follow: false },
    }
  }

  const url = `${SITE_URL}/ui-components/${hub.slug}`

  return {
    title: hub.title,
    description: hub.metaDescription,
    keywords: [...hub.keywords, 'mtverse UI library', 'responsive component previews', 'production ready UI'],
    alternates: { canonical: `/ui-components/${hub.slug}` },
    openGraph: {
      title: hub.title,
      description: hub.metaDescription,
      url,
      type: 'website',
      siteName: 'mtverse',
      images: [{ url: '/SiteLogo.png', width: 512, height: 512, alt: hub.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: hub.title,
      description: hub.metaDescription,
    },
    robots: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  }
}

export default async function UiComponentSeoHubPage({ params }: { params: Params }) {
  const { slug } = await params
  const hub = getUiComponentSeoHub(slug)
  if (!hub) notFound()

  const canonicalUrl = `${SITE_URL}/ui-components/${hub.slug}`
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${canonicalUrl}#collection`,
        name: hub.title,
        headline: hub.h1,
        description: hub.metaDescription,
        url: canonicalUrl,
        numberOfItems: hub.examples.length,
        isPartOf: { '@id': `${SITE_URL}/#website` },
      },
      {
        '@type': 'ItemList',
        '@id': `${canonicalUrl}#itemlist`,
        name: hub.title,
        itemListElement: hub.examples.map((example, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: example.name,
          description: example.description,
          url: getUiComponentPreviewUrl(example.slug),
        })),
      },
      {
        '@type': 'FAQPage',
        '@id': `${canonicalUrl}#faq`,
        mainEntity: hub.faqs.map((faq) => ({
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
          { '@type': 'ListItem', position: 2, name: 'UI Components', item: `${SITE_URL}/ui-components` },
          { '@type': 'ListItem', position: 3, name: hub.title, item: canonicalUrl },
        ],
      },
    ],
  }

  return (
    <PublicLayout>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <main>
        <section className="border-b bg-background">
          <div className="ds-container py-12 sm:py-16">
            <Link href="/ui-components" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
              UI component library
              <ArrowRight className="h-3.5 w-3.5" />
              {hub.title}
            </Link>
            <div className="mt-6 max-w-5xl">
              <span className="ds-eyebrow ds-eyebrow-accent">
                <Blocks className="h-3.5 w-3.5" />
                {hub.eyebrow}
              </span>
              <h1 className="mt-5 max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl">{hub.h1}</h1>
              <p className="mt-5 max-w-3xl text-base leading-8 text-muted-foreground sm:text-lg">{hub.description}</p>
              <div className="mt-6 flex flex-wrap gap-2">
                {hub.useCases.map((useCase) => (
                  <span key={useCase} className="rounded-full border border-border/70 bg-card px-3 py-1 text-sm font-semibold">
                    {useCase}
                  </span>
                ))}
              </div>
              <div className="mt-7 flex flex-wrap gap-3">
                <a
                  href={getUiComponentPreviewUrl(hub.examples[0].slug)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ds-btn ds-btn-primary"
                >
                  Preview components
                  <ExternalLink className="h-4 w-4" />
                </a>
                <Link href="/pricing#ui-library" className="ds-btn ds-btn-secondary">
                  View source access
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="ds-section-sm ds-bg-section">
          <div className="ds-container">
            <div className="mb-7 max-w-3xl">
              <span className="ds-eyebrow">
                <Search className="h-3.5 w-3.5" />
                Live examples
              </span>
              <h2 className="mt-4 text-3xl font-bold tracking-tight">Preview relevant {hub.title.toLowerCase()}</h2>
              <p className="mt-3 text-sm leading-7 text-muted-foreground sm:text-base">
                Open the live component in a new tab to inspect layout and interaction behavior before choosing protected source access.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {hub.examples.map((example) => (
                <a
                  key={example.slug}
                  href={getUiComponentPreviewUrl(example.slug)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ds-card ds-card-hover group block h-full no-underline"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Layers3 className="h-5 w-5" />
                  </div>
                  <h2 className="mt-4 text-lg font-bold tracking-tight">{example.name}</h2>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">{example.description}</p>
                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-primary">
                    Open live preview
                    <ExternalLink className="h-4 w-4" />
                  </span>
                </a>
              ))}
            </div>
          </div>
        </section>

        <section className="ds-section-sm">
          <div className="ds-container grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
            <article className="ds-card">
              <Search className="h-6 w-6 text-primary" />
              <h2 className="mt-4 text-2xl font-bold tracking-tight">{hub.introTitle}</h2>
              <div className="mt-4 space-y-4 text-sm leading-7 text-muted-foreground sm:text-base sm:leading-8">
                {hub.intro.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </article>
            <aside className="ds-card">
              <ShieldCheck className="h-6 w-6 text-emerald-600" />
              <h2 className="mt-4 text-xl font-bold tracking-tight">Production checklist</h2>
              <ul className="mt-5 space-y-3">
                {hub.checklist.map((item) => (
                  <li key={item} className="flex gap-3 text-sm leading-6 text-muted-foreground">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </aside>
          </div>
        </section>

        <section className="border-y bg-background">
          <div className="ds-container grid gap-10 py-14 lg:grid-cols-[minmax(0,0.72fr)_minmax(520px,1.28fr)] lg:py-16">
            <div>
              <span className="ds-eyebrow ds-eyebrow-accent">Component FAQ</span>
              <h2 className="mt-4 text-3xl font-bold tracking-tight">Questions about {hub.title.toLowerCase()}</h2>
              <p className="mt-3 max-w-md text-sm leading-7 text-muted-foreground">
                Practical answers about framework fit, responsive behavior, accessibility, source access, and implementation.
              </p>
            </div>
            <TemplateFaqList items={hub.faqs} />
          </div>
        </section>

        <section className="ds-section-sm">
          <div className="ds-container">
            <div className="rounded-xl border border-border/70 bg-card p-5">
              <h2 className="text-sm font-bold">Related UI component collections</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {hub.related.map((relatedSlug) => {
                  const related = getUiComponentSeoHub(relatedSlug)
                  if (!related) return null
                  return (
                    <Link key={related.slug} href={`/ui-components/${related.slug}`} className="ds-btn ds-btn-secondary ds-btn-sm">
                      {related.title}
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>
        </section>
      </main>
    </PublicLayout>
  )
}
