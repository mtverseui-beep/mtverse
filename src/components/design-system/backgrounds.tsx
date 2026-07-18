import type { CSSProperties } from 'react'
import { cn } from '@/lib/utils'

type DecorativeProps = {
  className?: string
  style?: CSSProperties
  [key: string]: unknown
}

export function Blob(_props: DecorativeProps) {
  return null
}

export function Shape(_props: DecorativeProps) {
  return null
}

export function Glow(_props: DecorativeProps) {
  return null
}

export function DotGrid({ className, style }: { className?: string; style?: CSSProperties }) {
  return <div aria-hidden className={cn('ds-dot-grid absolute inset-0', className)} style={style} />
}

export function LineGrid({ className, style }: { className?: string; style?: CSSProperties }) {
  return <div aria-hidden className={cn('ds-line-grid absolute inset-0', className)} style={style} />
}

export function HeroBackground({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn('absolute inset-0 -z-10 overflow-hidden bg-background', className)}>
      <LineGrid className="opacity-30" />
    </div>
  )
}

export function SectionBackground({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn('absolute inset-0 -z-10 overflow-hidden bg-muted/20', className)}>
      <DotGrid className="opacity-20" />
    </div>
  )
}

export function CtaBackground({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn('absolute inset-0 -z-10 overflow-hidden bg-muted/35', className)}>
      <LineGrid className="opacity-25" />
    </div>
  )
}
