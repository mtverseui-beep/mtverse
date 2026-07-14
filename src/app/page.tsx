import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  Check,
  Code2,
  Eye,
  Gauge,
  Layers3,
  LayoutGrid,
  PackageCheck,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Zap,
} from 'lucide-react'
import PublicLayout from '@/components/layout/PublicLayout'
import {
  getAllTemplatesFromStore,
  getFeaturedTemplatesFromStore,
  getTemplateCategoriesFor,
  getTemplateStatsFor,
} from '@/lib/templates-data'
import { withAllTemplateSocial } from '@/lib/template-social-store'
import { TemplateCard } from '@/components/templates/template-card'
import { SectionBackground, CtaBackground } from '@/components/design-system/backgrounds'
import { HomeHero3D } from '@/components/design-system/hero-3d'
import { Reveal, Stagger, StaggerItem, Magnetic } from '@/components/design-system/animations'
import { TEMPLATE_SEO_HUBS } from '@/lib/template-seo-hubs'
import { SITE_URL } from '@/lib/site-url'
import { SOCIAL_EMAIL, SOCIAL_GITHUB, SOCIAL_TWITTER } from '@/lib/site-social'

export const dynamic = 'force-static'
export const revalidate = 300

export const metadata: Metadata = {
  title: 'Next.js Dashboard Templates, Free HTML Templates & Website UI Kits',
  description:
    'Browse premium Next.js dashboard templates, React admin UI kits, ecommerce and SaaS templates, landing pages, and free responsive HTML website templates with live previews and secure ZIP downloads.',
  keywords: [
    'Next.js templates',
    'Next.js dashboard templates',
    'React admin dashboard templates',
    'admin UI kits',
    'SaaS dashboard templates',
    'ecommerce website templates',
    'landing page templates',
    'free HTML templates',
    'responsive website templates',
    'portfolio HTML templates',
    'Tailwind CSS templates',
    'TypeScript dashboard templates',
    'CRM dashboard templates',
    'analytics dashboard templates',
    'premium website templates',
    'website template source code',
  ],
  alternates: { canonical: '/' },
  openGraph: {
    title: 'mtverse - Next.js Dashboard Templates & Free HTML Templates',
    description:
      'Preview and download dashboard, ecommerce, SaaS, landing page, portfolio, and responsive HTML website templates.',
    url: SITE_URL,
    siteName: 'mtverse',
    type: 'website',
    images: [{ url: '/SiteLogo.png', width: 512, height: 512, alt: 'mtverse template marketplace' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'mtverse - Next.js Dashboard Templates & Free HTML Templates',
    description: 'Live template previews, source-code packages, free HTML downloads, and secure delivery.',
    images: ['/SiteLogo.png'],
  },
  robots: {
    index: true,
    follow: true,
    'max-image-preview': 'large',
    'max-snippet': -1,
    'max-video-preview': -1,
  },
}

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  dashboards: Gauge,
  ecommerce: ShoppingBag,
  html: Code2,
  landing: LayoutGrid,
}

const FAQS = [
  {
    question: 'What types of website templates are available on mtverse?',
    answer:
      'mtverse includes premium Next.js and React dashboard templates, admin UI kits, ecommerce storefronts, SaaS interfaces, landing pages, and free responsive HTML templates for portfolios and business websites.',
  },
  {
    question: 'Can I preview a template before downloading or buying it?',
    answer:
      'Yes. Template detail pages include screenshots and a live preview when available, so you can inspect layouts, pages, responsive behavior, and visual direction before checkout or download.',
  },
  {
    question: 'Does one template purchase unlock every paid template?',
    answer:
      'No. A single-template purchase unlocks only that template. The all-paid bundle is a separate offer that includes the paid catalog described on the pricing page.',
  },
  {
    question: 'Are the HTML website templates free?',
    answer:
      'Individual HTML templates follow the free account download rules. A separate HTML bundle unlock provides the complete HTML collection in one generated ZIP.',
  },
  {
    question: 'What do paid template downloads include?',
    answer:
      'Paid downloads provide the source package described on that template page. Included pages, technology details, features, license terms, and delivery options are listed before checkout.',
  },
]

export default async function Home() {
  const templates = await getAllTemplatesFromStore()
  const featuredTemplates = await getFeaturedTemplatesFromStore(6).then((items) => withAllTemplateSocial(items))
  const templateStats = getTemplateStatsFor(templates)
  const categoryOptions = getTemplateCategoriesFor(templates).filter((category) => category.id !== 'all')
  const paidTemplates = templates.filter((template) => !template.isFree).length
  const freeTemplates = templates.filter((template) => template.isFree).length

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: SITE_URL,
        name: 'mtverse',
        description: 'Next.js dashboard templates, React admin UI kits, and free responsive HTML website templates.',
        publisher: { '@id': `${SITE_URL}/#organization` },
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${SITE_URL}/templates?search={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'Organization',
        '@id': `${SITE_URL}/#organization`,
        name: 'mtverse',
        url: SITE_URL,
        logo: `${SITE_URL}/SiteLogo.png`,
        sameAs: [SOCIAL_GITHUB, SOCIAL_TWITTER],
        contactPoint: {
          '@type': 'ContactPoint',
          email: SOCIAL_EMAIL,
          contactType: 'customer support',
        },
      },
      {
        '@type': 'CollectionPage',
        '@id': `${SITE_URL}/#templates`,
        name: 'Website template marketplace',
        url: `${SITE_URL}/templates`,
        numberOfItems: templates.length,
        mainEntity: {
          '@type': 'ItemList',
          itemListElement: featuredTemplates.map((template, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: template.title,
            url: `${SITE_URL}/templates/${template.slug}`,
          })),
        },
      },
      {
        '@type': 'FAQPage',
        mainEntity: FAQS.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: { '@type': 'Answer', text: item.answer },
        })),
      },
    ],
  }

  const stats = [
    { value: templateStats.totalTemplates.toLocaleString(), label: 'Website templates' },
    { value: freeTemplates.toLocaleString(), label: 'Free templates' },
    { value: paidTemplates.toLocaleString(), label: 'Premium templates' },
    { value: categoryOptions.length.toLocaleString(), label: 'Template categories' },
  ]

  return (
    <PublicLayout schemaMarkup={jsonLd}>
      <main>
        <section className="relative flex min-h-[82vh] items-center overflow-hidden">
          <HomeHero3D />
          <div className="ds-container relative py-20">
            <div className="mx-auto max-w-4xl space-y-6 text-center">
              <Reveal>
                <span className="ds-eyebrow ds-eyebrow-accent">
                  <LayoutGrid className="h-3.5 w-3.5" />
                  {templateStats.totalTemplates.toLocaleString()} templates with preview-first browsing
                </span>
              </Reveal>
              <Reveal delay={0.08}>
                <h1 className="ds-display-1 ds-text-balance">
                  Website templates built to help you <span className="ds-text-emphasis">ship faster</span>
                </h1>
              </Reveal>
              <Reveal delay={0.16}>
                <p className="ds-lead ds-text-pretty mx-auto max-w-3xl">
                  Explore premium Next.js dashboards, React admin UI kits, ecommerce and SaaS templates,
                  landing pages, and free responsive HTML websites. Inspect the real UI before you download.
                </p>
              </Reveal>
              <Reveal delay={0.24}>
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <Magnetic>
                    <Link href="/templates" className="ds-btn ds-btn-primary ds-btn-lg">
                      Browse all templates
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Magnetic>
                  <Link href="/html-templates" className="ds-btn ds-btn-secondary ds-btn-lg">
                    <Code2 className="h-4 w-4" />
                    Free HTML templates
                  </Link>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        <section className="ds-section-sm ds-bg-section relative overflow-hidden border-y">
          <SectionBackground />
          <div className="ds-container relative">
            <Stagger className="grid grid-cols-2 gap-6 md:grid-cols-4">
              {stats.map((stat) => (
                <StaggerItem key={stat.label}>
                  <div className="text-center">
                    <div className="ds-stat-number">{stat.value}</div>
                    <div className="ds-stat-label">{stat.label}</div>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>

        <section className="ds-section ds-bg-section">
          <div className="ds-container">
            <Reveal className="ds-section-head ds-section-head-left mb-10">
              <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <span className="ds-eyebrow ds-eyebrow-accent mb-3">
                    <Sparkles className="h-3.5 w-3.5" />
                    Featured source packages
                  </span>
                  <h2 className="ds-h1 ds-text-balance">Popular templates to inspect now</h2>
                  <p className="ds-lead ds-text-pretty mt-2">
                    Compare real screenshots, live previews, included pages, framework details, and pricing before choosing.
                  </p>
                </div>
                <Link href="/templates?sort=featured" className="ds-btn ds-btn-secondary shrink-0">
                  View catalog
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </Reveal>
            <Stagger className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
              {featuredTemplates.map((template) => (
                <StaggerItem key={template.id}>
                  <TemplateCard template={template} />
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>

        <section className="ds-section ds-bg-section relative overflow-hidden">
          <SectionBackground />
          <div className="ds-container relative">
            <Reveal className="ds-section-head">
              <span className="ds-eyebrow">
                <Layers3 className="h-3.5 w-3.5" />
                Browse by format
              </span>
              <h2 className="ds-h1 ds-text-balance">Find the right template category</h2>
              <p className="ds-lead ds-text-pretty">
                Keep static HTML websites, application dashboards, ecommerce projects, and landing pages easy to compare.
              </p>
            </Reveal>
            <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {categoryOptions.map((category) => {
                const Icon = CATEGORY_ICONS[category.id] ?? LayoutGrid
                const count = templates.filter((template) => template.category === category.id).length
                return (
                  <StaggerItem key={category.id}>
                    <Link
                      href={`/template-categories/${category.id}`}
                      className="ds-card ds-card-hover group block h-full no-underline"
                    >
                      <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-transform group-hover:scale-105">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="ds-h3">{category.label}</h3>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{category.description}</p>
                      <div className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                        {count} templates
                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                      </div>
                    </Link>
                  </StaggerItem>
                )
              })}
            </Stagger>
          </div>
        </section>

        <section className="ds-section ds-bg-section">
          <div className="ds-container">
            <Reveal className="ds-section-head ds-section-head-left mb-8">
              <span className="ds-eyebrow ds-eyebrow-accent mb-3">
                <Search className="h-3.5 w-3.5" />
                Focused template guides
              </span>
              <h2 className="ds-h1 ds-text-balance">Browse templates by project intent</h2>
              <p className="ds-lead ds-text-pretty mt-2">
                Use focused collections when you already know the framework, website type, or application workflow you need.
              </p>
            </Reveal>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {TEMPLATE_SEO_HUBS.map((hub) => (
                <Link
                  key={hub.slug}
                  href={`/template-hubs/${hub.slug}`}
                  className="group flex min-h-28 items-start justify-between gap-4 rounded-lg border border-border bg-card p-5 transition hover:border-primary/40 hover:shadow-sm"
                >
                  <div>
                    <h3 className="font-semibold text-foreground">{hub.title}</h3>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">{hub.metaDescription}</p>
                  </div>
                  <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="ds-section ds-bg-section relative overflow-hidden">
          <SectionBackground />
          <div className="ds-container relative">
            <Reveal className="ds-section-head">
              <span className="ds-eyebrow">
                <Zap className="h-3.5 w-3.5" />
                A clearer buying path
              </span>
              <h2 className="ds-h1 ds-text-balance">Know what you are getting before checkout</h2>
            </Reveal>
            <Stagger className="grid gap-6 md:grid-cols-3">
              {[
                {
                  icon: Eye,
                  title: 'Preview the real interface',
                  copy: 'Open screenshots and live previews to inspect layout, navigation, pages, components, and responsive behavior.',
                },
                {
                  icon: PackageCheck,
                  title: 'Read the package scope',
                  copy: 'Each detail page lists the framework, technology stack, included pages, features, license, and exact purchase scope.',
                },
                {
                  icon: ShieldCheck,
                  title: 'Download through your account',
                  copy: 'Free-download rules and paid entitlements are attached to your signed-in account for protected ZIP delivery.',
                },
              ].map((item) => (
                <StaggerItem key={item.title}>
                  <div className="ds-card h-full">
                    <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <h3 className="ds-h3">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.copy}</p>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>

        <section className="ds-section ds-bg-section">
          <div className="ds-container max-w-5xl">
            <Reveal>
              <h2 className="ds-h2 mb-5">Templates for dashboards, ecommerce, SaaS, landing pages, and static websites</h2>
              <div className="space-y-4 text-sm leading-7 text-muted-foreground sm:text-base sm:leading-8">
                <p>
                  mtverse is a template catalog for developers, founders, designers, freelancers, and agencies who need a strong starting point without rebuilding common layouts from scratch. The collection covers <Link href="/template-hubs/nextjs-dashboard-templates" className="font-medium text-primary hover:underline">Next.js dashboard templates</Link>, <Link href="/template-hubs/react-admin-dashboard-templates" className="font-medium text-primary hover:underline">React admin UI kits</Link>, ecommerce storefronts, SaaS workspaces, landing pages, and responsive HTML websites.
                </p>
                <p>
                  Dashboard packages focus on application shells, navigation, analytics, tables, charts, settings, authentication screens, billing, ecommerce operations, CRM workflows, and internal tools. Website templates focus on clear page structure, responsive sections, product presentation, portfolios, service pages, and launch-ready marketing layouts.
                </p>
                <p>
                  Search visibility comes from useful, accurate template pages rather than keyword lists. Every important mtverse template route is designed to explain the project type, framework, included screens, preview options, pricing scope, and download path so visitors and search engines can understand what the page actually offers.
                </p>
              </div>
            </Reveal>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="ds-card">
                <h3 className="ds-h4">Popular developer template searches</h3>
                <div className="mt-4 flex flex-wrap gap-2">
                  {[
                    ['Next.js dashboards', '/template-hubs/nextjs-dashboard-templates'],
                    ['React admin templates', '/template-hubs/react-admin-dashboard-templates'],
                    ['SaaS templates', '/template-hubs/saas-templates'],
                    ['Ecommerce templates', '/template-hubs/ecommerce-website-templates'],
                  ].map(([label, href]) => (
                    <Link key={href} href={href} className="ds-btn ds-btn-secondary ds-btn-sm">{label}</Link>
                  ))}
                </div>
              </div>
              <div className="ds-card">
                <h3 className="ds-h4">Popular website template searches</h3>
                <div className="mt-4 flex flex-wrap gap-2">
                  {[
                    ['Free HTML templates', '/template-hubs/free-html-templates'],
                    ['Portfolio templates', '/template-hubs/portfolio-html-templates'],
                    ['Landing pages', '/template-hubs/landing-page-templates'],
                    ['Agency websites', '/template-hubs/agency-website-templates'],
                  ].map(([label, href]) => (
                    <Link key={href} href={href} className="ds-btn ds-btn-secondary ds-btn-sm">{label}</Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="ds-section ds-bg-section">
          <div className="ds-container max-w-4xl">
            <Reveal className="mb-8 text-center">
              <span className="ds-eyebrow ds-eyebrow-accent mb-3">Template FAQ</span>
              <h2 className="ds-h1 ds-text-balance">Questions before you choose a template</h2>
            </Reveal>
            <div className="grid gap-3">
              {FAQS.map((item) => (
                <details key={item.question} className="rounded-lg border border-border bg-card p-4">
                  <summary className="cursor-pointer list-none text-sm font-semibold text-foreground">{item.question}</summary>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="ds-section-lg ds-bg-section relative overflow-hidden">
          <CtaBackground />
          <div className="ds-container relative">
            <div className="mx-auto max-w-3xl space-y-6 text-center">
              <Reveal>
                <span className="ds-eyebrow ds-eyebrow-accent">
                  <Check className="h-3.5 w-3.5" />
                  Preview first, then choose
                </span>
              </Reveal>
              <Reveal delay={0.08}>
                <h2 className="ds-display-2 ds-text-balance">
                  Find a template that fits the <span className="ds-text-emphasis">actual project</span>
                </h2>
              </Reveal>
              <Reveal delay={0.16}>
                <p className="ds-lead ds-text-pretty">
                  Compare {templateStats.totalTemplates.toLocaleString()} templates across {categoryOptions.length} focused categories.
                </p>
              </Reveal>
              <Reveal delay={0.24}>
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <Link href="/templates" className="ds-btn ds-btn-primary ds-btn-lg">
                    Browse templates
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link href="/pricing" className="ds-btn ds-btn-secondary ds-btn-lg">Compare pricing</Link>
                </div>
              </Reveal>
            </div>
          </div>
        </section>
      </main>
    </PublicLayout>
  )
}