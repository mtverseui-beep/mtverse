'use client'

/**
 * Animated prompts showcase — 8 cards that cycle through 24 real prompt preview images.
 * Each card has a different rotation interval, creating a continuous, premium feel.
 *
 * - 8 cards arranged in a responsive grid
 * - Each card cycles through 3 different real prompt images (24 total unique)
 * - Images come from the R2 bucket (the same one used by /prompts)
 * - Smooth crossfade transition between images
 * - "Newly added" badge on every card
 * - Hover: pause animation + show "View prompt" overlay
 */

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Sparkles, Eye } from 'lucide-react'

const PROMPT_IMAGES: Array<{ src: string; slug: string; title: string }> = [
  { src: 'https://pub-59d1b450736b455084e9eebc2ed27f14.r2.dev/prompt-previews/approved-prompts/cinematic-grunge-black-white-red-portrait-prompt.png', slug: 'cinematic-grunge-black-white-red-portrait-prompt', title: 'Cinematic Grunge Portrait' },
  { src: 'https://pub-59d1b450736b455084e9eebc2ed27f14.r2.dev/prompt-previews/approved-prompts/cinematic-red-fashion-editorial-ai-prompt.jpg', slug: 'cinematic-red-fashion-editorial-ai-prompt', title: 'Cinematic Red Fashion Editorial' },
  { src: 'https://pub-59d1b450736b455084e9eebc2ed27f14.r2.dev/prompt-previews/approved-prompts/korean-chibi-rooftop-sunset-portrait-prompt.jpg', slug: 'korean-chibi-rooftop-sunset-portrait-prompt', title: 'Korean Chibi Rooftop Sunset' },
  { src: 'https://pub-59d1b450736b455084e9eebc2ed27f14.r2.dev/prompt-previews/approved-prompts/editorial-fashion-actress-h-02-village-saree-portrait.jpg', slug: 'editorial-fashion-actress-h-02-village-saree-portrait', title: 'Village Saree Editorial Portrait' },
  { src: 'https://pub-59d1b450736b455084e9eebc2ed27f14.r2.dev/prompt-previews/approved-prompts/minimalist-dual-identity-studio-portrait.jpg', slug: 'minimalist-dual-identity-studio-portrait', title: 'Minimalist Dual-Identity Portrait' },
  { src: 'https://pub-59d1b450736b455084e9eebc2ed27f14.r2.dev/prompt-previews/approved-prompts/nighttime-car-portrait-red-haired-woman.jpg', slug: 'nighttime-car-portrait-red-haired-woman', title: 'Nighttime Car Portrait' },
  { src: 'https://pub-59d1b450736b455084e9eebc2ed27f14.r2.dev/prompt-previews/approved-prompts/ultra-realistic-night-car-candid-photography.jpg', slug: 'ultra-realistic-night-car-candid-photography', title: 'Ultra-Realistic Night Car Candid' },
  { src: 'https://pub-59d1b450736b455084e9eebc2ed27f14.r2.dev/prompt-previews/prompts-json/2012437899955097836-0.jpg', slug: 'trending-gptimage-0013-3d-render-image-prompt-2012437899955097836', title: '3D Render Image Prompt' },
  { src: 'https://pub-59d1b450736b455084e9eebc2ed27f14.r2.dev/prompt-previews/prompts-json/2013316513701216688-0.jpg', slug: 'trending-nanobanana-0312-3d-render-image-prompt-2013316513701216688', title: '3D Render Abstract' },
  { src: 'https://pub-59d1b450736b455084e9eebc2ed27f14.r2.dev/prompt-previews/prompts-json/2029142137015812314-0.jpg', slug: 'trending-nanobanana-0317-3d-render-image-prompt-2029142137015812314', title: '3D Render Scene' },
  { src: 'https://pub-59d1b450736b455084e9eebc2ed27f14.r2.dev/prompt-previews/prompts-json/2011675822076411914-0.jpg', slug: 'trending-nanobanana-0332-anime-character-art-prompt-2011675822076411914', title: 'Anime Character Art' },
  { src: 'https://pub-59d1b450736b455084e9eebc2ed27f14.r2.dev/prompt-previews/prompts-json/2007523056822939698-0.jpg', slug: 'trending-gptimage-0004-architecture-and-interior-design-prompt-2007523056822939698', title: 'Architecture Interior' },
  { src: 'https://pub-59d1b450736b455084e9eebc2ed27f14.r2.dev/prompt-previews/prompts-json/2046866168208916503-0.jpg', slug: 'trending-gptimage-0008-architecture-and-interior-design-prompt-2046866168208916503', title: 'Interior Design' },
  { src: 'https://pub-59d1b450736b455084e9eebc2ed27f14.r2.dev/prompt-previews/prompts-json/2002826415939682584-0.jpg', slug: 'trending-gptimage-0020-architecture-and-interior-design-prompt-2002826415939682584', title: 'Modern Interior' },
  { src: 'https://pub-59d1b450736b455084e9eebc2ed27f14.r2.dev/prompt-previews/prompts-json/2009834337043394622-0.jpg', slug: 'trending-gptimage-0025-architecture-and-interior-design-prompt-2009834337043394622', title: 'Architectural Render' },
  { src: 'https://pub-59d1b450736b455084e9eebc2ed27f14.r2.dev/prompt-previews/prompts-md/nano-banana-pro-0004-a-fiery-flight-of-imagination.jpg', slug: 'nano-banana-pro-0004-a-fiery-flight-of-imagination', title: 'A Fiery Flight of Imagination' },
  { src: 'https://pub-59d1b450736b455084e9eebc2ed27f14.r2.dev/prompt-previews/prompts-md/nano-banana-pro-0023-a-whimsical-reflection-in-sky-blue-vibes.jpg', slug: 'nano-banana-pro-0023-a-whimsical-reflection-in-sky-blue-vibes', title: 'Whimsical Sky Blue Reflection' },
  { src: 'https://pub-59d1b450736b455084e9eebc2ed27f14.r2.dev/prompt-previews/prompts-md/nano-banana-pro-0006-be-unique-a-creative-3d-vision-on-the-platform.jpg', slug: 'nano-banana-pro-0006-be-unique-a-creative-3d-vision-on-the-platform', title: 'Creative 3D Vision' },
  { src: 'https://pub-59d1b450736b455084e9eebc2ed27f14.r2.dev/prompt-previews/prompts-md/nano-banana-pro-0022-chiaroscuro-elegance-the-gemini-nano-banana-3-0-portrait.jpg', slug: 'nano-banana-pro-0022-chiaroscuro-elegance-the-gemini-nano-banana-3-0-portrait', title: 'Chiaroscuro Elegance Portrait' },
  { src: 'https://pub-59d1b450736b455084e9eebc2ed27f14.r2.dev/prompt-previews/prompts-md/nano-banana-pro-0011-city-dreams-neon-reflections-through-rain.jpg', slug: 'nano-banana-pro-0011-city-dreams-neon-reflections-through-rain', title: 'Neon City Dreams' },
  { src: 'https://pub-59d1b450736b455084e9eebc2ed27f14.r2.dev/prompt-previews/prompts-md/nano-banana-pro-0001-colorful-dreams-in-a-cozy-attic.jpg', slug: 'nano-banana-pro-0001-colorful-dreams-in-a-cozy-attic', title: 'Colorful Dreams in Attic' },
  { src: 'https://pub-59d1b450736b455084e9eebc2ed27f14.r2.dev/prompt-previews/prompts-md/nano-banana-pro-0014-confidence-in-cinematic-style-a-modern-portrait.jpg', slug: 'nano-banana-pro-0014-confidence-in-cinematic-style-a-modern-portrait', title: 'Confidence Cinematic Portrait' },
  { src: 'https://pub-59d1b450736b455084e9eebc2ed27f14.r2.dev/prompt-previews/prompts-md/nano-banana-pro-0005-dark-elegance-at-the-water-s-edge.jpg', slug: 'nano-banana-pro-0005-dark-elegance-at-the-water-s-edge', title: 'Dark Elegance at Water Edge' },
  { src: 'https://pub-59d1b450736b455084e9eebc2ed27f14.r2.dev/prompt-previews/prompts-md/nano-banana-pro-0002-defiance-in-shadows-a-stylish-standoff.jpg', slug: 'nano-banana-pro-0002-defiance-in-shadows-a-stylish-standoff', title: 'Defiance in Shadows' },
]

type CardProps = {
  images: typeof PROMPT_IMAGES
  intervalMs?: number
}

function AnimatedPromptCard({ images, intervalMs = 3000 }: CardProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [hovered, setHovered] = useState(false)

  useEffect(() => {
    if (hovered) return
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length)
    }, intervalMs)
    return () => clearInterval(timer)
  }, [hovered, images.length, intervalMs])

  const current = images[currentIndex]

  return (
    <Link
      href={`/prompts/${current.slug}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group relative block aspect-[4/5] rounded-2xl overflow-hidden border border-border bg-muted no-underline"
    >
      {images.map((img, i) => (
        <Image
          key={img.slug}
          src={img.src}
          alt={img.title}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
          className="object-cover transition-opacity duration-700"
          style={{ opacity: i === currentIndex ? 1 : 0 }}
          unoptimized
          priority={i === 0 && currentIndex === 0}
        />
      ))}

      <div className="absolute top-2.5 left-2.5 z-10">
        <span className="inline-flex items-center gap-1 rounded-full bg-background/90 backdrop-blur px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 shadow-sm border">
          <Sparkles className="h-2.5 w-2.5" />
          New
        </span>
      </div>

      <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/70 to-transparent">
        <p className="text-xs font-medium text-white line-clamp-1">{current.title}</p>
      </div>

      <div
        className="absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity"
        style={{ opacity: hovered ? 1 : 0 }}
      >
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-foreground shadow-md">
          <Eye className="h-3.5 w-3.5" />
          View prompt
        </span>
      </div>

      <div className="absolute top-2.5 right-2.5 flex gap-1">
        {images.map((_, i) => (
          <span
            key={i}
            className="h-1 w-1 rounded-full transition-all"
            style={{
              background: i === currentIndex ? 'white' : 'rgba(255,255,255,0.4)',
              transform: i === currentIndex ? 'scale(1.3)' : 'scale(1)',
            }}
          />
        ))}
      </div>
    </Link>
  )
}

export function AnimatedPromptsShowcase() {
  const cards: typeof PROMPT_IMAGES[] = []
  for (let i = 0; i < 24; i += 3) {
    cards.push(PROMPT_IMAGES.slice(i, i + 3))
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
      {cards.map((cardImages, i) => (
        <AnimatedPromptCard
          key={i}
          images={cardImages}
          intervalMs={2800 + i * 350}
        />
      ))}
    </div>
  )
}
