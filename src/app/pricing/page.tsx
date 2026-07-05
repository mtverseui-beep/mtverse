import type { Metadata } from 'next'
import Link from 'next/link'
import { Check, Sparkles, Zap, Shield, Download, Eye, Infinity } from 'lucide-react'
import PublicLayout from '@/components/layout/PublicLayout'
import { SITE_URL } from '@/lib/site-url'
import { Reveal, Stagger, StaggerItem } from '@/components/design-system/animations'
import { CtaBackground } from '@/components/design-system/backgrounds'
import { AmexIcon, ApplePayIcon, GooglePayIcon, MastercardIcon, PaddleIcon, PayPalIcon, VisaIcon } from '@/components/payment/payment-icons'
import { FreeUnlockButton } from '@/components/payment/free-unlock-button'
import { PricingFreeAccountCta } from '@/components/payment/pricing-free-account-cta'
import { getAllTemplatesFromStore } from '@/lib/templates-data'

export const metadata: Metadata = {
  title: 'Pricing - Premium Templates and $5 HTML Bundle | mtverse',
  description: 'One-time pricing for premium Next.js templates and a $5 all HTML templates bundle. Unlock 100+ responsive HTML, portfolio, SaaS, ecommerce, agency, restaurant, healthcare, education, fitness, crypto, and real estate website templates in one ZIP.',
  keywords: [
    'HTML templates bundle',
    'all HTML templates zip',
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
    description: 'One-time access to premium templates and the $5 all HTML website templates ZIP.',
    url: SITE_URL + '/pricing',
    type: 'website',
  },
}

export const dynamic = 'force-dynamic'

export default async function PricingPage() {
  const templates = await getAllTemplatesFromStore()
  const hasFreeTemplates = templates.some((t) => t.isFree)
  const htmlTemplateCount = templates.filter((t) => t.category === 'html').length

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'mtverse UI Framework Packages',
    description: 'One-time template packages for premium dashboards and the all HTML website templates bundle.',
    url: SITE_URL + '/pricing',
    image: SITE_URL + '/SiteLogo.png',
    brand: { '@type': 'Brand', name: 'mtverse' },
    offers: {
      '@type': 'AggregateOffer',
      lowPrice: '5',
      highPrice: '52',
      priceCurrency: 'USD',
      offerCount: '4',
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
    'Lifetime access & free updates',
    'Full source code',
    'Commercial use license',
    'Live preview before purchase',
    'Instant download after payment',
    'Email support included',
    '14-day money-back guarantee',
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
    { q: 'Is it a one-time payment or subscription?', a: 'One-time payment only. No recurring charges, no hidden fees. You get lifetime access including all future updates.' },
    { q: 'What happens after I purchase?', a: 'After payment, you get instant access to download your template. For the $5 HTML unlock, the server prepares one ZIP containing all HTML template packages.' },
    { q: 'Do you offer refunds?', a: 'Yes. We offer a 14-day money-back guarantee. Contact us within 14 days for a full refund, no questions asked.' },
    { q: 'What about the HTML templates?', a: 'HTML templates can be downloaded individually up to 5 times with a free account. A one-time $5 unlock enables unlimited free downloads and the all HTML templates bundle ZIP.' },
    { q: 'Is the payment secure?', a: 'All payments are processed through Paddle, a trusted payment processor. We never store your card information. Fully PCI-DSS compliant.' },
  ]

  return (
    <PublicLayout>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <main>
        {/* ÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚Â Hero ÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚Â */}
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
                No subscriptions. No hidden fees. Pay once for premium templates, or unlock every HTML website template in one ZIP for $5.
              </p>
            </Reveal>
          </div>
        </section>

        {/* ÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚Â Pricing Cards ÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚Â */}
        <section className="ds-section-sm">
          <div className="ds-container max-w-5xl">
            <div className={`grid gap-6 ${hasFreeTemplates ? 'lg:grid-cols-3' : 'max-w-lg mx-auto'}`}>
              {/* Free Tier ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â only if free templates exist */}
              {hasFreeTemplates && (
                <Reveal>
                  <div className="h-full rounded-2xl border border-border/70 bg-card p-6 shadow-sm transition-shadow hover:shadow-md sm:p-7">
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

              {/* Premium ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â highlighted */}
              <Reveal delay={hasFreeTemplates ? 0.08 : 0}>
                <div className="relative h-full rounded-2xl border-2 border-primary/30 bg-card p-6 shadow-lg shadow-primary/[0.04] sm:p-7 lg:scale-[1.03]">
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
                    <p className="mt-1.5 text-sm text-muted-foreground">Per template · one-time payment</p>
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

              {/* Free Unlock ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â only if free templates exist */}
              {hasFreeTemplates && (
                <Reveal delay={0.16}>
                  <div className="h-full rounded-2xl border border-border/70 bg-card p-6 shadow-sm transition-shadow hover:shadow-md sm:p-7">
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

        {/* ÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚Â Payment Methods ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â compact strip ÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚Â */}
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

        {/* ÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚Â Benefits ÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚Â */}
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
                    Download immediately after payment. No waiting, no approval process.
                  </p>
                </div>
              </StaggerItem>

              <StaggerItem>
                <div className="ds-card p-6 text-center">
                  <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold mb-2">Lifetime updates</h3>
                  <p className="text-sm text-muted-foreground">
                    All future updates and improvements included. One purchase, forever access.
                  </p>
                </div>
              </StaggerItem>
            </Stagger>
          </div>
        </section>

        {/* ÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚Â FAQ ÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚Â */}
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

        {/* ÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚Â CTA ÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚Â */}
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
            <Reveal delay={0.16}>
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
