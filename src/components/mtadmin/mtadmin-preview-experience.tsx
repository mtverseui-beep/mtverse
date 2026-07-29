'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { ChevronDown, ChevronLeft, ChevronRight, ExternalLink, MonitorPlay } from 'lucide-react'
import type { MtadminEdition } from '@/lib/mtadmin-product'
import { cn } from '@/lib/utils'

type Props = { images: string[] }
type PreviewUrls = Partial<Record<string, string>>

const IMAGE_LABELS = ['Executive overview', 'Analytics workspace', 'Operations workspace']
const FRAMEWORK_ASSETS: Record<string, string> = {
  nextjs: '/brand/frameworks/nextjs.svg', react: '/brand/frameworks/react.svg', html: '/brand/frameworks/html5.svg',
  vue: '/brand/frameworks/vue.svg', angular: '/brand/frameworks/angular.svg', laravel: '/brand/frameworks/laravel.svg',
}

export function MtadminLivePreviewMenu({ editions, previewUrls }: { editions: MtadminEdition[]; previewUrls: PreviewUrls }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function closeMenu(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', closeMenu)
    return () => document.removeEventListener('mousedown', closeMenu)
  }, [])

  return (
    <div ref={menuRef} className="relative z-40 mt-2">
      <button type="button" onClick={() => setMenuOpen((open) => !open)} aria-haspopup="menu" aria-expanded={menuOpen} className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 text-sm font-semibold text-foreground shadow-sm transition-colors hover:bg-muted">
        <MonitorPlay className="h-4 w-4 text-primary" />
        Live preview
        <ChevronDown className={cn('h-4 w-4 text-muted-foreground transition-transform', menuOpen && 'rotate-180')} />
      </button>
      <div role="menu" className={cn('absolute left-0 right-0 top-[calc(100%+8px)] origin-top overflow-hidden rounded-lg border border-border bg-popover p-1.5 shadow-2xl transition-all duration-200', menuOpen ? 'visible translate-y-0 scale-100 opacity-100' : 'invisible -translate-y-1 scale-[0.98] opacity-0')}>
        <p className="px-3 pb-1.5 pt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Choose framework</p>
        {editions.map((edition) => {
          const previewUrl = previewUrls[edition.id]
          const available = edition.status === 'available' && Boolean(previewUrl)
          const rowClass = cn('flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left transition-colors', available ? 'hover:bg-muted' : 'cursor-not-allowed opacity-55')
          const content = (
            <>
              <span className="grid h-7 w-7 place-items-center rounded-md bg-background ring-1 ring-border">
                <Image src={FRAMEWORK_ASSETS[edition.id] || '/SiteLogo.png'} alt="" width={18} height={18} className="h-[18px] w-[18px] object-contain" />
              </span>
              <span className="min-w-0 flex-1 text-sm font-semibold text-foreground">{edition.name} preview</span>
              {available ? <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" /> : <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground">{edition.status === 'available' ? 'Pending' : 'Soon'}</span>}
            </>
          )

          return available ? (
            <a key={edition.id} href={previewUrl} target="_blank" rel="noopener noreferrer" role="menuitem" onClick={() => setMenuOpen(false)} className={rowClass}>{content}</a>
          ) : (
            <div key={edition.id} role="menuitem" aria-disabled="true" className={rowClass}>{content}</div>
          )
        })}
      </div>
    </div>
  )
}

export function MtadminPreviewExperience({ images }: Props) {
  const [activeImage, setActiveImage] = useState(0)
  const move = (direction: -1 | 1) => setActiveImage((current) => (current + direction + images.length) % images.length)

  return (
    <div id="preview" className="scroll-mt-24">

      <div className="relative overflow-hidden rounded-xl border border-border bg-muted/35 p-1.5 shadow-xl shadow-black/[0.05] sm:p-2">
        <div className="relative aspect-[1900/900] overflow-hidden rounded-lg border border-border bg-background">
          <Image key={images[activeImage]} src={images[activeImage]} alt={`mtadmin ${IMAGE_LABELS[activeImage].toLowerCase()} preview`} fill priority quality={75} sizes="(max-width: 1024px) 100vw, 820px" className="object-contain" />
        </div>
        <button type="button" onClick={() => move(-1)} className="absolute left-4 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-white/95 text-zinc-900 shadow-lg transition-transform hover:scale-105" aria-label="Previous screenshot"><ChevronLeft className="h-4 w-4" /></button>
        <button type="button" onClick={() => move(1)} className="absolute right-4 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-white/95 text-zinc-900 shadow-lg transition-transform hover:scale-105" aria-label="Next screenshot"><ChevronRight className="h-4 w-4" /></button>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        {images.map((image, index) => (
          <button key={image} type="button" onClick={() => setActiveImage(index)} className={cn('relative aspect-[1900/900] overflow-hidden rounded-md border bg-muted transition-all', activeImage === index ? 'border-primary ring-2 ring-primary/15' : 'border-border opacity-70 hover:opacity-100')} aria-label={`Show ${IMAGE_LABELS[index]}`}>
            <Image src={image} alt="" fill sizes="220px" className="object-cover" />
          </button>
        ))}
      </div>
    </div>
  )
}