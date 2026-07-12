import 'server-only'

import { revalidatePath, revalidateTag } from 'next/cache'
import {
  PROMPT_CATEGORIES,
  PROMPT_MODELS,
  type PromptCategory,
  type PromptEntry,
  type PromptExample,
  type PromptModelId,
} from '@/lib/prompt-library-data'
import { getPromptPreviewDefault, isPromptPlaceholderPreview } from '@/lib/prompt-preview-images'
import {
  deleteLocalPrompt,
  getMergedLocalPromptEntries,
  hasRuntimePromptStore,
  saveLocalPrompt,
  saveLocalPrompts,
  type PromptDeleteTarget,
} from '@/lib/prompt-local-store'
import { buildPromptSeoAutofill } from '@/lib/prompt-seo-autofill'
import { isCloudflarePromptImageUrl } from '@/lib/prompt-image-hosts'
import { slugify } from '@/lib/utils'

const PROMPTS_TAG = 'prompts'
const PROMPTS_MEMORY_CACHE_MS = process.env.NODE_ENV === 'development' ? 0 : 5 * 60 * 1000
const FORCED_PROMPT_DETAILS: Record<
  string,
  {
    title: string
    category: PromptCategory['id']
    categoryTitle: string
    subcategory: string
    previewImage: string
    previewAlt: string
  }
> = {
  'minimalist-dual-identity-studio-portrait': {
    title: 'Minimalist Dual-Identity Studio Portrait',
    category: 'image-generation',
    categoryTitle: 'Image Generation Prompts',
    subcategory: 'Portrait Prompts',
    previewImage: 'https://pub-59d1b450736b455084e9eebc2ed27f14.r2.dev/prompt-previews/approved-prompts/minimalist-dual-identity-studio-portrait.jpg',
    previewAlt: 'Minimalist dual-identity studio portrait prompt preview with paper-cut profile wall art',
  },
  'nighttime-car-portrait-red-haired-woman': {
    title: 'Nighttime Car Portrait of a Red-Haired Woman',
    category: 'image-generation',
    categoryTitle: 'Image Generation Prompts',
    subcategory: 'Night Portrait Prompts',
    previewImage: 'https://pub-59d1b450736b455084e9eebc2ed27f14.r2.dev/prompt-previews/approved-prompts/nighttime-car-portrait-red-haired-woman.jpg',
    previewAlt: 'Nighttime car portrait of a red-haired woman prompt preview',
  },
  'ultra-realistic-night-car-candid-photography': {
    title: 'Ultra-Realistic Night Car Candid Photography',
    category: 'image-generation',
    categoryTitle: 'Image Generation Prompts',
    subcategory: 'Night Portrait Prompts',
    previewImage: 'https://pub-59d1b450736b455084e9eebc2ed27f14.r2.dev/prompt-previews/approved-prompts/ultra-realistic-night-car-candid-photography.jpg',
    previewAlt: 'Ultra-realistic night car candid photography prompt preview',
  },
}

let promptLibraryCache:
  | {
      state: PromptLibraryState
      expiresAt: number
    }
  | null = null

type PromptLibraryState = {
  prompts: PromptEntry[]
  adminPrompts: PromptEntry[]
  featuredPrompts: PromptEntry[]
  categories: PromptCategory[]
  models: PromptModelId[]
  stats: {
    totalPrompts: number
    imagePrompts: number
    featuredPrompts: number
  }
}

function asString(value: unknown) {
  return typeof value === 'string' ? value : ''
}

function asStringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === 'string') : []
}

function asPromptExamples(value: unknown): PromptExample[] {
  if (!Array.isArray(value)) return []

  return value.flatMap(entry => {
    if (!entry || typeof entry !== 'object') return []
    const record = entry as Record<string, unknown>
    const label = asString(record.label) || asString(record.title)
    const exampleValue = asString(record.value) || asString(record.prompt) || asString(record.output)

    if (!label || !exampleValue) return []

    return [{ label, value: exampleValue }]
  })
}

function asPositiveInteger(value: unknown) {
  const numberValue = typeof value === 'number'
    ? value
    : typeof value === 'string'
      ? Number.parseInt(value, 10)
      : NaN

  if (!Number.isFinite(numberValue) || numberValue <= 0) return undefined
  return Math.round(numberValue)
}

function normalizeTopic(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}

function normalizePromptBody(value: string) {
  return value.toLowerCase().replace(/\s+/g, ' ').trim()
}

function countWords(value: string) {
  return normalizePromptBody(value).split(/\s+/).filter(Boolean).length
}

function isUsefulText(value: string, minLength = 1) {
  const normalized = normalizePromptBody(value)
  return normalized.length >= minLength && normalized !== 'premium prompt entry.'
}

export function validatePromptEntryInput(prompt: PromptEntry) {
  const title = asString(prompt?.title).trim()
  const rawSlug = asString(prompt?.slug).trim()
  const slug = slugify(rawSlug || title)
  const promptBody = normalizePromptBody(asString(prompt?.prompt))
  const models = Array.isArray(prompt?.models) ? prompt.models.filter(Boolean) : []
  const category = asString(prompt?.category)

  if (!title) return 'Prompt title is required before saving.'
  if (!slug) return 'Prompt slug is required before saving.'
  if (!promptBody) return 'Main prompt text is required before saving.'
  if (promptBody.length < 20) return 'Main prompt text is too short to publish.'
  if (!PROMPT_CATEGORIES.some(entry => entry.id === category)) return 'Choose a valid prompt category before saving.'
  if (models.length === 0) return 'Choose at least one AI model before saving.'
  if (!isCloudflarePromptImageUrl(asString(prompt?.previewImage))) {
    return 'Prompt preview image must be uploaded to Cloudflare R2 before saving.'
  }

  return ''
}

function normalizePreviewImageUrl(value: string) {
  return value
}

function getPromptMatchKey(prompt: PromptEntry) {
  return prompt.slug || normalizeTopic(prompt.title)
}

function hasPublicPromptPreview(value: string) {
  return isCloudflarePromptImageUrl(value)
}

function sortPrompts(prompts: PromptEntry[]) {
  return [...prompts].sort((left, right) => {
    if (left.featured !== right.featured) {
      return left.featured ? -1 : 1
    }

    return left.title.localeCompare(right.title)
  })
}

function sortAdminPrompts(prompts: PromptEntry[]) {
  return [...prompts].sort((left, right) => {
    const rightTime = Date.parse(right.updatedAt)
    const leftTime = Date.parse(left.updatedAt)
    const safeRightTime = Number.isFinite(rightTime) ? rightTime : 0
    const safeLeftTime = Number.isFinite(leftTime) ? leftTime : 0

    if (safeRightTime !== safeLeftTime) {
      return safeRightTime - safeLeftTime
    }

    return right.title.localeCompare(left.title)
  })
}

function withPromptSeoFallbacks(prompt: PromptEntry): PromptEntry {
  const needsAutofill =
    !isUsefulText(prompt.seoTitle, 24) ||
    !isUsefulText(prompt.metaDescription, 90) ||
    !isUsefulText(prompt.summary, 80) ||
    !isUsefulText(prompt.description, 140) ||
    !isUsefulText(prompt.audience, 20) ||
    !isUsefulText(prompt.visualStyle, 20) ||
    prompt.tags.length < 5 ||
    prompt.bestFor.length < 3 ||
    prompt.workflow.length < 3 ||
    prompt.tips.length < 2 ||
    prompt.examples.length < 2

  if (!needsAutofill || !isUsefulText(prompt.prompt, 20)) return prompt

  try {
    const generated = buildPromptSeoAutofill({
      prompt,
      categories: PROMPT_CATEGORIES,
      existingPrompts: [],
    }).prompt

    return {
      ...prompt,
      seoTitle: isUsefulText(prompt.seoTitle, 24) ? prompt.seoTitle : generated.seoTitle,
      metaDescription: isUsefulText(prompt.metaDescription, 90) ? prompt.metaDescription : generated.metaDescription,
      summary: isUsefulText(prompt.summary, 80) ? prompt.summary : generated.summary,
      description: isUsefulText(prompt.description, 140) ? prompt.description : generated.description,
      tags: prompt.tags.length >= 5 ? prompt.tags : generated.tags,
      audience: isUsefulText(prompt.audience, 20) ? prompt.audience : generated.audience,
      visualStyle: isUsefulText(prompt.visualStyle, 20) ? prompt.visualStyle : generated.visualStyle,
      previewAlt: isUsefulText(prompt.previewAlt, 20) ? prompt.previewAlt : generated.previewAlt,
      bestFor: prompt.bestFor.length >= 3 ? prompt.bestFor : generated.bestFor,
      workflow: prompt.workflow.length >= 3 ? prompt.workflow : generated.workflow,
      tips: prompt.tips.length >= 2 ? prompt.tips : generated.tips,
      examples: prompt.examples.length >= 2 ? prompt.examples : generated.examples,
    }
  } catch {
    return prompt
  }
}

function normalizePromptEntry(prompt: PromptEntry): PromptEntry {
  const fallbackPreview = getPromptPreviewDefault(prompt.category)
  const previewImage = normalizePreviewImageUrl(asString(prompt.previewImage))
  const previewWidth = asPositiveInteger(prompt.previewWidth)
  const previewHeight = asPositiveInteger(prompt.previewHeight)
  const title = asString(prompt.title) || 'Untitled prompt'
  const fallbackSlugSource =
    asString(prompt.slug) ||
    title ||
    asString(prompt.id) ||
    normalizePromptBody(asString(prompt.prompt)).slice(0, 80)
  const slug = slugify(fallbackSlugSource) || `prompt-${asString(prompt.id) || 'entry'}`
  const forcedDetails = FORCED_PROMPT_DETAILS[slug]
  const resolvedTitle = forcedDetails?.title || title

  const normalizedPrompt = {
    ...prompt,
    id: asString(prompt.id) || `prompt-${slug}`,
    slug,
    title: resolvedTitle,
    seoTitle: forcedDetails ? `${forcedDetails.title} Prompt` : asString(prompt.seoTitle) || title,
    metaDescription: asString(prompt.metaDescription) || asString(prompt.description) || asString(prompt.summary),
    summary: asString(prompt.summary) || asString(prompt.description) || 'Premium prompt entry.',
    description: asString(prompt.description) || asString(prompt.summary) || 'Premium prompt entry.',
    category: forcedDetails?.category || prompt.category,
    categoryTitle: forcedDetails?.categoryTitle || PROMPT_CATEGORIES.find(category => category.id === prompt.category)?.title || 'mtverse',
    subcategory: forcedDetails?.subcategory || asString(prompt.subcategory) || 'General',
    tags: asStringArray(prompt.tags),
    audience: asString(prompt.audience) || 'builders and creators',
    visualStyle: asString(prompt.visualStyle) || 'Premium prompt workflow',
    previewImage:
      forcedDetails?.previewImage ||
      (!previewImage || isPromptPlaceholderPreview(previewImage)
        ? fallbackPreview.src
        : previewImage),
    previewAlt: forcedDetails?.previewAlt || asString(prompt.previewAlt) || fallbackPreview.alt,
    previewWidth,
    previewHeight,
    featured: Boolean(prompt.featured),
    prompt: asString(prompt.prompt),
    variables: Array.isArray(prompt.variables) ? prompt.variables : [],
    bestFor: asStringArray(prompt.bestFor),
    workflow: asStringArray(prompt.workflow),
    tips: asStringArray(prompt.tips),
    examples: asPromptExamples(prompt.examples),
    relatedSlugs: asStringArray(prompt.relatedSlugs),
    updatedAt: asString(prompt.updatedAt) || new Date().toISOString().slice(0, 10),
  }

  return withPromptSeoFallbacks(normalizedPrompt)
}

function stableRelatedHash(value: string) {
  let hash = 2166136261

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }

  return hash >>> 0
}

function normalizeRelatedToken(value: string) {
  return value.trim().toLowerCase()
}

function countSharedTokens(left: string[], right: string[]) {
  if (!left.length || !right.length) return 0

  const rightTokens = new Set(right.map(normalizeRelatedToken).filter(Boolean))
  return left.reduce((count, token) => count + (rightTokens.has(normalizeRelatedToken(token)) ? 1 : 0), 0)
}

function buildRelatedSlugs(entry: PromptEntry, prompts: PromptEntry[], limit = 4) {
  return prompts
    .filter(candidate => candidate.slug !== entry.slug)
    .map(candidate => {
      const sharedTags = countSharedTokens(entry.tags, candidate.tags)
      const sharedBestFor = countSharedTokens(entry.bestFor, candidate.bestFor)
      const sameCategory = candidate.category === entry.category ? 4 : 0
      const sameSubcategory = normalizeRelatedToken(candidate.subcategory) === normalizeRelatedToken(entry.subcategory) ? 5 : 0
      const sameVisualStyle = normalizeRelatedToken(candidate.visualStyle) === normalizeRelatedToken(entry.visualStyle) ? 2 : 0
      const sameAudience = normalizeRelatedToken(candidate.audience) === normalizeRelatedToken(entry.audience) ? 1 : 0
      const sameModel = candidate.models.some(model => entry.models.includes(model)) ? 2 : 0

      return {
        slug: candidate.slug,
        score: (sharedTags * 6) + (sharedBestFor * 3) + sameSubcategory + sameCategory + sameModel + sameVisualStyle + sameAudience,
        rank: stableRelatedHash(`${entry.slug}:${candidate.slug}`),
        title: candidate.title,
      }
    })
    .sort((left, right) => right.score - left.score || left.rank - right.rank || left.title.localeCompare(right.title))
    .slice(0, limit)
    .map(candidate => candidate.slug)
}

function dedupePromptEntries(entries: PromptEntry[]) {
  const selected: PromptEntry[] = []
  const idMap = new Map<string, number>()
  const slugMap = new Map<string, number>()
  const promptMap = new Map<string, number>()

  for (const entry of entries) {
    const idKey = entry.id.trim().toLowerCase()
    const slugKey = entry.slug.trim().toLowerCase()
    const promptKey = normalizePromptBody(entry.prompt)
    const existingIndex = [
      idKey ? idMap.get(idKey) : undefined,
      slugKey ? slugMap.get(slugKey) : undefined,
      promptKey ? promptMap.get(promptKey) : undefined,
    ].find(
      value => typeof value === 'number'
    )

    if (typeof existingIndex !== 'number') {
      const nextIndex = selected.push(entry) - 1
      if (idKey) idMap.set(idKey, nextIndex)
      if (slugKey) slugMap.set(slugKey, nextIndex)
      if (promptKey) promptMap.set(promptKey, nextIndex)
      continue
    }

    const existing = selected[existingIndex]
    const shouldReplace =
      Number(Boolean(entry.featured)) > Number(Boolean(existing.featured)) ||
      entry.updatedAt > existing.updatedAt ||
      (entry.previewImage.startsWith('http') && !existing.previewImage.startsWith('http'))

    if (shouldReplace) {
      selected[existingIndex] = entry
      if (idKey) idMap.set(idKey, existingIndex)
      if (slugKey) slugMap.set(slugKey, existingIndex)
      if (promptKey) promptMap.set(promptKey, existingIndex)
    }
  }

  return selected
}

function buildPromptLibraryState(entries: PromptEntry[]): PromptLibraryState {
  const normalized = sortPrompts(dedupePromptEntries(entries.map(normalizePromptEntry)))
  const publicPrompts = normalized.filter(entry => hasPublicPromptPreview(entry.previewImage))
  const prompts = normalized
  const featuredPrompts = publicPrompts.filter(entry => entry.featured)
  const categories = PROMPT_CATEGORIES.map(category => ({
    ...category,
    count: publicPrompts.filter(prompt => prompt.category === category.id).length,
  }))

  return {
    prompts: publicPrompts,
    adminPrompts: sortAdminPrompts(prompts),
    featuredPrompts,
    categories,
    models: PROMPT_MODELS,
    stats: {
      totalPrompts: publicPrompts.length,
      imagePrompts: publicPrompts.filter(prompt => prompt.category.startsWith('image')).length,
      featuredPrompts: featuredPrompts.length,
    },
  }
}

function resetPromptCache() {
  promptLibraryCache = null
}

function revalidatePromptSurfaces(prompts: Pick<PromptEntry, 'slug'>[] = []) {
  revalidateTag(PROMPTS_TAG, { expire: 0 })
  revalidatePath('/')
  revalidatePath('/prompts')
  revalidatePath('/admin/prompts')

  for (const prompt of prompts.slice(0, 50)) {
    if (prompt.slug) revalidatePath(`/prompts/${prompt.slug}`)
  }
}

function assertWritableLocalPromptStore() {
  if (!hasRuntimePromptStore()) {
    throw new Error(
      'mtverse admin writes need UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN on Vercel, or must be run locally where data files are writable.'
    )
  }
}

export async function getPromptLibraryData(options: { noStore?: boolean } = {}): Promise<PromptLibraryState> {
  if (!options.noStore && promptLibraryCache && promptLibraryCache.expiresAt > Date.now()) {
    return promptLibraryCache.state
  }

  const entries = await getMergedLocalPromptEntries({ noStore: options.noStore })
  const state = buildPromptLibraryState(entries)

  if (!options.noStore) {
    promptLibraryCache = {
      state,
      expiresAt: Date.now() + PROMPTS_MEMORY_CACHE_MS,
    }
  }

  return state
}

export async function getPublishedPrompts(options: { noStore?: boolean } = {}) {
  return (await getPromptLibraryData(options)).prompts
}

const INDEXABLE_PROMPT_SLUGS = new Set([
  'royal-blue-velvet-saree-vogue-portrait',
])

export function isPromptIndexable(
  prompt: Pick<
    PromptEntry,
    | 'slug'
    | 'title'
    | 'metaDescription'
    | 'summary'
    | 'description'
    | 'prompt'
    | 'previewImage'
    | 'previewAlt'
    | 'models'
    | 'tags'
    | 'bestFor'
    | 'workflow'
    | 'tips'
  >
) {
  return Boolean(
    INDEXABLE_PROMPT_SLUGS.has(prompt.slug) &&
    prompt.slug &&
    prompt.title &&
    isUsefulText(prompt.metaDescription, 90) &&
    isUsefulText(prompt.summary, 80) &&
    isUsefulText(prompt.description, 140) &&
    countWords(prompt.prompt) >= 8 &&
    isUsefulText(prompt.previewAlt, 16) &&
    prompt.models.length >= 1 &&
    prompt.tags.length >= 4 &&
    prompt.bestFor.length >= 3 &&
    prompt.workflow.length >= 3 &&
    prompt.tips.length >= 2 &&
    hasPublicPromptPreview(prompt.previewImage)
  )
}

export async function getAdminPrompts(options: { noStore?: boolean } = {}) {
  return (await getPromptLibraryData(options)).adminPrompts
}

export async function getPromptBySlug(slug: string, options: { noStore?: boolean } = {}) {
  const prompts = await getPublishedPrompts(options)
  return prompts.find(prompt => prompt.slug === slug) || null
}

export async function getRelatedPrompts(slug: string, limit = 4) {
  const prompts = await getPublishedPrompts()
  const prompt = prompts.find(entry => entry.slug === slug)

  if (!prompt) return []

  const relatedSlugs = [
    ...prompt.relatedSlugs,
    ...buildRelatedSlugs(prompt, prompts, limit + prompt.relatedSlugs.length),
  ]
  const seenSlugs = new Set<string>()

  return relatedSlugs
    .filter(relatedSlug => {
      if (relatedSlug === prompt.slug || seenSlugs.has(relatedSlug)) return false
      seenSlugs.add(relatedSlug)
      return true
    })
    .map(relatedSlug => prompts.find(entry => entry.slug === relatedSlug) || null)
    .filter((entry): entry is PromptEntry => Boolean(entry))
    .slice(0, limit)
}

export async function savePrompt(input: PromptEntry) {
  assertWritableLocalPromptStore()
  const validationError = validatePromptEntryInput(input)
  if (validationError) throw new Error(validationError)
  const prompt = normalizePromptEntry(input)
  await saveLocalPrompt(prompt)
  resetPromptCache()
  revalidatePromptSurfaces([prompt])
  return prompt
}

export async function savePrompts(inputs: PromptEntry[]) {
  assertWritableLocalPromptStore()
  const prompts = inputs.map(normalizePromptEntry)
  await saveLocalPrompts(prompts)
  resetPromptCache()
  revalidatePromptSurfaces(prompts)
  return { success: true, count: prompts.length }
}

export async function deletePrompt(target: PromptDeleteTarget) {
  assertWritableLocalPromptStore()
  const result = await deleteLocalPrompt(target)
  resetPromptCache()
  revalidatePromptSurfaces([{ slug: target.slug || '' }])
  return result
}
