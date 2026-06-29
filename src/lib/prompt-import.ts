import type {
  PromptCategoryId,
  PromptEntry,
  PromptExample,
  PromptModelId,
  PromptVariable,
} from '@/lib/prompt-library-data'
import { slugify } from '@/lib/utils'

const VALID_CATEGORIES: PromptCategoryId[] = [
  'writing',
  'work',
  'coding',
  'career',
  'study',
  'research',
  'image-generation',
  'image-editing',
]

const VALID_MODELS: PromptModelId[] = [
  'ChatGPT',
  'Claude',
  'Gemini',
  'Midjourney',
  'Flux',
  'Photoshop AI',
]

function normalizeTopicKey(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}

function asString(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function asStringArray(value: unknown) {
  return Array.isArray(value) ? value.map(asString).filter(Boolean) : []
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

function uniqueStrings(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)))
}

function isPromptCategory(value: string): value is PromptCategoryId {
  return VALID_CATEGORIES.includes(value as PromptCategoryId)
}

function isPromptModel(value: string): value is PromptModelId {
  return VALID_MODELS.includes(value as PromptModelId)
}

function parseVariables(value: unknown): PromptVariable[] {
  if (!Array.isArray(value)) return []

  return value
    .map(entry => {
      const record = entry as { name?: unknown; hint?: unknown }
      const name = asString(record?.name)
      const hint = asString(record?.hint)
      if (!name || !hint) return null
      return { name, hint }
    })
    .filter((entry): entry is PromptVariable => Boolean(entry))
}

function parseExamples(value: unknown): PromptExample[] {
  if (!Array.isArray(value)) return []

  return value
    .map(entry => {
      const record = entry as { label?: unknown; value?: unknown }
      const label = asString(record?.label)
      const exampleValue = asString(record?.value)
      if (!label || !exampleValue) return null
      return { label, value: exampleValue }
    })
    .filter((entry): entry is PromptExample => Boolean(entry))
}

function buildSeoTitle(title: string, models: PromptModelId[]) {
  return `${title} Prompt - ${models.join(', ')}`
}

function normalizePromptRecord(raw: unknown): PromptEntry | null {
  if (!raw || typeof raw !== 'object') return null

  const record = raw as Record<string, unknown>
  const title = asString(record.title)
  const prompt = asString(record.prompt)
  if (!title || !prompt) return null

  const category = isPromptCategory(asString(record.category)) ? (asString(record.category) as PromptCategoryId) : 'writing'
  const models = uniqueStrings(asStringArray(record.models)).filter(isPromptModel) as PromptModelId[]
  const normalizedModels: PromptModelId[] = models.length > 0 ? models : ['ChatGPT']
  const slug = slugify(asString(record.slug) || title)
  const summary = asString(record.summary) || asString(record.description) || 'Premium prompt entry.'
  const description = asString(record.description) || summary
  const updatedAt = asString(record.updatedAt) || new Date().toISOString().slice(0, 10)
  const previewWidth = asPositiveInteger(record.previewWidth)
  const previewHeight = asPositiveInteger(record.previewHeight)

  return {
    id: asString(record.id) || `prompt-${slug}`,
    slug,
    title,
    seoTitle: asString(record.seoTitle) || buildSeoTitle(title, normalizedModels),
    metaDescription: asString(record.metaDescription) || description,
    summary,
    description,
    category,
    categoryTitle: asString(record.categoryTitle),
    subcategory: asString(record.subcategory) || 'General',
    models: normalizedModels,
    tags: uniqueStrings(asStringArray(record.tags)),
    audience: asString(record.audience) || 'builders and creators',
    visualStyle: asString(record.visualStyle) || 'Premium prompt layout',
    previewImage: asString(record.previewImage),
    previewAlt: asString(record.previewAlt) || title,
    previewWidth,
    previewHeight,
    featured: Boolean(record.featured),
    prompt,
    variables: parseVariables(record.variables),
    bestFor: uniqueStrings(asStringArray(record.bestFor)),
    workflow: uniqueStrings(asStringArray(record.workflow)),
    tips: uniqueStrings(asStringArray(record.tips)),
    examples: parseExamples(record.examples),
    relatedSlugs: uniqueStrings(asStringArray(record.relatedSlugs)),
    updatedAt,
  }
}

export type PromptImportSummary = {
  received: number
  prepared: number
  imported: number
  skippedExisting: number
  skippedIncomingDuplicates: number
  invalid: number
  replaceExisting: boolean
}

export function parsePromptImportPayload(
  payload: unknown,
  existingPrompts: PromptEntry[],
  options?: {
    replaceExisting?: boolean
  }
) {
  const replaceExisting = Boolean(options?.replaceExisting)
  const source = Array.isArray(payload)
    ? payload
    : Array.isArray((payload as { prompts?: unknown })?.prompts)
      ? ((payload as { prompts: unknown[] }).prompts)
      : []

  const existingKeys = new Set(
    existingPrompts.flatMap(prompt => [prompt.slug, normalizeTopicKey(prompt.title)]).filter(Boolean)
  )
  const incomingKeys = new Set<string>()

  const prompts: PromptEntry[] = []
  let invalid = 0
  let skippedExisting = 0
  let skippedIncomingDuplicates = 0

  for (const entry of source) {
    const normalized = normalizePromptRecord(entry)

    if (!normalized) {
      invalid += 1
      continue
    }

    const titleKey = normalizeTopicKey(normalized.title)
    const matchKeys = [normalized.slug, titleKey].filter(Boolean)

    if (matchKeys.some(key => incomingKeys.has(key))) {
      skippedIncomingDuplicates += 1
      continue
    }

    const exists = matchKeys.some(key => existingKeys.has(key))
    if (exists && !replaceExisting) {
      skippedExisting += 1
      continue
    }

    matchKeys.forEach(key => incomingKeys.add(key))
    prompts.push(normalized)
  }

  return {
    prompts,
    summary: {
      received: source.length,
      prepared: prompts.length,
      imported: prompts.length,
      skippedExisting,
      skippedIncomingDuplicates,
      invalid,
      replaceExisting,
    } satisfies PromptImportSummary,
  }
}
