import type { Metadata } from 'next'
import Link from 'next/link'
import { Mail, MessageSquare, BookOpen, Code, CreditCard, Shield, Download, ArrowRight } from 'lucide-react'
import PublicLayout from '@/components/layout/PublicLayout'
import { Reveal, Stagger, StaggerItem } from '@/components/design-system/animations'
import { SectionBackground, CtaBackground } from '@/components/design-system/backgrounds'
import { SOCIAL_EMAIL } from '@/lib/site-social'

export const metadata: Metadata = {
  title: 'Support - Get Help with mtverse Templates',
  description: 'Get help with mtverse templates, downloads, account access, payments, licenses, bundles, and framework requests.',
  alternates: { canonical: '/support' },
}

const SUPPORT_CATEGORIES = [
  {
    icon: Download,
    title: 'Template downloads',
    description: 'Help with free limits, paid ZIP access, bundles, and download history.',
    link: '/account',
    linkText: 'Open account',
  },
  {
    icon: Code,
    title: 'Templates',
    description: 'Help with template installation, customization, and downloads.',
    link: '/templates',
    linkText: 'Browse templates',
  },
  {
    icon: CreditCard,
    title: 'Payments & Refunds',
    description: 'Payment issues, invoices, refund requests, and license keys.',
    link: '/refund-policy',
    linkText: 'Read refund policy',
  },
  {
    icon: Shield,
    title: 'Account & Security',
    description: 'Password resets, account access, and security concerns.',
    link: '/sign-in',
    linkText: 'Sign in',
  },
  {
    icon: BookOpen,
    title: 'FAQ',
    description: 'Quick answers to the most common questions.',
    link: '/faq',
    linkText: 'View FAQ',
  },
  {
    icon: Mail,
    title: 'Contact us',
    description: 'Can\'t find what you need? Send us a message.',
    link: '/contact',
    linkText: 'Contact support',
  },
]

export default function SupportPage() {
  return (
    <PublicLayout>
      <main>
        <section className="ds-section-lg ds-bg-section relative overflow-hidden">
          <SectionBackground />
          <div className="ds-container relative">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <Reveal>
                <span className="ds-eyebrow ds-eyebrow-accent">
                  <MessageSquare className="h-3.5 w-3.5" />
                  Support
                </span>
              </Reveal>
              <Reveal delay={0.08}>
                <h1 className="ds-display-2 ds-text-balance">
                  How can we <span className="ds-text-emphasis">help</span>?
                </h1>
              </Reveal>
              <Reveal delay={0.16}>
                <p className="ds-lead">
                  Find quick answers, browse our resources, or reach out to our team.
                  We respond within 24 hours on business days.
                </p>
              </Reveal>
            </div>
          </div>
        </section>

        <section className="ds-section ds-bg-section">
          <div className="ds-container">
            <Stagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {SUPPORT_CATEGORIES.map((cat) => {
                const Icon = cat.icon
                return (
                  <StaggerItem key={cat.title}>
                    <Link
                      href={cat.link}
                      className="ds-card ds-card-hover h-full block no-underline group"
                    >
                      <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-300 mb-4">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="ds-h3 mb-1.5">{cat.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{cat.description}</p>
                      <span className="text-sm font-medium text-primary-600 inline-flex items-center gap-1">
                        {cat.linkText}
                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </Link>
                  </StaggerItem>
                )
              })}
            </Stagger>
          </div>
        </section>

        <section className="ds-section-lg ds-bg-section relative overflow-hidden">
          <CtaBackground />
          <div className="ds-container relative text-center max-w-2xl">
            <Reveal>
              <h2 className="ds-display-3 mb-4">Still need help?</h2>
              <p className="ds-lead mb-6">
                Email us at <a href={`mailto:${SOCIAL_EMAIL}`} className="text-primary-600 hover:underline">{SOCIAL_EMAIL}</a>
                {' '}and we&apos;ll get back to you within 24 hours.
              </p>
              <Link href="/contact" className="ds-btn ds-btn-primary ds-btn-lg">
                <Mail className="h-4 w-4" />
                Contact us
              </Link>
            </Reveal>
          </div>
        </section>
      </main>
    </PublicLayout>
  )
}
