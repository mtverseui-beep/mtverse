import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  Check,
  Code2,
  Eye,
  FormInput,
  Gauge,
  Layers3,
  LayoutGrid,
  Megaphone,
  Menu,
  PackageCheck,
  PanelsTopLeft,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Table2,
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
import { SectionBackground } from '@/components/design-system/backgrounds'
import { Reveal, Stagger, StaggerItem } from '@/components/design-system/animations'
import { TEMPLATE_SEO_HUBS } from '@/lib/template-seo-hubs'
import { SITE_URL } from '@/lib/site-url'
import { SOCIAL_EMAIL, SOCIAL_GITHUB, SOCIAL_TWITTER } from '@/lib/site-social'
import { NewsletterSignup } from '@/components/home/newsletter-signup'
import { TemplateFaqList } from '@/components/content/template-faq-list'

export const dynamic = 'force-static'
export const revalidate = 300

export const metadata: Metadata = {
  title: 'Website Templates & UI Component Library',
  description:
    'Browse production-ready dashboard, ecommerce, SaaS, landing page, portfolio, and HTML templates plus a reusable UI component library with live previews and secure source downloads.',
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
    'React UI component library',
    'Tailwind CSS component library',
    'modern UI components',
    'React UI components',
    'Next.js UI components',
    'navbar components',
    'sidebar components',
    'modern button UI',
    'form UI components',
    'dashboard UI components',
    'SaaS UI blocks',
  ],
  alternates: { canonical: '/' },
  openGraph: {
    title: 'mtverse - Website Templates & UI Component Library',
    description:
      'Preview website templates for dashboards, ecommerce, SaaS, landing pages, portfolios, and reusable UI components before downloading source code.',
    url: SITE_URL,
    siteName: 'mtverse',
    type: 'website',
    images: [{ url: '/SiteLogo.png', width: 512, height: 512, alt: 'mtverse template marketplace' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'mtverse - Website Templates & UI Component Library',
    description: 'Live previews for website templates and UI components, protected source packages, and secure account delivery.',
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

const UI_LIBRARY_URL = (process.env.NEXT_PUBLIC_UI_LIBRARY_URL || 'https://ui.mtverse.dev').replace(/\/$/, '')

const UI_COMPONENT_CATEGORIES = [
  { label: 'Modern UI', description: 'Production-focused patterns for SaaS, ecommerce, dashboards, and product workflows.', href: '/ui-components/modern-ui-components', icon: Sparkles },
  { label: 'React components', description: 'Reusable React patterns for forms, data display, overlays, and product screens.', href: '/ui-components/react-ui-components', icon: Layers3 },
  { label: 'Next.js components', description: 'App Router-ready interface patterns for public pages and authenticated products.', href: '/ui-components/nextjs-ui-components', icon: Code2 },
  { label: 'Navbars and sidebars', description: 'Responsive navigation, application shells, mobile menus, and dashboard sidebars.', href: '/ui-components/navbar-components', icon: Menu },
  { label: 'Buttons and forms', description: 'Clear actions, input states, validation, uploads, and product data entry.', href: '/ui-components/form-components', icon: FormInput },
  { label: 'Dashboard UI', description: 'Tables, metrics, filters, commands, notifications, and operational workflows.', href: '/ui-components/dashboard-ui-components', icon: Table2 },
] as const

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
  {
    question: 'What is included with the mtverse UI component library?',
    answer:
      'UI Library access includes the current component source, implementation notes, dependency guidance, a complete project package, and future component updates under the published license.',
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
        description: 'Website templates for product teams plus a reusable UI component source library.',
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
        <section className="relative flex min-h-[calc(100svh-5rem)] items-center overflow-hidden border-b bg-background">
          <div aria-hidden className="ds-line-grid absolute inset-0 opacity-20" />
          <div aria-hidden className="absolute inset-y-0 left-[12%] w-px bg-border/60" />
          <div aria-hidden className="absolute inset-y-0 right-[12%] w-px bg-border/60" />
          <div aria-hidden className="absolute inset-x-0 top-[22%] h-px bg-border/50" />
          <div aria-hidden className="absolute inset-x-0 bottom-[22%] h-px bg-border/50" />
          <div aria-hidden className="absolute left-[12%] top-[22%] h-3 w-3 -translate-x-1/2 -translate-y-1/2 border border-primary bg-background" />
          <div aria-hidden className="absolute bottom-[22%] right-[12%] h-3 w-3 translate-x-1/2 translate-y-1/2 border border-primary bg-background" />

          <div className="ds-container relative py-14 text-center sm:py-16">
            <div className="mx-auto max-w-4xl">
              <Reveal>
                <span className="ds-eyebrow ds-eyebrow-accent">
                  <LayoutGrid className="h-3.5 w-3.5" />
                  Templates and components for real product work
                </span>
              </Reveal>
              <Reveal delay={0.08}>
                <h1 className="ds-display-1 ds-text-balance mt-5">
                  Website templates and UI components built for <span className="ds-text-emphasis">real products</span>
                </h1>
              </Reveal>
              <Reveal delay={0.16}>
                <p className="ds-lead ds-text-pretty mx-auto mt-5 max-w-2xl">
                  Preview dashboard, ecommerce, SaaS, landing page, portfolio, and HTML templates. Reuse production-focused UI components with protected source access and clear implementation guidance.
                </p>
              </Reveal>
              <Reveal delay={0.24}>
                <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                  <Link href="/templates" className="ds-btn ds-btn-primary ds-btn-lg">
                    Browse templates
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link href={UI_LIBRARY_URL} target="_blank" rel="noopener noreferrer" className="ds-btn ds-btn-secondary ds-btn-lg">
                    <Layers3 className="h-4 w-4" />
                    Browse components
                  </Link>
                </div>
              </Reveal>
              <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs font-semibold text-muted-foreground">
                {['Live previews', 'One-time purchases', 'Account-based source access'].map((item) => (
                  <span key={item} className="inline-flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                    {item}
                  </span>
                ))}
              </div>
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

        <section id="ui-library" className="border-b bg-background">
          <div className="ds-container grid gap-10 py-14 lg:grid-cols-[minmax(0,0.82fr)_minmax(520px,1.18fr)] lg:items-center lg:py-16">
            <div>
              <span className="inline-flex items-center gap-2 text-xs font-bold uppercase text-primary">
                <Layers3 className="h-4 w-4" />
                mtverse UI component library
              </span>
              <h2 className="mt-4 max-w-xl text-3xl font-black leading-tight text-foreground sm:text-4xl">
                Production UI building blocks for real application work
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-muted-foreground sm:text-base">
                Inspect every component preview publicly. Lifetime access provides protected source, implementation notes, dependency guidance, the complete project, and future component updates.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href={UI_LIBRARY_URL} target="_blank" rel="noopener noreferrer" className="ds-btn ds-btn-primary">
                  Preview components
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/pricing#ui-library" className="ds-btn ds-btn-secondary">View access details</Link>
              </div>
            </div>

            <div className="grid overflow-hidden rounded-lg border border-border bg-card sm:grid-cols-2">
              {[
                { icon: LayoutGrid, title: '300+ component previews', copy: 'Explore navigation, forms, data display, commerce, marketing, and application states.' },
                { icon: Code2, title: 'Protected source access', copy: 'Open selected component source only after account entitlement is verified.' },
                { icon: PackageCheck, title: 'Complete project access', copy: 'Access the complete UI Library project as a private source package from your account.' },
                { icon: ShieldCheck, title: 'Lifetime product access', copy: 'Keep current components and receive future UI Library updates without a subscription.' },
              ].map((feature) => (
                <div key={feature.title} className="border-b border-border p-5 last:border-b-0 sm:border-r sm:[&:nth-child(2n)]:border-r-0 sm:[&:nth-last-child(-n+2)]:border-b-0">
                  <feature.icon className="h-5 w-5 text-primary" />
                  <h3 className="mt-4 text-sm font-bold text-foreground">{feature.title}</h3>
                  <p className="mt-2 text-xs leading-5 text-muted-foreground">{feature.copy}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="ds-section ds-bg-section relative overflow-hidden">
          <SectionBackground />
          <div className="ds-container relative">
            <Reveal className="ds-section-head">
              <span className="ds-eyebrow ds-eyebrow-accent">
                <Layers3 className="h-3.5 w-3.5" />
                Browse UI components
              </span>
              <h2 className="ds-h1 ds-text-balance">Start with the interface pattern you need</h2>
              <p className="ds-lead ds-text-pretty">
                Explore focused categories, inspect responsive previews, and review implementation details before choosing source access.
              </p>
            </Reveal>
            <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {UI_COMPONENT_CATEGORIES.map((category) => (
                <StaggerItem key={category.label}>
                  <Link href={category.href} className="ds-card ds-card-hover group block h-full no-underline">
                    <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <category.icon className="h-5 w-5" />
                    </div>
                    <h3 className="ds-h3">{category.label}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{category.description}</p>
                    <div className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                      Browse components
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </Link>
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

        <NewsletterSignup />

        <section className="border-y bg-background">
          <div className="ds-container grid gap-10 py-14 lg:grid-cols-[minmax(0,0.72fr)_minmax(520px,1.28fr)] lg:py-16">
            <Reveal>
              <span className="ds-eyebrow ds-eyebrow-accent mb-4">Templates and UI Library FAQ</span>
              <h2 className="ds-h1 ds-text-balance">Clear answers before you choose a product</h2>
              <p className="mt-4 max-w-md text-sm leading-7 text-muted-foreground">
                Preview scope, purchase boundaries, component access, licensing, and delivery are explained before checkout.
              </p>
              <Link href="/faq" className="ds-btn ds-btn-secondary mt-6">
                Read all FAQs
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Reveal>
            <TemplateFaqList items={FAQS} />
          </div>
        </section>

        <section className="border-b bg-muted/30">
          <div className="ds-container flex flex-col gap-8 py-14 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 text-xs font-bold uppercase text-primary">
                <Check className="h-3.5 w-3.5" />
                Preview first, choose with confidence
              </span>
              <h2 className="mt-4 text-3xl font-black leading-tight text-foreground sm:text-4xl">
                Find source that fits the actual product you are building
              </h2>
              <p className="mt-3 text-sm leading-7 text-muted-foreground sm:text-base">
                Compare {templateStats.totalTemplates.toLocaleString()} templates across {categoryOptions.length} focused categories, or unlock the reusable UI component library for $25.
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-3">
              <Link href="/templates" className="ds-btn ds-btn-primary ds-btn-lg">
                Browse templates
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/pricing" className="ds-btn ds-btn-secondary ds-btn-lg">Compare pricing</Link>
            </div>
          </div>
        </section>
      </main>
    </PublicLayout>
  )
}
