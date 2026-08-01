'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { ArrowRight, BadgeDollarSign, X } from 'lucide-react'
import { WeekendSaleCountdown } from '@/components/promotions/weekend-sale-countdown'
import { WEEKEND_SALE, isWeekendSaleActive } from '@/lib/weekend-sale'
import { cn } from '@/lib/utils'

const DISMISSED_KEY = `${WEEKEND_SALE.id}:popup-dismissed`

export function WeekendSalePopup() {
  const pathname = usePathname()
  const excludedFromPromotion = pathname === '/preview' || pathname.startsWith('/preview/')
  const [mounted, setMounted] = useState(false)
  const [visible, setVisible] = useState(false)
  const [active, setActive] = useState(false)

  useEffect(() => {
    const updateActive = () => setActive(isWeekendSaleActive())
    if (excludedFromPromotion) {
      setMounted(false)
      setVisible(false)
      setActive(false)
      return
    }

    updateActive()
    const interval = window.setInterval(updateActive, 1000)

    if (window.sessionStorage.getItem(DISMISSED_KEY) !== 'true' && isWeekendSaleActive()) {
      const entrance = window.setTimeout(() => {
        setMounted(true)
        window.requestAnimationFrame(() => setVisible(true))
      }, 650)

      return () => {
        window.clearTimeout(entrance)
        window.clearInterval(interval)
      }
    }

    return () => window.clearInterval(interval)
  }, [excludedFromPromotion])

  function dismiss() {
    setVisible(false)
    window.sessionStorage.setItem(DISMISSED_KEY, 'true')
    window.setTimeout(() => setMounted(false), 300)
  }

  if (!mounted || !active) return null

  return (
    <aside
      className={cn(
        'fixed bottom-4 right-4 z-50 w-[calc(100vw-2rem)] max-w-[360px] overflow-hidden rounded-2xl border border-amber-200/80 bg-white text-zinc-950 shadow-2xl shadow-zinc-950/20 transition-all duration-500 ease-out sm:bottom-6 sm:right-6',
        visible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
      )}
      aria-label="mtverse weekend offer"
    >
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.18),transparent_44%),radial-gradient(circle_at_bottom_left,rgba(99,102,241,0.10),transparent_48%)]" />
      <div className="relative p-4 sm:p-5">
        <button
          type="button"
          onClick={dismiss}
          className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-800"
          aria-label="Dismiss weekend offer"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-2 pr-9 text-[10px] font-black uppercase tracking-[0.18em] text-amber-700">
          <BadgeDollarSign className="h-4 w-4" />
          mtverse massive weekend offer
        </div>
        <div className="mt-3 flex items-end gap-2">
          <span className="text-4xl font-black tracking-tight">$5</span>
          <span className="pb-1 text-sm font-semibold text-zinc-600">each paid template</span>
        </div>
        <p className="mt-2 text-sm leading-6 text-zinc-600">
          Pick any individual paid template for one flat weekend price. Bundles are excluded.
        </p>

        <WeekendSaleCountdown className="mt-4" compact />

        <a
          href="/templates#templates-grid"
          className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-zinc-950 px-4 text-sm font-black text-white transition-colors hover:bg-zinc-800"
        >
          Explore $5 templates
          <ArrowRight className="h-4 w-4" />
        </a>
      </div>
    </aside>
  )
}
