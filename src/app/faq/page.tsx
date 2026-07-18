import type { Metadata } from 'next'
import Link from 'next/link'
import { CircleHelp } from 'lucide-react'
import PublicLayout from '@/components/layout/PublicLayout'
import { Reveal } from '@/components/design-system/animations'
import { SITE_URL } from '@/lib/site-url'
import { TemplateFaqList } from '@/components/content/template-faq-list'

export const metadata: Metadata = {
  title: 'Template FAQ: Pricing, Downloads & Licenses',
  description: 'Answers about mtverse website templates, Next.js dashboard packages, free HTML downloads, pricing, licenses, live previews, payments, bundles, and account access.',
  alternates: { canonical: '/faq' },
  openGraph: {
    title: 'Template FAQ | mtverse',
    description: 'Frequently asked questions about website templates, pricing, previews, licenses, bundles, checkout, and downloads.',
    url: `${SITE_URL}/faq`,
  },
}

const FAQ_GROUPS = [
  {
    category: 'Choosing a template',
    questions: [
      { q: 'What types of templates are available?', a: 'The catalog includes premium Next.js dashboards, React admin interfaces, ecommerce storefronts, SaaS workspaces, landing pages, and free responsive HTML templates for portfolios and business websites.' },
      { q: 'Can I preview a template before buying or downloading it?', a: 'Yes. Template pages include screenshots and a live preview when available. Use them to inspect page structure, navigation, responsive behavior, and visual direction.' },
      { q: 'How do I compare frameworks and included pages?', a: 'Each detail page lists the framework, technology stack, features, included pages, license, pricing tier, and package scope. Use catalog filters and focused template guides to narrow the options.' },
      { q: 'Can I request the same design in another framework?', a: 'Paid template pages include a framework request form for HTML, React, Next.js, Vue, Angular, Laravel, or a custom stack. Requests are reviewed and the reply is sent by email.' },
    ],
  },
  {
    category: 'Free HTML templates',
    questions: [
      { q: 'Are individual HTML templates free?', a: 'Individual HTML templates follow the free account download rules shown on the site. Sign in before downloading so the limit and download history can be tracked correctly.' },
      { q: 'What does the HTML bundle unlock include?', a: 'The separate HTML bundle unlock provides the HTML collection in one generated ZIP and enables the HTML access described on the pricing page.' },
      { q: 'Are HTML templates mixed with premium dashboards?', a: 'No. HTML templates have a dedicated category and subcategories, making static website options easy to browse without mixing them with paid application dashboards.' },
    ],
  },
  {
    category: 'Pricing and checkout',
    questions: [
      { q: 'Does one template purchase unlock every paid template?', a: 'No. A single purchase unlocks only the selected template. The all-paid bundle is a separate product and includes the paid catalog described on the pricing page.' },
      { q: 'Are payments one-time or subscriptions?', a: 'Template offers currently use one-time payments unless a checkout page clearly states otherwise. The exact price and access scope appear before payment.' },
      { q: 'Which payment provider processes checkout?', a: 'Paddle processes supported checkout transactions and handles the secure payment form. mtverse does not store full card details.' },
      { q: 'What happens after a successful payment?', a: 'The purchase is verified, attached to the signed-in account, and displayed in the account template library. The matching ZIP download becomes available after verification.' },
    ],
  },
  {
    category: 'Downloads and licenses',
    questions: [
      { q: 'Where can I find purchased templates?', a: 'Sign in and open the account page. Paid unlocked templates and saved templates appear in the template library with the available download action.' },
      { q: 'Can purchasing one template unlock another template by mistake?', a: 'No. Template-specific access is checked against the requested slug and the purchasing account. Bundle access is checked separately.' },
      { q: 'Can I use a template for a client project?', a: 'Review the license shown on the template detail page. Paid packages generally use a single production project license unless a different license is stated.' },
      { q: 'What if a download does not appear after payment?', a: 'Contact support with the account email and Paddle transaction ID. Do not include card details. The purchase record can be verified and the correct entitlement restored.' },
    ],
  },
  {
    category: 'Account and support',
    questions: [
      { q: 'Do I need an account?', a: 'You can browse public template pages and previews without an account. An account is required for downloads, purchases, saved templates, and access history.' },
      { q: 'Will I remain signed in after closing the browser?', a: 'A valid session can persist according to the selected sign-in behavior and cookie lifetime. You may need to sign in again after the session expires or cookies are cleared.' },
      { q: 'How can I contact support?', a: 'Use the contact or support page and include the template name, account email, and transaction ID when the issue concerns a purchase.' },
    ],
  },
]

export default function FAQPage() {
  const allQuestions = FAQ_GROUPS.flatMap((group) => group.questions)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: allQuestions.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  }

  return (
    <PublicLayout schemaMarkup={jsonLd}>
      <main className="ds-bg-section">
        <section className="ds-section-sm border-b border-border">
          <div className="ds-container max-w-4xl py-14 text-center">
            <Reveal>
              <span className="ds-eyebrow ds-eyebrow-accent mb-3"><CircleHelp className="h-3.5 w-3.5" />Help center</span>
              <h1 className="ds-display-2 ds-text-balance">Template questions, answered clearly</h1>
              <p className="ds-lead ds-text-pretty mx-auto mt-4 max-w-3xl">
                Learn how previews, pricing, HTML downloads, paid source packages, account access, licenses, bundles, and support work.
              </p>
            </Reveal>
          </div>
        </section>

        <section className="ds-section">
          <div className="ds-container max-w-4xl space-y-10">
            {FAQ_GROUPS.map((group) => (
              <section key={group.category}>
                <h2 className="ds-h2 mb-4">{group.category}</h2>
                <TemplateFaqList items={group.questions.map((item) => ({ question: item.q, answer: item.a }))} />

              </section>
            ))}

            <div className="rounded-lg border border-primary/20 bg-primary/5 p-6 text-center">
              <h2 className="ds-h3">Still need help?</h2>
              <p className="mt-2 text-sm text-muted-foreground">Contact support with the template name and your account email.</p>
              <Link href="/contact" className="ds-btn ds-btn-primary mt-5">Contact support</Link>
            </div>
          </div>
        </section>
      </main>
    </PublicLayout>
  )
}
