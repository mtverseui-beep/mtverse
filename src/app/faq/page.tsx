import type { Metadata } from 'next'
import { SITE_URL } from '@/lib/site-url'
import Link from 'next/link'
import { ChevronDown } from 'lucide-react'
import PublicLayout from '@/components/layout/PublicLayout'
import { Reveal, Stagger, StaggerItem } from '@/components/design-system/animations'
import { SectionBackground, CtaBackground } from '@/components/design-system/backgrounds'

export const metadata: Metadata = {
  title: 'FAQ - Frequently Asked Questions | mtverse',
  description: 'Answers to common questions about mtverse AI prompts, free HTML templates, premium Next.js templates, pricing, downloads, licenses, and support.',
  alternates: { canonical: '/faq' },
  openGraph: {
    title: 'FAQ | mtverse',
    description: 'Frequently asked questions about prompts, HTML templates, premium templates, pricing, and downloads.',
    url: SITE_URL + '/faq',
  },
}

const FAQS = [
  {
    category: 'Prompts',
    questions: [
      {
        q: 'Are the AI prompts really free?',
        a: 'Yes. All public prompts on mtverse are free to use. You can browse, search, and filter freely; sign in to reveal, copy, and save prompt text.',
      },
      {
        q: 'Which AI models do the prompts work with?',
        a: 'Our prompts are tagged for tools such as ChatGPT, Claude, Gemini, Midjourney, Flux, and Photoshop AI. Use the model filters to find prompts for your workflow.',
      },
      {
        q: 'Can I use AI-generated content commercially?',
        a: 'You are responsible for checking the terms of the AI tool you use. mtverse provides prompt ideas, but every AI provider has its own commercial-use rules.',
      },
      {
        q: 'How often are new prompts added?',
        a: 'New prompt collections are added regularly, and each published prompt is reviewed before it appears in the library.',
      },
    ],
  },
  {
    category: 'HTML Templates',
    questions: [
      {
        q: 'What are mtverse HTML templates?',
        a: 'HTML templates are static website packages built for simple hosting and fast customization. They include responsive pages for portfolios, SaaS sites, ecommerce stores, agencies, restaurants, education, healthcare, real estate, fitness, crypto, and more.',
      },
      {
        q: 'Are HTML templates free?',
        a: 'Individual HTML templates can be downloaded with a free account up to the free download limit. The $5 HTML bundle unlock gives unlimited individual HTML downloads and one server-prepared ZIP containing every HTML template package.',
      },
      {
        q: 'Do HTML templates need Next.js or a build setup?',
        a: 'No. HTML templates are static HTML, CSS, and JavaScript packages. You can edit them directly and host them on any static hosting provider.',
      },
      {
        q: 'Can I preview HTML templates before downloading?',
        a: 'Yes. Each HTML template has screenshots and a live preview link so you can inspect the design before downloading.',
      },
    ],
  },
  {
    category: 'Premium Templates',
    questions: [
      {
        q: 'What is included in a paid Next.js template?',
        a: 'Paid templates include the source package for the specific template you purchase, reusable pages and components shown in the preview, secure download access, and a single-project license.',
      },
      {
        q: 'What license do I get?',
        a: 'Paid templates include a single-project license. You can use the purchased template in one production project. HTML bundle access covers the included static HTML templates under the HTML template license.',
      },
      {
        q: 'Can I see a live preview before buying?',
        a: 'Yes. Click Live preview on a template detail page to inspect the demo before checkout.',
      },
      {
        q: 'Are templates responsive?',
        a: 'Yes. Templates are designed for desktop, tablet, and mobile screens. Check each template detail page for its included pages and feature list.',
      },
    ],
  },
  {
    category: 'Pricing & Payments',
    questions: [
      {
        q: 'How much do templates cost?',
        a: 'Paid Next.js templates are one-time purchases for the selected template only. The HTML bundle is a separate one-time $5 unlock for all HTML templates in one ZIP plus unlimited individual HTML downloads.',
      },
      {
        q: 'How are payments processed?',
        a: 'Payments are processed securely through Paddle. mtverse does not see or store your card details.',
      },
      {
        q: 'Do you offer refunds?',
        a: 'Yes. We offer a 14-day refund window for eligible template purchases. Contact support with your order details if something is not right.',
      },
      {
        q: 'Can I get an invoice?',
        a: 'Yes. Paddle sends a receipt or invoice to your email after purchase.',
      },
    ],
  },
  {
    category: 'Account & Support',
    questions: [
      {
        q: 'Do I need an account to use mtverse?',
        a: 'You do not need an account to browse prompt pages. An account is needed to reveal, copy, save prompts, download templates, access purchases, and manage your downloads.',
      },
      {
        q: 'I forgot my password. How do I reset it?',
        a: 'Open the sign-in page, choose the forgot password option, enter your email, and use the reset link sent to your inbox. Reset links expire for security.',
      },
      {
        q: 'How do I download a purchased template?',
        a: 'After purchase, sign in and open your account downloads. Paid Next.js templates download only after purchase. HTML bundle downloads become available after the $5 HTML unlock.',
      },
      {
        q: 'How do I get support?',
        a: 'Email hello@mtverse.dev or use the contact page. Include the template slug, order email, and a short description of the issue so we can help faster.',
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
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
                  Everything you need to know about prompts, HTML templates, premium templates, pricing, and downloads.
                  Can't find an answer? <Link href="/contact" className="text-primary-600 hover:underline">Contact us</Link>.
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
              <p className="ds-lead mb-6">Our team is here to help. Reach out and we'll respond as soon as possible.</p>
              <Link href="/contact" className="ds-btn ds-btn-primary ds-btn-lg">Contact support</Link>
            </Reveal>
          </div>
        </section>
      </main>
    </PublicLayout>
  )
}
