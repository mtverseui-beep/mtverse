'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { ArrowRight, BadgeDollarSign, X } from 'lucide-react'
import { WeekendSaleCountdown } from '@/components/promotions/weekend-sale-countdown'
import type { WeeklyOfferRuntime, WeeklyOfferSettings } from '@/lib/weekly-offer'
import { cn } from '@/lib/utils'

const DISMISSED_KEY = 'mtverse:weekly-offer:popup-dismissed'

type CurrentOfferPayload = {
  settings: WeeklyOfferSettings
  runtime: WeeklyOfferRuntime
}

export function WeeklyOfferPopup() {
  const pathname = usePathname()
  const excludedFromPromotion = pathname === '/preview' || pathname.startsWith('/preview/')
  const [offer, setOffer] = useState<CurrentOfferPayload | null>(null)
  const [mounted, setMounted] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const controller = new AbortController()

    if (excludedFromPromotion) {
      setOffer(null)
      setMounted(false)
      setVisible(false)
      return () => controller.abort()
    }

    fetch('/api/offers/current', { cache: 'no-store', signal: controller.signal })
      .then((response) => response.ok ? response.json() as Promise<CurrentOfferPayload> : null)
      .then((payload) => {
        if (!payload?.runtime.active || !payload.settings.popupEnabled) return
        setOffer(payload)
        if (window.sessionStorage.getItem(DISMISSED_KEY) === 'true') return
        window.setTimeout(() => {
          setMounted(true)
          window.requestAnimationFrame(() => setVisible(true))
        }, 650)
      })
      .catch((error) => {
        if (error instanceof DOMException && error.name === 'AbortError') return
        console.warn('[Offer] Unable to load the current promotion.', error)
      })

    return () => controller.abort()
  }, [excludedFromPromotion])

  useEffect(() => {
    if (excludedFromPromotion) return
    const interval = window.setInterval(() => {
      fetch('/api/offers/current', { cache: 'no-store' })
        .then((response) => response.ok ? response.json() as Promise<CurrentOfferPayload> : null)
        .then((payload) => {
          if (!payload) return
          setOffer(payload)
          const anyProductEnabled = payload.settings.individualTemplatesEnabled || payload.settings.mtadminEditionsEnabled || payload.settings.uiLibraryEnabled || payload.settings.allPaidBundleEnabled
          if (!payload.runtime.active || !payload.settings.popupEnabled || !anyProductEnabled) {
            setVisible(false)
            setMounted(false)
          } else if (window.sessionStorage.getItem(DISMISSED_KEY) !== 'true') {
            setMounted(true)
            window.requestAnimationFrame(() => setVisible(true))
          }
        })
        .catch(() => undefined)
    }, 60_000)

    return () => window.clearInterval(interval)
  }, [excludedFromPromotion])

  function dismiss() {
    setVisible(false)
    window.sessionStorage.setItem(DISMISSED_KEY, 'true')
    window.setTimeout(() => setMounted(false), 300)
  }

  if (!mounted || !offer?.runtime.active || !offer.settings.popupEnabled) return null
  const offerProducts = [
    offer.settings.individualTemplatesEnabled ? 'templates' : '',
    offer.settings.mtadminEditionsEnabled ? 'mtadmin editions' : '',
    offer.settings.uiLibraryEnabled ? 'UI Library' : '',
  ].filter(Boolean)
  if (!offerProducts.length && !offer.settings.allPaidBundleEnabled) return null

  return (
    <aside
      className={cn(
        'fixed bottom-4 right-4 z-50 w-[calc(100vw-2rem)] max-w-[380px] overflow-hidden rounded-2xl border border-amber-200/80 bg-white text-zinc-950 shadow-2xl shadow-zinc-950/20 transition-all duration-500 ease-out sm:bottom-6 sm:right-6',
        visible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0',
      )}
      aria-label="mtverse weekly offer"
    >
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.18),transparent_44%),radial-gradient(circle_at_bottom_left,rgba(99,102,241,0.10),transparent_48%)]" />
      <div className="relative p-4 sm:p-5">
        <button type="button" onClick={dismiss} className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-800" aria-label="Dismiss offer">
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-2 pr-9 text-[10px] font-black uppercase tracking-[0.18em] text-amber-700">
          <BadgeDollarSign className="h-4 w-4" />
          mtverse {offer.runtime.label}
        </div>
        <div className="mt-3 flex flex-wrap items-end gap-x-2 gap-y-1">
          <span className="text-4xl font-black tracking-tight">${offerProducts.length ? offer.settings.individualTemplatePriceUsd : offer.settings.allPaidBundlePriceUsd}</span>
          <span className="pb-1 text-sm font-semibold text-zinc-600">{offerProducts.length ? offerProducts.join(', ') : 'All Templates Bundle'}</span>
          {offerProducts.length && offer.settings.allPaidBundleEnabled ? <span className="w-full text-xs font-bold text-indigo-700">All Templates Bundle ${offer.settings.allPaidBundlePriceUsd}</span> : null}
        </div>
        <p className="mt-2 text-sm leading-6 text-zinc-600">{offer.settings.popupDescription}</p>

        <WeekendSaleCountdown className="mt-4" compact runtime={offer.runtime} />

        <a href="/pricing" className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-zinc-950 px-4 text-sm font-black text-white transition-colors hover:bg-zinc-800">
          {offer.settings.popupButtonLabel}
          <ArrowRight className="h-4 w-4" />
        </a>
      </div>
    </aside>
  )
}
