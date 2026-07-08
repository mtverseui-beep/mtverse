import type { Metadata } from 'next'
import Link from 'next/link'
import { Check, Sparkles, Zap, Shield, Download, Eye, Infinity, PackageCheck } from 'lucide-react'
import PublicLayout from '@/components/layout/PublicLayout'
import { SITE_URL } from '@/lib/site-url'
import { Reveal, Stagger, StaggerItem } from '@/components/design-system/animations'
import { CtaBackground } from '@/components/design-system/backgrounds'
import { AmexIcon, ApplePayIcon, GooglePayIcon, MastercardIcon, PayPalIcon, VisaIcon } from '@/components/payment/payment-icons'
import { AllPaidBundleButton } from '@/components/payment/all-paid-bundle-button'
import { FreeUnlockButton } from '@/components/payment/free-unlock-button'
import { PricingFreeAccountCta } from '@/components/payment/pricing-free-account-cta'
import { getAllTemplatesFromStore } from '@/lib/templates-data'
import { getPricingCtaSettings } from '@/lib/pricing-settings-store'

export const metadata: Metadata = {
  title: 'Pricing - Premium Templates, $149 Paid Bundle and $5 HTML Bundle | mtverse',
  description: 'One-time pricing for individual premium Next.js templates, the $149 all paid templates bundle with future paid updates included, and the $5 all HTML templates bundle.',
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
  ],
  alternates: { canonical: '/pricing' },
  openGraph: {
    title: 'Pricing - mtverse',
    description: 'One-time access to individual premium templates, the $149 all paid templates bundle, and the $5 all HTML website templates ZIP.',
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

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'mtverse UI Framework Packages',
    description: 'One-time template packages for individual premium templates, the all paid templates bundle, and the all HTML website templates bundle.',
    url: SITE_URL + '/pricing',
    image: SITE_URL + '/SiteLogo.png',
    brand: { '@type': 'Brand', name: 'mtverse' },
    offers: {
      '@type': 'AggregateOffer',
      lowPrice: '5',
      highPrice: '149',
      priceCurrency: 'USD',
      offerCount: '5',
      availability: 'https://schema.org/InStock',
      url: SITE_URL + '/pricing',
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: { '@type': 'MonetaryAmount', value: '0', currency: 'USD' },
        shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'US' },
        deliveryTime: { '@type': 'ShippingDeliveryTime', handlingTime: { '@type': 'QuantitativeValue', minValue: 0, maxValue: 0, unitCode: 'MIN' } },
      },
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        applicableCountry: 'US',
        returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
        merchantReturnDays: 14,
        returnMethod: 'https://schema.org/ReturnByMail',
        returnFees: 'https://schema.org/FreeReturn',
      },
    },
  }

  const premiumPricePoints = [
    { label: 'Standard templates', price: '$12' },
    { label: 'Pro templates', price: '$20' },
    { label: 'Premium Pro templates', price: '$52' },
  ]

  const premiumFeatures = [
    'Unlock only the template you purchase',
    'Lifetime access for purchased template',
    'Full source code',
    'Commercial use license',
    'Live preview before purchase',
    'Instant download after payment',
    'Email support included',
    '14-day money-back guarantee',
  ]

  const allPaidFeatures = [
    'All paid templates in one generated ZIP',
    'Future paid template updates included',
    'Individual paid downloads stay unlocked',
    'Dashboard, ecommerce, and landing templates',
    'Commercial project use',
    'Lifetime account access',
    'Secure download after purchase',
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
    { q: 'Is the payment secure?', a: 'All payments are processed through Paddle, a trusted payment processor. We never store your card information. Fully PCI-DSS compliant.' },
  ]

  return (
    <PublicLayout>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <main>
        {/* Hero */}
        <section className="ds-section-lg pt-20 relative overflow-hidden">
          <CtaBackground />
          <div className="ds-container relative text-center max-w-4xl">
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
                No subscriptions. No hidden fees. Pay once for the exact premium template you need, get every paid template in one $149 bundle, or unlock every HTML website template in one ZIP for $5.
              </p>
            </Reveal>
          </div>
        </section>

        {/* Pricing cards */}
        <section className="ds-section-sm">
          <div className="ds-container max-w-[1380px]">
            <div className={`grid gap-6 ${hasFreeTemplates ? 'md:grid-cols-2 lg:grid-cols-4' : 'md:grid-cols-2 max-w-5xl mx-auto'}`}>
              {hasFreeTemplates && (
                <Reveal>
                  <div className="h-full rounded-2xl border border-border/70 bg-card p-6 shadow-sm transition-shadow hover:shadow-md sm:p-8">
                    <div className="mb-6">
                      <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 mb-3">
                        <Download className="h-5 w-5" />
                      </div>
                      <h3 className="text-lg font-bold">Free</h3>
                      <div className="mt-2 flex items-baseline gap-1">
                        <span className="text-3xl font-bold">$0</span>
                      </div>
                      <p className="mt-1.5 text-sm text-muted-foreground">Up to 5 template downloads</p>
                    </div>

                    <PricingFreeAccountCta />

                    <ul className="space-y-2.5">
                      {['5 free template downloads', 'Full source code', 'Live preview access', 'Single project license', 'Community support'].map((f) => (
                        <li key={f} className="flex items-start gap-2.5 text-sm">
                          <Check className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                </Reveal>
              )}

              <Reveal delay={hasFreeTemplates ? 0.08 : 0}>
                <div className="relative h-full rounded-2xl border-2 border-primary/30 bg-card p-6 shadow-lg shadow-primary/[0.04] sm:p-8">
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground shadow-sm">
                      Most popular
                    </span>
                  </div>

                  <div className="mb-6">
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary mb-3">
                      <Zap className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-bold">Premium</h3>
                    <div className="mt-2 flex items-baseline gap-1.5">
                      <span className="text-3xl font-bold">From $12</span>
                    </div>
                    <p className="mt-1.5 text-sm text-muted-foreground">Per template - one-time payment</p>
                    <div className="mt-4 grid gap-2 rounded-xl border border-border/70 bg-muted/30 p-3">
                      {premiumPricePoints.map((point) => (
                        <div key={point.label} className="flex items-center justify-between gap-3 text-sm">
                          <span className="text-muted-foreground">{point.label}</span>
                          <span className="font-bold text-foreground">{point.price}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Link href="/templates" className="ds-btn ds-btn-accent w-full mb-6">
                    <Zap className="h-4 w-4" />
                    Browse Templates
                  </Link>

                  <ul className="space-y-2.5">
                    {premiumFeatures.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-sm">
                        <Check className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
                    <Shield className="h-3.5 w-3.5 text-emerald-600" />
                    14-day money-back guarantee
                  </div>
                </div>
              </Reveal>

              <Reveal delay={0.12}>
                <div className="relative h-full rounded-2xl border-2 border-violet-300/70 bg-gradient-to-b from-violet-50 via-card to-card p-6 shadow-lg shadow-violet-500/[0.08] dark:border-violet-700/50 dark:from-violet-950/30 sm:p-8">
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="rounded-full bg-violet-600 px-3 py-1 text-xs font-bold text-white shadow-sm">
                      {pricingCta.badge}
                    </span>
                  </div>

                  <div className="mb-6">
                    <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-200">
                      <PackageCheck className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-black leading-tight">{pricingCta.title}</h3>
                    <div className="mt-2 flex items-end gap-1.5">
                      <span className="text-3xl font-black tracking-normal">${bundlePrice}</span>
                      <span className="pb-1 text-xs font-semibold text-muted-foreground">one-time</span>
                    </div>
                    <p className="mt-2 text-sm leading-5 text-muted-foreground">
                      ${bundleRetailTotal} individual value. Save ${bundleSavings} compared with buying one by one.
                    </p>
                  </div>

                  <div className="mb-5 rounded-2xl border border-violet-200/70 bg-background/75 p-3 text-sm leading-5 text-muted-foreground dark:border-violet-800/50">
                    Current paid templates, future paid updates, and individual downloads stay available in your account.
                  </div>

                  <AllPaidBundleButton label={pricingCta.buttonLabel} />
                  <Link href="/templates" className="mt-2 flex h-10 items-center justify-center rounded-xl text-sm font-bold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                    {pricingCta.secondaryLabel}
                  </Link>

                  <ul className="mt-5 space-y-2.5">
                    {allPaidFeatures.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-sm">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>

              {hasFreeTemplates && (
                <Reveal delay={0.18}>
                  <div className="h-full rounded-2xl border border-border/70 bg-card p-6 shadow-sm transition-shadow hover:shadow-md sm:p-8">
                    <div className="mb-6">
                      <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 mb-3">
                        <Infinity className="h-5 w-5" />
                      </div>
                      <h3 className="text-lg font-bold">HTML Bundle</h3>
                      <div className="mt-2 flex items-baseline gap-1">
                        <span className="text-3xl font-bold">$5</span>
                      </div>
                      <p className="mt-1.5 text-sm text-muted-foreground">{htmlTemplateCount} HTML templates in one ZIP</p>
                    </div>

                    <FreeUnlockButton />

                    <ul className="mt-6 space-y-2.5">
                      {[`All ${htmlTemplateCount} HTML templates in one ZIP`, 'Unlimited individual HTML downloads', 'One-time $5 payment', 'Portfolio, SaaS, ecommerce, agency, and more', 'No expiration'].map((f) => (
                        <li key={f} className="flex items-start gap-2.5 text-sm">
                          <Check className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                </Reveal>
              )}
            </div>
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

            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <Reveal key={i} delay={i * 0.04}>
                  <div className="ds-card group">
                    <details>
                      <summary className="flex items-center justify-between gap-3 cursor-pointer list-none font-medium text-foreground p-5">
                        {faq.q}
                        <span className="shrink-0 text-muted-foreground transition-transform group-open:rotate-45">+</span>
                      </summary>
                      <p className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                    </details>
                  </div>
                </Reveal>
              ))}
            </div>
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