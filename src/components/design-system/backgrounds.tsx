'use client'

/**
 * Decorative background system — solid pastel blobs, shapes, glows, grids.
 * NO GRADIENTS. All visuals use solid colors with blur for soft edges.
 */

import { cn } from '@/lib/utils'

/* ─── Soft blobs ────────────────────────────────────────────── */

type BlobProps = {
  className?: string
  variant?: 'primary' | 'accent' | 'blue' | 'lavender' | 'yellow' | 'mint' | 'peach' | 'rose'
  size?: number | string
  position?: {
    top?: string | number
    left?: string | number
    right?: string | number
    bottom?: string | number
  }
  float?: 'none' | 'slow' | 'normal'
  style?: React.CSSProperties
}

export function Blob({
  className,
  variant = 'lavender',
  size = 400,
  position,
  float = 'none',
  style,
}: BlobProps) {
  const floatClass =
    float === 'normal' ? 'ds-blob-float' : float === 'slow' ? 'ds-blob-float-slow' : ''
  return (
    <div
      aria-hidden
      className={cn('ds-blob', `ds-blob-${variant}`, floatClass, className)}
      style={{
        width: typeof size === 'number' ? `${size}px` : size,
        height: typeof size === 'number' ? `${size}px` : size,
        ...position,
        ...style,
      }}
    />
  )
}

/* ─── Crisp pastel shape (non-blurred) ──────────────────────── */

type ShapeProps = {
  className?: string
  variant?: 'blue' | 'lavender' | 'yellow' | 'mint' | 'peach' | 'rose'
  shape?: 'circle' | 'blob-1' | 'blob-2' | 'blob-3' | 'rounded'
  size?: number | string
  position?: BlobProps['position']
  float?: 'none' | 'slow' | 'normal'
  style?: React.CSSProperties
}

const SHAPE_CLASS = {
  circle: 'ds-shape-circle',
  'blob-1': 'ds-shape-blob-1',
  'blob-2': 'ds-shape-blob-2',
  'blob-3': 'ds-shape-blob-3',
  rounded: '',
}

const SHAPE_BG = {
  blue: 'var(--ds-soft-blue)',
  lavender: 'var(--ds-soft-lavender)',
  yellow: 'var(--ds-soft-yellow)',
  mint: 'var(--ds-soft-mint)',
  peach: 'var(--ds-soft-peach)',
  rose: 'var(--ds-soft-rose)',
}

export function Shape({
  className,
  variant = 'lavender',
  shape = 'blob-1',
  size = 200,
  position,
  float = 'none',
  style,
}: ShapeProps) {
  const floatClass =
    float === 'normal' ? 'ds-anim-float' : float === 'slow' ? 'ds-anim-float-sm' : ''
  return (
    <div
      aria-hidden
      className={cn('ds-shape', SHAPE_CLASS[shape], floatClass, className)}
      style={{
        width: typeof size === 'number' ? `${size}px` : size,
        height: typeof size === 'number' ? `${size}px` : size,
        background: SHAPE_BG[variant],
        ...position,
        ...style,
      }}
    />
  )
}

/* ─── Glow halo ─────────────────────────────────────────────── */

type GlowProps = {
  className?: string
  variant?: 'primary' | 'accent'
  size?: number | string
  position?: BlobProps['position']
  pulse?: boolean
  style?: React.CSSProperties
}

export function Glow({ className, variant = 'primary', size = 500, position, pulse, style }: GlowProps) {
  return (
    <div
      aria-hidden
      className={cn(
        'ds-glow',
        `ds-glow-${variant}`,
        pulse && 'ds-anim-pulse-glow',
        className
      )}
      style={{
        width: typeof size === 'number' ? `${size}px` : size,
        height: typeof size === 'number' ? `${size}px` : size,
        ...position,
        ...style,
      }}
    />
  )
}

/* ─── Dot/line grid ─────────────────────────────────────────── */

export function DotGrid({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return <div aria-hidden className={cn('ds-dot-grid absolute inset-0', className)} style={style} />
}

export function LineGrid({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return <div aria-hidden className={cn('ds-line-grid absolute inset-0', className)} style={style} />
}

/* ─── Full hero background composition ──────────────────────── */

/**
 * Hero background — solid canvas + 3 floating pastel blobs + dot grid + edge fade.
 * NO mesh gradient. Soft and premium.
 */
export function HeroBackground({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn('absolute inset-0 -z-10 overflow-hidden', className)}>
      <Blob variant="lavender" size={500} position={{ top: '-10%', left: '-5%' }} float="slow" />
      <Blob variant="peach" size={420} position={{ top: '20%', right: '-8%' }} float="normal" />
      <Blob variant="blue" size={360} position={{ bottom: '-15%', left: '30%' }} float="slow" />
      <DotGrid className="opacity-30" />
      <div
        className="absolute inset-0"
        style={{
          background: 'var(--ds-bg-canvas)',
          maskImage: 'radial-gradient(ellipse at center, transparent 30%, black 90%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, transparent 30%, black 90%)',
        }}
      />
    </div>
  )
}

/**
 * Section background — subtle pastel blobs only.
 */
export function SectionBackground({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn('absolute inset-0 -z-10 overflow-hidden', className)}>
      <Blob variant="lavender" size={400} position={{ top: '10%', left: '-10%' }} float="slow" />
      <Blob variant="mint" size={320} position={{ bottom: '10%', right: '-5%' }} float="normal" />
    </div>
  )
}

/**
 * CTA section background — solid sunken bg + glow halos + floating shapes.
 */
export function CtaBackground({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn('absolute inset-0 -z-10 overflow-hidden', className)}>
      <div className="absolute inset-0" style={{ background: 'var(--ds-bg-sunken)' }} />
      <Glow variant="primary" size={500} position={{ top: '-20%', left: '20%' }} pulse />
      <Glow variant="accent" size={450} position={{ bottom: '-20%', right: '15%' }} pulse />
      <Shape variant="yellow" shape="blob-1" size={180} position={{ top: '15%', left: '8%' }} float="normal" />
      <Shape variant="blue" shape="blob-2" size={140} position={{ bottom: '15%', right: '8%' }} float="slow" />
    </div>
  )
}
