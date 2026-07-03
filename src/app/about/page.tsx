import type { Metadata } from 'next'
import { SITE_URL } from '@/lib/site-url'
import Link from 'next/link'
import { Mail, Github, Twitter, Sparkles, Zap, Shield, Heart, Code2, LayoutGrid } from 'lucide-react'
import PublicLayout from '@/components/layout/PublicLayout'
import { Reveal, Stagger, StaggerItem } from '@/components/design-system/animations'
import { SectionBackground, Blob } from '@/components/design-system/backgrounds'
import { HomeHeroBackground } from '@/components/design-system/hero-backgrounds'
import { SOCIAL_EMAIL, SOCIAL_GITHUB, SOCIAL_TWITTER } from '@/lib/site-social'
import { getPromptLibraryData } from '@/lib/prompt-db'
import { getAllTemplatesFromStore } from '@/lib/templates-data'

export const metadata: Metadata = {
  title: 'About mtverse - Free AI Prompts, HTML Templates & Premium Templates',
  description:
    'mtverse is a curated library of free AI prompts, responsive HTML website templates, and premium Next.js templates for creators who ship faster.',
  alternates: { canonical: '/about' },
  openGraph: {
    title: 'About mtverse',
    description: 'Free AI prompts, responsive HTML website templates, and premium Next.js templates for creators.',
    url: SITE_URL + '/about',
    type: 'website',
  },
}

export default async function AboutPage() {
  const [library, templates] = await Promise.all([
    getPromptLibraryData().catch(() => null),
    getAllTemplatesFromStore().catch(() => []),
  ])
  const promptCount = library?.stats?.totalPrompts ?? 0
  const htmlTemplateCount = templates.filter((template) => template.category === 'html').length
  const premiumTemplateCount = templates.filter((template) => template.category !== 'html' && !template.isFree).length

  const values = [
    {
      icon: Sparkles,
      title: 'Quality over quantity',
      description: 'Every prompt is reviewed, every HTML template has a real preview, and every paid template is prepared for production use.',
      color: 'primary',
    },
    {
      icon: Zap,
      title: 'Ship faster',
      description: 'Copy a prompt in seconds, download a static HTML site quickly, or buy a premium template and launch faster.',
      color: 'accent',
    },
    {
      icon: Shield,
      title: 'Honest pricing',
      description: 'Free prompts, free individual HTML downloads with limits, a $5 HTML bundle unlock, and paid templates sold one template at a time.',
      color: 'emerald',
    },
    {
      icon: Heart,
      title: 'Creator-first',
      description: 'Built for people who need useful assets, clear previews, simple downloads, and no confusing subscriptions.',
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
                  mtverse brings together {promptCount.toLocaleString()}+ free AI prompts, {htmlTemplateCount} responsive HTML templates, and {premiumTemplateCount} premium source-code templates for creators who want useful assets without noise.
                </p>
              </Reveal>
            </div>
          </div>
        </section>

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
                  <div className="ds-stat-number">{htmlTemplateCount}</div>
                  <div className="ds-stat-label">HTML templates</div>
                </div>
              </StaggerItem>
              <StaggerItem>
                <div className="text-center">
                  <div className="ds-stat-number">{premiumTemplateCount}</div>
                  <div className="ds-stat-label">Premium templates</div>
                </div>
              </StaggerItem>
              <StaggerItem>
                <div className="text-center">
                  <div className="ds-stat-number">12k+</div>
                  <div className="ds-stat-label">Active creators</div>
                </div>
              </StaggerItem>
            </Stagger>
          </div>
        </section>

        <section className="ds-section ds-bg-section relative overflow-hidden">
          <SectionBackground />
          <div className="ds-container max-w-3xl">
            <Reveal>
              <h2 className="ds-h1 mb-6">Our story</h2>
              <div className="space-y-4 text-base text-muted-foreground leading-relaxed">
                <p>
                  mtverse started as a personal collection of AI prompts: a working library tested across ChatGPT, Midjourney, Flux, Gemini, and other creative tools. We were spending more time tweaking prompts than creating useful output, so we turned the best patterns into a public library.
                </p>
                <p>
                  The template side grew from the same problem. Creators need usable websites, dashboards, storefronts, and admin screens without rebuilding the basics every time. That is why mtverse now includes responsive HTML templates, premium Next.js dashboards, ecommerce templates, and admin UI kits with real previews and secure delivery.
                </p>
                <p>
                  The goal is simple: useful prompts, clear template previews, honest pricing, and download flows that feel predictable. No filler, no fake review blocks, and no bundle claims that do not match what the user actually buys.
                </p>
              </div>
            </Reveal>
          </div>
        </section>

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
                      <div className={'inline-flex h-10 w-10 items-center justify-center rounded-xl ' + colorMap[v.color] + ' shrink-0'}>
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

        <section className="ds-section-sm border-y bg-background">
          <div className="ds-container">
            <div className="grid gap-4 md:grid-cols-2">
              <Link href="/html-templates" className="ds-card ds-card-hover flex items-start gap-4">
                <Code2 className="mt-1 h-5 w-5 text-primary" />
                <div>
                  <h2 className="ds-h3">Explore free HTML templates</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Browse static website templates by portfolio, SaaS, ecommerce, agency, restaurant, and more.</p>
                </div>
              </Link>
              <Link href="/templates" className="ds-card ds-card-hover flex items-start gap-4">
                <LayoutGrid className="mt-1 h-5 w-5 text-primary" />
                <div>
                  <h2 className="ds-h3">Browse all templates</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Compare free HTML templates and paid Next.js source-code templates in one catalog.</p>
                </div>
              </Link>
            </div>
          </div>
        </section>

        <section className="ds-section ds-bg-section">
          <div className="ds-container max-w-2xl text-center">
            <Reveal>
              <h2 className="ds-h1 mb-3">Get in touch</h2>
              <p className="ds-lead mb-6">
                Questions, feedback, partnership ideas? We'd love to hear from you.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link href="/contact" className="ds-btn ds-btn-primary">
                  <Mail className="h-4 w-4" />
                  Contact us
                </Link>
                <a href={SOCIAL_GITHUB} target="_blank" rel="noopener noreferrer" className="ds-btn ds-btn-secondary">
                  <Github className="h-4 w-4" />
                  GitHub
                </a>
                <a href={SOCIAL_TWITTER} target="_blank" rel="noopener noreferrer" className="ds-btn ds-btn-secondary">
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
