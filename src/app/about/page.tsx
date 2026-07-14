import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Eye, LayoutGrid, PackageCheck, ShieldCheck, Sparkles, Zap } from 'lucide-react'
import PublicLayout from '@/components/layout/PublicLayout'
import { Reveal, Stagger, StaggerItem } from '@/components/design-system/animations'
import { HomeHeroBackground } from '@/components/design-system/hero-backgrounds'
import { SOCIAL_EMAIL, SOCIAL_GITHUB, SOCIAL_TWITTER } from '@/lib/site-social'
import { getAllTemplatesFromStore } from '@/lib/templates-data'
import { SITE_URL } from '@/lib/site-url'

export const metadata: Metadata = {
  title: 'About mtverse - Website Templates, Dashboard UI Kits & HTML Themes',
  description:
    'Learn how mtverse curates Next.js dashboards, React admin UI kits, ecommerce and landing page templates, and free responsive HTML websites with transparent previews and delivery.',
  alternates: { canonical: '/about' },
  openGraph: {
    title: 'About mtverse Template Marketplace',
    description: 'A preview-first catalog of dashboard, ecommerce, SaaS, landing page, portfolio, and responsive HTML templates.',
    url: `${SITE_URL}/about`,
    type: 'website',
  },
}

export default async function AboutPage() {
  const templates = await getAllTemplatesFromStore().catch(() => [])
  const htmlTemplateCount = templates.filter((template) => template.category === 'html').length
  const paidTemplateCount = templates.filter((template) => !template.isFree).length
  const categories = new Set(templates.map((template) => template.category)).size

  const values = [
    {
      icon: Eye,
      title: 'Preview before choosing',
      description: 'Screenshots and live previews make the actual interface visible before a free download or paid checkout.',
      color: 'primary',
    },
    {
      icon: Zap,
      title: 'Useful starting points',
      description: 'The catalog focuses on reusable pages and realistic product flows that reduce repetitive frontend setup work.',
      color: 'accent',
    },
    {
      icon: ShieldCheck,
      title: 'Clear purchase scope',
      description: 'Single purchases unlock the selected template. Bundle access and free-download rules are described separately.',
      color: 'emerald',
    },
  ]

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'About mtverse',
    url: `${SITE_URL}/about`,
    mainEntity: {
      '@type': 'Organization',
      name: 'mtverse',
      url: SITE_URL,
      logo: `${SITE_URL}/SiteLogo.png`,
      description: 'A catalog of website templates and application UI kits with live previews and source-package delivery.',
      sameAs: [SOCIAL_GITHUB, SOCIAL_TWITTER],
      email: SOCIAL_EMAIL,
    },
  }

  return (
    <PublicLayout schemaMarkup={jsonLd}>
      <main>
        <section className="relative flex min-h-[64vh] items-center overflow-hidden">
          <HomeHeroBackground />
          <div className="ds-container relative py-20">
            <div className="mx-auto max-w-4xl space-y-6 text-center">
              <Reveal>
                <span className="ds-eyebrow ds-eyebrow-accent"><Sparkles className="h-3.5 w-3.5" />About mtverse</span>
              </Reveal>
              <Reveal delay={0.08}>
                <h1 className="ds-display-1 ds-text-balance">A clearer way to choose <span className="ds-text-emphasis">website templates</span></h1>
              </Reveal>
              <Reveal delay={0.16}>
                <p className="ds-lead ds-text-pretty mx-auto max-w-3xl">
                  mtverse curates {templates.length} dashboard, ecommerce, SaaS, landing page, portfolio, and responsive HTML templates for developers, founders, designers, freelancers, and agencies.
                </p>
              </Reveal>
              <Reveal delay={0.24}>
                <Link href="/templates" className="ds-btn ds-btn-primary ds-btn-lg">
                  Browse templates
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Reveal>
            </div>
          </div>
        </section>

        <section className="ds-section-sm ds-bg-section border-y">
          <div className="ds-container">
            <Stagger className="grid grid-cols-3 gap-6">
              <StaggerItem><div className="text-center"><div className="ds-stat-number">{templates.length}</div><div className="ds-stat-label">Total templates</div></div></StaggerItem>
              <StaggerItem><div className="text-center"><div className="ds-stat-number">{htmlTemplateCount}</div><div className="ds-stat-label">HTML templates</div></div></StaggerItem>
              <StaggerItem><div className="text-center"><div className="ds-stat-number">{paidTemplateCount}</div><div className="ds-stat-label">Premium source packages</div></div></StaggerItem>
            </Stagger>
          </div>
        </section>

        <section className="ds-section ds-bg-section">
          <div className="ds-container max-w-5xl">
            <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
              <Reveal>
                <span className="ds-eyebrow mb-3">Why it exists</span>
                <h2 className="ds-h1 ds-text-balance">Template pages should answer practical questions</h2>
              </Reveal>
              <Reveal delay={0.08}>
                <div className="space-y-4 text-base leading-8 text-muted-foreground">
                  <p>Choosing a template is difficult when a marketplace shows only a polished thumbnail. Buyers need to know the framework, included pages, visual system, responsive behavior, license, purchase scope, and exact download path.</p>
                  <p>mtverse organizes templates around those decisions. Dashboard packages cover admin, analytics, CRM, ecommerce, billing, settings, and application workflows. Website templates cover portfolios, agencies, products, stores, services, and campaign landing pages.</p>
                  <p>The goal is straightforward: show the interface clearly, describe the package accurately, keep pricing honest, and make account delivery predictable.</p>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        <section className="ds-section ds-bg-section">
          <div className="ds-container">
            <Reveal className="ds-section-head">
              <span className="ds-eyebrow ds-eyebrow-accent">Marketplace principles</span>
              <h2 className="ds-h1 ds-text-balance">What every listing should make clear</h2>
            </Reveal>
            <Stagger className="grid gap-6 md:grid-cols-3">
              {values.map((value) => {
                const Icon = value.icon
                return (
                  <StaggerItem key={value.title}>
                    <div className="ds-card h-full">
                      <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary"><Icon className="h-5 w-5" /></div>
                      <h3 className="ds-h3">{value.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{value.description}</p>
                    </div>
                  </StaggerItem>
                )
              })}
            </Stagger>
          </div>
        </section>

        <section className="ds-section ds-bg-section">
          <div className="ds-container max-w-5xl">
            <Reveal className="ds-card p-6 sm:p-8">
              <div className="grid gap-6 sm:grid-cols-3">
                <div><LayoutGrid className="mb-3 h-5 w-5 text-primary" /><h3 className="font-semibold">{categories} catalog categories</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">Separate browsing for dashboards, ecommerce, landing pages, HTML websites, and new categories as they are published.</p></div>
                <div><PackageCheck className="mb-3 h-5 w-5 text-primary" /><h3 className="font-semibold">Protected package delivery</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">Paid download access is attached to the purchasing account and the correct template entitlement.</p></div>
                <div><ShieldCheck className="mb-3 h-5 w-5 text-primary" /><h3 className="font-semibold">Policies and support</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">Licensing, refunds, privacy, editorial standards, and support routes are published for buyers to review.</p></div>
              </div>
            </Reveal>
          </div>
        </section>
      </main>
    </PublicLayout>
  )
}