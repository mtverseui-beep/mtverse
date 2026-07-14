'use client'

/**
 * Three distinct animated hero backgrounds.
 * - HomeHeroBackground: floating pastel orbs + drifting dot grid
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
