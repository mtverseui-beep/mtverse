import Link from 'next/link'
import { SITE_URL } from '@/lib/site-url'
import {
  ArrowRight,
  Sparkles,
  Search,
  Tag,
  Zap,
  Heart,
  Star,
  TrendingUp,
  Users,
  Image as ImageIcon,
  PenTool,
  Code,
  Briefcase,
  GraduationCap,
  Microscope,
  Wand2,
  LayoutGrid,
  Eye,
  Check,
  Shield,
} from 'lucide-react'
import PublicLayout from '@/components/layout/PublicLayout'
import { getPromptLibraryData } from '@/lib/prompt-db'
import { PROMPT_CATEGORIES, PROMPT_MODELS } from '@/lib/prompt-library-data'
import {
  getFeaturedTemplatesFromStore,
  getTemplateStatsFromStore,
} from '@/lib/templates-data'
import { withAllTemplateSocial } from '@/lib/template-social-store'
import { TemplateCard } from '@/components/templates/template-card'
import { SectionBackground, CtaBackground, Blob } from '@/components/design-system/backgrounds'
import { HomeHero3D } from '@/components/design-system/hero-3d'
import { AI_TOOL_ICONS } from '@/components/design-system/ai-icons'
import { Reveal, Stagger, StaggerItem, Magnetic, Marquee } from '@/components/design-system/animations'
import { AnimatedPromptsShowcase } from '@/components/home/animated-prompts-showcase'

export const dynamic = 'force-static'
export const revalidate = 60

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  writing: PenTool,
  work: Briefcase,
  coding: Code,
  career: Users,
  study: GraduationCap,
  research: Microscope,
  'image-generation': ImageIcon,
  'image-editing': Wand2,
}

const CATEGORY_PASTEL: Record<string, string> = {
  writing: 'ds-card-pastel-yellow',
  work: 'ds-card-pastel-blue',
  coding: 'ds-card-pastel-mint',
  career: 'ds-card-pastel-peach',
  study: 'ds-card-pastel-lavender',
  research: 'ds-card-pastel-rose',
  'image-generation': 'ds-card-pastel-blue',
  'image-editing': 'ds-card-pastel-mint',
}

export const metadata = {
  title: {
    default: 'mtverse — Free AI Prompts & Premium Dashboard Templates',
    template: '%s | mtverse',
  },
  description:
    'Browse 2,300+ free AI prompts for ChatGPT, Midjourney, Nano Banana, Gemini, and Flux. Plus premium Next.js dashboard templates for SaaS, enterprise, ecommerce, CRM, and analytics. Copy prompts instantly, buy dashboard templates once.',
  keywords: [
    'AI prompts',
    'free AI prompts',
    'ChatGPT prompts',
    'Midjourney prompts',
    'Nano Banana prompts',
    'Gemini prompts',
    'Flux prompts',
    'image generation prompts',
    'AI image prompts',
    'Next.js templates',
    'dashboard templates',
    'ecommerce templates',
    'SaaS templates',
    'portfolio templates',
    'prompt library',
    'prompt marketplace',
  ],
  authors: [{ name: 'mtverse' }],
  metadataBase: new URL(`${SITE_URL}`),
  alternates: { canonical: '/' },
  openGraph: {
    title: 'mtverse — Free AI Prompts & Premium Dashboard Templates',
    description:
      '2,300+ free AI prompts for ChatGPT, Midjourney, Nano Banana, Gemini, Flux. Plus premium Next.js dashboard templates. Copy instantly, buy once.',
    url: `${SITE_URL}`,
    siteName: 'mtverse',
    type: 'website',
    images: [{ url: '/SiteLogo.png', width: 512, height: 512, alt: 'mtverse' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'mtverse — Free AI Prompts & Premium Dashboard Templates',
    description:
      '2,300+ free AI prompts for ChatGPT, Midjourney, Nano Banana, Gemini, Flux. Plus premium Next.js dashboard templates.',
  },
  robots: {
    index: true,
    follow: true,
    'max-image-preview': 'large',
    'max-snippet': -1,
    'max-video-preview': -1,
  },
}

export default async function Home() {
  const library = await getPromptLibraryData().catch(() => null)
  const promptCount = library?.stats?.totalPrompts ?? 0
  const featuredCount = library?.stats?.featuredPrompts ?? 0
  const imageCount = library?.stats?.imagePrompts ?? 0

  const [featuredTemplates, templateStats] = await Promise.all([
    getFeaturedTemplatesFromStore(3).then((templates) => withAllTemplateSocial(templates)),
    getTemplateStatsFromStore(),
  ])

  const stats = [
    { value: promptCount.toLocaleString(), label: 'Curated prompts' },
    { value: `${templateStats.totalTemplates}`, label: 'Dashboard templates' },
    { value: `${featuredCount}+`, label: 'Featured picks' },
    { value: 'Weekly', label: 'New prompts added' },
  ]

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: `${SITE_URL}`,
        name: 'mtverse',
        description: 'Free AI prompts and premium Next.js templates',
        publisher: { '@id': `${SITE_URL}/#organization` },
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${SITE_URL}/prompts?q={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'Organization',
        '@id': `${SITE_URL}/#organization`,
        name: 'mtverse',
        url: `${SITE_URL}`,
        logo: `${SITE_URL}/SiteLogo.png`,
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'What are AI prompts?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'AI prompts are instructions you give to AI models like ChatGPT, Midjourney, or Gemini to generate text, images, or code. mtverse offers 2,300+ curated prompts across image generation, writing, coding, and more — all free to copy and use.',
            },
          },
          {
            '@type': 'Question',
            name: 'Are the prompts really free?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes. Every prompt on mtverse is free to copy and use. You can browse by category, search by keyword, filter by AI model, and copy any prompt with one click. No sign-up required.',
            },
          },
          {
            '@type': 'Question',
            name: 'What AI models do the prompts work with?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Our prompts work with ChatGPT, Claude, Gemini, Midjourney, Flux, and Photoshop AI. Each prompt is tagged with the models it works best with, so you can filter by your favorite tool.',
            },
          },
          {
            '@type': 'Question',
            name: 'What are the premium templates?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Our premium dashboard templates are production-ready Next.js source packages for SaaS, enterprise, analytics, ecommerce, CRM, and admin products. They include live previews, full source code, and secure download access. Buy once, use forever.',
            },
          },
        ],
      },
    ],
  }

  return (
    <PublicLayout promptCount={promptCount}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main>
        {/* ═══════════════ HERO — fits in viewport ═══════════════ */}
        <section className="relative min-h-[88vh] flex items-center overflow-hidden">
          <HomeHero3D />

          <div className="ds-container relative">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <Reveal>
                <span className="ds-eyebrow ds-eyebrow-accent">
                  <Sparkles className="h-3.5 w-3.5" />
                  {promptCount.toLocaleString()} prompts · {templateStats.totalTemplates} templates
                </span>
              </Reveal>
              <Reveal delay={0.08}>
                <h1 className="ds-display-1 ds-text-balance">
                  Prompts &amp; templates for <span className="ds-text-emphasis">creators</span>
                </h1>
              </Reveal>
              <Reveal delay={0.16}>
                <p className="ds-lead ds-text-pretty">
                  Free AI prompts for ChatGPT, Midjourney, Nano Banana, Gemini, Flux.
                  Premium Next.js dashboard templates for SaaS, enterprise, ecommerce, CRM, and analytics.
                </p>
              </Reveal>
              <Reveal delay={0.24}>
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <Magnetic>
                    <Link href="/prompts" className="ds-btn ds-btn-primary ds-btn-lg">
                      Browse prompts
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Magnetic>
                  <Link href="/templates" className="ds-btn ds-btn-secondary ds-btn-lg">
                    <LayoutGrid className="h-4 w-4" />
                    Browse templates
                  </Link>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ═══════════════ STATS STRIP ═══════════════ */}
        <section className="ds-section-sm ds-bg-section relative overflow-hidden border-y">
          <SectionBackground />
          <div className="ds-container relative">
            <Stagger className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((s, i) => (
                <StaggerItem key={i}>
                  <div className="text-center">
                    <div className="ds-stat-number">{s.value}</div>
                    <div className="ds-stat-label">{s.label}</div>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>

        {/* ═══════════════ ANIMATED PROMPTS SHOWCASE (8 cards, 24 images cycling) ═══════════════ */}
        <section className="ds-section ds-bg-section relative overflow-hidden">
          <div className="ds-container relative">
            <Reveal className="ds-section-head ds-section-head-left mb-8">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 w-full">
                <div>
                  <span className="ds-eyebrow ds-eyebrow-accent mb-3">
                    <Sparkles className="h-3.5 w-3.5" />
                    Newly added
                  </span>
                  <h2 className="ds-h1 ds-text-balance">Fresh prompts, every week</h2>
                  <p className="ds-lead ds-text-pretty mt-2">
                    A rotating preview of the latest prompts from our library. Hover to pause.
                  </p>
                </div>
                <Link
                  href="/prompts?sort=new"
                  className="ds-btn ds-btn-secondary shrink-0"
                >
                  See all new prompts
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <AnimatedPromptsShowcase />
            </Reveal>
          </div>
        </section>

        {/* ═══════════════ FEATURE CARDS ═══════════════ */}
        <section className="ds-section ds-bg-section relative overflow-hidden">
          <SectionBackground />
          <div className="ds-container relative">
            <Reveal className="ds-section-head">
              <span className="ds-eyebrow">
                <Zap className="h-3.5 w-3.5" />
                Why mtverse
              </span>
              <h2 className="ds-h1 ds-text-balance">Built for creators who ship</h2>
              <p className="ds-lead ds-text-pretty">
                Every prompt is hand-reviewed, every template is production-ready. No bloat, no filler.
              </p>
            </Reveal>

            <Stagger className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StaggerItem>
                <div className="ds-card ds-card-hover h-full">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600 mb-4 dark:bg-primary-900/30 dark:text-primary-300">
                    <Search className="h-5 w-5" />
                  </div>
                  <h3 className="ds-h3 mb-2">Search &amp; filter</h3>
                  <p className="ds-body ds-muted">
                    Find the right prompt or template by category, model, tag, or keyword. Sort by trending, newest, or shuffle for fresh inspiration.
                  </p>
                </div>
              </StaggerItem>
              <StaggerItem>
                <div className="ds-card ds-card-hover h-full">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-accent-50 text-accent-600 mb-4 dark:bg-accent-900/30 dark:text-accent-300">
                    <Tag className="h-5 w-5" />
                  </div>
                  <h3 className="ds-h3 mb-2">Copy &amp; use</h3>
                  <p className="ds-body ds-muted">
                    Prompts come with one-click copy and structured guidance. Templates come with full source code and lifetime updates.
                  </p>
                </div>
              </StaggerItem>
              <StaggerItem>
                <div className="ds-card ds-card-hover h-full">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 mb-4 dark:bg-emerald-900/30 dark:text-emerald-300">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <h3 className="ds-h3 mb-2">Curated quality</h3>
                  <p className="ds-body ds-muted">
                    Every prompt is hand-reviewed and paired with a preview image. Every template is production-tested and battle-hardened.
                  </p>
                </div>
              </StaggerItem>
            </Stagger>
          </div>
        </section>

        {/* ═══════════════ TEMPLATES PREVIEW ═══════════════ */}
        <section className="ds-section ds-bg-section relative overflow-hidden">
          <Blob variant="peach" size={400} position={{ top: '10%', right: '-5%' }} float="slow" />
          <Blob variant="lavender" size={300} position={{ bottom: '5%', left: '-5%' }} float="normal" />

          <div className="ds-container relative">
            <Reveal className="ds-section-head ds-section-head-left mb-10">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 w-full">
                <div>
                  <span className="ds-eyebrow ds-eyebrow-accent mb-3">
                    <LayoutGrid className="h-3.5 w-3.5" />
                    Dashboard templates
                  </span>
                  <h2 className="ds-h1 ds-text-balance">Ship faster with production-ready dashboards</h2>
                  <p className="ds-lead ds-text-pretty mt-2">
                    Real suite-backed Next.js dashboard templates with live previews, secure download access, and source code you can ship from.
                  </p>
                </div>
                <Link
                  href="/templates"
                  className="ds-btn ds-btn-secondary shrink-0"
                >
                  View all templates
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </Reveal>

            <Stagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
              {featuredTemplates.map((t) => (
                <StaggerItem key={t.id}>
                  <TemplateCard template={t} />
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>

        {/* ═══════════════ CATEGORIES ═══════════════ */}
        <section className="ds-section ds-bg-section relative overflow-hidden">
          <SectionBackground />
          <div className="ds-container relative">
            <Reveal className="ds-section-head">
              <span className="ds-eyebrow">
                <Heart className="h-3.5 w-3.5" />
                Browse by category
              </span>
              <h2 className="ds-h1 ds-text-balance">Find the perfect prompt</h2>
              <p className="ds-lead ds-text-pretty">
                Eight curated categories covering image generation, writing, coding, and more.
              </p>
            </Reveal>

            <Stagger className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
              {PROMPT_CATEGORIES.map((c) => {
                const Icon = CATEGORY_ICONS[c.id] ?? Sparkles
                const pastelClass = CATEGORY_PASTEL[c.id] ?? 'ds-card-pastel-blue'
                return (
                  <StaggerItem key={c.id}>
                    <Link
                      href={`/prompts?category=${c.id}`}
                      className={`${pastelClass} ds-card-pastel block h-full no-underline group`}
                    >
                      <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/60 mb-3 transition-transform group-hover:scale-110">
                        <Icon className="h-5 w-5 text-foreground/70" />
                      </div>
                      <h3 className="ds-h4 mb-1">{c.title}</h3>
                      <p className="text-xs text-foreground/60 line-clamp-2">{c.description}</p>
                      <div className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-foreground/70 group-hover:text-foreground">
                        Explore
                        <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                      </div>
                    </Link>
                  </StaggerItem>
                )
              })}
            </Stagger>
          </div>
        </section>

        {/* ═══════════════ AI TOOLS MARQUEE (real icons) ═══════════════ */}
        <section className="ds-section-sm ds-bg-section relative overflow-hidden border-y">
          <div className="ds-container relative">
            <Reveal className="text-center mb-6">
              <span className="ds-eyebrow">Works with your favorite AI tools</span>
            </Reveal>
            <Marquee speed="slow">
              {AI_TOOL_ICONS.map(({ name, Icon, bg, fg }) => (
                <div key={name} className="flex items-center gap-3 px-8">
                  <div className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${bg} ${fg} shadow-sm`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="text-2xl font-bold text-foreground/70">{name}</span>
                </div>
              ))}
            </Marquee>
          </div>
        </section>

        {/* ═══════════════ TESTIMONIALS ═══════════════ */}
        <section className="ds-section ds-bg-section relative overflow-hidden">
          <SectionBackground />
          <div className="ds-container relative">
            <Reveal className="ds-section-head">
              <span className="ds-eyebrow">
                <Star className="h-3.5 w-3.5" />
                Built for creators
              </span>
              <h2 className="ds-h1 ds-text-balance">Why mtverse</h2>
            </Reveal>

            <Stagger className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  quote: 'mtverse cut my ideation time in half. The preview images alone are worth it.',
                  name: 'Aria Chen',
                  role: 'AI Artist',
                  color: 'blue',
                },
                {
                  quote: 'The templates are worth every penny. Saved me 3 weeks of dev time on my SaaS launch.',
                  name: 'Marcus Vale',
                  role: 'Founder, Lumi',
                  color: 'yellow',
                },
                {
                  quote: 'I find better prompts here in 5 minutes than I did in an hour of trial and error.',
                  name: 'Priya Nair',
                  role: 'Creative Director',
                  color: 'mint',
                },
              ].map((t, i) => (
                <StaggerItem key={i}>
                  <div className={`ds-card-pastel ds-card-pastel-${t.color} h-full flex flex-col`}>
                    <div className="flex gap-1 mb-4">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <Star key={j} className="h-4 w-4 fill-current text-foreground/60" />
                      ))}
                    </div>
                    <p className="text-base leading-relaxed mb-6 flex-1">“{t.quote}”</p>
                    <div className="flex items-center gap-3 pt-4 border-t border-white/40">
                      <div className="h-10 w-10 rounded-full bg-white/70 flex items-center justify-center font-bold text-foreground/70">
                        {t.name[0]}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-foreground/80">{t.name}</div>
                        <div className="text-xs text-foreground/60">{t.role}</div>
                      </div>
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>

        {/* ═══════════════ ADVANCED SEO CONTENT ═══════════════ */}
        <section className="ds-section ds-bg-section">
          <div className="ds-container max-w-4xl">
            <Reveal>
              <h2 className="ds-h2 mb-6">Free AI prompts for every workflow</h2>
              <div className="prose prose-sm dark:prose-invert max-w-none space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  mtverse is a curated library of <strong>free AI prompts</strong> for image generation,
                  writing, coding, career development, study, and research. Whether you are a designer looking
                  for <Link href="/prompts?category=image-generation" className="text-primary-600 hover:underline">AI image prompts</Link> for
                  Midjourney, a developer searching for <Link href="/prompts?category=coding" className="text-primary-600 hover:underline">ChatGPT coding prompts</Link>,
                  or a marketer needing <Link href="/prompts?category=writing" className="text-primary-600 hover:underline">writing prompts</Link> for
                  blog posts and ad copy, our library has you covered.
                </p>
                <p>
                  Every prompt in our library is hand-reviewed and paired with a preview image, so you can see
                  what the prompt actually produces before you copy it. We currently offer prompts for{' '}
                  <strong>ChatGPT</strong>, <strong>Claude</strong>, <strong>Gemini</strong>,{' '}
                  <strong>Midjourney</strong>, <strong>Flux</strong>, and <strong>Photoshop AI</strong>,
                  with new prompts added weekly. Browse by category, search by keyword, or filter by AI model
                  to find exactly what you need in seconds.
                </p>
                <p>
                  Beyond prompts, we also offer a curated marketplace of{' '}
                  <Link href="/templates" className="text-primary-600 hover:underline">premium Next.js templates</Link>{' '}
                  for SaaS, enterprise, analytics, ecommerce, CRM, and admin products.
                  Each dashboard template comes with full source code, TypeScript types, Tailwind CSS styling, shadcn/ui
                  components, dark mode, and a 14-day money-back guarantee. Buy once, use forever.
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-10">
                <div className="ds-card">
                  <h3 className="ds-h4 mb-2">Popular prompt categories</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li><Link href="/prompts?category=image-generation" className="hover:text-foreground hover:underline">AI image generation prompts</Link></li>
                    <li><Link href="/prompts?category=image-editing" className="hover:text-foreground hover:underline">AI image editing prompts</Link></li>
                    <li><Link href="/prompts?category=writing" className="hover:text-foreground hover:underline">Writing &amp; content prompts</Link></li>
                    <li><Link href="/prompts?category=coding" className="hover:text-foreground hover:underline">Coding &amp; development prompts</Link></li>
                    <li><Link href="/prompts?category=work" className="hover:text-foreground hover:underline">Work &amp; productivity prompts</Link></li>
                    <li><Link href="/prompts?category=career" className="hover:text-foreground hover:underline">Career &amp; job search prompts</Link></li>
                  </ul>
                </div>
                <div className="ds-card">
                  <h3 className="ds-h4 mb-2">Popular AI model prompts</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li><Link href="/prompts?model=ChatGPT" className="hover:text-foreground hover:underline">ChatGPT prompts</Link></li>
                    <li><Link href="/prompts?model=Midjourney" className="hover:text-foreground hover:underline">Midjourney prompts</Link></li>
                    <li><Link href="/prompts?model=Flux" className="hover:text-foreground hover:underline">Flux prompts</Link></li>
                    <li><Link href="/prompts?model=Gemini" className="hover:text-foreground hover:underline">Gemini prompts</Link></li>
                    <li><Link href="/prompts?model=Claude" className="hover:text-foreground hover:underline">Claude prompts</Link></li>
                    <li><Link href="/prompts?model=Photoshop%20AI" className="hover:text-foreground hover:underline">Photoshop AI prompts</Link></li>
                  </ul>
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.2}>
              <div className="ds-card mt-6">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="ds-h4 mb-1">Free to use, no sign-up required</h3>
                    <p className="text-sm text-muted-foreground">
                      Every prompt on mtverse is free to copy and use. You do not need an account to browse,
                      search, or copy prompts. Sign up is optional — it only saves your favorites and lets you
                      download purchased templates.
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ═══════════════ CTA ═══════════════ */}
        {/* Homepage FAQ */}
        <section className="ds-section ds-bg-section">
          <div className="ds-container max-w-4xl">
            <Reveal className="text-center mb-8">
              <span className="ds-eyebrow ds-eyebrow-accent mb-3">Help center</span>
              <h2 className="ds-h1 ds-text-balance">Questions before you browse?</h2>
              <p className="ds-lead ds-text-pretty mt-2">Clear answers for prompt users, template buyers, and creators checking mtverse for the first time.</p>
            </Reveal>
            <div className="grid gap-3">
              {[
                ['Are mtverse AI prompts free?', 'Yes. Public prompts are free to browse, copy, and adapt. You do not need an account to use the prompt library.'],
                ['What templates can I buy?', 'mtverse focuses on premium dashboard, SaaS, ecommerce, CRM, analytics, and admin templates with live previews and secure download access.'],
                ['Can I preview a template before purchase?', 'Yes. Each paid template has a live preview route and full screenshots so you can inspect the UI before checkout.'],
                ['What helps mtverse rank in Google?', 'Useful page content, accurate metadata, internal links, fast pages, clean schema, a sitemap, and trustworthy policy pages help more than long keyword stuffing lists.'],
              ].map(([question, answer]) => (
                <details key={question} className="rounded-lg border border-border bg-card p-4">
                  <summary className="cursor-pointer list-none text-sm font-semibold text-foreground">{question}</summary>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="ds-section-lg ds-bg-section relative overflow-hidden">
          <CtaBackground />
          <div className="ds-container relative">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <Reveal>
                <span className="ds-eyebrow ds-eyebrow-accent">
                  <Sparkles className="h-3.5 w-3.5" />
                  Start creating
                </span>
              </Reveal>
              <Reveal delay={0.08}>
                <h2 className="ds-display-2 ds-text-balance">
                  Your next great idea is one <span className="ds-text-emphasis">prompt</span> away
                </h2>
              </Reveal>
              <Reveal delay={0.16}>
                <p className="ds-lead ds-text-pretty">
                  Browse {promptCount.toLocaleString()} curated prompts and {templateStats.totalTemplates} premium templates.
                </p>
              </Reveal>
              <Reveal delay={0.24}>
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <Magnetic>
                    <Link href="/prompts" className="ds-btn ds-btn-primary ds-btn-lg">
                      Browse prompts
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Magnetic>
                  <Link href="/templates" className="ds-btn ds-btn-secondary ds-btn-lg">
                    <Eye className="h-4 w-4" />
                    Browse templates
                  </Link>
                </div>
              </Reveal>
            </div>
          </div>
        </section>
      </main>
    </PublicLayout>
  )
}
