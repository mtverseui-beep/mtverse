import type { Metadata } from 'next'
import Link from 'next/link'
import { Check, Sparkles, Zap, Shield, Download, Eye } from 'lucide-react'
import PublicLayout from '@/components/layout/PublicLayout'
import { SITE_URL } from '@/lib/site-url'
import { Reveal, Stagger, StaggerItem } from '@/components/design-system/animations'
import { CtaBackground } from '@/components/design-system/backgrounds'
import { AmexIcon, ApplePayIcon, GooglePayIcon, MastercardIcon, PaddleIcon, PayPalIcon, VisaIcon } from '@/components/payment/payment-icons'

export const metadata: Metadata = {
  title: 'Pricing - Premium Next.js Dashboard Templates | mtverse',
  description: 'One-time payment for lifetime access to premium Next.js dashboard templates. No subscriptions, no hidden fees. Includes all future updates.',
  alternates: { canonical: '/pricing' },
  openGraph: {
    title: 'Pricing - mtverse',
    description: 'One-time payment for lifetime access to premium Next.js dashboard templates.',
    url: SITE_URL + '/pricing',
    type: 'website',
  },
}

export default function PricingPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'mtverse UI Framework Packages',
    description: 'One-time UI framework zip packages for HTML, React, Next.js, Vue.js, Angular, and Laravel. Public prompts are free.',
    url: SITE_URL + '/pricing',
    image: SITE_URL + '/SiteLogo.png',
    brand: {
      '@type': 'Brand',
      name: 'mtverse',
    },
    offers: {
      '@type': 'Offer',
      price: '12',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      url: SITE_URL + '/pricing',
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: {
          '@type': 'MonetaryAmount',
          value: '0',
          currency: 'USD',
        },
        shippingDestination: {
          '@type': 'DefinedRegion',
          addressCountry: 'US',
        },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          handlingTime: {
            '@type': 'QuantitativeValue',
            minValue: 0,
            maxValue: 0,
            unitCode: 'MIN',
          },
        },
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

  const features = [
    'All premium dashboard templates',
    'Lifetime access & updates',
    'Source code included',
    'Commercial use license',
    'Live preview before purchase',
    'Instant download after payment',
    'Email support included',
    '14-day money-back guarantee',
    'Single project license',
    'No subscription fees',
    'Secure payment via Paddle',
    'Multiple payment methods',
  ]

  const paymentMethods = [
    { name: 'Visa', description: 'Credit and debit cards', Icon: VisaIcon },
    { name: 'Mastercard', description: 'Credit and debit cards', Icon: MastercardIcon },
    { name: 'American Express', description: 'Premium card payments', Icon: AmexIcon },
    { name: 'PayPal', description: 'Secure wallet checkout', Icon: PayPalIcon },
    { name: 'Apple Pay', description: 'One-click Apple checkout', Icon: ApplePayIcon },
    { name: 'Google Pay', description: 'Fast Google Pay checkout', Icon: GooglePayIcon },
    { name: 'Paddle', description: 'Secure merchant of record', Icon: PaddleIcon },
  ]

  const faqs = [
    {
      q: 'What payment methods do you accept?',
      a: 'We accept all major credit cards, Google Pay, Apple Pay, PayPal, and local payment methods through Paddle. All payments are processed securely with industry-standard encryption.',
    },
    {
      q: 'Is it a one-time payment or subscription?',
      a: 'One-time payment only! No recurring charges, no hidden fees. You get lifetime access to the template you purchase, including all future updates.',
    },
    {
      q: 'What happens after I purchase?',
      a: 'After successful payment, you\'ll receive instant access to download your template. A license key will be sent to your email for future downloads and support.',
    },
    {
      q: 'Do you offer refunds?',
      a: 'Yes! We offer a 14-day money-back guarantee. If you\'re not satisfied with your purchase, contact us within 14 days for a full refund.',
    },
    {
      q: 'Can I use Google Pay or Apple Pay?',
      a: 'Absolutely! Our checkout supports Google Pay, Apple Pay, and all major payment methods. The available options will show automatically based on your device and location.',
    },
    {
      q: 'Is the payment secure?',
      a: 'Yes. All payments are processed through Paddle, a trusted payment processor. We don\'t store your card information. All transactions are encrypted and PCI-DSS compliant.',
    },
  ]

  return (
    <PublicLayout>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <main>
        {/* Hero Section */}
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
              <h1 className="ds-display-2 mb-4">One-time payment.<br />Lifetime access.</h1>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="ds-lead ds-text-pretty mb-8">
                No subscriptions, no hidden fees. Purchase once and get lifetime access to premium Next.js dashboard templates with all future updates.
              </p>
            </Reveal>
          </div>
        </section>

        {/* Pricing Card */}
        <section className="ds-section-sm">
          <div className="ds-container max-w-4xl">
            <div className="ds-card overflow-hidden">
              <div className="grid md:grid-cols-2 gap-8 p-8">
                {/* Left: Price */}
                <div className="space-y-6">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-2">Premium Templates</div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-bold">$12</span>
                      <span className="text-muted-foreground">USD</span>
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground">
                      <span className="line-through">$49</span> &middot; Save 76%
                    </div>
                  </div>

                  <Link
                    href="/templates"
                    className="ds-btn ds-btn-accent ds-btn-lg w-full"
                  >
                    <Zap className="h-4 w-4" />
                    Browse Templates
                  </Link>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Shield className="h-4 w-4 text-emerald-600" />
                    <span>14-day money-back guarantee</span>
                  </div>
                </div>

                {/* Right: Features */}
                <div className="space-y-3">
                  <div className="text-sm font-semibold mb-4">What's included:</div>
                  {features.slice(0, 8).map((feature) => (
                    <div key={feature} className="flex items-start gap-2.5">
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 shrink-0 mt-0.5">
                        <Check className="h-3 w-3" />
                      </span>
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Payment Methods */}
        <section className="ds-section-sm ds-bg-section">
          <div className="ds-container max-w-5xl">
            <Reveal className="text-center mb-8">
              <h2 className="ds-h2 mb-2">Flexible payment options</h2>
              <p className="ds-muted">We support multiple payment methods for your convenience</p>
            </Reveal>

            <Stagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {paymentMethods.map((method) => {
                const Icon = method.Icon
                return (
                  <StaggerItem key={method.name}>
                    <div className="ds-card p-5">
                      <Icon className="mb-4 h-8 w-auto" />
                      <div className="font-semibold text-sm mb-1">{method.name}</div>
                      <div className="text-xs text-muted-foreground">{method.description}</div>
                    </div>
                  </StaggerItem>
                )
              })}
            </Stagger>

            <Reveal delay={0.3} className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                <Shield className="inline h-4 w-4 mr-1" />
                All payments are securely processed by <strong>Paddle</strong> &middot; PCI-DSS compliant
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

            <Stagger className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StaggerItem>
                <div className="ds-card p-6">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600 mb-4 dark:bg-primary-900/30 dark:text-primary-300">
                    <Eye className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold mb-2">Preview before you buy</h3>
                  <p className="text-sm text-muted-foreground">
                    Try the full live preview of each template before making a purchase. See exactly what you're getting.
                  </p>
                </div>
              </StaggerItem>

              <StaggerItem>
                <div className="ds-card p-6">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 mb-4 dark:bg-emerald-900/30 dark:text-emerald-300">
                    <Download className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold mb-2">Instant access</h3>
                  <p className="text-sm text-muted-foreground">
                    Download your template immediately after payment. No waiting, no approval needed.
                  </p>
                </div>
              </StaggerItem>

              <StaggerItem>
                <div className="ds-card p-6">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600 mb-4 dark:bg-amber-900/30 dark:text-amber-300">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold mb-2">Free updates</h3>
                  <p className="text-sm text-muted-foreground">
                    Get all future updates and improvements for free. Your purchase includes lifetime access.
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
                <Reveal key={i} delay={i * 0.05}>
                  <div className="ds-card group">
                    <details>
                      <summary className="flex items-center justify-between gap-3 cursor-pointer list-none font-medium text-foreground p-5">
                        {faq.q}
                        <span className="text-muted-foreground transition-transform group-open:rotate-90">→</span>
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
              <h2 className="ds-display-3 mb-4">Ready to get started?</h2>
            </Reveal>
            <Reveal delay={0.08}>
              <p className="ds-lead mb-6">
                Browse our collection of premium Next.js dashboard templates and find the perfect fit for your project.
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
