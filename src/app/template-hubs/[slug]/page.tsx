import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, CheckCircle2, Compass, LayoutGrid, Search, ShieldCheck, Sparkles } from 'lucide-react'
import PublicLayout from '@/components/layout/PublicLayout'
import { Reveal, Stagger, StaggerItem } from '@/components/design-system/animations'
import { TemplateCard } from '@/components/templates/template-card'
import { SITE_URL } from '@/lib/site-url'
import { getAllTemplatesFromStore } from '@/lib/templates-data'
import { withAllTemplateSocial } from '@/lib/template-social-store'
import { getHubTemplates, getTemplateSeoHub, TEMPLATE_SEO_HUBS } from '@/lib/template-seo-hubs'

type Params = Promise<{ slug: string }>

export const dynamic = 'force-dynamic'

export function generateStaticParams() {
  return TEMPLATE_SEO_HUBS.map((hub) => ({ slug: hub.slug }))
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params
  const hub = getTemplateSeoHub(slug)
  if (!hub) return { title: 'Template hub not found', robots: { index: false, follow: false } }

  const url = `${SITE_URL}/template-hubs/${hub.slug}`

  return {
    title: hub.title,
    description: hub.metaDescription,
    keywords: [
      ...hub.keywords,
      'mtverse templates',
      'template live preview',
      'website templates download',
      'source code templates',
      'premium UI templates',
    ],
    alternates: { canonical: `/template-hubs/${hub.slug}` },
    openGraph: {
      title: hub.title,
      description: hub.metaDescription,
      url,
      type: 'website',
      siteName: 'mtverse',
      images: [{ url: '/SiteLogo.png', width: 512, height: 512, alt: 'mtverse templates' }],
    },
    twitter: { card: 'summary_large_image', title: hub.title, description: hub.metaDescription },
    robots: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
    },
  }
}

export default async function TemplateSeoHubPage({ params }: { params: Params }) {
  const { slug } = await params
  const hub = getTemplateSeoHub(slug)
  if (!hub) notFound()

  const baseTemplates = await getAllTemplatesFromStore()
  const hubTemplates = await withAllTemplateSocial(getHubTemplates(baseTemplates, hub))
  const fallbackTemplates = hubTemplates.length ? hubTemplates : await withAllTemplateSocial(baseTemplates.filter((template) => !template.isFree).slice(0, 9))
  const canonicalUrl = `${SITE_URL}/template-hubs/${hub.slug}`

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
        numberOfItems: fallbackTemplates.length,
        isPartOf: { '@id': `${SITE_URL}/#website` },
      },
      {
        '@type': 'ItemList',
        '@id': `${canonicalUrl}#itemlist`,
        name: hub.title,
        itemListElement: fallbackTemplates.slice(0, 24).map((template, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          url: `${SITE_URL}/templates/${template.slug}`,
          name: template.title,
          description: template.summary,
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
          { '@type': 'ListItem', position: 2, name: 'Templates', item: `${SITE_URL}/templates` },
          { '@type': 'ListItem', position: 3, name: hub.title, item: canonicalUrl },
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
              <div className="max-w-5xl">
                <Link href="/templates" className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:underline">
                  Templates
                  <ArrowRight className="h-3.5 w-3.5" />
                  {hub.title}
                </Link>
                <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-primary-700 dark:text-primary-300">
                  <Compass className="h-3.5 w-3.5" />
                  {hub.eyebrow}
                </span>
                <h1 className="max-w-4xl text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">{hub.h1}</h1>
                <p className="mt-4 max-w-3xl text-base leading-8 text-muted-foreground sm:text-lg">{hub.description}</p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {hub.useCases.slice(0, 6).map((useCase) => (
                    <span key={useCase} className="rounded-full border border-border/70 bg-background px-3 py-1 text-sm font-semibold text-foreground">
                      {useCase}
                    </span>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        <section className="ds-section-sm ds-bg-section">
          <div className="ds-container">
            <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Featured {hub.title.toLowerCase()}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">Preview the UI first, then open the detail page for package, price, and download access.</p>
              </div>
              <Link href="/templates" className="ds-btn ds-btn-secondary">
                Browse all templates
                <LayoutGrid className="h-4 w-4" />
              </Link>
            </div>
            <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {fallbackTemplates.slice(0, 12).map((template, index) => (
                <StaggerItem key={template.id}>
                  <TemplateCard template={template} priority={index === 0} />
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>

        <section className="ds-section-sm">
          <div className="ds-container">
            <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
              <Reveal className="ds-card">
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Search className="h-5 w-5" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight">{hub.introTitle}</h2>
                <div className="mt-4 space-y-4 text-sm leading-7 text-muted-foreground sm:text-base sm:leading-8">
                  {hub.intro.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </Reveal>

              <Reveal delay={0.08} className="ds-card">
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h2 className="text-lg font-bold tracking-tight">Selection checklist</h2>
                <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                  {hub.checklist.map((item) => (
                    <li key={item} className="flex gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </Reveal>
            </div>
          </div>
        </section>

        <section className="ds-section-sm ds-bg-section">
          <div className="ds-container max-w-5xl">
            <Reveal className="mb-6">
              <span className="ds-eyebrow ds-eyebrow-accent">
                <Sparkles className="h-3.5 w-3.5" />
                Helpful answers
              </span>
              <h2 className="mt-3 text-2xl font-bold tracking-tight">Questions about {hub.title.toLowerCase()}</h2>
            </Reveal>
            <div className="grid gap-3">
              {hub.faqs.map((faq) => (
                <details key={faq.question} className="ds-card group">
                  <summary className="cursor-pointer list-none text-sm font-semibold text-foreground">{faq.question}</summary>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="ds-section-sm">
          <div className="ds-container max-w-5xl">
            <div className="rounded-2xl border border-border/70 bg-background p-5">
              <h2 className="text-sm font-bold text-foreground">Related template hubs</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {hub.related.map((relatedSlug) => {
                  const related = getTemplateSeoHub(relatedSlug)
                  if (!related) return null
                  return (
                    <Link key={related.slug} href={`/template-hubs/${related.slug}`} className="ds-btn ds-btn-secondary ds-btn-sm">
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
