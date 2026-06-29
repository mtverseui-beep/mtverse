'use client'

/**
 * 3D Animated Hero Backgrounds — subtle, modern, content-related.
 * Uses CSS 3D transforms + perspective for depth, no heavy WebGL.
 * All animations are GPU-accelerated (transform/opacity only).
 * All respect prefers-reduced-motion.
 *
 * Three variants:
 * - HomeHero3D: Floating geometric shapes (cubes, spheres) with parallax depth
 * - PromptsHero3D: Rising prompt preview cards in 3D perspective
 * - TemplatesHero3D: Rotating template screenshot tiles in 3D grid
 */

import { cn } from '@/lib/utils'

/* ──────────────────────────────────────────────────────────────
   HOME HERO 3D — Floating geometric shapes with parallax depth
   Simple, clean: 3 large blurred pastel orbs + subtle 3D cubes
   ────────────────────────────────────────────────────────────── */

export function HomeHero3D({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn('absolute inset-0 overflow-hidden', className)}>
      {/* Base */}
      

      {/* 3D perspective container */}
      <div
        className="absolute inset-0"
        style={{ perspective: '1000px', perspectiveOrigin: '50% 30%' }}
      >
        {/* Large blurred pastel orbs (depth layer 1 — furthest back) */}
        <div
          className="absolute rounded-full blur-3xl opacity-50"
          style={{
            width: 420,
            height: 420,
            background: 'var(--ds-soft-lavender)',
            top: '-8%',
            left: '-5%',
            transform: 'translateZ(-100px)',
            animation: 'ds-float-y 8s ease-in-out infinite',
          }}
        />
        <div
          className="absolute rounded-full blur-3xl opacity-50"
          style={{
            width: 380,
            height: 380,
            background: 'var(--ds-soft-peach)',
            top: '30%',
            right: '-6%',
            transform: 'translateZ(-80px)',
            animation: 'ds-float-y-sm 6s ease-in-out infinite',
            animationDelay: '1.5s',
          }}
        />
        <div
          className="absolute rounded-full blur-3xl opacity-40"
          style={{
            width: 300,
            height: 300,
            background: 'var(--ds-soft-mint)',
            bottom: '-10%',
            left: '40%',
            transform: 'translateZ(-120px)',
            animation: 'ds-float-y 7s ease-in-out infinite',
            animationDelay: '2s',
          }}
        />

        {/* 3D floating geometric shapes (depth layer 2 — mid ground) */}
        {/* Rotating cube wireframe — top left */}
        <div
          className="absolute"
          style={{
            top: '15%',
            left: '8%',
            transform: 'translateZ(50px)',
            animation: 'ds-3d-rotate 20s linear infinite',
          }}
        >
          <div
            style={{
              width: 60,
              height: 60,
              border: '1.5px solid var(--ds-primary-200)',
              borderRadius: '12px',
              transformStyle: 'preserve-3d',
              transform: 'rotateX(45deg) rotateY(45deg)',
            }}
          />
        </div>

        {/* Floating circle — top right */}
        <div
          className="absolute rounded-full"
          style={{
            top: '20%',
            right: '12%',
            width: 50,
            height: 50,
            background: 'var(--ds-soft-blue)',
            opacity: 0.7,
            transform: 'translateZ(80px)',
            animation: 'ds-float-y 5s ease-in-out infinite',
            animationDelay: '0.5s',
          }}
        />

        {/* Small triangle — bottom left */}
        <div
          className="absolute"
          style={{
            bottom: '20%',
            left: '15%',
            width: 0,
            height: 0,
            borderLeft: '20px solid transparent',
            borderRight: '20px solid transparent',
            borderBottom: '35px solid var(--ds-soft-yellow)',
            opacity: 0.6,
            transform: 'translateZ(60px)',
            animation: 'ds-float-rotate 10s ease-in-out infinite',
          }}
        />

        {/* Small square — bottom right */}
        <div
          className="absolute rounded-lg"
          style={{
            bottom: '25%',
            right: '18%',
            width: 40,
            height: 40,
            background: 'var(--ds-soft-peach)',
            opacity: 0.7,
            transform: 'translateZ(70px)',
            animation: 'ds-float-y-sm 4s ease-in-out infinite',
            animationDelay: '1s',
          }}
        />

        {/* Tiny dots scattered (depth layer 3 — foreground) */}
        {[
          { top: '12%', left: '25%', size: 6, color: 'var(--ds-primary-300)', delay: '0s' },
          { top: '18%', left: '70%', size: 4, color: 'var(--ds-accent-300)', delay: '0.5s' },
          { top: '35%', left: '15%', size: 8, color: 'var(--ds-soft-blue)', delay: '1s' },
          { top: '55%', left: '85%', size: 5, color: 'var(--ds-soft-mint)', delay: '1.5s' },
          { top: '70%', left: '30%', size: 7, color: 'var(--ds-primary-200)', delay: '2s' },
          { top: '25%', left: '50%', size: 4, color: 'var(--ds-accent-200)', delay: '0.8s' },
        ].map((dot, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              top: dot.top,
              left: dot.left,
              width: dot.size,
              height: dot.size,
              background: dot.color,
              opacity: 0.5,
              transform: `translateZ(${100 + i * 10}px)`,
              animation: `ds-float-y ${4 + i}s ease-in-out infinite`,
              animationDelay: dot.delay,
            }}
          />
        ))}
      </div>

      {/* Subtle dot grid overlay */}
      <div
        className="absolute inset-0 ds-dot-grid"
        style={{
          opacity: 0.25,
          maskImage: 'radial-gradient(ellipse at center, black 35%, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, black 35%, transparent 75%)',
        }}
      />

      {/* Edge fade */}

      {/* 3D keyframes */}
    </div>
  )
}

/* ──────────────────────────────────────────────────────────────
   PROMPTS HERO 3D — Rising prompt cards in 3D perspective
   Content-related: small card-like shapes rising up with depth
   ────────────────────────────────────────────────────────────── */

export function PromptsHero3D({ className }: { className?: string }) {
  const cards = [
    { size: 50, color: 'var(--ds-soft-blue)', left: '8%', delay: '0s', duration: '14s', z: 20 },
    { size: 65, color: 'var(--ds-soft-lavender)', left: '22%', delay: '3s', duration: '18s', z: 40 },
    { size: 45, color: 'var(--ds-soft-yellow)', left: '38%', delay: '6s', duration: '16s', z: 30 },
    { size: 70, color: 'var(--ds-soft-mint)', left: '52%', delay: '1.5s', duration: '20s', z: 50 },
    { size: 55, color: 'var(--ds-soft-peach)', left: '68%', delay: '4.5s', duration: '15s', z: 35 },
    { size: 48, color: 'var(--ds-soft-rose)', left: '82%', delay: '7.5s', duration: '17s', z: 25 },
    { size: 58, color: 'var(--ds-soft-blue)', left: '15%', delay: '9s', duration: '19s', z: 45 },
    { size: 62, color: 'var(--ds-soft-lavender)', left: '45%', delay: '11s', duration: '13s', z: 38 },
    { size: 42, color: 'var(--ds-soft-mint)', left: '75%', delay: '2.5s', duration: '21s', z: 28 },
  ]

  return (
    <div aria-hidden className={cn('absolute inset-0 overflow-hidden', className)}>
      

      {/* 3D perspective */}
      <div
        className="absolute inset-0"
        style={{ perspective: '800px', perspectiveOrigin: '50% 100%' }}
      >
        {/* Rising card-shaped pastel elements */}
        {cards.map((card, i) => (
          <div
            key={i}
            className="absolute rounded-2xl"
            style={{
              width: card.size,
              height: card.size * 1.25,
              background: card.color,
              left: card.left,
              bottom: '-20%',
              opacity: 0.55,
              transform: `translateZ(${card.z}px)`,
              animation: `ds-3d-rise ${card.duration} linear infinite`,
              animationDelay: card.delay,
              borderRadius: i % 3 === 0 ? '50%' : i % 3 === 1 ? '16px' : '8px 24px 8px 24px',
            }}
          />
        ))}

        {/* Subtle floating dots in foreground */}
        {[
          { top: '20%', left: '30%', size: 5, color: 'var(--ds-primary-200)' },
          { top: '40%', left: '70%', size: 4, color: 'var(--ds-accent-200)' },
          { top: '60%', left: '20%', size: 6, color: 'var(--ds-soft-mint)' },
        ].map((dot, i) => (
          <div
            key={`dot-${i}`}
            className="absolute rounded-full"
            style={{
              top: dot.top,
              left: dot.left,
              width: dot.size,
              height: dot.size,
              background: dot.color,
              opacity: 0.4,
              transform: 'translateZ(80px)',
              animation: `ds-float-y ${5 + i}s ease-in-out infinite`,
              animationDelay: `${i * 0.7}s`,
            }}
          />
        ))}
      </div>

      {/* Bottom fade */}
    </div>
  )
}

/* ──────────────────────────────────────────────────────────────
   TEMPLATES HERO 3D — Rotating template tiles in 3D grid
   Content-related: screenshot-like tiles floating in 3D space
   ────────────────────────────────────────────────────────────── */

export function TemplatesHero3D({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn('absolute inset-0 overflow-hidden', className)}>
      

      {/* 3D perspective */}
      <div
        className="absolute inset-0"
        style={{ perspective: '1200px', perspectiveOrigin: '50% 50%' }}
      >
        {/* Two large rotating dashed rings (3D) */}
        <div
          className="absolute rounded-full"
          style={{
            width: 700,
            height: 700,
            border: '1px dashed var(--ds-primary-200)',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%) translateZ(-50px)',
            animation: 'ds-3d-spin 90s linear infinite',
            opacity: 0.4,
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: 500,
            height: 500,
            border: '1px dashed var(--ds-accent-200)',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%) translateZ(0px)',
            animation: 'ds-3d-spin 60s linear infinite reverse',
            opacity: 0.5,
          }}
        />

        {/* Floating 3D template tiles (card-like shapes with depth) */}
        {[
          { top: '15%', left: '10%', w: 80, h: 50, color: 'var(--ds-soft-blue)', z: 60, delay: '0s', dur: '8s' },
          { top: '20%', right: '12%', w: 70, h: 44, color: 'var(--ds-soft-peach)', z: 80, delay: '1s', dur: '6s' },
          { bottom: '20%', left: '18%', w: 65, h: 40, color: 'var(--ds-soft-yellow)', z: 50, delay: '1.8s', dur: '7s' },
          { bottom: '25%', right: '15%', w: 75, h: 48, color: 'var(--ds-soft-mint)', z: 70, delay: '0.5s', dur: '9s' },
          { top: '50%', left: '5%', w: 50, h: 32, color: 'var(--ds-soft-lavender)', z: 90, delay: '2.5s', dur: '5s' },
          { top: '60%', right: '8%', w: 55, h: 35, color: 'var(--ds-soft-rose)', z: 65, delay: '3s', dur: '8s' },
        ].map((tile, i) => (
          <div
            key={i}
            className="absolute rounded-xl"
            style={{
              top: tile.top,
              left: tile.left,
              right: tile.right,
              width: tile.w,
              height: tile.h,
              background: tile.color,
              opacity: 0.65,
              transform: `translateZ(${tile.z}px)`,
              animation: `ds-3d-float ${tile.dur} ease-in-out infinite`,
              animationDelay: tile.delay,
              boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
            }}
          >
            {/* Faux content lines inside tile */}
            <div className="p-2 space-y-1">
              <div className="h-1 w-3/4 rounded-full bg-white/40" />
              <div className="h-1 w-1/2 rounded-full bg-white/30" />
              <div className="h-1 w-2/3 rounded-full bg-white/20" />
            </div>
          </div>
        ))}

        {/* Small geometric accents */}
        <div
          className="absolute rounded-full"
          style={{
            top: '12%',
            left: '45%',
            width: 8,
            height: 8,
            background: 'var(--ds-primary-300)',
            opacity: 0.6,
            transform: 'translateZ(100px)',
            animation: 'ds-float-y 4s ease-in-out infinite',
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            bottom: '15%',
            left: '55%',
            width: 6,
            height: 6,
            background: 'var(--ds-accent-300)',
            opacity: 0.6,
            transform: 'translateZ(110px)',
            animation: 'ds-float-y-sm 3s ease-in-out infinite',
            animationDelay: '1s',
          }}
        />
      </div>

      {/* Dot grid overlay */}
      <div
        className="absolute inset-0 ds-dot-grid"
        style={{
          opacity: 0.2,
          maskImage: 'radial-gradient(ellipse at center, black 20%, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, black 20%, transparent 70%)',
        }}
      />

      {/* Edge fade */}
    </div>
  )
}
