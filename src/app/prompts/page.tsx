import type { Metadata } from 'next'
import PublicLayout from '@/components/layout/PublicLayout'
import PromptHubPage from '@/components/prompts/PromptHubPage'
import { getPromptLibraryData } from '@/lib/prompt-db'
import { PROMPT_COLLECTIONS } from '@/lib/prompt-collections'
import { sortPromptsForMode } from '@/lib/prompt-hub-ranking'
import {
  filterPrompts,
  normalizePromptQuery,
  normalizePromptSearchParam,
  resolvePromptCategory,
  resolvePromptModel,
} from '@/lib/prompt-query'
import { absoluteUrl, SITE_URL } from '@/lib/site-url'
import { generateHreflangMap } from '@/lib/seo-languages'

const promptsPageMetadata = {
  title: 'Free AI Prompts - ChatGPT, AI Image, Midjourney & Photo Editing Prompts',
  description:
    'Browse free copy-ready AI prompts for ChatGPT, AI image generation, Midjourney, Flux, Nano Banana, photo editing, portraits, products, posters, writing, and viral content. Sign in to reveal, copy, and save prompts.',
  keywords: [
    'free AI prompts',
    'free AI image prompts',
    'best free AI prompts',
    'copy paste AI prompts',
    'copy ready AI prompts',
    'free art prompts',
    'trending AI prompts',
    'trending image prompts',
    'viral AI image prompts',
    'AI image prompt library',
    'AI prompt generator ideas',
    'image generation prompts',
    'AI art prompts',
    'copy AI prompts',
    'AI prompts',
    'ChatGPT prompts',
    'ChatGPT image prompts',
    'free image prompts',
    'free ChatGPT prompts',
    'free Midjourney prompts',
    'Nano Banana prompts',
    'free Nano Banana prompts',
    'Midjourney prompts',
    'Flux prompts',
    'AI portrait prompts',
    'AI product photography prompts',
    'product photography AI prompts',
    'AI advertising prompts',
    'AI social media prompts',
    'AI poster prompts',
    'poster design AI prompts',
    'AI fashion prompts',
    'editorial fashion AI prompts',
    'AI anime prompts',
    'cinematic portrait prompts',
    'Gemini image prompts',
    'AI photo editing prompts',
    'free prompt templates',
    'AI writing prompts',
    'viral AI prompts',
    'Gemini prompts',
    'Instagram AI photo prompts',
    'AI profile picture prompts',
  ],
  openGraph: {
    title: 'Free AI Prompts - ChatGPT, AI Image, Midjourney & Photo Editing | mtverse',
    description:
      'Curated free copy-ready AI prompts for ChatGPT, image generation, Midjourney, Flux, Nano Banana, portraits, products, writing, and photo edits.',
    type: 'website',
    url: absoluteUrl('/prompts'),
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free AI Prompts - Trending Prompts | mtverse',
    description:
      'Curated free copy-ready AI prompts for ChatGPT Image, Nano Banana, Midjourney, Flux, art, portraits, products, and edits.',
  },
  alternates: {
    canonical: absoluteUrl('/prompts'),
    languages: generateHreflangMap('/prompts', SITE_URL),
  },
} satisfies Metadata

export async function generateMetadata({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}): Promise<Metadata> {
  const resolvedSearchParams = await searchParams
  void resolvedSearchParams

  return {
    ...promptsPageMetadata,
    robots: {
      index: false,
      follow: true,
      googleBot: { index: false, follow: true },
    },
  }
}

// ISR: revalidate every 5 minutes
export const revalidate = 300
const DEFAULT_PROMPT_TAKE = 100
const MAX_PROMPT_TAKE = 100

interface PromptsPageProps {
  searchParams?: Promise<{
    page?: string | string[]
    category?: string | string[]
    model?: string | string[]
    q?: string | string[]
    sort?: string | string[]
    seed?: string | string[]
    take?: string | string[]
  }>
}

function resolvePromptSort(value?: string): 'featured' | 'hot' | 'new' | 'top' | 'shuffle' {
  if (value === 'hot' || value === 'new' || value === 'top' || value === 'shuffle') {
    return value
  }
  return 'featured'
}

function resolveShuffleSeed(value?: string) {
  const normalized = value?.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 32)
  return normalized || 'mtverse'
}

function resolvePromptTake(value?: string) {
  const parsed = Number.parseInt(value || '', 10)
  if (!Number.isFinite(parsed)) return DEFAULT_PROMPT_TAKE
  return Math.min(Math.max(parsed, DEFAULT_PROMPT_TAKE), MAX_PROMPT_TAKE)
}

function resolvePromptPage(value?: string) {
  const parsed = Number.parseInt(value || '', 10)
  if (!Number.isFinite(parsed)) return 1
  return Math.max(parsed, 1)
}

function toPromptHubEntry(prompt: (Awaited<ReturnType<typeof getPromptLibraryData>>)['prompts'][number]) {
  return {
    slug: prompt.slug,
    title: prompt.title,
    previewImage: prompt.previewImage,
    previewAlt: prompt.previewAlt,
    previewWidth: prompt.previewWidth,
    previewHeight: prompt.previewHeight,
    category: prompt.category,
    subcategory: prompt.subcategory,
    visualStyle: prompt.visualStyle,
    tags: prompt.tags,
    bestFor: prompt.bestFor,
    models: prompt.models,
    featured: prompt.featured,
    updatedAt: prompt.updatedAt,
  }
}

export default async function PromptsPage({ searchParams }: PromptsPageProps) {
  const resolvedSearchParams = await searchParams
  const library = await getPromptLibraryData()
  const activeCategory = resolvePromptCategory(
    normalizePromptSearchParam(resolvedSearchParams?.category),
  )
  const activeModel = resolvePromptModel(
    normalizePromptSearchParam(resolvedSearchParams?.model),
  )
  const searchQuery = normalizePromptQuery(resolvedSearchParams?.q)
  const sortMode = resolvePromptSort(
    normalizePromptSearchParam(resolvedSearchParams?.sort),
  )
  const shuffleSeed = resolveShuffleSeed(
    normalizePromptSearchParam(resolvedSearchParams?.seed),
  )
  const visibleLimit = resolvePromptTake(
    normalizePromptSearchParam(resolvedSearchParams?.take),
  )
  const requestedPage = resolvePromptPage(
    normalizePromptSearchParam(resolvedSearchParams?.page),
  )
  const filteredPrompts = filterPrompts(library.prompts, {
    category: activeCategory,
    model: activeModel,
    query: searchQuery,
  })
  const promptHubEntries = sortPromptsForMode(
    filteredPrompts.map(toPromptHubEntry),
    sortMode,
    shuffleSeed,
  )
  const pageSize = visibleLimit === DEFAULT_PROMPT_TAKE ? DEFAULT_PROMPT_TAKE : visibleLimit
  const totalPages = Math.max(1, Math.ceil(promptHubEntries.length / pageSize))
  const activePage = Math.min(requestedPage, totalPages)
  const pageStart = (activePage - 1) * pageSize
  const visiblePromptEntries = promptHubEntries.slice(pageStart, pageStart + pageSize)

  const schemaMarkup = [
    {
      '@context': 'https://schema.org',
      '@type': ['WebPage', 'CollectionPage'],
      name: 'Free AI Image Prompts',
      headline: 'Free AI image prompts for trending art, ChatGPT Image, Nano Banana, and creative workflows',
      description:
        'Browse free copy-ready AI prompts for image generation, trending art prompts, ChatGPT Image, Nano Banana, photo editing, portraits, products, posters, and creative workflows.',
      url: absoluteUrl('/prompts'),
      inLanguage: 'en',
      keywords: [
        'free AI prompts',
        'free AI image prompts',
        'copy paste AI prompts',
        'copy ready AI prompts',
        'trending AI prompts',
        'viral AI image prompts',
        'image generation prompts',
        'AI art prompts',
        'ChatGPT prompts',
        'AI image prompts',
        'Nano Banana prompts',
        'Midjourney prompts',
        'Flux prompts',
      ].join(', '),
      mainEntity: {
        '@type': 'ItemList',
        numberOfItems: library.stats.totalPrompts,
        itemListElement: PROMPT_COLLECTIONS.slice(0, 12).map((collection, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: collection.title,
          url: absoluteUrl(`/prompts/collections/${collection.slug}`),
        })),
      },
      hasPart: PROMPT_COLLECTIONS.map(collection => ({
        '@type': 'CollectionPage',
        name: collection.title,
        url: absoluteUrl(`/prompts/collections/${collection.slug}`),
        description: collection.metaDescription,
      })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Are mtverse AI prompts free?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. Public prompts on mtverse are free to browse, copy, and adapt for your own workflows.',
          },
        },
        {
          '@type': 'Question',
          name: 'What prompt types are available?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'The prompt hub includes ChatGPT prompts, AI image prompts, photo editing prompts, Nano Banana-style trend prompts, writing prompts, product prompts, and creative workflows.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can I use prompts with different AI models?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. Many prompts are written so they can be adapted across ChatGPT, Gemini, Midjourney, Flux, image editors, and other AI tools.',
          },
        },
      ],
    },
  ]

  return (
    <PublicLayout schemaMarkup={schemaMarkup} promptCount={library.stats.totalPrompts}>
      <PromptHubPage
        categories={library.categories}
        models={library.models}
        filteredPrompts={visiblePromptEntries}
        activeCategory={activeCategory}
        activeModel={activeModel}
        searchQuery={searchQuery}
        sortMode={sortMode}
        shuffleSeed={shuffleSeed}
        totalResults={filteredPrompts.length}
        totalPrompts={library.stats.totalPrompts}
        activePage={activePage}
        totalPages={totalPages}
        pageSize={pageSize}
      />
    </PublicLayout>
  )
}
