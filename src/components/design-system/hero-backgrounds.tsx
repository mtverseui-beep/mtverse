'use client'

/**
 * Three distinct animated hero backgrounds.
 * - HomeHeroBackground: floating pastel orbs + drifting dot grid
 * - PromptsHeroBackground: vertical stream of pastel shapes rising upward
 * - TemplatesHeroBackground: rotating concentric ring + scattered shapes
 *
 * All use SOLID colors (no gradients). All respect prefers-reduced-motion.
 */

import { cn } from '@/lib/utils'

/* ──────────────────────────────────────────────────────────────
   HOME HERO — floating orbs + drifting dot grid + soft edge fade
   ────────────────────────────────────────────────────────────── */

export function HomeHeroBackground({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn('absolute inset-0 -z-10 overflow-hidden', className)}>
      {/* Solid base */}
      <div className="absolute inset-0 bg-background" />

      {/* Soft pastel orbs (blurred, floating) */}
      <div
        className="absolute rounded-full blur-3xl opacity-50 ds-anim-float"
        style={{
          width: 420,
          height: 420,
          background: 'var(--ds-soft-lavender)',
          top: '-8%',
          left: '-5%',
        }}
      />
      <div
        className="absolute rounded-full blur-3xl opacity-50 ds-anim-float-sm"
        style={{
          width: 380,
          height: 380,
          background: 'var(--ds-soft-peach)',
          top: '30%',
          right: '-6%',
          animationDelay: '1.2s',
        }}
      />
      <div
        className="absolute rounded-full blur-3xl opacity-40 ds-anim-float"
        style={{
          width: 300,
          height: 300,
          background: 'var(--ds-soft-mint)',
          bottom: '-10%',
          left: '40%',
          animationDelay: '2.1s',
        }}
      />

      {/* Drifting dot grid (subtle, slow drift) */}
      <div
        className="absolute inset-0 ds-dot-grid"
        style={{
          opacity: 0.35,
          animation: 'ds-drift-bg 60s linear infinite',
          maskImage: 'radial-gradient(ellipse at center, black 35%, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, black 35%, transparent 75%)',
        }}
      />

      {/* Edge fade so content stays readable */}
      <div
        className="absolute inset-0"
        style={{
          background: 'var(--ds-bg-canvas)',
          maskImage: 'radial-gradient(ellipse at center, transparent 35%, black 90%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, transparent 35%, black 90%)',
        }}
      />
    </div>
  )
}

/* ──────────────────────────────────────────────────────────────
   PROMPTS HERO — vertical stream of pastel shapes rising upward
   ────────────────────────────────────────────────────────────── */

export function PromptsHeroBackground({ className }: { className?: string }) {
  const shapes = [
    { size: 60, color: 'var(--ds-soft-blue)', left: '8%', delay: '0s', duration: '14s' },
    { size: 80, color: 'var(--ds-soft-lavender)', left: '22%', delay: '3s', duration: '18s' },
    { size: 50, color: 'var(--ds-soft-yellow)', left: '38%', delay: '6s', duration: '16s' },
    { size: 90, color: 'var(--ds-soft-mint)', left: '52%', delay: '1.5s', duration: '20s' },
    { size: 70, color: 'var(--ds-soft-peach)', left: '68%', delay: '4.5s', duration: '15s' },
    { size: 55, color: 'var(--ds-soft-rose)', left: '82%', delay: '7.5s', duration: '17s' },
    { size: 65, color: 'var(--ds-soft-blue)', left: '15%', delay: '9s', duration: '19s' },
    { size: 75, color: 'var(--ds-soft-lavender)', left: '45%', delay: '11s', duration: '13s' },
    { size: 45, color: 'var(--ds-soft-mint)', left: '75%', delay: '2.5s', duration: '21s' },
  ]

  return (
    <div aria-hidden className={cn('absolute inset-0 -z-10 overflow-hidden', className)}>
      <div className="absolute inset-0 bg-background" />

      {/* Rising pastel shapes */}
      {shapes.map((s, i) => (
        <div
          key={i}
          className="absolute rounded-3xl"
          style={{
            width: s.size,
            height: s.size,
            background: s.color,
            left: s.left,
            bottom: '-15%',
            opacity: 0.55,
            animation: `ds-rise-up ${s.duration} linear infinite`,
            animationDelay: s.delay,
            borderRadius: i % 3 === 0 ? '50%' : i % 3 === 1 ? '60% 40% 30% 70% / 60% 30% 70% 40%' : '30% 70% 70% 30% / 30% 30% 70% 70%',
          }}
        />
      ))}

      {/* Subtle dot grid overlay */}
      <div
        className="absolute inset-0 ds-dot-grid"
        style={{ opacity: 0.2 }}
      />

      {/* Bottom fade */}
      <div
        className="absolute inset-x-0 bottom-0 h-1/2"
        style={{
          background: 'var(--ds-bg-canvas)',
          maskImage: 'linear-gradient(to top, black 0%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to top, black 0%, transparent 100%)',
        }}
      />
    </div>
  )
}

/* ──────────────────────────────────────────────────────────────
   TEMPLATES HERO — slow rotating ring + scattered floating shapes
   ────────────────────────────────────────────────────────────── */

export function TemplatesHeroBackground({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn('absolute inset-0 -z-10 overflow-hidden', className)}>
      <div className="absolute inset-0 bg-background" />

      {/* Large rotating ring (dashed border) */}
      <div
        className="absolute rounded-full"
        style={{
          width: 700,
          height: 700,
          border: '1px dashed var(--ds-border-strong)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          animation: 'ds-rotate-slow 90s linear infinite',
          opacity: 0.5,
        }}
      />
      <div
        className="absolute rounded-full"
        style={{
          width: 500,
          height: 500,
          border: '1px dashed var(--ds-primary-200)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          animation: 'ds-rotate-slow 60s linear infinite reverse',
          opacity: 0.6,
        }}
      />

      {/* Scattered floating pastel shapes */}
      <div
        className="absolute ds-anim-float"
        style={{
          width: 90,
          height: 90,
          background: 'var(--ds-soft-blue)',
          borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%',
          top: '15%',
          left: '10%',
          opacity: 0.7,
        }}
      />
      <div
        className="absolute ds-anim-float-sm"
        style={{
          width: 70,
          height: 70,
          background: 'var(--ds-soft-peach)',
          borderRadius: '50%',
          top: '20%',
          right: '12%',
          opacity: 0.7,
          animationDelay: '1s',
        }}
      />
      <div
        className="absolute ds-anim-float"
        style={{
          width: 60,
          height: 60,
          background: 'var(--ds-soft-yellow)',
          borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%',
          bottom: '15%',
          left: '20%',
          opacity: 0.65,
          animationDelay: '1.8s',
        }}
      />
      <div
        className="absolute ds-anim-float-sm"
        style={{
          width: 80,
          height: 80,
          background: 'var(--ds-soft-mint)',
          borderRadius: '50%',
          bottom: '20%',
          right: '15%',
          opacity: 0.65,
          animationDelay: '0.5s',
        }}
      />
      <div
        className="absolute ds-anim-float"
        style={{
          width: 50,
          height: 50,
          background: 'var(--ds-soft-lavender)',
          borderRadius: '40% 60% 60% 40% / 40% 40% 60% 60%',
          top: '50%',
          left: '5%',
          opacity: 0.6,
          animationDelay: '2.5s',
        }}
      />
      <div
        className="absolute ds-anim-float-sm"
        style={{
          width: 55,
          height: 55,
          background: 'var(--ds-soft-rose)',
          borderRadius: '50%',
          top: '60%',
          right: '8%',
          opacity: 0.6,
          animationDelay: '3s',
        }}
      />

      {/* Dot grid overlay */}
      <div
        className="absolute inset-0 ds-dot-grid"
        style={{
          opacity: 0.25,
          maskImage: 'radial-gradient(ellipse at center, black 20%, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, black 20%, transparent 70%)',
        }}
      />

      {/* Edge fade */}
      <div
        className="absolute inset-0"
        style={{
          background: 'var(--ds-bg-canvas)',
          maskImage: 'radial-gradient(ellipse at center, transparent 40%, black 90%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, transparent 40%, black 90%)',
        }}
      />
    </div>
  )
}

/* ── Keyframes (added inline so they ship with the component) ── */
<style jsx global>{`
  @keyframes ds-drift-bg {
    0%   { transform: translate(0, 0); }
    50%  { transform: translate(-20px, 20px); }
    100% { transform: translate(0, 0); }
  }
  @keyframes ds-rise-up {
    0%   { transform: translateY(0) rotate(0deg); opacity: 0; }
    10%  { opacity: 0.55; }
    90%  { opacity: 0.55; }
    100% { transform: translateY(-110vh) rotate(360deg); opacity: 0; }
  }
  @keyframes ds-rotate-slow {
    from { transform: translate(-50%, -50%) rotate(0deg); }
    to   { transform: translate(-50%, -50%) rotate(360deg); }
  }
`}</style>
