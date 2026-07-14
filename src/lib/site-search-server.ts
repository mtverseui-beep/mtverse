import 'server-only'

import { unstable_cache } from 'next/cache'
import { getAllTemplatesFromStore } from '@/lib/templates-data'
import type { SiteSearchResult } from '@/lib/site-search'

function normalize(value: string) {
  return value.trim().toLowerCase()
}

function includesQuery(value: string | undefined, query: string) {
  return Boolean(value && normalize(value).includes(query))
}

function getScore(
  candidate: { title: string; description?: string; category?: string; tags?: string[] },
  query: string,
) {
  const normalizedTitle = normalize(candidate.title)
  let score = 0

  if (normalizedTitle === query) score += 120
  if (normalizedTitle.startsWith(query)) score += 90
  if (normalizedTitle.includes(query)) score += 70
  if (includesQuery(candidate.category, query)) score += 30
  if (includesQuery(candidate.description, query)) score += 18
  if (candidate.tags?.some((tag) => includesQuery(tag, query))) score += 16

  return score
}

const getCachedSearchSiteContent = unstable_cache(
  async (normalizedQuery: string, limit: number): Promise<SiteSearchResult[]> => {
    const templates = await getAllTemplatesFromStore()

    return templates
      .filter((template) =>
        [
          template.title,
          template.summary,
          template.description,
          template.categoryLabel,
          template.subcategory,
          template.frameworkLabel,
          template.license,
          ...template.tags,
          ...(template.keywords || []),
          ...template.techStack,
          ...template.features,
          ...template.pages,
        ].some((value) => includesQuery(value, normalizedQuery)),
      )
      .map((template) => ({
        id: `template:${template.slug}`,
        type: 'template' as const,
        title: template.title,
        description: template.summary,
        href: `/templates/${template.slug}`,
        category: 'Templates',
        subcategory: template.subcategory,
        badge: template.categoryLabel || 'Template',
        score: getScore(
          {
            title: template.title,
            description: `${template.summary} ${template.description}`,
            category: `${template.categoryLabel || ''} ${template.subcategory || ''}`,
            tags: [
              ...template.tags,
              ...(template.keywords || []),
              ...template.techStack,
              ...template.features.slice(0, 12),
            ],
          },
          normalizedQuery,
        ),
      }))
      .sort((left, right) => right.score - left.score || left.title.localeCompare(right.title))
      .slice(0, limit)
      .map(({ score: _score, ...result }) => result)
  },
  ['template-search-results'],
  { revalidate: 1800, tags: ['templates'] },
)

export async function searchSiteContent(query: string, limit = 12): Promise<SiteSearchResult[]> {
  const normalizedQuery = normalize(query)
  if (normalizedQuery.length < 2) return []
  return getCachedSearchSiteContent(normalizedQuery, limit)
}