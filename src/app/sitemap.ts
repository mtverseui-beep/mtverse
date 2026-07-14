import type { MetadataRoute } from 'next'
import { headers } from 'next/headers'
import { BLOG_POSTS } from '@/lib/blog-posts'
import { generateHreflangMap } from '@/lib/seo-languages'
import { resolveSiteUrlFromRequestHeaders } from '@/lib/site-url'
import { TEMPLATE_SEO_HUBS } from '@/lib/template-seo-hubs'
import { getAllTemplatesFromStore, getTemplateCategoriesFor, TEMPLATES } from '@/lib/templates-data'

const PRIORITY_TEMPLATE_CATEGORY_IDS = ['dashboards', 'ecommerce', 'landing', 'html'] as const

function safeDate(value: Date | string, fallback: Date) {
  const resolved = value instanceof Date ? value : new Date(value)
  return Number.isNaN(resolved.getTime()) ? fallback : resolved
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = resolveSiteUrlFromRequestHeaders(await headers())
  const staticDate = new Date('2026-07-14')
  const templates = await getAllTemplatesFromStore().catch(() => TEMPLATES)

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: staticDate, changeFrequency: 'weekly', priority: 1 },
    { url: `${baseUrl}/templates`, lastModified: staticDate, changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/html-templates`, lastModified: staticDate, changeFrequency: 'daily', priority: 0.98 },
    { url: `${baseUrl}/pricing`, lastModified: staticDate, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/blog`, lastModified: staticDate, changeFrequency: 'weekly', priority: 0.76 },
    { url: `${baseUrl}/faq`, lastModified: staticDate, changeFrequency: 'monthly', priority: 0.72 },
    { url: `${baseUrl}/about`, lastModified: staticDate, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/editorial-policy`, lastModified: staticDate, changeFrequency: 'monthly', priority: 0.62 },
    { url: `${baseUrl}/support`, lastModified: staticDate, changeFrequency: 'monthly', priority: 0.58 },
    { url: `${baseUrl}/contact`, lastModified: staticDate, changeFrequency: 'yearly', priority: 0.55 },
    { url: `${baseUrl}/changelog`, lastModified: staticDate, changeFrequency: 'monthly', priority: 0.45 },
    { url: `${baseUrl}/privacy`, lastModified: staticDate, changeFrequency: 'yearly', priority: 0.25 },
    { url: `${baseUrl}/terms`, lastModified: staticDate, changeFrequency: 'yearly', priority: 0.25 },
    { url: `${baseUrl}/disclaimer`, lastModified: staticDate, changeFrequency: 'yearly', priority: 0.25 },
    { url: `${baseUrl}/dmca`, lastModified: staticDate, changeFrequency: 'yearly', priority: 0.25 },
    { url: `${baseUrl}/cookie-policy`, lastModified: staticDate, changeFrequency: 'yearly', priority: 0.25 },
    { url: `${baseUrl}/refund-policy`, lastModified: staticDate, changeFrequency: 'yearly', priority: 0.25 },
  ]

  const templateCategoryIds = Array.from(new Set([
    ...PRIORITY_TEMPLATE_CATEGORY_IDS,
    ...getTemplateCategoriesFor(templates).filter((category) => category.id !== 'all').map((category) => category.id),
  ]))

  const templateCategoryRoutes: MetadataRoute.Sitemap = templateCategoryIds.map((categoryId) => ({
    url: `${baseUrl}/template-categories/${categoryId}`,
    lastModified: staticDate,
    changeFrequency: 'daily' as const,
    priority: categoryId === 'dashboards' ? 0.99 : categoryId === 'ecommerce' ? 0.98 : categoryId === 'landing' ? 0.97 : categoryId === 'html' ? 0.96 : 0.94,
  }))

  const templateHubRoutes: MetadataRoute.Sitemap = TEMPLATE_SEO_HUBS.map((hub) => ({
    url: `${baseUrl}/template-hubs/${hub.slug}`,
    lastModified: staticDate,
    changeFrequency: 'weekly' as const,
    priority: hub.slug === 'nextjs-dashboard-templates' ? 0.99 : hub.slug === 'react-admin-dashboard-templates' ? 0.98 : 0.96,
  }))

  const templateRoutes: MetadataRoute.Sitemap = templates.map((template) => ({
    url: `${baseUrl}/templates/${template.slug}`,
    lastModified: safeDate(template.lastUpdated, staticDate),
    changeFrequency: 'weekly' as const,
    priority: !template.isFree ? (template.pricingTier === 'pro' ? 0.99 : 0.98) : template.category === 'html' ? 0.94 : 0.91,
  }))

  const blogRoutes: MetadataRoute.Sitemap = BLOG_POSTS.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: safeDate(post.isoDate, staticDate),
    changeFrequency: 'monthly' as const,
    priority: 0.72,
  }))

  return [...staticRoutes, ...templateCategoryRoutes, ...templateHubRoutes, ...templateRoutes, ...blogRoutes].map((route) => ({
    ...route,
    alternates: {
      languages: generateHreflangMap(route.url.replace(baseUrl, ''), baseUrl),
    },
  }))
}