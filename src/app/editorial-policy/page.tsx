import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle2, FileCheck2, Mail, SearchCheck, ShieldCheck } from 'lucide-react'
import PublicLayout from '@/components/layout/PublicLayout'
import { SITE_URL } from '@/lib/site-url'

export const metadata: Metadata = {
  title: 'Editorial Standards and Review Process',
  description:
    'How mtverse reviews templates, writes practical guides, attributes prompt sources, corrects errors, and keeps commercial recommendations transparent.',
  alternates: { canonical: '/editorial-policy' },
  openGraph: {
    title: 'mtverse Editorial Standards and Review Process',
    description: 'Our standards for template testing, original guides, prompt attribution, corrections, and commercial transparency.',
    url: `${SITE_URL}/editorial-policy`,
    type: 'website',
  },
  robots: { index: true, follow: true },
}

const standards = [
  {
    icon: SearchCheck,
    title: 'Template evaluation',
    copy: 'We inspect the available source structure, production build, responsive behavior, live preview, package contents, dependencies, and documented license before publishing a commercial template listing.',
  },
  {
    icon: FileCheck2,
    title: 'Original practical guides',
    copy: 'Guides are written around concrete development and creative workflows. We prioritize decision criteria, test steps, failure cases, and checklists that readers can apply to their own projects.',
  },
  {
    icon: ShieldCheck,
    title: 'Prompt sources and attribution',
    copy: 'Prompt entries may be original, submitted, or adapted from sources that permit reuse. Source or license notes are retained where required. Public search indexing is reserved for entries that receive an additional editorial review.',
  },
  {
    icon: CheckCircle2,
    title: 'Corrections and updates',
    copy: 'We update pages when framework behavior, package contents, pricing, previews, or technical instructions change. Material errors can be reported through the contact page and are reviewed before correction.',
  },
]

export default function EditorialPolicyPage() {
  return (
    <PublicLayout>
      <main>
        <section className="border-b bg-[var(--surface-sunken)] py-14 sm:py-20">
          <div className="mx-auto max-w-4xl px-4 sm:px-6">
            <p className="text-xs font-bold uppercase tracking-widest text-primary">Publisher standards</p>
            <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-5xl">How mtverse reviews and publishes content</h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-muted-foreground sm:text-lg">
              mtverse publishes developer templates, implementation guides, and creative prompt resources. These standards explain the checks and editorial decisions behind public pages.
            </p>
          </div>
        </section>

        <section className="py-12 sm:py-16">
          <div className="mx-auto max-w-4xl px-4 sm:px-6">
            <div className="grid gap-4 sm:grid-cols-2">
              {standards.map(item => {
                const Icon = item.icon
                return (
                  <article key={item.title} className="rounded-lg border border-border bg-card p-5 shadow-sm">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h2 className="mt-4 text-base font-bold">{item.title}</h2>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">{item.copy}</p>
                  </article>
                )
              })}
            </div>

            <section className="mt-10 rounded-lg border border-border bg-[var(--surface-sunken)] p-5 sm:p-7">
              <h2 className="text-xl font-bold">Commercial transparency</h2>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                mtverse sells some templates directly. A paid listing does not change the technical information shown on its page. Prices, package access, update terms, and refund conditions are presented before checkout, and sponsored placements are labeled when used.
              </p>
            </section>

            <section className="mt-8 border-t pt-8">
              <h2 className="text-xl font-bold">Report a correction</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
                Include the page URL, the information that appears incorrect, and a supporting reference when available. We review factual, package, licensing, and attribution reports.
              </p>
              <Link href="/contact" className="mt-5 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground">
                <Mail className="h-4 w-4" />
                Contact mtverse
              </Link>
            </section>
          </div>
        </section>
      </main>
    </PublicLayout>
  )
}
