import 'server-only'

import { revalidatePath, revalidateTag } from 'next/cache'
import {
  PROMPT_CATEGORIES,
  PROMPT_MODELS,
  type PromptCategory,
  type PromptEntry,
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

  return {
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
    examples: Array.isArray(prompt.examples) ? prompt.examples : [],
    relatedSlugs: asStringArray(prompt.relatedSlugs),
    updatedAt: asString(prompt.updatedAt) || new Date().toISOString().slice(0, 10),
  }
}

function buildRelatedSlugs(entry: PromptEntry, prompts: PromptEntry[], limit = 4) {
  return prompts
    .filter(candidate => candidate.slug !== entry.slug)
    .map(candidate => {
      const sharedTags = candidate.tags.filter(tag => entry.tags.includes(tag)).length
      const sameCategory = candidate.category === entry.category ? 3 : 0
      const sameModel = candidate.models.some(model => entry.models.includes(model)) ? 1 : 0

      return {
        slug: candidate.slug,
        score: sharedTags + sameCategory + sameModel,
        title: candidate.title,
      }
    })
    .sort((left, right) => right.score - left.score || left.title.localeCompare(right.title))
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

export async function getPromptLibraryData(): Promise<PromptLibraryState> {
  if (promptLibraryCache && promptLibraryCache.expiresAt > Date.now()) {
    return promptLibraryCache.state
  }

  const entries = await getMergedLocalPromptEntries()
  const state = buildPromptLibraryState(entries)

  promptLibraryCache = {
    state,
    expiresAt: Date.now() + PROMPTS_MEMORY_CACHE_MS,
  }

  return state
}

export async function getPublishedPrompts() {
  return (await getPromptLibraryData()).prompts
}

export function isPromptIndexable(
  prompt: Pick<PromptEntry, 'slug' | 'title' | 'metaDescription' | 'prompt' | 'previewImage'>
) {
  return Boolean(
    prompt.slug &&
    prompt.title &&
    prompt.metaDescription &&
    prompt.prompt &&
    hasPublicPromptPreview(prompt.previewImage)
  )
}

export async function getAdminPrompts() {
  return (await getPromptLibraryData()).adminPrompts
}

export async function getPromptBySlug(slug: string) {
  const prompts = await getPublishedPrompts()
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
