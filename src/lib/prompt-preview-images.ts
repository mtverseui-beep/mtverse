import type { PromptCategoryId } from '@/lib/prompt-library-data'

const MODERN_PROMPT_FALLBACK = '/prompt-previews/prompt-fallback-modern.svg'

export const PROMPT_CATEGORY_LOCAL_PREVIEWS: Record<PromptCategoryId, string> = {
  writing: MODERN_PROMPT_FALLBACK,
  work: MODERN_PROMPT_FALLBACK,
  coding: MODERN_PROMPT_FALLBACK,
  career: MODERN_PROMPT_FALLBACK,
  study: MODERN_PROMPT_FALLBACK,
  research: MODERN_PROMPT_FALLBACK,
  'image-generation': MODERN_PROMPT_FALLBACK,
  'image-editing': MODERN_PROMPT_FALLBACK,
}

export const PROMPT_CATEGORY_REMOTE_PREVIEWS: Record<PromptCategoryId, { src: string; alt: string }> = {
  writing: {
    src: 'https://pub-59d1b450736b455084e9eebc2ed27f14.r2.dev/prompt-previews/approved-prompts/cinematic-grunge-black-white-red-portrait-prompt.png',
    alt: 'Cinematic editorial portrait prompt preview',
  },
  work: {
    src: 'https://pub-59d1b450736b455084e9eebc2ed27f14.r2.dev/prompt-previews/prompts-json/2012437899955097836-0.jpg',
    alt: 'Modern workspace prompt preview',
  },
  coding: {
    src: 'https://pub-59d1b450736b455084e9eebc2ed27f14.r2.dev/prompt-previews/approved-prompts/minimalist-dual-identity-studio-portrait.jpg',
    alt: 'Minimal studio concept prompt preview',
  },
  career: {
    src: 'https://pub-59d1b450736b455084e9eebc2ed27f14.r2.dev/prompt-previews/approved-prompts/nighttime-car-portrait-red-haired-woman.jpg',
    alt: 'Professional portrait prompt preview',
  },
  study: {
    src: 'https://pub-59d1b450736b455084e9eebc2ed27f14.r2.dev/prompt-previews/approved-prompts/ultra-realistic-night-car-candid-photography.jpg',
    alt: 'Focused cinematic scene prompt preview',
  },
  research: {
    src: 'https://pub-59d1b450736b455084e9eebc2ed27f14.r2.dev/prompt-previews/prompts-md/nano-banana-pro-0001-colorful-dreams-in-a-cozy-attic.jpg',
    alt: 'Creative research prompt preview',
  },
  'image-generation': {
    src: 'https://pub-59d1b450736b455084e9eebc2ed27f14.r2.dev/prompt-previews/prompts-json/2012437899955097836-0.jpg',
    alt: 'AI image generation prompt preview',
  },
  'image-editing': {
    src: 'https://pub-59d1b450736b455084e9eebc2ed27f14.r2.dev/prompt-previews/prompts-md/nano-banana-pro-0001-colorful-dreams-in-a-cozy-attic.jpg',
    alt: 'AI image editing prompt preview',
  },
}

export function getPromptPreviewFallback(category: PromptCategoryId) {
  return PROMPT_CATEGORY_LOCAL_PREVIEWS[category]
}

export function getPromptPreviewDefault(category: PromptCategoryId) {
  return PROMPT_CATEGORY_REMOTE_PREVIEWS[category]
}

export function isPromptPlaceholderPreview(value: string) {
  return Object.values(PROMPT_CATEGORY_LOCAL_PREVIEWS).includes(value)
}
