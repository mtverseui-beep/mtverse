import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Blocks, Check, Sparkles, Shield, Download, Eye, Infinity, PackageCheck } from 'lucide-react'
import PublicLayout from '@/components/layout/PublicLayout'
import { SITE_URL } from '@/lib/site-url'
import { Reveal, Stagger, StaggerItem } from '@/components/design-system/animations'
import { CtaBackground } from '@/components/design-system/backgrounds'
import { AmexIcon, ApplePayIcon, GooglePayIcon, MastercardIcon, PayPalIcon, VisaIcon } from '@/components/payment/payment-icons'
import { AllPaidBundleButton } from '@/components/payment/all-paid-bundle-button'
import { FreeUnlockButton } from '@/components/payment/free-unlock-button'
import { PricingFreeAccountCta } from '@/components/payment/pricing-free-account-cta'
import { UiLibraryButton } from '@/components/payment/ui-library-button'
import { getProductPackage } from '@/lib/packages'
import { getAllTemplatesFromStore } from '@/lib/templates-data'
import { getPricingCtaSettings } from '@/lib/pricing-settings-store'
import { TemplateFaqList } from '@/components/content/template-faq-list'

export const metadata: Metadata = {
  title: 'Template Pricing, Paid & HTML Bundles',
  description: 'One-time pricing for premium website templates, complete template bundles, free HTML source, and lifetime access to the mtverse UI component library.',
  keywords: [
    'HTML templates bundle',
    'all HTML templates zip',
    'all paid templates bundle',
    'paid Next.js templates bundle',
    'dashboard templates bundle',
    'ecommerce templates bundle',
    'landing page templates bundle',
    'free HTML templates',
    'website templates bundle',
    'portfolio templates',
    'SaaS HTML templates',
    'ecommerce HTML templates',
    'agency website templates',
    'restaurant HTML templates',
    'real estate website templates',
    'healthcare HTML templates',
    'education website templates',
    'Tailwind CSS templates',
    'Next.js dashboard templates',
    'premium website templates',
    'React UI component library',
    'Next.js component library',
    'Tailwind CSS components',
  ],
  alternates: { canonical: '/pricing' },
  openGraph: {
    title: 'Pricing - mtverse',
    description: 'One-time access to premium templates, website template bundles, and the mtverse UI component source library.',
    url: SITE_URL + '/pricing',
    type: 'website',
  },
}

export const dynamic = 'force-dynamic'

export default async function PricingPage() {
  const [templates, pricingCta] = await Promise.all([
    getAllTemplatesFromStore(),
    getPricingCtaSettings(),
  ])
  const hasFreeTemplates = templates.some((t) => t.isFree)
  const htmlTemplateCount = templates.filter((t) => t.category === 'html').length
  const paidTemplates = templates.filter((t) => !t.isFree && Number(t.price || 0) > 0)
  const bundlePrice = 149
  const bundleRetailTotal = paidTemplates.reduce((total, template) => total + Number(template.price || 0), 0)
  const bundleSavings = Math.max(0, bundleRetailTotal - bundlePrice)
  const uiLibraryPackage = getProductPackage('ui-library')
  const uiLibraryUrl = process.env.NEXT_PUBLIC_UI_LIBRARY_URL?.trim() || 'https://ui.mtverse.dev'

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'mtverse UI Framework Packages',
    description: 'One-time packages for premium templates, template bundles, and lifetime UI component source access.',
    url: SITE_URL + '/pricing',
    image: SITE_URL + '/SiteLogo.png',
    brand: { '@type': 'Brand', name: 'mtverse' },
    offers: {
      '@type': 'AggregateOffer',
      lowPrice: '5',
      highPrice: '149',
      priceCurrency: 'USD',
      offerCount: '4',
      availability: 'https://schema.org/InStock',
      url: SITE_URL + '/pricing',
    },
  }

  const allPaidFeatures = [
    'Every current paid template in one source bundle',
    'Future paid template updates included',
    'Individual paid downloads stay unlocked',
    'Dashboard, ecommerce, and landing templates',
    'Commercial project use',
    'Lifetime account access',
    'Secure download after purchase',
  ]

  const uiLibraryFeatures = [
    '360+ production-ready React components',
    'Preview, source, dependencies, and usage details',
    'Next.js, React, TypeScript, and Tailwind CSS',
    'Lifetime source access with future component updates',
    'Complete UI Library project access',
    'Commercial project use under the mtverse license',
    'Copy individual components without downloading a full template',
  ]

  const paymentMethods = [
    { name: 'Visa', Icon: VisaIcon },
    { name: 'Mastercard', Icon: MastercardIcon },
    { name: 'American Express', Icon: AmexIcon },
    { name: 'PayPal', Icon: PayPalIcon },
    { name: 'Apple Pay', Icon: ApplePayIcon },
    { name: 'Google Pay', Icon: GooglePayIcon },
  ]

  const faqs = [
    { q: 'What payment methods do you accept?', a: 'All major credit cards, Google Pay, Apple Pay, PayPal, and local payment methods through Paddle. Payments are processed with industry-standard encryption.' },
    { q: 'Is it a one-time payment or subscription?', a: 'One-time payment only. No recurring charges, no hidden fees. Individual purchases unlock that template. The all-paid bundle unlocks current paid templates and future paid template updates.' },
    { q: 'What happens after I purchase?', a: 'After payment, you get instant access to download your purchased template. For generated bundles, the server prepares one ZIP archive and the download starts when it is ready.' },
    { q: 'Do you offer refunds?', a: 'Yes. We offer a 14-day money-back guarantee. Contact us within 14 days for a full refund, no questions asked.' },
    { q: 'What about the HTML templates?', a: 'HTML templates can be downloaded individually up to 5 times with a free account. A one-time $5 unlock enables unlimited free HTML downloads and the all HTML templates bundle ZIP.' },
    { q: 'What is included with UI Library access?', a: 'The one-time UI Library purchase unlocks protected source code for every current component plus future component updates. It is separate from template and template-bundle purchases.' },
    { q: 'Is the payment secure?', a: 'All payments are processed through Paddle, a trusted payment processor. We never store your card information. Fully PCI-DSS compliant.' },
  ]

  return (
    <PublicLayout>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <main>
        {/* Hero */}
        <section className="relative flex min-h-[calc(50svh-5rem)] items-center overflow-hidden border-b">
          <CtaBackground />
          <div className="ds-container relative max-w-4xl py-10 text-center">
            <Reveal>
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-4">
                <Sparkles className="h-4 w-4" />
                Simple, transparent pricing
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <h1 className="ds-display-2 mb-4">One price. Lifetime access.</h1>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="ds-lead ds-text-pretty mb-8 max-w-2xl mx-auto">
                No subscriptions. Pay once for the exact premium template you need, choose a template bundle, or unlock the complete mtverse UI component source library for life.
              </p>
            </Reveal>
          </div>
        </section>

        {/* Pricing cards */}
        <section className="pb-12 pt-8">
          <div className="ds-container max-w-[1440px]">
            <div className="grid items-stretch gap-5 md:grid-cols-2 lg:grid-cols-4">
              {hasFreeTemplates && (
                <Reveal>
                  <div className="flex h-full flex-col rounded-lg border border-border bg-card p-6 shadow-sm">
                    <div className="mb-6 lg:min-h-[184px]">
                      <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                        <Download className="h-5 w-5" />
                      </div>
                      <h3 className="text-lg font-black">Free templates</h3>
                      <div className="mt-2 text-3xl font-black">$0</div>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">Create an account and access five free source packages.</p>
                    </div>
                    <div className="border-t border-border pb-5 pt-4">
                      <PricingFreeAccountCta />
                    </div>
                    <ul className="space-y-3">
                      {['5 free template downloads', 'Full source packages', 'Live preview access', 'Single project license'].map((feature) => (
                        <li key={feature} className="flex items-start gap-2.5 text-sm">
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </Reveal>
              )}

              <Reveal delay={0.06}>
                <div className="relative flex h-full flex-col rounded-lg border-2 border-foreground bg-card p-6 shadow-md">
                  <span className="absolute right-4 top-4 rounded-md bg-foreground px-2 py-1 text-[10px] font-bold uppercase text-background">
                    {pricingCta.badge}
                  </span>
                  <div className="mb-6 lg:min-h-[184px]">
                    <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-foreground text-background">
                      <PackageCheck className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-black leading-tight">All paid templates</h3>
                    <div className="mt-2 flex items-end gap-2">
                      <span className="text-3xl font-black">${bundlePrice}</span>
                      <span className="pb-1 text-xs font-semibold text-muted-foreground">one-time</span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      Current paid templates and future updates in one private source bundle.
                    </p>

                  </div>
                  <div className="border-t border-border pb-5 pt-4">
                    <AllPaidBundleButton label={pricingCta.buttonLabel} />
                  </div>
                  <ul className="space-y-3">
                    {bundleSavings > 0 && (
                      <li className="flex items-start gap-2.5 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                        <Check className="mt-0.5 h-4 w-4 shrink-0" />
                        Save ${bundleSavings} versus individual prices
                      </li>
                    )}
                    {allPaidFeatures.slice(0, 5).map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5 text-sm">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>

              <Reveal delay={0.12}>
                <div id="ui-library" className="flex h-full scroll-mt-24 flex-col rounded-lg border-2 border-primary/60 bg-card p-6 shadow-md">
                  <div className="mb-6 lg:min-h-[184px]">
                    <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                      <Blocks className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-black">UI component library</h3>
                    <div className="mt-2 flex items-end gap-2">
                      <span className="text-3xl font-black">${uiLibraryPackage.amountUsd}</span>
                      <span className="pb-1 text-xs font-semibold text-muted-foreground">lifetime</span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      Component source, implementation notes, the complete project, and future updates.
                    </p>
                  </div>
                  <div className="border-t border-border pb-5 pt-4">
                    <UiLibraryButton />
                  </div>
                  <ul className="space-y-3">
                    {uiLibraryFeatures.slice(0, 5).map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5 text-sm">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link href={uiLibraryUrl} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
                    Preview components
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </Reveal>

              {hasFreeTemplates && (
                <Reveal delay={0.18}>
                  <div className="flex h-full flex-col rounded-lg border border-border bg-card p-6 shadow-sm">
                    <div className="mb-6 lg:min-h-[184px]">
                      <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300">
                        <Infinity className="h-5 w-5" />
                      </div>
                      <h3 className="text-lg font-black">HTML bundle</h3>
                      <div className="mt-2 text-3xl font-black">$5</div>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{htmlTemplateCount} responsive HTML templates with lifetime bundle access.</p>
                    </div>
                    <div className="border-t border-border pb-5 pt-4">
                      <FreeUnlockButton />
                    </div>
                    <ul className="space-y-3">
                      {['All ' + htmlTemplateCount + ' HTML templates', 'Unlimited individual HTML downloads', 'Portfolio, SaaS, ecommerce, and more', 'One-time payment with no expiration'].map((feature) => (
                        <li key={feature} className="flex items-start gap-2.5 text-sm">
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </Reveal>
              )}
            </div>
            <p className="mt-5 text-center text-xs leading-5 text-muted-foreground">
              Need only one paid template? Open its detail page to see the exact one-time price and package scope.
            </p>
          </div>
        </section>

        {/* Payment methods */}
        <section className="ds-section-sm ds-bg-section">
          <div className="ds-container max-w-4xl text-center">
            <Reveal>
              <p className="text-sm font-medium text-muted-foreground mb-4">Accepted payment methods</p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                {paymentMethods.map((method) => {
                  const Icon = method.Icon
                  return <Icon key={method.name} className="h-8 w-auto opacity-70 transition-opacity hover:opacity-100" />
                })}
              </div>
              <p className="mt-4 text-xs text-muted-foreground">
                <Shield className="inline h-3.5 w-3.5 mr-1" />
                Processed securely by <strong>Paddle</strong> &middot; PCI-DSS compliant
              </p>
            </Reveal>
          </div>
        </section>

        {/* Benefits */}
        <section className="ds-section-sm">
          <div className="ds-container max-w-5xl">
            <Reveal className="text-center mb-8">
              <h2 className="ds-h2 mb-2">Why choose mtverse?</h2>
            </Reveal>

            <Stagger className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <StaggerItem>
                <div className="ds-card p-6 text-center">
                  <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-300">
                    <Eye className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold mb-2">Preview before you buy</h3>
                  <p className="text-sm text-muted-foreground">
                    Full live preview of every template. See exactly what you get before checkout.
                  </p>
                </div>
              </StaggerItem>

              <StaggerItem>
                <div className="ds-card p-6 text-center">
                  <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300">
                    <Download className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold mb-2">Instant access</h3>
                  <p className="text-sm text-muted-foreground">
                    Download immediately after payment. Bundle ZIPs are prepared by the server and start when ready.
                  </p>
                </div>
              </StaggerItem>

              <StaggerItem>
                <div className="ds-card p-6 text-center">
                  <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold mb-2">Lifetime access</h3>
                  <p className="text-sm text-muted-foreground">
                    Individual purchases include updates for that template. The all-paid bundle also includes future paid template updates.
                  </p>
                </div>
              </StaggerItem>
            </Stagger>
          </div>
        </section>

        {/* FAQ */}
        <section className="ds-section-sm ds-bg-section">
          <div className="ds-container max-w-3xl">
            <Reveal className="text-center mb-8">
              <h2 className="ds-h2 mb-2">Frequently asked questions</h2>
            </Reveal>

            <TemplateFaqList items={faqs.map((faq) => ({ question: faq.q, answer: faq.a }))} />
          </div>
        </section>

        {/* CTA */}
        <section className="ds-section-lg ds-bg-section relative overflow-hidden">
          <CtaBackground />
          <div className="ds-container relative text-center max-w-2xl">
            <Reveal>
              <h2 className="ds-display-3 mb-4">Ready to build?</h2>
            </Reveal>
            <Reveal delay={0.08}>
              <p className="ds-lead mb-6">
                Browse premium templates and pay only for the exact template you choose.
              </p>
            </Reveal>
            <Reveal delay={0.18}>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link href="/templates" className="ds-btn ds-btn-accent ds-btn-lg">
                  <Sparkles className="h-4 w-4" />
                  View All Templates
                </Link>
                <Link href="/templates/helios-pro" className="ds-btn ds-btn-secondary ds-btn-lg">
                  <Eye className="h-4 w-4" />
                  Try Live Preview
                </Link>
              </div>
            </Reveal>
          </div>
        </section>
      </main>
    </PublicLayout>
  )
}
