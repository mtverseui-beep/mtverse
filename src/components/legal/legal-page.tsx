import type { Metadata } from 'next'
import { SITE_URL } from '@/lib/site-url'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import PublicLayout from '@/components/layout/PublicLayout'
import { Reveal } from '@/components/design-system/animations'
import { SectionBackground } from '@/components/design-system/backgrounds'

type Props = {
  title: string
  description: string
  lastUpdated: string
  children: React.ReactNode
}

export function LegalPage({ title, description, lastUpdated, children }: Props) {
  return (
    <PublicLayout>
      <main className="ds-bg-section relative overflow-hidden">
        <SectionBackground />
        <div className="ds-container relative max-w-3xl py-12 sm:py-16">
          <Reveal>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to home
            </Link>
          </Reveal>

          <Reveal delay={0.05}>
            <header className="mb-10 pb-6 border-b border-border">
              <h1 className="ds-h1 mb-3">{title}</h1>
              <p className="text-sm text-muted-foreground">{description}</p>
              <p className="text-xs text-muted-foreground mt-2">
                Last updated: {lastUpdated}
              </p>
            </header>
          </Reveal>

          <Reveal delay={0.1}>
            <article className="space-y-6 text-sm sm:text-base leading-relaxed text-muted-foreground [&_h2]:text-foreground [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mt-8 [&_h2]:mb-3 [&_h3]:text-foreground [&_h3]:text-base [&_h3]:font-semibold [&_h3]:mt-6 [&_h3]:mb-2 [&_p]:leading-relaxed [&_a]:text-primary-600 [&_a]:underline [&_a:hover]:text-primary-700 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2 [&_li]:leading-relaxed [&_strong]:text-foreground [&_strong]:font-semibold">
              {children}
            </article>
          </Reveal>
        </div>
      </main>
    </PublicLayout>
  )
}

export function legalMetadata(title: string, description: string, path: string): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: `${title} | mtverse`,
      description,
      url: `${SITE_URL}${path}`,
      type: 'article',
    },
    robots: { index: true, follow: true },
  }
}
