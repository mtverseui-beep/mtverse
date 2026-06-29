export type SiteSearchResultType = 'prompt' | 'template'

export type SiteSearchResult = {
  id: string
  type: SiteSearchResultType
  title: string
  description: string
  href: string
  category: string
  subcategory?: string
  badge: string
}

const SEARCH_RESULT_CACHE_TTL_MS = 5 * 60 * 1000
const searchResultCache = new Map<string, { expiresAt: number; results: SiteSearchResult[] }>()

export async function fetchSiteSearch(
  query: string,
  limit = 12,
  signal?: AbortSignal
): Promise<SiteSearchResult[]> {
  const normalizedQuery = query.trim()
  if (normalizedQuery.length < 2) return []
  const cacheKey = `${normalizedQuery.toLowerCase()}::${limit}`
  const cachedEntry = searchResultCache.get(cacheKey)

  if (cachedEntry && cachedEntry.expiresAt > Date.now()) {
    return cachedEntry.results
  }

  const params = new URLSearchParams({
    q: normalizedQuery,
    limit: String(limit),
  })

  const response = await fetch(`/api/search?${params.toString()}`, {
    signal,
    cache: 'no-store',
  })

  if (!response.ok) return []

  const data = (await response.json()) as { results?: SiteSearchResult[] }
  const results = data.results ?? []

  searchResultCache.set(cacheKey, {
    expiresAt: Date.now() + SEARCH_RESULT_CACHE_TTL_MS,
    results,
  })

  return results
}
