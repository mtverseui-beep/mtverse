import type { Metadata } from 'next'
import { SITE_URL } from '@/lib/site-url'
import Link from 'next/link'
import { Mail, Github, Twitter, Sparkles, Zap, Shield, Heart } from 'lucide-react'
import PublicLayout from '@/components/layout/PublicLayout'
import { Reveal, Stagger, StaggerItem } from '@/components/design-system/animations'
import { SectionBackground, Blob } from '@/components/design-system/backgrounds'
import { HomeHeroBackground } from '@/components/design-system/hero-backgrounds'
import { SOCIAL_EMAIL, SOCIAL_GITHUB, SOCIAL_TWITTER } from '@/lib/site-social'
import { getPromptLibraryData } from '@/lib/prompt-db'
import { getTemplateStats } from '@/lib/templates-data'

export const metadata: Metadata = {
  title: 'About mtverse — Free AI Prompts & Premium Templates',
  description:
    'mtverse is a curated library of free AI prompts and premium Next.js templates. Learn about our mission to help creators ship faster.',
  alternates: { canonical: '/about' },
  openGraph: {
    title: 'About mtverse',
    description: 'Curated AI prompts and premium Next.js templates for creators.',
    url: `${SITE_URL}/about`,
    type: 'website',
  },
}



export default async function AboutPage() {
  const library = await getPromptLibraryData().catch(() => null)
  const promptCount = library?.stats?.totalPrompts ?? 0
  const templateStats = getTemplateStats()

  const values = [
    {
      icon: Sparkles,
      title: 'Quality over quantity',
      description: 'Every prompt is hand-reviewed and paired with a preview. Every template is production-tested.',
      color: 'primary',
    },
    {
      icon: Zap,
      title: 'Ship faster',
      description: 'Copy a prompt in seconds. Buy a template and launch in hours, not weeks.',
      color: 'accent',
    },
    {
      icon: Shield,
      title: 'Honest pricing',
      description: 'Free prompts, forever. Premium templates with a 14-day money-back guarantee. No subscriptions.',
      color: 'emerald',
    },
    {
      icon: Heart,
      title: 'Creator-first',
      description: 'Built by creators, for creators. We use everything we sell in our own projects.',
      color: 'rose',
    },
  ]

  const colorMap: Record<string, string> = {
    primary: 'bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-300',
    accent: 'bg-accent-50 text-accent-600 dark:bg-accent-900/30 dark:text-accent-300',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300',
    rose: 'bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-300',
  }

  return (
    <PublicLayout>
      <main>
        {/* Hero */}
        <section className="ds-section-lg ds-bg-section relative overflow-hidden">
          <HomeHeroBackground />
          <div className="ds-container relative">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <Reveal>
                <span className="ds-eyebrow ds-eyebrow-accent">
                  <Sparkles className="h-3.5 w-3.5" />
                  About mtverse
                </span>
              </Reveal>
              <Reveal delay={0.08}>
                <h1 className="ds-display-1 ds-text-balance">
                  We help creators <span className="ds-text-emphasis">ship faster</span>
                </h1>
              </Reveal>
              <Reveal delay={0.16}>
                <p className="ds-lead ds-text-pretty">
                  mtverse is a curated library of {promptCount.toLocaleString()}+ free AI prompts and {templateStats.totalTemplates} premium
                  Next.js templates. Built by creators who were tired of trial-and-error and boilerplate code.
                </p>
              </Reveal>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="ds-section-sm border-y">
          <div className="ds-container">
            <Stagger className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <StaggerItem>
                <div className="text-center">
                  <div className="ds-stat-number">{promptCount.toLocaleString()}</div>
                  <div className="ds-stat-label">Free prompts</div>
                </div>
              </StaggerItem>
              <StaggerItem>
                <div className="text-center">
                  <div className="ds-stat-number">{templateStats.totalTemplates}</div>
                  <div className="ds-stat-label">Premium templates</div>
                </div>
              </StaggerItem>
              <StaggerItem>
                <div className="text-center">
                  <div className="ds-stat-number">12k+</div>
                  <div className="ds-stat-label">Active creators</div>
                </div>
              </StaggerItem>
              <StaggerItem>
                <div className="text-center">
                  <div className="ds-stat-number">4.9/5</div>
                  <div className="ds-stat-label">Avg. rating</div>
                </div>
              </StaggerItem>
            </Stagger>
          </div>
        </section>

        {/* Story */}
        <section className="ds-section ds-bg-section relative overflow-hidden">
          <SectionBackground />
          <div className="ds-container max-w-3xl">
            <Reveal>
              <h2 className="ds-h1 mb-6">Our story</h2>
              <div className="space-y-4 text-base text-muted-foreground leading-relaxed">
                <p>
                  mtverse started as a personal collection of AI prompts — a Notion document that grew into a library of 2,300+ prompts
                  tested across ChatGPT, Midjourney, Flux, Gemini, and Nano Banana. We were spending more time tweaking prompts than
                  actually creating, so we decided to share our best work with the world.
                </p>
                <p>
                  Along the way, we noticed that the same was true for templates. Every SaaS project started with the same boilerplate:
                  authentication, dashboards, settings, billing. So we started building production-ready templates that we could reuse
                  across projects — and realized other creators might want them too.
                </p>
                <p>
                  Today, mtverse is both: a free prompt library that anyone can use without signing up, and a premium template marketplace
                  for creators who want to ship faster. No subscriptions, no lock-in, no bloat. Just prompts and templates that work.
                </p>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Values */}
        <section className="ds-section ds-bg-section relative overflow-hidden">
          <Blob variant="peach" size={400} position={{ top: '10%', right: '-5%' }} float="slow" />
          <Blob variant="lavender" size={300} position={{ bottom: '5%', left: '-5%' }} float="normal" />
          <div className="ds-container relative">
            <Reveal className="ds-section-head">
              <span className="ds-eyebrow">What we believe</span>
              <h2 className="ds-h1 ds-text-balance">Our values</h2>
            </Reveal>
            <Stagger className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {values.map((v) => {
                const Icon = v.icon
                return (
                  <StaggerItem key={v.title}>
                    <div className="ds-card ds-card-hover h-full flex items-start gap-4">
                      <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${colorMap[v.color]} shrink-0`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="ds-h3 mb-1">{v.title}</h3>
                        <p className="text-sm text-muted-foreground">{v.description}</p>
                      </div>
                    </div>
                  </StaggerItem>
                )
              })}
            </Stagger>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="ds-section ds-bg-section">
          <div className="ds-container max-w-2xl text-center">
            <Reveal>
              <h2 className="ds-h1 mb-3">Get in touch</h2>
              <p className="ds-lead mb-6">
                Questions, feedback, partnership ideas? We&apos;d love to hear from you.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link href="/contact" className="ds-btn ds-btn-primary">
                  <Mail className="h-4 w-4" />
                  Contact us
                </Link>
                <a
                  href={SOCIAL_GITHUB}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ds-btn ds-btn-secondary"
                >
                  <Github className="h-4 w-4" />
                  GitHub
                </a>
                <a
                  href={SOCIAL_TWITTER}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ds-btn ds-btn-secondary"
                >
                  <Twitter className="h-4 w-4" />
                  Twitter
                </a>
              </div>
            </Reveal>
          </div>
        </section>
      </main>
    </PublicLayout>
  )
}
