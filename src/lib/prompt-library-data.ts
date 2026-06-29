export type PromptCategoryId =
  | 'writing'
  | 'work'
  | 'coding'
  | 'career'
  | 'study'
  | 'research'
  | 'image-generation'
  | 'image-editing'

export type PromptModelId =
  | 'ChatGPT'
  | 'Claude'
  | 'Gemini'
  | 'Midjourney'
  | 'Flux'
  | 'Photoshop AI'

export type PromptVariable = {
  name: string
  hint: string
}

export type PromptExample = {
  label: string
  value: string
}

export type PromptEntry = {
  id: string
  slug: string
  title: string
  seoTitle: string
  metaDescription: string
  summary: string
  description: string
  category: PromptCategoryId
  categoryTitle: string
  subcategory: string
  models: PromptModelId[]
  tags: string[]
  audience: string
  visualStyle: string
  previewImage: string
  previewAlt: string
  previewWidth?: number
  previewHeight?: number
  featured?: boolean
  prompt: string
  variables: PromptVariable[]
  bestFor: string[]
  workflow: string[]
  tips: string[]
  examples: PromptExample[]
  relatedSlugs: string[]
  updatedAt: string
}

export type PromptCategory = {
  id: PromptCategoryId
  title: string
  description: string
  count: number
  href: string
}

const CATEGORY_META: Record<
  PromptCategoryId,
  {
    title: string
    description: string
    previewImage: string
  }
> = {
  writing: {
    title: 'Writing Prompts',
    description: 'Email, article, summary, and rewrite prompts with stronger structure.',
    previewImage: 'https://pub-59d1b450736b455084e9eebc2ed27f14.r2.dev/prompt-previews/approved-prompts/cinematic-grunge-black-white-red-portrait-prompt.png',
  },
  work: {
    title: 'Work Prompts',
    description: 'Meeting notes, action plans, briefs, and execution prompts.',
    previewImage: 'https://pub-59d1b450736b455084e9eebc2ed27f14.r2.dev/prompt-previews/prompts-json/2012437899955097836-0.jpg',
  },
  coding: {
    title: 'Coding Prompts',
    description: 'Debugging, reviews, specs, and implementation prompts for developers.',
    previewImage: 'https://pub-59d1b450736b455084e9eebc2ed27f14.r2.dev/prompt-previews/approved-prompts/minimalist-dual-identity-studio-portrait.jpg',
  },
  career: {
    title: 'Career Prompts',
    description: 'Resume, interview, and job-search prompts that stay practical.',
    previewImage: 'https://pub-59d1b450736b455084e9eebc2ed27f14.r2.dev/prompt-previews/approved-prompts/nighttime-car-portrait-red-haired-woman.jpg',
  },
  study: {
    title: 'Study Prompts',
    description: 'Revision plans, explainers, flashcards, and study structure prompts.',
    previewImage: 'https://pub-59d1b450736b455084e9eebc2ed27f14.r2.dev/prompt-previews/approved-prompts/ultra-realistic-night-car-candid-photography.jpg',
  },
  research: {
    title: 'Research Prompts',
    description: 'Comparison, extraction, market, and analysis prompts with clearer synthesis.',
    previewImage: 'https://pub-59d1b450736b455084e9eebc2ed27f14.r2.dev/prompt-previews/prompts-md/nano-banana-pro-0001-colorful-dreams-in-a-cozy-attic.jpg',
  },
  'image-generation': {
    title: 'Image Generation Prompts',
    description: 'Visual prompts for portraits, products, interiors, posters, and branded scenes.',
    previewImage: 'https://pub-59d1b450736b455084e9eebc2ed27f14.r2.dev/prompt-previews/prompts-json/2012437899955097836-0.jpg',
  },
  'image-editing': {
    title: 'Image Editing Prompts',
    description: 'Retouch, relight, restore, clean up, and edit images with better direction.',
    previewImage: 'https://pub-59d1b450736b455084e9eebc2ed27f14.r2.dev/prompt-previews/prompts-md/nano-banana-pro-0001-colorful-dreams-in-a-cozy-attic.jpg',
  },
}

export const PROMPTS: PromptEntry[] = [
  {
    id: 'prompt-royal-blue-velvet-saree-vogue-portrait',
    slug: 'royal-blue-velvet-saree-vogue-portrait',
    title: 'Royal Blue Velvet Saree Vogue Portrait',
    seoTitle: 'Photorealistic Indian Saree Portrait Prompt',
    metaDescription:
      'A stunning Indian woman in a royal blue velvet saree with cinematic lighting, vogue-style photography, jasmine accessories, and elegant indoor aesthetics.',
    summary:
      'Ultra-detailed cinematic portrait of an Indian woman wearing a royal blue velvet saree with vogue-inspired fashion photography styling.',
    description:
      'A photorealistic cinematic portrait of a stunning young Indian woman wearing a luxurious royal blue velvet saree with elegant gold zari detailing, styled with jasmine accessories, sunglasses, and warm indoor golden-hour lighting.',
    category: 'image-generation',
    categoryTitle: 'Image Generation Prompts',
    subcategory: 'Fashion Photography',
    models: ['ChatGPT'],
    tags: [
      'indian woman',
      'saree portrait',
      'vogue photography',
      'cinematic lighting',
      'fashion editorial',
      'photorealistic',
      'royal blue saree',
      '8k portrait',
      'traditional fashion',
      'indian aesthetic',
    ],
    audience: 'AI artists, portrait photographers, fashion creators',
    visualStyle: 'Photorealistic cinematic vogue-style fashion photography',
    previewImage:
      'https://pub-59d1b450736b455084e9eebc2ed27f14.r2.dev/prompt-previews/approved-prompts/20260523_174000.jpg',
    previewAlt: 'Indian woman in royal blue velvet saree portrait',
    featured: true,
    prompt:
      'A stunning young Indian woman with fair skin, long voluminous wavy black hair cascading over her shoulder, wearing small round black sunglasses, posing confidently. She has a small bindi on her forehead, subtle makeup with glossy lips, and a seductive smile. She is wearing a rich royal blue velvet saree with a matching short-sleeve deep-neck blouse that reveals her toned midriff. The saree is elegantly draped with the pallu falling over her left shoulder, showing intricate gold zari border work. A delicate gold waist chain (kamarband) adorns her bare waist. Her right hand is raised, fingers gently touching the sunglasses, while her left hand is in her hair. She wears a thick white jasmine flower gajra bracelet on her left wrist and a dark green bangle on her right arm. A small tattoo is visible on her upper left arm. Photorealistic, sharp details, soft natural window lighting from the left, warm golden hour glow, slight rim lighting, elegant indoor setting with maroon curtains in the background, shallow depth of field, cinematic composition, 8k ultra-detailed, vogue photography style.',
    variables: [],
    bestFor: [
      'AI fashion portraits',
      'cinematic Indian photography',
      'editorial saree shoots',
      'luxury traditional aesthetics',
    ],
    workflow: [
      'Generate portrait composition',
      'Refine saree texture and gold detailing',
      'Enhance cinematic lighting',
      'Apply shallow depth-of-field and color grading',
    ],
    tips: [
      'Use warm golden-hour tones for realistic skin rendering',
      'Keep the maroon curtain background softly blurred',
      'Enhance velvet fabric texture for premium realism',
      'Maintain subtle cinematic rim lighting for depth',
    ],
    examples: [],
    relatedSlugs: [],
    updatedAt: '2026-05-24',
  },
]

export const FEATURED_PROMPTS = PROMPTS.filter(entry => entry.featured)

export const PROMPT_MODELS: PromptModelId[] = [
  'ChatGPT',
  'Claude',
  'Gemini',
  'Midjourney',
  'Flux',
  'Photoshop AI',
]

export const PROMPT_CATEGORIES: PromptCategory[] = (Object.entries(CATEGORY_META) as Array<
  [PromptCategoryId, (typeof CATEGORY_META)[PromptCategoryId]]
>).map(([id, meta]) => ({
  id,
  title: meta.title,
  description: meta.description,
  count: 0,
  href: `/prompts?category=${id}`,
}))

export function getPromptBySlug(slug: string) {
  return PROMPTS.find(prompt => prompt.slug === slug) || null
}

export function getRelatedPrompts(slug: string, limit = 4) {
  const prompt = getPromptBySlug(slug)
  if (!prompt) return []

  return prompt.relatedSlugs
    .map(relatedSlug => getPromptBySlug(relatedSlug))
    .filter((entry): entry is PromptEntry => Boolean(entry))
    .slice(0, limit)
}

export const PROMPT_LIBRARY_STATS = {
  totalPrompts: PROMPTS.length,
  imagePrompts: PROMPTS.filter(prompt => prompt.category.startsWith('image')).length,
  featuredPrompts: FEATURED_PROMPTS.length,
}
