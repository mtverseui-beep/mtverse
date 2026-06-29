import type {
  PromptCategory,
  PromptCategoryId,
  PromptEntry,
  PromptModelId,
  PromptVariable,
} from '@/lib/prompt-library-data'
import { slugify } from '@/lib/utils'

type PromptSeoAutofillInput = Partial<PromptEntry> & {
  prompt?: string
  previewImage?: string
}

export type PromptSeoAutofillInsight = {
  label: string
  value: string
}

const CATEGORY_LABELS: Record<PromptCategoryId, string> = {
  writing: 'Writing Prompts',
  work: 'Work Prompts',
  coding: 'Coding Prompts',
  career: 'Career Prompts',
  study: 'Study Prompts',
  research: 'Research Prompts',
  'image-generation': 'Image Generation Prompts',
  'image-editing': 'Image Editing Prompts',
}

const CATEGORY_KEYWORDS: Array<{
  category: PromptCategoryId
  keywords: string[]
}> = [
  {
    category: 'image-editing',
    keywords: [
      'uploaded photo',
      'source photo',
      'reference photo',
      'edit this',
      'photo edit',
      'retouch',
      'remove background',
      'replace background',
      'restore',
      'relight',
      'upscale',
      'face from',
      'use the face',
      'image editing',
    ],
  },
  {
    category: 'image-generation',
    keywords: [
      'portrait',
      'cinematic',
      'photo',
      'photography',
      'fashion',
      'editorial',
      'anime',
      'pixar',
      'ghibli',
      'midjourney',
      'flux',
      'render',
      'illustration',
      'poster',
      'product shot',
      'scene',
      'visual',
    ],
  },
  {
    category: 'coding',
    keywords: ['code', 'debug', 'api', 'typescript', 'react', 'next.js', 'sql', 'regex', 'schema', 'test case'],
  },
  {
    category: 'career',
    keywords: ['resume', 'cv', 'cover letter', 'interview', 'linkedin', 'job', 'recruiter', 'career'],
  },
  {
    category: 'research',
    keywords: ['research', 'compare', 'market', 'analysis', 'report', 'evidence', 'case study'],
  },
  {
    category: 'study',
    keywords: ['study', 'exam', 'explain', 'flashcard', 'quiz', 'lesson', 'learn'],
  },
  {
    category: 'work',
    keywords: ['meeting', 'brief', 'plan', 'roadmap', 'stakeholder', 'project', 'team', 'workflow'],
  },
]

const MODEL_KEYWORDS: Array<{ model: PromptModelId; keywords: string[] }> = [
  { model: 'Midjourney', keywords: ['midjourney', '--ar', '--v', 'stylize'] },
  { model: 'Flux', keywords: ['flux', 'schnell', 'dev model'] },
  { model: 'Gemini', keywords: ['gemini', 'nano banana', 'uploaded photo', 'image edit'] },
  { model: 'Photoshop AI', keywords: ['photoshop', 'generative fill', 'remove background', 'retouch'] },
  { model: 'Claude', keywords: ['claude', 'document', 'analysis', 'research'] },
  { model: 'ChatGPT', keywords: ['chatgpt', 'gpt', 'prompt', 'write', 'generate'] },
]

const PHRASE_TAGS = [
  'free ai prompt',
  'ai image prompt',
  'chatgpt prompt',
  'midjourney prompt',
  'nano banana prompt',
  'photo editing prompt',
  'cinematic portrait',
  'fashion photography',
  'editorial fashion',
  'product photography',
  'instagram edit',
  'viral ai photo',
  'ultra realistic',
  'realistic portrait',
  'anime style',
  'professional headshot',
  'social media prompt',
  'creative workflow',
  'prompt template',
]

const SAFE_STOPWORDS = new Set([
  'with',
  'from',
  'that',
  'this',
  'your',
  'into',
  'using',
  'make',
  'create',
  'generate',
  'image',
  'photo',
  'prompt',
  'style',
  'high',
  'quality',
  'very',
  'real',
  'person',
  'young',
  'girl',
  'boy',
  'child',
  'teen',
  'minor',
])

const RISKY_TERMS = new Set([
  'nude',
  'naked',
  'nsfw',
  'explicit',
  'sexual',
  'sexy',
  'hot',
  'boudoir',
  'sensual',
  'cleavage',
  'bikini',
  'lingerie',
  'erotic',
])

function normalizeText(value: string | undefined) {
  return (value || '').replace(/\s+/g, ' ').trim()
}

function toTitleCase(value: string) {
  return value
    .toLowerCase()
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map(word => (word.length <= 3 ? word.toUpperCase() : word.charAt(0).toUpperCase() + word.slice(1)))
    .join(' ')
}

function compactSentence(value: string, maxLength: number) {
  const cleaned = normalizeText(value)
  if (cleaned.length <= maxLength) return cleaned
  const sliced = cleaned.slice(0, maxLength - 1)
  const lastBreak = Math.max(sliced.lastIndexOf('.'), sliced.lastIndexOf(','), sliced.lastIndexOf(' '))
  return `${sliced.slice(0, Math.max(48, lastBreak)).trim().replace(/[,.]+$/, '')}.`
}

function includesAny(source: string, keywords: string[]) {
  return keywords.some(keyword => source.includes(keyword))
}

function detectCategory(text: string, fallback?: PromptCategoryId): PromptCategoryId {
  const normalized = text.toLowerCase()
  const matched = CATEGORY_KEYWORDS.find(group => includesAny(normalized, group.keywords))
  return matched?.category || fallback || 'writing'
}

function detectModels(text: string, category: PromptCategoryId, fallback?: PromptModelId[]) {
  const normalized = text.toLowerCase()
  const matched = MODEL_KEYWORDS
    .filter(group => includesAny(normalized, group.keywords))
    .map(group => group.model)

  const defaults: PromptModelId[] =
    category === 'image-editing'
      ? ['ChatGPT', 'Gemini', 'Photoshop AI']
      : category === 'image-generation'
        ? ['ChatGPT', 'Midjourney', 'Flux']
        : category === 'coding' || category === 'research'
          ? ['ChatGPT', 'Claude', 'Gemini']
          : ['ChatGPT', 'Gemini']

  return Array.from(new Set([...(matched.length ? matched : fallback || []), ...defaults])).slice(0, 3)
}

function extractVariables(prompt: string): PromptVariable[] {
  const bracketMatches = Array.from(prompt.matchAll(/\[([A-Z0-9 _-]{2,48})\]/gi))
    .map(match => match[1]?.trim())
    .filter(Boolean)

  const variables = bracketMatches.map(name => ({
    name: String(name).toUpperCase().replace(/\s+/g, '_'),
    hint: `Replace ${String(name).toLowerCase()} with your own detail.`,
  }))

  return Array.from(new Map(variables.map(variable => [variable.name, variable])).values()).slice(0, 8)
}

function extractTags(text: string, category: PromptCategoryId, models: PromptModelId[]) {
  const normalized = text.toLowerCase()
  const phraseTags = PHRASE_TAGS.filter(tag => normalized.includes(tag.replace(' prompt', '')) || normalized.includes(tag))
  const words = normalized
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length >= 4 && !SAFE_STOPWORDS.has(word) && !RISKY_TERMS.has(word))

  const frequency = new Map<string, number>()
  for (const word of words) {
    frequency.set(word, (frequency.get(word) || 0) + 1)
  }

  const keywordTags = Array.from(frequency.entries())
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .map(([word]) => word)
    .slice(0, 8)

  const baseTags =
    category === 'image-generation' || category === 'image-editing'
      ? ['free ai prompt', 'ai image prompt', 'copy ready prompt']
      : ['free prompt', 'copy ready prompt', 'ai workflow']

  return Array.from(
    new Set([
      ...baseTags,
      ...models.map(model => `${model.toLowerCase()} prompt`),
      ...phraseTags,
      ...keywordTags,
    ]),
  )
    .filter(tag => !RISKY_TERMS.has(tag.toLowerCase()))
    .slice(0, 14)
}

function buildTitle(prompt: PromptSeoAutofillInput, text: string, category: PromptCategoryId) {
  const existing = normalizeText(prompt.title)
  if (existing) return existing

  const normalized = text.toLowerCase()
  const style = [
    'cinematic',
    'editorial',
    'fashion',
    'portrait',
    'product',
    'anime',
    'realistic',
    'luxury',
    'minimal',
    'instagram',
    'viral',
  ].filter(word => normalized.includes(word)).slice(0, 3)

  if (category === 'image-editing') {
    return `${toTitleCase(style.join(' ') || 'Viral Photo Edit')} AI Prompt`
  }

  if (category === 'image-generation') {
    return `${toTitleCase(style.join(' ') || 'Premium Image Generation')} AI Prompt`
  }

  const firstWords = normalizeText(text)
    .split(/\s+/)
    .filter(word => word.length > 2)
    .slice(0, 6)
    .join(' ')

  return `${toTitleCase(firstWords || 'Premium')} Prompt`
}

function buildVisualStyle(text: string, category: PromptCategoryId) {
  const normalized = text.toLowerCase()
  const cues = [
    'cinematic',
    'editorial',
    'minimal',
    'ultra realistic',
    'realistic',
    'studio',
    'fashion',
    'anime',
    'luxury',
    'dark moody',
    'soft lighting',
    'high contrast',
    'film grain',
  ].filter(cue => normalized.includes(cue))

  if (cues.length) return `${toTitleCase(cues.slice(0, 5).join(' '))} visual direction`
  if (category === 'image-editing') return 'Clean realistic AI photo editing workflow'
  if (category === 'image-generation') return 'Premium commercial AI image generation style'
  return 'Clean structured prompt workflow'
}

function buildSeoCopy({
  title,
  category,
  models,
  tags,
  prompt,
}: {
  title: string
  category: PromptCategoryId
  models: PromptModelId[]
  tags: string[]
  prompt: string
}) {
  const modelText = models.slice(0, 3).join(', ')
  const keywordText = tags.slice(0, 4).join(', ')
  const categoryNoun =
    category === 'image-editing'
      ? 'AI photo editing'
      : category === 'image-generation'
        ? 'AI image generation'
        : 'AI workflow'

  const summary = compactSentence(
    `A free copy-ready ${categoryNoun} prompt for ${modelText} that helps creators generate polished results faster.`,
    180,
  )

  const description = compactSentence(
    `${title} is a free prompt template built for ${categoryNoun}. Use it to create cleaner results with stronger direction, useful constraints, and practical output steps based on the main prompt: ${prompt}`,
    360,
  )

  const metaDescription = compactSentence(
    `Copy this free ${title.toLowerCase()} for ${modelText}. Includes SEO-friendly tags, workflow tips, and ready-to-use prompt structure for ${keywordText}.`,
    158,
  )

  return { summary, description, metaDescription }
}

function buildBestFor(category: PromptCategoryId, tags: string[]) {
  if (category === 'image-editing') {
    return ['AI photo edits', 'Instagram visuals', 'Creator workflows', 'Image retouching', 'Social media content']
  }
  if (category === 'image-generation') {
    return ['AI image generation', 'Prompt inspiration', 'Creative campaigns', 'Portrait concepts', 'Visual storytelling']
  }
  if (category === 'coding') return ['Developer workflows', 'Debugging', 'Code reviews', 'Technical planning']
  if (category === 'career') return ['Resume writing', 'Job applications', 'Interview prep', 'LinkedIn content']
  if (category === 'research') return ['Market research', 'Topic analysis', 'Content briefs', 'Decision support']

  return ['Content creation', 'Productivity', 'AI workflows', tags[0] || 'Prompt writing'].filter(Boolean)
}

function buildWorkflow(category: PromptCategoryId) {
  if (category === 'image-editing') {
    return ['Upload the source image if your AI tool supports image input.', 'Paste the prompt and replace any bracketed variables.', 'Generate a subtle version first, then create stronger variants.', 'Check realism, edges, text, and identity before exporting.']
  }
  if (category === 'image-generation') {
    return ['Copy the prompt into your preferred AI image generator.', 'Set the aspect ratio and quality mode for your use case.', 'Generate 3 to 5 variations and keep the strongest composition.', 'Refine subject, lighting, and background details if needed.']
  }

  return ['Copy the prompt.', 'Replace bracketed variables with your own context.', 'Run the prompt once, then ask for a tighter version.', 'Review the final output before publishing or using it.']
}

function buildTips(category: PromptCategoryId) {
  if (category === 'image-editing') {
    return ['Use clear source images for better identity and texture control.', 'Avoid overprocessing skin, shadows, and edges.', 'If text renders badly, generate without text and add it manually.', 'Keep prompts specific instead of adding too many style words.']
  }
  if (category === 'image-generation') {
    return ['Control composition and lighting before adding extra style terms.', 'Use one clear subject and one dominant mood.', 'Generate both subtle and bold variants.', 'Add negative constraints when outputs look generic or cluttered.']
  }

  return ['Add real context for better output quality.', 'Ask for a short version if the result is too long.', 'Request alternatives when tone or structure is not right.', 'Keep the final answer specific and usable.']
}

function buildRelatedSlugs(entry: Pick<PromptEntry, 'slug' | 'category' | 'tags'>, existingPrompts: PromptEntry[]) {
  const tagSet = new Set(entry.tags.map(tag => tag.toLowerCase()))

  return existingPrompts
    .filter(prompt => prompt.slug && prompt.slug !== entry.slug)
    .map(prompt => {
      const sharedTags = prompt.tags.filter(tag => tagSet.has(tag.toLowerCase())).length
      const sameCategory = prompt.category === entry.category ? 3 : 0
      return {
        slug: prompt.slug,
        score: sharedTags + sameCategory,
        title: prompt.title,
      }
    })
    .filter(item => item.score > 0)
    .sort((left, right) => right.score - left.score || left.title.localeCompare(right.title))
    .slice(0, 4)
    .map(item => item.slug)
}

export function buildPromptSeoAutofill({
  prompt,
  categories,
  existingPrompts,
}: {
  prompt: PromptSeoAutofillInput
  categories: PromptCategory[]
  existingPrompts: PromptEntry[]
}): { prompt: PromptEntry; insights: PromptSeoAutofillInsight[] } {
  const sourcePrompt = normalizeText(prompt.prompt)
  const sourceText = normalizeText([
    prompt.title,
    prompt.summary,
    prompt.description,
    prompt.subcategory,
    prompt.visualStyle,
    sourcePrompt,
  ].filter(Boolean).join(' '))

  if (!sourcePrompt) {
    throw new Error('Add the main prompt before generating SEO.')
  }

  if (!sourceText) {
    throw new Error('Add prompt content before generating SEO.')
  }

  const category = detectCategory(sourceText, prompt.category)
  const categoryTitle = categories.find(item => item.id === category)?.title || CATEGORY_LABELS[category]
  const models = detectModels(sourceText, category, prompt.models)
  const tags = extractTags(sourceText, category, models)
  const title = buildTitle(prompt, sourceText, category)
  const slug = slugify(prompt.slug || title)
  const visualStyle = prompt.visualStyle?.trim() || buildVisualStyle(sourceText, category)
  const { summary, description, metaDescription } = buildSeoCopy({
    title,
    category,
    models,
    tags,
    prompt: sourcePrompt || title,
  })
  const variables = prompt.variables?.length ? prompt.variables : extractVariables(sourcePrompt)
  const nextPrompt: PromptEntry = {
    id: prompt.id || `prompt-${slug}`,
    slug,
    title,
    seoTitle: compactSentence(prompt.seoTitle || `${title} - Free Copy Ready AI Prompt | mtverse`, 72),
    metaDescription: prompt.metaDescription?.trim() || metaDescription,
    summary: prompt.summary?.trim() || summary,
    description: prompt.description?.trim() || description,
    category,
    categoryTitle,
    subcategory: prompt.subcategory?.trim() || (category.startsWith('image') ? 'AI Visual Prompts' : 'Prompt Workflows'),
    models,
    tags,
    audience:
      prompt.audience?.trim() ||
      (category.startsWith('image')
        ? 'AI artists, creators, designers, marketers, and social media editors'
        : 'creators, operators, students, professionals, and AI power users'),
    visualStyle,
    previewImage: prompt.previewImage?.trim() || '',
    previewAlt: prompt.previewAlt?.trim() || `${title} preview image`,
    featured: prompt.featured ?? true,
    prompt: sourcePrompt,
    variables,
    bestFor: prompt.bestFor?.length ? prompt.bestFor : buildBestFor(category, tags),
    workflow: prompt.workflow?.length ? prompt.workflow : buildWorkflow(category),
    tips: prompt.tips?.length ? prompt.tips : buildTips(category),
    examples: prompt.examples?.length
      ? prompt.examples
      : [
          { label: 'Input', value: 'Paste the main prompt and replace any variables with your own details.' },
          { label: 'Output', value: 'A polished result aligned with the selected style, model, and workflow.' },
        ],
    relatedSlugs: prompt.relatedSlugs?.length
      ? prompt.relatedSlugs
      : buildRelatedSlugs({ slug, category, tags }, existingPrompts),
    updatedAt: new Date().toISOString().slice(0, 10),
  }

  return {
    prompt: nextPrompt,
    insights: [
      { label: 'Cost', value: 'Free local rules' },
      { label: 'Category', value: categoryTitle },
      { label: 'Models', value: models.join(', ') },
      { label: 'Tags', value: `${tags.length} SEO tags` },
    ],
  }
}
