import type { PromptCategoryId, PromptEntry, PromptModelId } from '@/lib/prompt-library-data'

export const PROMPTS_PUBLIC_PAGE_SIZE = 30

export function normalizePromptSearchParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value
}

export function normalizePromptQuery(value?: string | string[]) {
  return normalizePromptSearchParam(value)?.trim() || ''
}

function normalizeSearchText(value: string) {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function getSearchTokens(value: string) {
  return normalizeSearchText(value)
    .split(' ')
    .filter(token => token.length > 1)
}

export function resolvePromptCategory(value?: string): 'all' | PromptCategoryId {
  if (
    value === 'writing' ||
    value === 'work' ||
    value === 'coding' ||
    value === 'career' ||
    value === 'study' ||
    value === 'research' ||
    value === 'image-generation' ||
    value === 'image-editing'
  ) {
    return value
  }

  return 'all'
}

export function resolvePromptModel(value?: string): 'all' | PromptModelId {
  if (
    value === 'ChatGPT' ||
    value === 'Claude' ||
    value === 'Gemini' ||
    value === 'Midjourney' ||
    value === 'Flux' ||
    value === 'Photoshop AI'
  ) {
    return value
  }

  return 'all'
}

export function parsePromptPage(value?: string) {
  const numeric = Number.parseInt(value || '1', 10)
  if (!Number.isFinite(numeric) || numeric < 1) return 1
  return numeric
}

export function filterPrompts(
  prompts: PromptEntry[],
  filters: {
    category: 'all' | PromptCategoryId
    model: 'all' | PromptModelId
    query?: string
  }
) {
  const normalizedQuery = normalizeSearchText(filters.query || '')
  const queryTokens = getSearchTokens(filters.query || '')

  return prompts.filter(prompt => {
    if (filters.category !== 'all' && prompt.category !== filters.category) {
      return false
    }

    if (filters.model !== 'all' && !prompt.models.includes(filters.model)) {
      return false
    }

    if (normalizedQuery) {
      const haystack = [
        prompt.title,
        prompt.summary,
        prompt.description,
        prompt.prompt,
        prompt.visualStyle,
        prompt.categoryTitle,
        prompt.subcategory,
        ...prompt.tags,
        ...prompt.models,
        ...prompt.bestFor,
        ...prompt.workflow,
        ...prompt.tips,
      ]
        .join(' ')
      const normalizedHaystack = normalizeSearchText(haystack)

      if (
        !normalizedHaystack.includes(normalizedQuery) &&
        !queryTokens.every(token => normalizedHaystack.includes(token))
      ) {
        return false
      }
    }

    return true
  })
}

export function paginatePrompts(prompts: PromptEntry[], page: number, pageSize = PROMPTS_PUBLIC_PAGE_SIZE) {
  const totalPages = Math.max(1, Math.ceil(prompts.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const startIndex = (safePage - 1) * pageSize
  const endIndex = Math.min(startIndex + pageSize, prompts.length)

  return {
    items: prompts.slice(startIndex, endIndex),
    page: safePage,
    totalPages,
    startIndex,
    endIndex,
  }
}

