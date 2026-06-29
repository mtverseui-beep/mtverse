import type { PromptCategoryId, PromptEntry, PromptModelId } from '@/lib/prompt-library-data'

export type PromptSortMode = 'featured' | 'hot' | 'new' | 'top' | 'shuffle'

export type PromptHubSortableEntry = Pick<
  PromptEntry,
  | 'slug'
  | 'title'
  | 'previewImage'
  | 'category'
  | 'subcategory'
  | 'visualStyle'
  | 'tags'
  | 'bestFor'
  | 'models'
  | 'featured'
  | 'updatedAt'
>

export type PromptHubFilterState = {
  category?: 'all' | PromptCategoryId
  model?: 'all' | PromptModelId
  query?: string
  sort?: PromptSortMode
  seed?: string
}

export function buildPromptHref({
  category,
  model,
  query,
  sort,
  seed,
  page,
  take,
}: PromptHubFilterState & { page?: number; take?: number }) {
  const params = new URLSearchParams()
  if (query?.trim()) params.set('q', query.trim())
  if (category && category !== 'all') params.set('category', category)
  if (model && model !== 'all') params.set('model', model)
  if (sort && sort !== 'featured') params.set('sort', sort)
  if (sort === 'shuffle' && seed) params.set('seed', seed)
  if (page && page > 1) params.set('page', String(page))
  if (take && take > 0) params.set('take', String(take))
  const s = params.toString()
  return s ? `/prompts?${s}` : '/prompts'
}

function getShuffleScore(prompt: PromptHubSortableEntry, seed: string) {
  let hash = 2166136261
  const input = `${seed}:${prompt.slug}:${prompt.title}`
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

export function sortPromptsForMode<T extends PromptHubSortableEntry>(
  prompts: T[],
  sortMode: PromptSortMode,
  shuffleSeed: string
) {
  const sorted = [...prompts]
  if (sortMode === 'shuffle') return sorted.sort((a, b) => getShuffleScore(a, shuffleSeed) - getShuffleScore(b, shuffleSeed))
  if (sortMode === 'new') return sorted.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt) || a.title.localeCompare(b.title))
  if (sortMode === 'top') return sorted.sort((a, b) => b.tags.length - a.tags.length || a.title.localeCompare(b.title))
  if (sortMode === 'hot') {
    return sorted.sort((a, b) => {
      const as = Number(a.featured) * 4 + Number(a.previewImage.startsWith('http')) * 2 + a.models.length
      const bs = Number(b.featured) * 4 + Number(b.previewImage.startsWith('http')) * 2 + b.models.length
      return bs - as || a.title.localeCompare(b.title)
    })
  }
  return sorted.sort(
    (a, b) =>
      Number(b.featured) - Number(a.featured) ||
      b.updatedAt.localeCompare(a.updatedAt) ||
      a.title.localeCompare(b.title)
  )
}
