import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle2, FileCheck2, Mail, SearchCheck, ShieldCheck } from 'lucide-react'
import PublicLayout from '@/components/layout/PublicLayout'
import { SITE_URL } from '@/lib/site-url'

export const metadata: Metadata = {
  title: 'Template Editorial Standards and Review Process',
  description: 'How mtverse evaluates template listings, verifies previews and packages, writes practical guides, corrects errors, and keeps commercial information transparent.',
  alternates: { canonical: '/editorial-policy' },
  openGraph: {
    title: 'mtverse Template Editorial Standards',
    description: 'Standards for template evaluation, package accuracy, practical guides, corrections, and commercial transparency.',
    url: `${SITE_URL}/editorial-policy`,
    type: 'website',
  },
  robots: { index: true, follow: true },
}

const standards = [
  {
    icon: SearchCheck,
    title: 'Template evaluation',
    copy: 'We review the available source structure, production build, responsive behavior, live preview, package contents, dependencies, framework information, and documented license before publishing a commercial listing.',
  },
  {
    icon: FileCheck2,
    title: 'Listing accuracy',
    copy: 'Titles, summaries, screenshots, included pages, features, technology labels, pricing tiers, and delivery scope should describe the package a buyer can actually receive.',
  },
  {
    icon: ShieldCheck,
    title: 'Preview and package checks',
    copy: 'Preview URLs and screenshots are checked for relevance. Protected package records are reviewed so a paid entitlement points to the matching template rather than another product.',
  },
  {
    icon: CheckCircle2,
    title: 'Corrections and updates',
    copy: 'We update pages when framework behavior, package contents, pricing, previews, licenses, or technical instructions change. Material errors can be reported through the contact page.',
  },
]

export default function EditorialPolicyPage() {
  return (
    <PublicLayout>
      <main>
        <section className="border-b bg-[var(--surface-sunken)] py-14 sm:py-20">
          <div className="mx-auto max-w-4xl px-4 sm:px-6">
            <p className="text-xs font-bold uppercase tracking-widest text-primary">Publisher standards</p>
            <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-5xl">How mtverse reviews template listings</h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-muted-foreground sm:text-lg">
              mtverse publishes website templates, application UI kits, and implementation guides. These standards explain the checks and editorial decisions behind public catalog pages.
            </p>
          </div>
        </section>

        <section className="py-12 sm:py-16">
          <div className="mx-auto max-w-4xl px-4 sm:px-6">
            <div className="grid gap-4 sm:grid-cols-2">
              {standards.map((item) => {
                const Icon = item.icon
                return (
                  <article key={item.title} className="rounded-lg border border-border bg-card p-5 shadow-sm">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary"><Icon className="h-5 w-5" /></div>
                    <h2 className="mt-4 text-base font-bold">{item.title}</h2>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">{item.copy}</p>
                  </article>
                )
              })}
            </div>

            <section className="mt-10 rounded-lg border border-border bg-[var(--surface-sunken)] p-5 sm:p-7">
              <h2 className="text-xl font-bold">Commercial transparency</h2>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                mtverse sells some templates directly. Paid status does not change the technical information shown on a listing. Price, package access, purchase scope, update terms, and refund conditions should be visible before checkout. Sponsored placements are labeled when used.
              </p>
            </section>

            <section className="mt-8 border-t pt-8">
              <h2 className="text-xl font-bold">Report a correction</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
                Include the template URL, the information that appears incorrect, and a supporting reference when available. We review factual, package, preview, pricing, licensing, and attribution reports.
              </p>
              <Link href="/contact" className="mt-5 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground">
                <Mail className="h-4 w-4" />Contact mtverse
              </Link>
            </section>
          </div>
        </section>
      </main>
    </PublicLayout>
  )
}