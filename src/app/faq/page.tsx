import type { Metadata } from 'next'
import { SITE_URL } from '@/lib/site-url'
import Link from 'next/link'
import { ChevronDown } from 'lucide-react'
import PublicLayout from '@/components/layout/PublicLayout'
import { Reveal, Stagger, StaggerItem } from '@/components/design-system/animations'
import { SectionBackground, CtaBackground } from '@/components/design-system/backgrounds'

export const metadata: Metadata = {
  title: 'FAQ — Frequently Asked Questions',
  description: 'Answers to common questions about mtverse prompts, templates, pricing, licenses, and more.',
  alternates: { canonical: '/faq' },
  openGraph: {
    title: 'FAQ | mtverse',
    description: 'Frequently asked questions about our prompts, templates, and pricing.',
    url: `${SITE_URL}/faq`,
  },
}

const FAQS = [
  {
    category: 'Prompts',
    questions: [
      {
        q: 'Are the AI prompts really free?',
        a: 'Yes! All 2,300+ prompts on mtverse are 100% free to copy and use. You don\'t need an account, and there are no limits. You can use them for personal and commercial projects without attribution.',
      },
      {
        q: 'Which AI models do the prompts work with?',
        a: 'Our prompts are tested with ChatGPT, Claude, Gemini, Midjourney, Flux, and Photoshop AI. Each prompt is tagged with the models it works best with, so you can filter by your favorite tool.',
      },
      {
        q: 'Can I use AI-generated content commercially?',
        a: 'You are solely responsible for reviewing the terms of service of any AI tool you use. Some AI tools may have restrictions on commercial use of generated content. We recommend checking the terms of your specific AI provider.',
      },
      {
        q: 'How often are new prompts added?',
        a: 'We add new prompts weekly. Each prompt is hand-reviewed and paired with a preview image before publication. Check the "Newly added" section on our homepage for the latest additions.',
      },
      {
        q: 'Can I submit my own prompts?',
        a: 'Currently, prompts are curated by our team. However, we\'re working on a community submission feature. Follow us on Twitter or GitHub for updates.',
      },
    ],
  },
  {
    category: 'Templates',
    questions: [
      {
        q: 'What\'s included in a premium template?',
        a: 'Each template includes full source code (Next.js + TypeScript + Tailwind CSS), all pages and components shown in the demo, documentation, and 12 months of free updates. You also get email support.',
      },
      {
        q: 'What license do I get?',
        a: 'You get a single-project license, which allows you to use the template in one production project. For additional projects, you need to purchase additional licenses. See our Terms of Service for full details.',
      },
      {
        q: 'Can I see a live preview before buying?',
        a: 'Yes! Click "Live preview" on any template detail page to open a full interactive demo in a new tab. You can navigate the template just like a real website.',
      },
      {
        q: 'Do templates include dark mode?',
        a: 'Most of our templates include dark mode support out of the box. Check the template\'s feature list on its detail page to confirm.',
      },
      {
        q: 'Are templates responsive?',
        a: 'Yes, all templates are mobile-first responsive. They look great on phones, tablets, and desktops.',
      },
    ],
  },
  {
    category: 'Pricing & Payments',
    questions: [
      {
        q: 'How much do templates cost?',
        a: 'Template prices range from $19 to $89, depending on complexity and included features. Each template is a one-time purchase — no subscriptions, no recurring fees.',
      },
      {
        q: 'How are payments processed?',
        a: 'Payments are processed securely through Paddle. We never see or store your credit card information. Paddle handles all payment security and compliance.',
      },
      {
        q: 'Do you offer refunds?',
        a: 'Yes, we offer a 14-day no-questions-asked money-back guarantee on all template purchases. If you\'re not satisfied, email refunds@mtverse.dev within 14 days for a full refund.',
      },
      {
        q: 'Can I get an invoice?',
        a: 'Yes, Paddle sends a receipt/invoice to your email after purchase. If you need a custom invoice, contact us with your order ID and company details.',
      },
    ],
  },
  {
    category: 'Account & Support',
    questions: [
      {
        q: 'Do I need an account to use mtverse?',
        a: 'No, you can browse and copy prompts without an account. You only need an account to purchase templates, save favorites, and download purchased products.',
      },
      {
        q: 'I forgot my password. How do I reset it?',
        a: 'Go to the sign-in page and click "Forgot?". Enter your email and we\'ll send you a reset link. The link is valid for 1 hour.',
      },
      {
        q: 'How do I download a purchased template?',
        a: 'After purchasing, go to your account dashboard or click the download link in your confirmation email. You\'ll need your license key to download.',
      },
      {
        q: 'How do I get support?',
        a: 'Email us at hello@mtverse.dev. We respond within 24 hours on business days. For template-specific issues, include your license key and a description of the problem.',
      },
    ],
  },
]

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQS.flatMap((cat) =>
    cat.questions.map((q) => ({
      '@type': 'Question',
      name: q.q,
      acceptedAnswer: { '@type': 'Answer', text: q.a },
    }))
  ),
}

export default function FaqPage() {
  return (
    <PublicLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main>
        <section className="ds-section-lg ds-bg-section relative overflow-hidden">
          <SectionBackground />
          <div className="ds-container relative">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <Reveal>
                <span className="ds-eyebrow ds-eyebrow-accent">FAQ</span>
              </Reveal>
              <Reveal delay={0.08}>
                <h1 className="ds-display-2 ds-text-balance">
                  Frequently asked <span className="ds-text-emphasis">questions</span>
                </h1>
              </Reveal>
              <Reveal delay={0.16}>
                <p className="ds-lead">
                  Everything you need to know about prompts, templates, pricing, and more.
                  Can&apos;t find an answer? <Link href="/contact" className="text-primary-600 hover:underline">Contact us</Link>.
                </p>
              </Reveal>
            </div>
          </div>
        </section>

        <section className="ds-section ds-bg-section">
          <div className="ds-container max-w-3xl">
            <Stagger className="space-y-10">
              {FAQS.map((cat) => (
                <StaggerItem key={cat.category}>
                  <h2 className="ds-h2 mb-4">{cat.category}</h2>
                  <div className="space-y-3">
                    {cat.questions.map((item, i) => (
                      <details key={i} className="ds-card group">
                        <summary className="flex items-center justify-between gap-3 cursor-pointer list-none font-medium text-foreground">
                          {item.q}
                          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
                        </summary>
                        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{item.a}</p>
                      </details>
                    ))}
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>

        <section className="ds-section-lg ds-bg-section relative overflow-hidden">
          <CtaBackground />
          <div className="ds-container relative text-center max-w-2xl">
            <Reveal>
              <h2 className="ds-display-3 mb-4">Still have questions?</h2>
              <p className="ds-lead mb-6">Our team is here to help. Reach out and we&apos;ll respond within 24 hours.</p>
              <Link href="/contact" className="ds-btn ds-btn-primary ds-btn-lg">Contact support</Link>
            </Reveal>
          </div>
        </section>
      </main>
    </PublicLayout>
  )
}
