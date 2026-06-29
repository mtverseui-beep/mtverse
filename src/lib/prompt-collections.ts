import type { PromptCategoryId, PromptEntry, PromptModelId } from '@/lib/prompt-library-data'

export type PromptCollection = {
  slug: string
  title: string
  h1: string
  shortTitle: string
  description: string
  metaDescription: string
  keywords: string[]
  category?: PromptCategoryId
  model?: PromptModelId
  terms: string[]
  howTo: string[]
  faq: Array<{
    question: string
    answer: string
  }>
}

export const PROMPT_COLLECTIONS: PromptCollection[] = [
  {
    slug: 'free-chatgpt-prompts',
    title: 'Free ChatGPT Prompts',
    h1: 'Free ChatGPT Prompts',
    shortTitle: 'ChatGPT',
    description:
      'Copy free ChatGPT prompts for writing, coding, planning, learning, marketing, and daily productivity workflows.',
    metaDescription:
      'Browse free ChatGPT prompts you can copy for writing, coding, study, work, marketing, research, and productivity.',
    keywords: ['free ChatGPT prompts', 'ChatGPT prompts', 'copy ChatGPT prompt', 'AI writing prompts'],
    model: 'ChatGPT',
    terms: ['chatgpt', 'gpt', 'writing', 'coding', 'work', 'study', 'research'],
    howTo: [
      'Pick a prompt that matches your task.',
      'Replace the bracketed details with your topic, audience, or goal.',
      'Paste it into ChatGPT and ask for a refined second version if needed.',
    ],
    faq: [
      {
        question: 'Are these ChatGPT prompts free?',
        answer: 'Yes. The prompts are free to browse, copy, and adapt for your own workflow.',
      },
      {
        question: 'Can I edit these prompts?',
        answer: 'Yes. Replace variables, add context, and keep the structure that matches your task.',
      },
    ],
  },
  {
    slug: 'free-ai-image-prompts',
    title: 'Free AI Image Prompts',
    h1: 'Free AI Image Prompts',
    shortTitle: 'AI Images',
    description:
      'Explore free AI image prompts for portraits, products, posters, anime, fashion, architecture, and cinematic scenes.',
    metaDescription:
      'Browse free AI image prompts for Midjourney, Flux, Nano Banana, portraits, product photos, anime, fashion, and visual ideas.',
    keywords: ['free AI image prompts', 'AI image prompts', 'Midjourney prompts', 'Flux prompts'],
    category: 'image-generation',
    terms: ['image', 'portrait', 'photo', 'midjourney', 'flux', 'nano banana', 'stable diffusion'],
    howTo: [
      'Choose a visual style and copy the prompt.',
      'Replace subject, lighting, camera, color, and aspect-ratio details.',
      'Generate several variations and keep the best composition.',
    ],
    faq: [
      {
        question: 'Which AI image tools can use these prompts?',
        answer: 'Most prompts work well with Midjourney, Flux, Gemini image tools, Nano Banana style workflows, and similar image generators.',
      },
      {
        question: 'Can I use these prompts for commercial ideas?',
        answer: 'You can use the prompt text freely, but always check the image tool and asset license before commercial publishing.',
      },
    ],
  },
  {
    slug: 'midjourney-prompts',
    title: 'Midjourney Prompts',
    h1: 'Free Midjourney Prompts',
    shortTitle: 'Midjourney',
    description:
      'Copy free Midjourney prompts for portraits, product shots, cinematic scenes, architecture, fashion, posters, and visual concepts.',
    metaDescription:
      'Browse free Midjourney prompts for portraits, product photography, cinematic art, architecture, fashion images, posters, and creative visuals.',
    keywords: ['free Midjourney prompts', 'Midjourney prompts', 'AI image prompts', 'Midjourney image prompt'],
    model: 'Midjourney',
    terms: ['midjourney', 'image', 'portrait', 'product', 'cinematic', 'fashion', 'architecture', 'poster'],
    howTo: [
      'Choose a prompt with the visual direction you want.',
      'Replace the subject, mood, lens, lighting, color, and aspect ratio.',
      'Generate variations and keep the version with the cleanest composition.',
    ],
    faq: [
      {
        question: 'Are these Midjourney prompts free?',
        answer: 'Yes. The Midjourney prompts on mtverse are free to browse, copy, and adapt.',
      },
      {
        question: 'Can I use these prompts in other image generators?',
        answer: 'Yes. Many prompts can be adapted for Flux, Gemini image tools, and other AI image models by adjusting model-specific syntax.',
      },
    ],
  },
  {
    slug: 'chatgpt-image-prompts',
    title: 'ChatGPT Image Prompts',
    h1: 'Free ChatGPT Image Prompts',
    shortTitle: 'ChatGPT Image',
    description:
      'Find free ChatGPT image prompts for portraits, product visuals, social media graphics, edits, thumbnails, and creative image workflows.',
    metaDescription:
      'Copy free ChatGPT image prompts for AI portraits, product visuals, photo edits, thumbnails, social media images, and creative workflows.',
    keywords: ['free ChatGPT image prompts', 'ChatGPT image prompts', 'AI photo prompt', 'ChatGPT photo editing prompt'],
    model: 'ChatGPT',
    category: 'image-generation',
    terms: ['chatgpt', 'image', 'photo', 'portrait', 'product', 'thumbnail', 'social media', 'visual'],
    howTo: [
      'Pick a ChatGPT image prompt that matches your visual goal.',
      'Add the subject, setting, style, lighting, crop, and output format.',
      'Ask for variations, then refine the strongest result with a short edit instruction.',
    ],
    faq: [
      {
        question: 'Do ChatGPT image prompts need exact wording?',
        answer: 'No. Use these as structured starting points, then add your own subject, style, and constraints.',
      },
      {
        question: 'Can I use these for social media images?',
        answer: 'Yes. Many prompts are written for profile photos, thumbnails, product images, posts, and visual content ideas.',
      },
    ],
  },
  {
    slug: 'nano-banana-prompts',
    title: 'Nano Banana Prompts',
    h1: 'Free Nano Banana Prompts',
    shortTitle: 'Nano Banana',
    description:
      'Discover free Nano Banana style prompts for viral portraits, cinematic edits, product visuals, and creative AI images.',
    metaDescription:
      'Copy free Nano Banana prompts for viral AI portraits, photo edits, cinematic images, social media visuals, and creative ideas.',
    keywords: ['Nano Banana prompts', 'free Nano Banana prompts', 'Gemini Nano Banana prompt', 'viral AI prompts'],
    terms: ['nano banana', 'gemini nano banana', 'viral ai', 'photo editing', 'portrait'],
    howTo: [
      'Open a Nano Banana prompt that matches your image idea.',
      'Add your subject, mood, background, and output ratio.',
      'Keep identity-safe and age-appropriate details when editing people.',
    ],
    faq: [
      {
        question: 'What are Nano Banana prompts?',
        answer: 'They are structured AI image prompts built for the popular Nano Banana style trend and similar visual workflows.',
      },
      {
        question: 'Do I need a paid account to copy them?',
        answer: 'No. The prompts on mtverse are free to copy.',
      },
    ],
  },
  {
    slug: 'instagram-ai-photo-prompts',
    title: 'Instagram AI Photo Prompts',
    h1: 'Free Instagram AI Photo Prompts',
    shortTitle: 'Instagram',
    description:
      'Find free AI photo prompts for Instagram profile pictures, reels covers, viral edits, aesthetic posts, and creator visuals.',
    metaDescription:
      'Copy free Instagram AI photo prompts for profile pictures, reels covers, viral photo edits, aesthetic posts, and creator images.',
    keywords: ['Instagram AI prompts', 'free AI photo prompts', 'AI profile picture prompts', 'viral Instagram prompts'],
    terms: ['instagram', 'profile picture', 'avatar', 'viral', 'social media', 'creator', 'reels'],
    howTo: [
      'Start with a prompt that matches your post style.',
      'Add your outfit, background, lighting, and crop ratio.',
      'Keep text short if the image will be used as a reel cover or post.',
    ],
    faq: [
      {
        question: 'Can these prompts help with Instagram posts?',
        answer: 'Yes. They are designed for social visuals like profile photos, reels covers, creator edits, and aesthetic posts.',
      },
      {
        question: 'Are these prompts safe for public posting?',
        answer: 'Use age-appropriate images, avoid private people without permission, and review each result before posting.',
      },
    ],
  },
  {
    slug: 'viral-ai-prompts',
    title: 'Viral AI Prompts',
    h1: 'Free Viral AI Prompts',
    shortTitle: 'Viral',
    description:
      'Browse free viral AI prompts for trending photo edits, nostalgic images, avatars, reels covers, and shareable visuals.',
    metaDescription:
      'Discover free viral AI prompts for trending photo edits, childhood-now images, avatars, reels covers, and social media ideas.',
    keywords: ['viral AI prompts', 'free viral prompts', 'trending AI prompts', 'AI photo trend prompts'],
    terms: ['viral', 'trend', 'trending', 'instagram', 'tiktok', 'childhood', 'avatar', 'reels'],
    howTo: [
      'Choose a prompt based on the trend you want to recreate.',
      'Use clear source images when the prompt asks for a photo reference.',
      'Adjust the caption, year, mood, or visual style before generating.',
    ],
    faq: [
      {
        question: 'Are viral AI prompts updated?',
        answer: 'The library is built to surface new and trending prompt styles as they are added.',
      },
      {
        question: 'Can I copy these for reels or shorts?',
        answer: 'Yes. They are free to copy and can be adapted for social media formats.',
      },
    ],
  },
  {
    slug: 'celebrity-style-fashion-prompts',
    title: 'Celebrity-Style Fashion Prompts',
    h1: 'Free Celebrity-Style Fashion Prompts',
    shortTitle: 'Fashion Portraits',
    description:
      'Explore free Hollywood and Indian actress-inspired AI fashion portrait prompts with cinematic lighting, editorial styling, and photorealistic image direction.',
    metaDescription:
      'Copy free celebrity-style fashion portrait prompts for Hollywood-inspired, Indian actress-inspired, cinematic, editorial, and photorealistic AI images.',
    keywords: [
      'celebrity style AI prompts',
      'Hollywood actress AI prompt',
      'Indian actress AI prompt',
      'fashion portrait prompt',
      'photorealistic portrait prompt',
      'cinematic fashion AI prompt',
      'editorial fashion AI prompt',
      'free fashion portrait prompts',
      'resort fashion AI prompt',
    ],
    category: 'image-generation',
    terms: [
      'actress style',
      'hollywood actress',
      'indian actress',
      'fashion portrait',
      'editorial fashion',
      'resort fashion',
      'clean fashion prompt',
      'instagram portrait prompt',
      'photorealistic portrait',
      'cinematic portrait',
      'editorial',
    ],
    howTo: [
      'Pick a prompt with the fashion scene, lighting, or location you want.',
      'Replace subject details with your own safe, adult, fictional, or consent-based reference.',
      'Generate variations and refine clothing, camera, lighting, and background instead of using real celebrity names.',
    ],
    faq: [
      {
        question: 'Are these fashion portrait prompts free?',
        answer: 'Yes. These celebrity-style fashion prompts are free to browse, copy, and adapt for AI image workflows.',
      },
      {
        question: 'Can I use real celebrity names?',
        answer: 'Use generic style direction instead of impersonating real people. Keep prompts fictional, consent-based, and respectful.',
      },
    ],
  },
  {
    slug: 'ai-photo-editing-prompts',
    title: 'AI Photo Editing Prompts',
    h1: 'Free AI Photo Editing Prompts',
    shortTitle: 'Photo Editing',
    description:
      'Use free AI photo editing prompts for retouching, relighting, restoring, background edits, and social-ready transformations.',
    metaDescription:
      'Copy free AI photo editing prompts for Gemini, ChatGPT, Photoshop AI, retouching, relighting, restoration, and creative edits.',
    keywords: ['free AI photo editing prompts', 'AI photo edit prompt', 'Gemini photo prompt', 'Photoshop AI prompts'],
    category: 'image-editing',
    terms: ['editing', 'edit', 'photo', 'retouch', 'restore', 'background', 'gemini', 'photoshop'],
    howTo: [
      'Upload a clear source image if the AI tool supports image input.',
      'Copy the prompt and replace the edit goal with your exact change.',
      'Review faces, hands, text, and background details before publishing.',
    ],
    faq: [
      {
        question: 'Can these prompts edit existing photos?',
        answer: 'Yes. They are written for tools that support photo input and instruction-based editing.',
      },
      {
        question: 'Will every AI tool support photo editing?',
        answer: 'No. Use these with image-capable tools such as Gemini image tools, ChatGPT image workflows, or Photoshop AI.',
      },
    ],
  },
]

export function getPromptCollection(slug: string) {
  return PROMPT_COLLECTIONS.find(collection => collection.slug === slug) || null
}

export function getPromptCollectionHref(slug: string) {
  return `/prompts/collections/${slug}`
}

export function getPromptsForCollection(prompts: PromptEntry[], collection: PromptCollection) {
  const terms = collection.terms.map(term => term.toLowerCase())

  return prompts.filter(prompt => {
    if (collection.category && prompt.category !== collection.category) return false
    if (collection.model && !prompt.models.includes(collection.model)) return false

    const haystack = [
      prompt.title,
      prompt.summary,
      prompt.description,
      prompt.categoryTitle,
      prompt.subcategory,
      prompt.visualStyle,
      ...prompt.tags,
      ...prompt.models,
      ...prompt.bestFor,
    ]
      .join(' ')
      .toLowerCase()

    return terms.some(term => haystack.includes(term))
  })
}
