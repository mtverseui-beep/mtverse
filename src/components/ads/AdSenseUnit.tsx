'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import {
  AD_RESERVE_SIZES,
  getAdSlotFooter,
  getAdSlotInline,
  getAdSlotSidebar,
  getGoogleAdsenseClient,
  isAdsenseAllowedOnPath,
} from '@/lib/adsense'
import { cn } from '@/lib/utils'

declare global {
  interface Window {
    adsbygoogle?: unknown[]
  }
}

type AdPlacement = 'sidebar' | 'inline' | 'footer'

type AdSenseUnitProps = {
  placement?: AdPlacement
  className?: string
}

const placementConfig = {
  sidebar: {
    label: 'Sidebar ad',
    getSlot: getAdSlotSidebar,
    reserve: AD_RESERVE_SIZES.sidebar,
  },
  inline: {
    label: 'Inline ad',
    getSlot: getAdSlotInline,
    reserve: AD_RESERVE_SIZES.inline,
  },
  footer: {
    label: 'Footer ad',
    getSlot: getAdSlotFooter,
    reserve: AD_RESERVE_SIZES.footer,
  },
} satisfies Record<AdPlacement, {
  label: string
  getSlot: () => string
  reserve: { width: number; height: number }
}>

export default function AdSenseUnit({ placement = 'inline', className }: AdSenseUnitProps) {
  const pathname = usePathname() || '/'
  const config = placementConfig[placement]
  const client = getGoogleAdsenseClient()
  const slot = config.getSlot()
  const shouldRender = Boolean(client && slot && isAdsenseAllowedOnPath(pathname))

  useEffect(() => {
    if (!shouldRender) return

    try {
      window.adsbygoogle = window.adsbygoogle || []
      window.adsbygoogle.push({})
    } catch (error) {
      console.error('AdSense unit failed to initialize:', error)
    }
  }, [pathname, shouldRender, slot])

  if (!shouldRender) return null

  return (
    <aside
      aria-label={config.label}
      className={cn('mx-auto w-full max-w-4xl px-4 py-6 sm:px-6', className)}
    >
      <div
        className="mx-auto flex w-full max-w-full flex-col items-center justify-center overflow-hidden rounded-lg border border-border/60 bg-muted/20 text-center"
        style={{ minHeight: config.reserve.height }}
      >
        <span className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Advertisement
        </span>
        <ins
          className="adsbygoogle block w-full"
          style={{ display: 'block', minHeight: config.reserve.height, maxWidth: config.reserve.width }}
          data-ad-client={client}
          data-ad-slot={slot}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    </aside>
  )
}