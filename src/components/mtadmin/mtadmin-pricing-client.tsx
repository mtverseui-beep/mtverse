'use client'

import Image from 'next/image'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Box,
  Check,
  Layers3,
  Loader2,
  LockKeyhole,
  PackageCheck,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { toast } from 'sonner'
import { TemplateFaqList } from '@/components/content/template-faq-list'
import { PaymentMethodsSection } from '@/components/payment/payment-methods-section'
import { useAuth } from '@/hooks/use-auth'
import { openPaddleCheckout } from '@/lib/paddle-client'
import type { PaddleCheckoutPayload } from '@/lib/paddle-types'
import type { PackageId } from '@/lib/packages'
import type { MtadminEdition, MtadminProduct } from '@/lib/mtadmin-product'
import { WeekendSaleCountdown } from '@/components/promotions/weekend-sale-countdown'
import { getWeekendMtadminPackageId } from '@/lib/weekend-sale'
import { getWeeklyOfferRuntime, type WeeklyOfferSettings } from '@/lib/weekly-offer'
import { cn } from '@/lib/utils'

type Selection = 'bundle' | string

const FRAMEWORK_ICONS: Record<string, string> = {
  nextjs: '/brand/frameworks/nextjs.svg',
  react: '/brand/frameworks/react.svg',
  html: '/brand/frameworks/html5.svg',
  vue: '/brand/frameworks/vue.svg',
  angular: '/brand/frameworks/angular.svg',
  laravel: '/brand/frameworks/laravel.svg',
  tailwind: '/brand/frameworks/tailwind.svg',
}

function PriceButton({
  packageId,
  label,
  loadingPackage,
  onCheckout,
  disabled,
}: {
  packageId?: PackageId
  label: string
  loadingPackage: PackageId | null
  onCheckout: (packageId: PackageId) => void
  disabled?: boolean
}) {
  const loading = Boolean(packageId && loadingPackage === packageId)
  return (
    <button
      type="button"
      disabled={!packageId || disabled || loading}
      onClick={() => packageId && onCheckout(packageId)}
      className={cn(
        'inline-flex h-12 w-full items-center justify-center gap-2 rounded-md px-5 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:w-[210px]',
        packageId && !disabled
          ? 'bg-primary text-primary-foreground hover:bg-primary/90'
          : 'cursor-not-allowed border border-border bg-muted text-muted-foreground'
      )}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : packageId ? <PackageCheck className="h-4 w-4" /> : <LockKeyhole className="h-4 w-4" />}
      {loading ? 'Opening secure checkout...' : label}
    </button>
  )
}

export function MtadminPricingClient({ product, offerSettings }: { product: MtadminProduct; offerSettings: WeeklyOfferSettings }) {
  const router = useRouter()
  const { authenticated, loading: authLoading } = useAuth()
  const [offerRuntime, setOfferRuntime] = useState(() => getWeeklyOfferRuntime(offerSettings))
  const offerActive = offerRuntime.active && offerSettings.mtadminEditionsEnabled
  const [selection, setSelection] = useState<Selection>(() => getWeeklyOfferRuntime(offerSettings).active && offerSettings.mtadminEditionsEnabled ? (product.editions.find((edition) => edition.status === 'available')?.id || 'bundle') : 'bundle')
  const [loadingPackage, setLoadingPackage] = useState<PackageId | null>(null)


  useEffect(() => {
    const updateSale = () => setOfferRuntime(getWeeklyOfferRuntime(offerSettings))
    updateSale()
    const interval = window.setInterval(updateSale, 30_000)
    return () => window.clearInterval(interval)
  }, [offerSettings])
  const availableFallback = product.editions.find((edition) => edition.status === 'available') || product.editions[0]
  const selectedEdition = useMemo(
    () => selection === 'bundle'
      ? availableFallback
      : product.editions.find((edition) => edition.id === selection) || availableFallback,
    [availableFallback, product.editions, selection]
  )

  async function handleCheckout(packageId: PackageId) {
    if (authLoading) return
    if (!authenticated) {
      toast.info('Sign in to purchase mtadmin')
      router.push('/sign-in?next=/mtadmin/pricing')
      return
    }

    setLoadingPackage(packageId)
    try {
      const response = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageId }),
      })
      const checkout = (await response.json()) as {
        url?: string
        paddle?: PaddleCheckoutPayload
        error?: string
        code?: string
      }

      if (!response.ok) {
        if (checkout.code === 'sign_in_required') {
          router.push('/sign-in?next=/mtadmin/pricing')
          return
        }
        throw new Error(checkout.error || 'Checkout failed')
      }

      if (checkout.url) {
        router.push(checkout.url)
        return
      }

      if (checkout.paddle) {
        const successUrl = new URL('/pricing/success', window.location.origin)
        successUrl.searchParams.set('package', packageId)
        successUrl.searchParams.set('provider', 'paddle')
        await openPaddleCheckout(checkout.paddle, successUrl.toString())
        return
      }

      throw new Error('Checkout did not return a payment session.')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to start checkout')
    } finally {
      setLoadingPackage(null)
    }
  }

  const editionAvailable = selectedEdition.status === 'available' && Boolean(selectedEdition.packageId)
  const bundleSelected = selection === 'bundle'
  const displayedFrameworks = bundleSelected
    ? product.editions
        .filter((edition) => edition.status === 'available')
        .map((edition) => ({ id: edition.id, name: edition.name }))
    : [{ id: selectedEdition.id, name: selectedEdition.name }]
  const individualWeekendOffer = offerActive && !bundleSelected && editionAvailable
  const planPackageId: PackageId | undefined = bundleSelected
    ? 'mtadmin-bundle'
    : editionAvailable
      ? individualWeekendOffer ? getWeekendMtadminPackageId(selectedEdition.packageId!) : selectedEdition.packageId
      : 'mtadmin-bundle'
  const planPrice = bundleSelected || !editionAvailable ? product.bundle.priceUsd : individualWeekendOffer ? offerSettings.individualTemplatePriceUsd : selectedEdition.priceUsd
  const planTitle = bundleSelected ? 'All Together - Bundle' : `${selectedEdition.name} Edition`

  return (
    <>
      <section className="border-b bg-background">
        <div className="ds-container max-w-6xl py-6 text-center sm:py-7">
          <div className="mx-auto mb-3 inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-1.5 text-xs font-bold uppercase text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            {offerActive ? `${offerRuntime.label} - single editions $${offerSettings.individualTemplatePriceUsd}` : 'One-time access. Built for production.'}
          </div>
          <h1 className="mx-auto max-w-4xl text-4xl font-black leading-tight text-foreground sm:text-5xl">
            {offerActive ? `Choose any mtadmin edition for $${offerSettings.individualTemplatePriceUsd}` : 'Get mtadmin for life'}
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
            Choose one framework or unlock the complete multi-framework product. No subscription and no recurring renewal.
          </p>
        </div>
      </section>

      <section className="border-b bg-[#f8fafc] py-4 dark:bg-muted/20 sm:py-5">
        <div className="ds-container max-w-7xl">
          <div className="overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="mx-auto flex w-max min-w-full items-center gap-1 rounded-full bg-[#eef1f5] p-1.5 dark:bg-muted lg:w-fit lg:min-w-0">
              <button
                type="button"
                onClick={() => setSelection('bundle')}
                className={cn(
                  'inline-flex h-11 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-bold transition-colors',
                  bundleSelected ? 'bg-background text-foreground shadow-sm ring-1 ring-border/60' : 'text-muted-foreground hover:bg-background/70 hover:text-foreground'
                )}
              >
                <Box className="h-4 w-4" />
                All Together - Bundle
                <span className={cn('rounded px-1.5 py-0.5 text-[10px] uppercase', bundleSelected ? 'bg-background/15' : 'bg-emerald-100 text-emerald-700')}>Best value</span>
              </button>
              {product.editions.map((edition) => (
                <button
                  key={edition.id}
                  type="button"
                  disabled={edition.status === 'coming-soon'}
                  aria-label={edition.status === 'coming-soon' ? `${edition.name} - coming soon` : edition.name}
                  onClick={() => edition.status === 'available' && setSelection(edition.id)}
                  className={cn(
                    'inline-flex h-11 shrink-0 items-center gap-2 rounded-full px-3.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-55',
                    selection === edition.id ? 'bg-background text-foreground shadow-sm ring-1 ring-border/60' : 'text-muted-foreground hover:bg-background/70 hover:text-foreground disabled:hover:bg-transparent disabled:hover:text-muted-foreground'
                  )}
                >
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-black/5">
                    <Image src={FRAMEWORK_ICONS[edition.id]} alt="" width={17} height={17} className="h-[17px] w-[17px] object-contain" />
                  </span>
                  {edition.name}
                  {edition.status === 'coming-soon' ? <span className="inline-flex items-center gap-1 rounded-full bg-background px-1.5 py-0.5 text-[9px] font-bold uppercase text-muted-foreground ring-1 ring-border/60"><LockKeyhole className="h-2.5 w-2.5" />Soon</span> : null}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 grid overflow-hidden rounded-lg border border-border bg-background shadow-sm lg:grid-cols-[0.92fr_1.08fr]">
            <article className="flex min-h-[330px] flex-col p-6 sm:p-8">
              <div className="flex flex-wrap gap-3" aria-label="Included technologies">
                {[...displayedFrameworks, { id: 'tailwind', name: 'Tailwind CSS' }].map((item) => (
                  <div key={item.id} className="flex flex-col items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-background shadow-sm ring-1 ring-border/70">
                      <Image src={FRAMEWORK_ICONS[item.id]} alt="" width={22} height={22} className="h-[22px] w-[22px] object-contain" />
                    </span>
                    {item.name}
                  </div>
                ))}
              </div>

              <h2 className="mt-6 text-xl font-black text-foreground">
                {bundleSelected ? 'Next.js, React, and every upcoming mtadmin edition' : `${selectedEdition.name} + Tailwind CSS`}
              </h2>
              <p className="mt-3 max-w-lg text-sm leading-6 text-muted-foreground">
                {bundleSelected
                  ? 'Get both production-ready editions now. HTML, Vue.js, Angular, and Laravel will be added to your account when each edition is released.'
                  : editionAvailable
                    ? `Get the complete ${selectedEdition.name} source package, ready for commercial dashboard and web application projects.`
                    : `${selectedEdition.name} is in development. The all-framework bundle includes it automatically when the edition is released.`}
              </p>

              <div className="mt-6 grid gap-3 text-sm">
                {['All current editions', 'Future editions included', 'Lifetime updates', 'Commercial project use'].map((feature) => (
                  <span key={feature} className="flex items-center gap-2.5 font-semibold text-foreground">
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                      <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                    </span>
                    {feature}
                  </span>
                ))}
              </div>
            </article>

            <article className="flex min-h-[330px] flex-col border-t border-border bg-blue-50/55 p-6 dark:bg-primary/[0.035] sm:p-8 lg:border-l lg:border-t-0">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-2xl font-black text-foreground">{planTitle}</h2>
                <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-black uppercase text-emerald-700">
                  {bundleSelected ? 'Bundle - not discounted' : individualWeekendOffer ? offerRuntime.label : editionAvailable ? 'Available now' : 'Bundle access'}
                </span>
              </div>

              <div className="mt-4 flex items-end gap-2">
                <span className="text-5xl font-black text-foreground">${planPrice}</span>
                {individualWeekendOffer ? <span className="pb-1.5 text-base font-semibold text-muted-foreground line-through">${selectedEdition.priceUsd}</span> : null}
                <span className="pb-1.5 text-sm font-semibold text-muted-foreground">one-time</span>
              </div>
              <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
                {bundleSelected
                  ? 'One purchase unlocks every current mtadmin framework package and all upcoming framework editions.'
                  : editionAvailable
                    ? `One purchase unlocks the complete ${selectedEdition.name} edition with lifetime product access.`
                    : `Purchase the bundle now to receive ${selectedEdition.name} automatically when it is released.`}
              </p>

              <div className="mt-5">
                <PriceButton
                  packageId={planPackageId}
                  label={bundleSelected
                    ? `Buy bundle - $${product.bundle.priceUsd}`
                    : editionAvailable
                      ? `Buy ${selectedEdition.name} - $${planPrice}`
                      : `Get the bundle - $${product.bundle.priceUsd}`}
                  loadingPackage={loadingPackage}
                  onCheckout={handleCheckout}
                />
              </div>
              {individualWeekendOffer ? <WeekendSaleCountdown className="mt-4 max-w-md" runtime={offerRuntime} /> : null}
              <div className="mt-5 flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                Secure checkout. No subscription or recurring renewal.
              </div>
            </article>
          </div>
        </div>
      </section>

      <PaymentMethodsSection />

      <section className="bg-muted/20 py-12 sm:py-16">
        <div className="ds-container max-w-3xl">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-black text-foreground sm:text-4xl">Frequently asked questions</h2>
            <p className="mt-3 text-sm text-muted-foreground">Product access, licensing, framework delivery, and checkout details.</p>
          </div>
          <TemplateFaqList items={product.faqs} />
        </div>
      </section>
    </>
  )
}
