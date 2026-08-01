'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Clock3 } from 'lucide-react'
import { WEEKEND_SALE, getWeekendSaleRemainingMs } from '@/lib/weekend-sale'
import { cn } from '@/lib/utils'

type Props = {
  className?: string
  compact?: boolean
  inverted?: boolean
  refreshOnEnd?: boolean
}

function getParts(remainingMs: number) {
  const totalSeconds = Math.max(0, Math.floor(remainingMs / 1000))
  const days = Math.floor(totalSeconds / 86_400)
  const hours = Math.floor((totalSeconds % 86_400) / 3_600)
  const minutes = Math.floor((totalSeconds % 3_600) / 60)
  const seconds = totalSeconds % 60

  return [
    { label: 'Days', value: days },
    { label: 'Hours', value: hours },
    { label: 'Mins', value: minutes },
    { label: 'Secs', value: seconds },
  ]
}

export function WeekendSaleCountdown({
  className,
  compact = false,
  inverted = false,
  refreshOnEnd = true,
}: Props) {
  const router = useRouter()
  const [remainingMs, setRemainingMs] = useState<number | null>(null)
  const refreshedRef = useRef(false)

  useEffect(() => {
    const update = () => {
      const remaining = getWeekendSaleRemainingMs()
      setRemainingMs(remaining)
      if (remaining === 0 && refreshOnEnd && !refreshedRef.current) {
        refreshedRef.current = true
        router.refresh()
      }
    }

    update()
    const interval = window.setInterval(update, 1000)
    return () => window.clearInterval(interval)
  }, [refreshOnEnd, router])

  const parts = getParts(remainingMs ?? 0)

  return (
    <div
      className={cn(
        'rounded-xl border px-3 py-2.5',
        inverted
          ? 'border-white/15 bg-white/[0.08] text-white'
          : 'border-amber-200/80 bg-amber-50/80 text-amber-950 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-100',
        className
      )}
      role="timer"
      aria-label={`Weekend offer ends ${WEEKEND_SALE.endLabel}`}
    >
      <div className="flex items-center justify-between gap-3">
        <span className={cn('flex items-center gap-1.5 font-semibold', compact ? 'text-[11px]' : 'text-xs')}>
          <Clock3 className={compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
          Offer ends in
        </span>
        <span className={cn('text-[10px] font-medium', inverted ? 'text-white/65' : 'text-amber-800/70 dark:text-amber-200/70')}>
          {WEEKEND_SALE.endLabel}
        </span>
      </div>

      <div className={cn('mt-2 grid grid-cols-4', compact ? 'gap-1' : 'gap-1.5')} aria-live="off">
        {parts.map((part) => (
          <div
            key={part.label}
            className={cn(
              'rounded-lg border text-center',
              compact ? 'px-1 py-1' : 'px-1.5 py-1.5',
              inverted ? 'border-white/10 bg-black/15' : 'border-amber-200/70 bg-white/75 dark:border-white/10 dark:bg-black/15'
            )}
          >
            <div className={cn('font-black tabular-nums', compact ? 'text-sm' : 'text-base')}>
              {remainingMs === null ? '--' : String(part.value).padStart(2, '0')}
            </div>
            <div className={cn('font-bold uppercase tracking-[0.08em]', compact ? 'text-[8px]' : 'text-[9px]', inverted ? 'text-white/55' : 'text-amber-800/60 dark:text-amber-200/60')}>
              {part.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
