import type { Metadata } from 'next'
import Link from 'next/link'
import { LayoutGrid, PackageCheck, ShieldCheck, Zap } from 'lucide-react'
import PublicLayout from '@/components/layout/PublicLayout'
import { Reveal, Stagger, StaggerItem } from '@/components/design-system/animations'
import { SectionBackground } from '@/components/design-system/backgrounds'

export const metadata: Metadata = {
  title: 'Template Marketplace Changelog - mtverse',
  description: 'Track updates to the mtverse template catalog, previews, checkout verification, account downloads, admin tools, and template SEO collections.',
  alternates: { canonical: '/changelog' },
}

const ENTRIES = [
  {
    version: 'v1.5.0',
    date: 'July 14, 2026',
    icon: LayoutGrid,
    title: 'Template-only marketplace focus',
    items: [
      'Focused the public product, account, admin, search, metadata, and sitemap on website templates',
      'Expanded template category pages and buyer-intent guides for dashboards, ecommerce, SaaS, landing pages, agencies, portfolios, and HTML websites',
      'Reduced unnecessary route prefetch and removed Vercel-only telemetry from Netlify deployments',
      'Added clean retirement responses for removed legacy content routes',
    ],
  },
  {
    version: 'v1.4.0',
    date: 'July 12, 2026',
    icon: PackageCheck,
    title: 'Checkout and protected delivery improvements',
    items: [
      'Strengthened Paddle transaction verification before granting access',
      'Kept single-template entitlements separate from all-paid and HTML bundle access',
      'Added generated ZIP progress states and account download visibility',
      'Expanded admin views for orders, users, downloads, reviews, and framework requests',
    ],
  },
  {
    version: 'v1.3.0',
    date: 'July 3, 2026',
    icon: ShieldCheck,
    title: 'Larger template catalog and preview coverage',
    items: [
      'Added dashboard, ecommerce, landing page, portfolio, and responsive HTML template collections',
      'Added live preview routes, screenshots, structured metadata, and category filters',
      'Added free individual HTML downloads and separate bundle access',
      'Added customer authentication with email, Google, and GitHub options',
    ],
  },
]

export default function ChangelogPage() {
  return (
    <PublicLayout>
      <main className="ds-bg-section relative overflow-hidden">
        <SectionBackground />
        <div className="ds-container relative max-w-3xl py-12 sm:py-16">
          <Reveal>
            <span className="ds-eyebrow ds-eyebrow-accent mb-4"><Zap className="h-3.5 w-3.5" />Changelog</span>
            <h1 className="ds-display-2 mb-3">What is new</h1>
            <p className="ds-lead mb-10">Catalog, preview, checkout, delivery, account, admin, and search improvements.</p>
          </Reveal>

          <Stagger className="space-y-8">
            {ENTRIES.map((entry) => {
              const Icon = entry.icon
              return (
                <StaggerItem key={entry.version}>
                  <div className="ds-card">
                    <div className="mb-4 flex items-center gap-3">
                      <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-300"><Icon className="h-4 w-4" /></div>
                      <div>
                        <h2 className="ds-h3">{entry.title}</h2>
                        <div className="mt-0.5 flex items-center gap-2"><span className="ds-badge ds-badge-primary">{entry.version}</span><span className="text-xs text-muted-foreground">{entry.date}</span></div>
                      </div>
                    </div>
                    <ul className="space-y-2">
                      {entry.items.map((item) => (
                        <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-500" /><span>{item}</span></li>
                      ))}
                    </ul>
                  </div>
                </StaggerItem>
              )
            })}
          </Stagger>

          <Reveal delay={0.2}>
            <div className="mt-12 text-center"><Link href="/contact" className="ds-btn ds-btn-secondary">Suggest a template feature</Link></div>
          </Reveal>
        </div>
      </main>
    </PublicLayout>
  )
}