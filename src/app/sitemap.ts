import { MetadataRoute } from "next";
import { headers } from "next/headers";
import { BLOG_POSTS } from "@/lib/blog-posts";
import { getPromptCollectionHref, PROMPT_COLLECTIONS } from "@/lib/prompt-collections";
import { getPublishedPrompts, isPromptIndexable } from "@/lib/prompt-db";
import { generateHreflangMap } from "@/lib/seo-languages";
import { resolveSiteUrlFromRequestHeaders } from "@/lib/site-url";
import { TEMPLATE_SEO_HUBS } from "@/lib/template-seo-hubs";
import { getAllTemplatesFromStore, getTemplateCategoriesFor, TEMPLATES } from "@/lib/templates-data";

const MAX_PROMPT_SITEMAP_URLS = 300;
const PRIORITY_TEMPLATE_CATEGORY_IDS = ["dashboards", "ecommerce", "landing", "html"] as const;

function safeDate(value: Date | string, fallback: Date) {
  const resolved = value instanceof Date ? value : new Date(value);
  return Number.isNaN(resolved.getTime()) ? fallback : resolved;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const requestHeaders = await headers();
  const baseUrl = resolveSiteUrlFromRequestHeaders(requestHeaders);
  const staticDate = new Date("2026-07-03");
  const contentDate = new Date("2026-07-10");
  const prompts = await getPublishedPrompts().catch(() => []);
  const templates = await getAllTemplatesFromStore().catch(() => TEMPLATES);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: contentDate, changeFrequency: "weekly", priority: 1.0 },
    { url: baseUrl + "/templates", lastModified: contentDate, changeFrequency: "daily", priority: 1.0 },
    { url: baseUrl + "/html-templates", lastModified: contentDate, changeFrequency: "daily", priority: 0.96 },
    { url: baseUrl + "/pricing", lastModified: contentDate, changeFrequency: "weekly", priority: 0.88 },
    { url: baseUrl + "/prompts", lastModified: contentDate, changeFrequency: "weekly", priority: 0.55 },
    { url: baseUrl + "/blog", lastModified: contentDate, changeFrequency: "weekly", priority: 0.72 },
    { url: baseUrl + "/faq", lastModified: contentDate, changeFrequency: "monthly", priority: 0.7 },
    { url: baseUrl + "/about", lastModified: contentDate, changeFrequency: "monthly", priority: 0.66 },
    { url: baseUrl + "/support", lastModified: staticDate, changeFrequency: "monthly", priority: 0.58 },
    { url: baseUrl + "/contact", lastModified: staticDate, changeFrequency: "yearly", priority: 0.55 },
    { url: baseUrl + "/changelog", lastModified: contentDate, changeFrequency: "weekly", priority: 0.45 },
    { url: baseUrl + "/privacy", lastModified: staticDate, changeFrequency: "yearly", priority: 0.25 },
    { url: baseUrl + "/terms", lastModified: staticDate, changeFrequency: "yearly", priority: 0.25 },
    { url: baseUrl + "/disclaimer", lastModified: staticDate, changeFrequency: "yearly", priority: 0.25 },
    { url: baseUrl + "/dmca", lastModified: staticDate, changeFrequency: "yearly", priority: 0.25 },
    { url: baseUrl + "/cookie-policy", lastModified: staticDate, changeFrequency: "yearly", priority: 0.25 },
    { url: baseUrl + "/refund-policy", lastModified: staticDate, changeFrequency: "yearly", priority: 0.25 },
  ];

  const templateCategoryIds = Array.from(new Set([
    ...PRIORITY_TEMPLATE_CATEGORY_IDS,
    ...getTemplateCategoriesFor(templates).filter((category) => category.id !== "all").map((category) => category.id),
  ]));

  const templateCategoryRoutes: MetadataRoute.Sitemap = templateCategoryIds.map((categoryId) => ({
    url: baseUrl + "/template-categories/" + categoryId,
    lastModified: contentDate,
    changeFrequency: "daily" as const,
    priority: categoryId === "dashboards" ? 0.98 : categoryId === "ecommerce" ? 0.97 : categoryId === "landing" ? 0.96 : categoryId === "html" ? 0.95 : 0.93,
  }));

  const templateHubRoutes: MetadataRoute.Sitemap = TEMPLATE_SEO_HUBS.map((hub) => ({
    url: baseUrl + "/template-hubs/" + hub.slug,
    lastModified: contentDate,
    changeFrequency: "weekly" as const,
    priority: hub.slug === "nextjs-dashboard-templates" ? 0.98 : hub.slug === "react-admin-dashboard-templates" ? 0.97 : 0.94,
  }));

  const templateRoutes: MetadataRoute.Sitemap = templates.map((template) => ({
    url: baseUrl + "/templates/" + template.slug,
    lastModified: safeDate(template.lastUpdated, contentDate),
    changeFrequency: "weekly" as const,
    priority: !template.isFree ? (template.pricingTier === "pro" ? 0.99 : 0.97) : template.category === "html" ? 0.9 : 0.86,
  }));

  const promptCollectionRoutes: MetadataRoute.Sitemap = PROMPT_COLLECTIONS.map((collection) => ({
    url: baseUrl + getPromptCollectionHref(collection.slug),
    lastModified: contentDate,
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  const promptRoutes: MetadataRoute.Sitemap = prompts
    .filter(isPromptIndexable)
    .sort((left, right) => Number(right.featured) - Number(left.featured) || safeDate(right.updatedAt, contentDate).getTime() - safeDate(left.updatedAt, contentDate).getTime())
    .slice(0, MAX_PROMPT_SITEMAP_URLS)
    .map((prompt) => ({
      url: baseUrl + "/prompts/" + prompt.slug,
      lastModified: safeDate(prompt.updatedAt, contentDate),
      changeFrequency: "monthly" as const,
      priority: prompt.featured ? 0.46 : 0.38,
    }));

  const blogRoutes: MetadataRoute.Sitemap = BLOG_POSTS.map((post) => ({
    url: baseUrl + "/blog/" + post.slug,
    lastModified: safeDate(post.isoDate, contentDate),
    changeFrequency: "monthly" as const,
    priority: 0.68,
  }));

  return [...staticRoutes, ...templateCategoryRoutes, ...templateHubRoutes, ...templateRoutes, ...promptCollectionRoutes, ...promptRoutes, ...blogRoutes].map((route) => ({
    ...route,
    alternates: {
      languages: generateHreflangMap(route.url.replace(baseUrl, ""), baseUrl),
    },
  }));
}
