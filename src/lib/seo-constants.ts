// ─────────────────────────────────────────────────────────
// SEO Constants — Centralised metadata for the entire site
// ─────────────────────────────────────────────────────────

import { SITE_URL as _SITE_URL } from '@/lib/site-url'
export { SITE_URL } from '@/lib/site-url'
const SITE_URL = _SITE_URL
export const SITE_NAME = 'mtverse'
export const SITE_DESCRIPTION =
  'Free copy-ready AI prompts for image generation, ChatGPT, Midjourney, photo edits, writing, and creative workflows. Plus production-ready React UI components with Tailwind CSS and shadcn/ui.'

export const DEFAULT_OG_IMAGE = '/opengraph-image'
export const TWITTER_HANDLE = '@mtverse'

// ── Page-specific metadata ───────────────────────────────

export const PAGE_METADATA = {
  home: {
    title: 'mtverse — Free AI Prompts & Production-Ready UI Components',
    description:
      'Discover free AI prompts for image generation, ChatGPT, Midjourney, Flux, photo editing, and writing. Browse production-ready React UI components with Tailwind CSS and shadcn/ui.',
    keywords: [
      'AI prompts',
      'free AI prompts',
      'AI image prompts',
      'ChatGPT prompts',
      'Midjourney prompts',
      'UI components',
      'React components',
      'Tailwind CSS components',
      'admin dashboard',
      'design system',
    ],
  },
  prompts: {
    title: 'AI Prompts Library — Free Copy-Ready Prompts | mtverse',
    description:
      'Browse the free AI prompts library. Copy-ready prompts for ChatGPT, Midjourney, Flux, image generation, photo editing, writing, coding, and creative workflows.',
    keywords: [
      'AI prompts library',
      'free ChatGPT prompts',
      'AI image generation prompts',
      'Midjourney prompts',
      'Flux prompts',
      'viral AI prompts',
      'trending prompts',
      'copy paste AI prompts',
    ],
  },
  ui: {
    title: 'UI Components — React, Tailwind CSS, shadcn/ui | mtverse',
    description:
      'Browse production-ready React UI components built with Tailwind CSS and shadcn/ui. Admin dashboards, charts, forms, tables, and 200+ reusable components.',
    keywords: [
      'React UI components',
      'Tailwind CSS components',
      'shadcn UI',
      'admin dashboard template',
      'Next.js components',
      'TypeScript components',
      'production ready UI',
      'dark mode components',
    ],
  },
  about: {
    title: 'About mtverse — Free AI Prompts & UI Components',
    description:
      'Learn about mtverse, the free platform for AI prompts and production-ready React UI components. Built for creators, developers, and designers.',
    keywords: ['about mtverse', 'AI prompts platform', 'UI component library', 'free developer tools'],
  },
  contact: {
    title: 'Contact Us — mtverse',
    description: 'Get in touch with the mtverse team for questions, feedback, or partnership inquiries.',
    keywords: ['contact mtverse', 'AI prompts support', 'UI components help'],
  },
  privacy: {
    title: 'Privacy Policy — mtverse',
    description: 'Read the mtverse privacy policy. Learn how we handle your data, cookies, and personal information.',
    keywords: ['privacy policy', 'data protection', 'mtverse privacy'],
  },
  terms: {
    title: 'Terms of Service — mtverse',
    description: 'Read the mtverse terms of service. Understand the rules for using our AI prompts and UI components.',
    keywords: ['terms of service', 'usage terms', 'mtverse terms'],
  },
  search: {
    title: 'Search AI Prompts & UI Components — mtverse',
    description: 'Search across AI prompts, UI components, and creative resources on mtverse.',
    keywords: ['search AI prompts', 'find UI components', 'prompt search'],
  },
  feedback: {
    title: 'Feedback — mtverse',
    description: 'Share your feedback, suggestions, and ideas to help improve mtverse.',
    keywords: ['mtverse feedback', 'suggestions', 'feature requests'],
  },
} as const

// ── Structured data templates ────────────────────────────

export function generateWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/SiteLogo.png`,
    sameAs: [],
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

export function generateItemPageSchema(params: {
  title: string
  description: string
  url: string
  image?: string
  dateModified?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemPage',
    name: params.title,
    description: params.description,
    url: params.url,
    ...(params.image ? { image: params.image } : {}),
    ...(params.dateModified ? { dateModified: params.dateModified } : {}),
  }
}

export function generateBreadcrumbSchema(
  items: Array<{ name: string; url: string }>
) {
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

export function generateFAQSchema(
  faqs: Array<{ question: string; answer: string }>
) {
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
