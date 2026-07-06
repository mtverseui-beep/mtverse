import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { cache } from 'react'
import PublicLayout from '@/components/layout/PublicLayout'
import UniverseTopBar from '@/components/public/UniverseTopBar'
import PromptDetailPage from '@/components/prompts/PromptDetailPage'
import { getPublishedPrompts, getRelatedPrompts, isPromptIndexable } from '@/lib/prompt-db'
import type { PromptEntry } from '@/lib/prompt-library-data'
import { SITE_URL, absoluteUrl } from '@/lib/site-url'
import { slugify } from '@/lib/utils'

type PromptSlugPageProps = {
  params: Promise<{ slug: string }>
}

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const dynamicParams = true

export async function generateStaticParams() {
  const prompts = await getPublishedPrompts()
  return prompts.filter(isPromptIndexable).map(prompt => ({ slug: prompt.slug }))
}

function safeDecodeSlug(slug: string) {
  try {
    return decodeURIComponent(slug)
  } catch {
    return slug
  }
}

const getPromptPageData = cache(async (slug: string) => {
  const prompts = await getPublishedPrompts({ noStore: true })
  const normalizedSlug = slugify(safeDecodeSlug(slug))
  const prompt =
    prompts.find(entry => entry.slug === slug) ||
    prompts.find(entry => entry.slug.toLowerCase() === slug.toLowerCase()) ||
    prompts.find(entry => entry.slug === normalizedSlug) ||
    null

  if (!prompt) {
    return {
      prompt: null,
      relatedPrompts: [],
      promptCount: prompts.length,
    }
  }

  let relatedPrompts = prompt.relatedSlugs.length
    ? prompt.relatedSlugs
        .map(relatedSlug => prompts.find(entry => entry.slug === relatedSlug) || null)
        .filter((entry): entry is PromptEntry => Boolean(entry))
        .slice(0, 24)
    : await getRelatedPrompts(prompt.slug, 24)

  if (relatedPrompts.length < 24) {
    const seenSlugs = new Set([prompt.slug, ...relatedPrompts.map(entry => entry.slug)])
    const fallbackRelatedPrompts = await getRelatedPrompts(prompt.slug, 36)
    relatedPrompts = [
      ...relatedPrompts,
      ...fallbackRelatedPrompts.filter(entry => !seenSlugs.has(entry.slug)),
    ].slice(0, 24)
  }

  return {
    prompt,
    relatedPrompts,
    promptCount: prompts.length,
  }
})

function compactList(items: string[], fallback: string) {
  return items.length ? items.slice(0, 3).join(', ') : fallback
}

function buildPromptFaqItems(prompt: PromptEntry) {
  const modelText = compactList(prompt.models, 'popular AI image and chat tools')
  const useText = compactList(prompt.bestFor, prompt.categoryTitle.toLowerCase())
  const tipText = prompt.tips[0] || 'Start with the prompt as written, then adjust subject, lighting, format, and constraints for your own result.'

  return [
    {
      question: `What is ${prompt.title} best for?`,
      answer: `${prompt.title} is best for ${useText}. It gives creators a copy-ready starting point with a clear visual direction and practical constraints.`,
    },
    {
      question: `Which AI tools can use this prompt?`,
      answer: `This prompt is structured for ${modelText}. You can also adapt it for similar image generation, photo editing, or creative workflow tools.`,
    },
    {
      question: `How should I customize this prompt?`,
      answer: tipText,
    },
  ]
}

function buildPromptStructuredData(baseUrl: string, prompt: PromptEntry) {
  const pageUrl = `${baseUrl}/prompts/${prompt.slug}`
  const promptKeywords = buildPromptSeoKeywords(prompt)
  const promptDescription = buildPromptSeoDescription(prompt)
  const promptFaqItems = buildPromptFaqItems(prompt)

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'mtverse',
            item: `${baseUrl}/prompts`,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: prompt.categoryTitle,
            item: pageUrl,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: prompt.title,
            item: pageUrl,
          },
        ],
      },
      {
        '@type': 'Article',
        headline: `${prompt.seoTitle} | Free AI Prompt`,
        description: promptDescription,
        url: pageUrl,
        dateModified: prompt.updatedAt,
        articleSection: prompt.categoryTitle,
        keywords: promptKeywords,
        image: prompt.previewImage,
        datePublished: prompt.updatedAt,
        author: { '@type': 'Organization', name: 'mtverse', url: baseUrl },
        publisher: {
          '@type': 'Organization',
          name: 'mtverse',
          logo: { '@type': 'ImageObject', url: `${baseUrl}/SiteLogo.png` },
        },
      },
      {
        '@type': 'FAQPage',
        mainEntity: promptFaqItems.map(item => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.answer,
          },
        })),
      },
    ],
  }
}

function buildPromptSeoKeywords(prompt: PromptEntry) {
  return Array.from(
    new Set([
      'free AI prompt',
      'free AI prompts',
      'copy AI prompt',
      'copy paste AI prompt',
      'copy ready prompt',
      'AI image prompt',
      'free AI image prompt',
      'image generation prompt',
      'AI art prompt',
      'trending AI prompt',
      'viral AI prompt',
      'ChatGPT image prompt',
      'Gemini image prompt',
      'Nano Banana prompt',
      'Midjourney prompt',
      'Flux prompt',
      'poster design prompt',
      'product photography prompt',
      'cinematic portrait prompt',
      'photo editing prompt',
      prompt.title,
      prompt.categoryTitle,
      prompt.subcategory,
      prompt.visualStyle,
      ...prompt.models,
      ...prompt.tags,
      ...prompt.bestFor.slice(0, 6),
    ].filter(Boolean))
  )
}

function buildPromptSeoDescription(prompt: PromptEntry) {
  const base = prompt.metaDescription.toLowerCase().includes('free')
    ? prompt.metaDescription
    : `Free AI prompt: ${prompt.metaDescription}`
  const modelText = prompt.models.length ? ` Works with ${prompt.models.join(', ')}.` : ''
  const useText = prompt.bestFor[0] ? ` Best for ${prompt.bestFor.slice(0, 3).join(', ')}.` : ''
  return `${base}${modelText}${useText}`.slice(0, 220)
}

function stripPromptBodyForClient(prompt: PromptEntry) {
  const { prompt: _promptBody, ...clientPrompt } = prompt
  return clientPrompt
}
export async function generateMetadata({ params }: PromptSlugPageProps): Promise<Metadata> {
  const { slug } = await params
  const { prompt } = await getPromptPageData(slug)

  if (!prompt) {
    return {
      title: 'Prompt not found | mtverse',
      robots: {
        index: false,
        follow: false,
        googleBot: { index: false, follow: false },
      },
    }
  }

  const seoTitle = `${prompt.seoTitle} | Free AI Prompt`
  const seoDescription = buildPromptSeoDescription(prompt)
  const seoKeywords = buildPromptSeoKeywords(prompt)

  return {
    title: seoTitle,
    description: seoDescription,
    keywords: seoKeywords,
    robots: isPromptIndexable(prompt)
      ? {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            'max-image-preview': 'large',
            'max-snippet': -1,
            'max-video-preview': -1,
          },
        }
      : {
          index: false,
          follow: true,
          googleBot: { index: false, follow: true },
        },
    openGraph: {
      title: seoTitle,
      description: seoDescription,
      url: absoluteUrl(`/prompts/${prompt.slug}`),
      type: 'article',
      images: [
        {
          url: prompt.previewImage,
          alt: prompt.previewAlt,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: seoTitle,
      description: seoDescription,
    },
    alternates: {
      canonical: absoluteUrl(`/prompts/${prompt.slug}`),
    },
  }
}

export default async function PromptSlugPage({ params }: PromptSlugPageProps) {
  const { slug } = await params
  const { prompt, relatedPrompts, promptCount } = await getPromptPageData(slug)

  if (!prompt) {
    notFound()
  }

  if (prompt.slug !== slug) {
    redirect(`/prompts/${prompt.slug}`)
  }

  const jsonLd = buildPromptStructuredData(SITE_URL, prompt)

  return (
    <PublicLayout promptCount={promptCount}>
      {jsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      ) : null}
      <UniverseTopBar
        items={[
          { label: 'Prompts', href: '/prompts' },
          { label: prompt.categoryTitle, href: `/prompts?category=${prompt.category}` },
          { label: prompt.title },
        ]}
        actionName={prompt.title}
        actionSlug={prompt.slug}
      />
      <PromptDetailPage
        prompt={stripPromptBodyForClient(prompt)}
        relatedPrompts={relatedPrompts.map(stripPromptBodyForClient)}
      />
    </PublicLayout>
  )
}
