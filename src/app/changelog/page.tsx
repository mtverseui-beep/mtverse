import type { Metadata } from 'next'
import Link from 'next/link'
import { Sparkles, Zap, Wrench } from 'lucide-react'
import PublicLayout from '@/components/layout/PublicLayout'
import { Reveal, Stagger, StaggerItem } from '@/components/design-system/animations'
import { SectionBackground } from '@/components/design-system/backgrounds'

export const metadata: Metadata = {
  title: 'Changelog — What\'s New at mtverse',
  description: 'Track the latest updates, new features, and improvements to mtverse prompts and templates.',
  alternates: { canonical: '/changelog' },
}

const ENTRIES = [
  {
    version: 'v1.2.0',
    date: 'June 27, 2026',
    type: 'feature',
    title: 'Templates marketplace + admin dashboard',
    items: [
      'Launched premium dashboard templates marketplace with curated product pages',
      'Added live preview feature — open any template in an interactive iframe',
      'Built full admin dashboard with prompt/template CRUD, orders, users, settings',
      'Real customer auth with email/password + OAuth (Google, GitHub)',
      'Paddle payment integration with webhook signature verification',
      'Admin upload workflow for prompt preview images and template assets',
    ],
  },
  {
    version: 'v1.1.0',
    date: 'June 20, 2026',
    type: 'feature',
    title: 'Design system + animated prompts showcase',
    items: [
      'Premium design system with Inter + Instrument Serif fonts',
      '3 distinct animated hero backgrounds (home, prompts, templates)',
      '8-card animated prompts showcase cycling through real prompt previews',
      'Real AI tool brand icons (ChatGPT, Claude, Gemini, Midjourney, Flux, Photoshop)',
      'Advanced SEO content section + JSON-LD structured data',
    ],
  },
  {
    version: 'v1.0.0',
    date: 'June 15, 2026',
    type: 'release',
    title: 'Initial launch',
    items: [
      '2,331 curated AI prompts across 8 categories',
      'Prompt detail pages with copy-to-clipboard, related prompts, structured data',
      'Customer auth (sign-in, sign-up, forgot-password)',
      'Modern navbar with expandable search + theme toggle',
      'Responsive design with dark mode',
      'Image hosting and cached preview proxy',
    ],
  },
]

const typeIcon = {
  feature: Sparkles,
  release: Zap,
  fix: Wrench,
}

const typeColor = {
  feature: 'ds-badge-primary',
  release: 'ds-badge-accent',
  fix: 'ds-badge-success',
}

export default function ChangelogPage() {
  return (
    <PublicLayout>
      <main className="ds-bg-section relative overflow-hidden">
        <SectionBackground />
        <div className="ds-container relative max-w-3xl py-12 sm:py-16">
          <Reveal>
            <span className="ds-eyebrow ds-eyebrow-accent mb-4">
              <Zap className="h-3.5 w-3.5" />
              Changelog
            </span>
            <h1 className="ds-display-2 mb-3">What&apos;s new</h1>
            <p className="ds-lead mb-10">
              Track the latest updates, new features, and improvements to mtverse.
            </p>
          </Reveal>

          <Stagger className="space-y-8">
            {ENTRIES.map((entry) => {
              const Icon = typeIcon[entry.type as keyof typeof typeIcon]
              return (
                <StaggerItem key={entry.version}>
                  <div className="ds-card">
                    <div className="flex items-center justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-300">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <h2 className="ds-h3">{entry.title}</h2>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={`ds-badge ${typeColor[entry.type as keyof typeof typeColor]}`}>{entry.version}</span>
                            <span className="text-xs text-muted-foreground">{entry.date}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <ul className="space-y-2">
                      {entry.items.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary-500 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </StaggerItem>
              )
            })}
          </Stagger>

          <Reveal delay={0.2}>
            <div className="text-center mt-12">
              <Link href="/contact" className="ds-btn ds-btn-secondary">
                Suggest a feature
              </Link>
            </div>
          </Reveal>
        </div>
      </main>
    </PublicLayout>
  )
}
