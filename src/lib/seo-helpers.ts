// SEO helpers - centralized metadata generation utilities

import type { Metadata } from 'next'
import { SITE_URL } from '@/lib/site-url'
import { generateHreflangMap } from '@/lib/seo-languages'

export const SITE_NAME = 'mtverse'
export const SITE_DESCRIPTION =
  'Free copy-ready AI prompts for image generation, ChatGPT, Midjourney, photo edits, writing, and creative workflows. Plus premium Next.js dashboard kits with live previews and package delivery.'
export const DEFAULT_OG_IMAGE = '/opengraph-image'
export const TWITTER_HANDLE = '@mtverse'

// Hreflang helpers

/**
 * Generates hreflang alternate languages for a given canonical path.
 * Returns a Record<string, string> suitable for Next.js metadata.alternates.languages.
 */
export function getHreflangLanguages(canonicalPath: string): Record<string, string> {
  return generateHreflangMap(canonicalPath, SITE_URL)
}

/**
 * Builds a canonical URL from a site-relative path.
 */
export function getCanonicalUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`
}

// Page metadata builder

export type PageMetaOptions = {
  title: string
  description: string
  canonicalPath: string
  keywords?: string[]
  ogImage?: string
  ogType?: 'website' | 'article'
  noIndex?: boolean
  includeHreflang?: boolean
  publishedTime?: string
  modifiedTime?: string
}

/**
 * Generates comprehensive Next.js Metadata for any public page.
 * Includes title, description, keywords, OG, Twitter, alternates (canonical + hreflang), and robots.
 */
export function buildPageMetadata(options: PageMetaOptions): Metadata {
  const {
    title,
    description,
    canonicalPath,
    keywords,
    ogImage,
    ogType = 'website',
    noIndex = false,
    includeHreflang = true,
    publishedTime,
    modifiedTime,
  } = options

  const canonicalUrl = getCanonicalUrl(canonicalPath)
  const resolvedOgImage = ogImage
    ? ogImage.startsWith('http')
      ? ogImage
      : `${SITE_URL}${ogImage.startsWith('/') ? ogImage : `/${ogImage}`}`
    : `${SITE_URL}${DEFAULT_OG_IMAGE}`

  const languages = includeHreflang ? getHreflangLanguages(canonicalPath) : undefined

  return {
    title,
    description,
    keywords: keywords?.length ? keywords : undefined,
    alternates: {
      canonical: canonicalUrl,
      languages,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: SITE_NAME,
      type: ogType,
      images: [
        {
          url: resolvedOgImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: 'en_US',
      ...(publishedTime ? { publishedTime } : {}),
      ...(modifiedTime ? { modifiedTime } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [resolvedOgImage],
      creator: TWITTER_HANDLE,
      site: TWITTER_HANDLE,
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
          googleBot: { index: false, follow: false },
        }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
          },
        },
  }
}

// Structured data helpers

export function generateSoftwareApplicationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: SITE_NAME,
    url: SITE_URL,
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Web',
    description: SITE_DESCRIPTION,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '2400',
      bestRating: '5',
    },
  }
}

export function generateProductWithOffersSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'mtverse Next.js Dashboard Kit Package',
    description:
      'Lifetime access to the premium Next.js dashboard kit package. Public prompts remain free.',
    url: `${SITE_URL}/pricing`,
    brand: {
      '@type': 'Brand',
      name: SITE_NAME,
    },
    offers: [
      {
        '@type': 'Offer',
        name: 'Free Prompts',
        price: '0',
        priceCurrency: 'USD',
        description: 'Public prompt library access',
        availability: 'https://schema.org/InStock',
      },
      {
        '@type': 'Offer',
        name: 'Next.js Dashboard Kit Package',
        price: '12',
        priceCurrency: 'USD',
        description: 'One-time lifetime package download',
        availability: 'https://schema.org/InStock',
      },
    ],
  }
}

export function generateFAQSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }
}

export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

export function generateCollectionPageSchema(params: {
  name: string
  description: string
  url: string
  itemCount?: number
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: params.name,
    description: params.description,
    url: params.url,
    ...(params.itemCount ? { numberOfItems: params.itemCount } : {}),
  }
}

// Global FAQ for homepage

export const GLOBAL_FAQ = [
  {
    question: 'Are mtverse AI prompts free?',
    answer:
      'Yes. Public prompts on mtverse are free to browse, copy, and adapt for your own workflows. No signup required.',
  },
  {
    question: 'What types of AI prompts are available?',
    answer:
      'The prompt hub includes ChatGPT prompts, AI image prompts, photo editing prompts, Nano Banana-style trend prompts, writing prompts, product prompts, and creative workflows.',
  },
  {
    question: 'Can I use prompts with different AI models?',
    answer:
      'Yes. Many prompts are written so they can be adapted across ChatGPT, Gemini, Midjourney, Flux, image editors, and other AI tools.',
  },
  {
    question: 'What dashboard kits are available?',
    answer:
      'mtverse offers premium Next.js dashboard kits with live previews, product detail pages, metadata, screenshots, package delivery, and reusable admin UI patterns.',
  },
  {
    question: 'Do I need an account to use mtverse?',
    answer:
      'No. All public prompts are accessible without an account. Premium Next.js dashboard kit downloads require a one-time purchase.',
  },
]


