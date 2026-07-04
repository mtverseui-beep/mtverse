import 'server-only'

import { buildPromptSeoAutofill, type PromptSeoAutofillInsight } from '@/lib/prompt-seo-autofill'
import type { PromptCategory, PromptCategoryId, PromptEntry } from '@/lib/prompt-library-data'

const GEMINI_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models'
const OPENROUTER_ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions'
const DEFAULT_GEMINI_MODEL = 'gemini-2.5-flash'
const DEFAULT_OPENROUTER_MODEL = 'openrouter/free'
const MAX_IMAGE_BYTES = 8 * 1024 * 1024

type AutofillProvider = 'local' | 'gemini' | 'openrouter'

type PromptAutofillInput = {
  prompt: Partial<PromptEntry>
  categories: PromptCategory[]
  existingPrompts: PromptEntry[]
}

type AiAutofillJson = Partial<Pick<
  PromptEntry,
  | 'title'
  | 'seoTitle'
  | 'metaDescription'
  | 'summary'
  | 'description'
  | 'category'
  | 'categoryTitle'
  | 'subcategory'
  | 'models'
  | 'tags'
  | 'audience'
  | 'visualStyle'
  | 'previewAlt'
  | 'variables'
  | 'bestFor'
  | 'workflow'
  | 'tips'
  | 'examples'
>>

function readEnv(value: string | undefined) {
  const trimmed = value?.trim()
  return trimmed || ''
}

function chooseProvider(): AutofillProvider {
  const configured = readEnv(process.env.ADMIN_AI_AUTOFILL_PROVIDER).toLowerCase()
  if (configured === 'local' || configured === 'gemini' || configured === 'openrouter') return configured
  if (readEnv(process.env.GEMINI_API_KEY)) return 'gemini'
  if (readEnv(process.env.OPENROUTER_API_KEY)) return 'openrouter'
  return 'local'
}

function buildJsonInstruction(prompt: Partial<PromptEntry>, categories: PromptCategory[]) {
  const categoryIds = categories.map(category => category.id).join(', ')
  const modelIds = ['ChatGPT', 'Claude', 'Gemini', 'Midjourney', 'Flux', 'Photoshop AI'].join(', ')

  return [
    'You are an admin assistant for mtverse.dev prompt library SEO.',
    'Analyze the preview image and main prompt, then return ONLY valid minified JSON with no markdown.',
    'Do not invent unsafe claims. Do not include pricing. Do not mention internal admin tools.',
    `Allowed category values: ${categoryIds}.`,
    `Allowed model values: ${modelIds}.`,
    'Required JSON keys: title, seoTitle, metaDescription, summary, description, category, subcategory, models, tags, audience, visualStyle, previewAlt, bestFor, workflow, tips, examples.',
    'Rules: title under 70 chars, seoTitle under 72 chars, metaDescription 120-160 chars, summary 1 sentence, description 2-4 sentences, tags 6-12 short SEO tags, bestFor/workflow/tips arrays 3-5 items, examples array with label/value objects.',
    'Keep the main prompt unchanged; do not return a prompt key.',
    `Existing draft title: ${prompt.title || ''}`,
    `Existing draft category: ${prompt.category || ''}`,
    `Main prompt: ${prompt.prompt || ''}`,
  ].join('\n')
}

function stripJsonFence(value: string) {
  return value
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/```$/i, '')
    .trim()
}

function parseAiJson(value: string): AiAutofillJson {
  const cleaned = stripJsonFence(value)
  const firstBrace = cleaned.indexOf('{')
  const lastBrace = cleaned.lastIndexOf('}')
  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    throw new Error('AI did not return a JSON object.')
  }
  return JSON.parse(cleaned.slice(firstBrace, lastBrace + 1)) as AiAutofillJson
}

function asString(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function asStringArray(value: unknown, limit = 12) {
  return Array.isArray(value)
    ? value.map(item => asString(item)).filter(Boolean).slice(0, limit)
    : []
}

function isPromptCategoryId(value: string, categories: PromptCategory[]): value is PromptCategoryId {
  return categories.some(category => category.id === value)
}

function sanitizeAiFields(ai: AiAutofillJson, categories: PromptCategory[]) {
  const allowedModels = new Set(['ChatGPT', 'Claude', 'Gemini', 'Midjourney', 'Flux', 'Photoshop AI'])
  const category = asString(ai.category)
  const models = asStringArray(ai.models, 6).filter(model => allowedModels.has(model)) as PromptEntry['models']
  const categoryEntry = isPromptCategoryId(category, categories) ? categories.find(item => item.id === category) : undefined

  return {
    title: asString(ai.title),
    seoTitle: asString(ai.seoTitle),
    metaDescription: asString(ai.metaDescription),
    summary: asString(ai.summary),
    description: asString(ai.description),
    category: categoryEntry?.id,
    categoryTitle: categoryEntry?.title,
    subcategory: asString(ai.subcategory),
    models,
    tags: asStringArray(ai.tags),
    audience: asString(ai.audience),
    visualStyle: asString(ai.visualStyle),
    previewAlt: asString(ai.previewAlt),
    bestFor: asStringArray(ai.bestFor, 5),
    workflow: asStringArray(ai.workflow, 5),
    tips: asStringArray(ai.tips, 5),
    examples: Array.isArray(ai.examples)
      ? ai.examples
          .map(example => {
            const record = example as { label?: unknown; value?: unknown }
            const label = asString(record.label)
            const value = asString(record.value)
            return label && value ? { label, value } : null
          })
          .filter((example): example is { label: string; value: string } => Boolean(example))
          .slice(0, 4)
      : [],
  }
}

function mergeAiIntoPrompt(basePrompt: PromptEntry, ai: AiAutofillJson, categories: PromptCategory[]) {
  const fields = sanitizeAiFields(ai, categories)
  return {
    ...basePrompt,
    title: fields.title || basePrompt.title,
    seoTitle: fields.seoTitle || basePrompt.seoTitle,
    metaDescription: fields.metaDescription || basePrompt.metaDescription,
    summary: fields.summary || basePrompt.summary,
    description: fields.description || basePrompt.description,
    category: fields.category || basePrompt.category,
    categoryTitle: fields.categoryTitle || basePrompt.categoryTitle,
    subcategory: fields.subcategory || basePrompt.subcategory,
    models: fields.models.length ? fields.models : basePrompt.models,
    tags: fields.tags.length ? fields.tags : basePrompt.tags,
    audience: fields.audience || basePrompt.audience,
    visualStyle: fields.visualStyle || basePrompt.visualStyle,
    previewAlt: fields.previewAlt || basePrompt.previewAlt,
    bestFor: fields.bestFor.length ? fields.bestFor : basePrompt.bestFor,
    workflow: fields.workflow.length ? fields.workflow : basePrompt.workflow,
    tips: fields.tips.length ? fields.tips : basePrompt.tips,
    examples: fields.examples.length ? fields.examples : basePrompt.examples,
    updatedAt: new Date().toISOString().slice(0, 10),
  }
}

async function fetchImageAsBase64(imageUrl: string) {
  if (!/^https:\/\//i.test(imageUrl)) return null

  const response = await fetch(imageUrl, { cache: 'no-store' })
  if (!response.ok) return null

  const contentType = response.headers.get('content-type') || 'image/jpeg'
  if (!contentType.startsWith('image/')) return null

  const bytes = Buffer.from(await response.arrayBuffer())
  if (bytes.byteLength > MAX_IMAGE_BYTES) return null

  return {
    mimeType: contentType.split(';')[0] || 'image/jpeg',
    data: bytes.toString('base64'),
  }
}

async function callGemini(prompt: Partial<PromptEntry>, categories: PromptCategory[]) {
  const apiKey = readEnv(process.env.GEMINI_API_KEY)
  if (!apiKey) throw new Error('GEMINI_API_KEY is not configured.')

  const model = readEnv(process.env.ADMIN_AI_AUTOFILL_MODEL) || DEFAULT_GEMINI_MODEL
  const image = await fetchImageAsBase64(asString(prompt.previewImage))
  const parts: Array<Record<string, unknown>> = [{ text: buildJsonInstruction(prompt, categories) }]

  if (image) {
    parts.push({ inlineData: { mimeType: image.mimeType, data: image.data } })
  }

  const response = await fetch(`${GEMINI_ENDPOINT}/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts }],
      generationConfig: {
        temperature: 0.25,
        responseMimeType: 'application/json',
      },
    }),
  })

  const payload = await response.json().catch(() => null) as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>; error?: { message?: string } } | null
  if (!response.ok) throw new Error(payload?.error?.message || `Gemini autofill failed with ${response.status}.`)

  const text = payload?.candidates?.[0]?.content?.parts?.map(part => part.text || '').join('\n').trim()
  if (!text) throw new Error('Gemini returned an empty autofill response.')
  return parseAiJson(text)
}

async function callOpenRouter(prompt: Partial<PromptEntry>, categories: PromptCategory[]) {
  const apiKey = readEnv(process.env.OPENROUTER_API_KEY)
  if (!apiKey) throw new Error('OPENROUTER_API_KEY is not configured.')

  const model = readEnv(process.env.OPENROUTER_AUTOFILL_MODEL) || DEFAULT_OPENROUTER_MODEL
  const content: Array<Record<string, unknown>> = [
    { type: 'text', text: buildJsonInstruction(prompt, categories) },
  ]

  const imageUrl = asString(prompt.previewImage)
  if (/^https:\/\//i.test(imageUrl)) {
    content.push({ type: 'image_url', image_url: { url: imageUrl } })
  }

  const response = await fetch(OPENROUTER_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'https://www.mtverse.dev',
      'X-Title': 'mtverse Admin Prompt Autofill',
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content }],
      temperature: 0.25,
      response_format: { type: 'json_object' },
    }),
  })

  const payload = await response.json().catch(() => null) as { choices?: Array<{ message?: { content?: string } }>; error?: { message?: string } } | null
  if (!response.ok) throw new Error(payload?.error?.message || `OpenRouter autofill failed with ${response.status}.`)

  const text = payload?.choices?.[0]?.message?.content?.trim()
  if (!text) throw new Error('OpenRouter returned an empty autofill response.')
  return parseAiJson(text)
}

export async function buildAdminPromptAutofill({ prompt, categories, existingPrompts }: PromptAutofillInput): Promise<{
  prompt: PromptEntry
  insights: PromptSeoAutofillInsight[]
  provider: AutofillProvider
}> {
  const local = buildPromptSeoAutofill({ prompt, categories, existingPrompts })
  const provider = chooseProvider()

  if (provider === 'local') {
    return { ...local, provider }
  }

  try {
    const ai = provider === 'gemini'
      ? await callGemini(prompt, categories)
      : await callOpenRouter(prompt, categories)
    const merged = mergeAiIntoPrompt(local.prompt, ai, categories)

    return {
      prompt: merged,
      provider,
      insights: [
        { label: 'AI', value: provider === 'gemini' ? 'Gemini autofill' : 'OpenRouter autofill' },
        { label: 'Category', value: merged.categoryTitle },
        { label: 'Models', value: merged.models.join(', ') },
        { label: 'Tags', value: `${merged.tags.length} SEO tags` },
      ],
    }
  } catch (error) {
    return {
      ...local,
      provider: 'local',
      insights: [
        { label: 'AI fallback', value: error instanceof Error ? error.message.slice(0, 80) : 'AI unavailable' },
        ...local.insights.slice(1),
      ],
    }
  }
}