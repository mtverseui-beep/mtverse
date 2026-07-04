import { MetadataRoute } from "next";
import { headers } from "next/headers";
import { BLOG_POSTS } from "@/lib/blog-posts";
import { getPromptCollectionHref, PROMPT_COLLECTIONS } from "@/lib/prompt-collections";
import { getPublishedPrompts, isPromptIndexable } from "@/lib/prompt-db";
import { generateHreflangMap } from "@/lib/seo-languages";
import { resolveSiteUrlFromRequestHeaders } from "@/lib/site-url";
import { getAllTemplatesFromStore, TEMPLATES } from "@/lib/templates-data";

function safeDate(value: Date | string, fallback: Date) {
  const resolved = value instanceof Date ? value : new Date(value);
  return Number.isNaN(resolved.getTime()) ? fallback : resolved;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const requestHeaders = await headers();
  const baseUrl = resolveSiteUrlFromRequestHeaders(requestHeaders);
  const staticDate = new Date("2026-07-03");
  const contentDate = new Date("2026-07-03");
  const prompts = await getPublishedPrompts().catch(() => []);
  const templates = await getAllTemplatesFromStore().catch(() => TEMPLATES);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: contentDate, changeFrequency: "weekly", priority: 1.0 },
    { url: baseUrl + "/prompts", lastModified: contentDate, changeFrequency: "weekly", priority: 0.9 },
    { url: baseUrl + "/templates", lastModified: contentDate, changeFrequency: "weekly", priority: 0.9 },
    { url: baseUrl + "/html-templates", lastModified: contentDate, changeFrequency: "weekly", priority: 0.86 },
    { url: baseUrl + "/pricing", lastModified: contentDate, changeFrequency: "monthly", priority: 0.8 },
    { url: baseUrl + "/blog", lastModified: contentDate, changeFrequency: "weekly", priority: 0.8 },
    { url: baseUrl + "/about", lastModified: contentDate, changeFrequency: "monthly", priority: 0.68 },
    { url: baseUrl + "/contact", lastModified: staticDate, changeFrequency: "yearly", priority: 0.6 },
    { url: baseUrl + "/faq", lastModified: contentDate, changeFrequency: "monthly", priority: 0.72 },
    { url: baseUrl + "/support", lastModified: staticDate, changeFrequency: "monthly", priority: 0.6 },
    { url: baseUrl + "/changelog", lastModified: contentDate, changeFrequency: "weekly", priority: 0.5 },
    { url: baseUrl + "/privacy", lastModified: staticDate, changeFrequency: "yearly", priority: 0.3 },
    { url: baseUrl + "/terms", lastModified: staticDate, changeFrequency: "yearly", priority: 0.3 },
    { url: baseUrl + "/disclaimer", lastModified: staticDate, changeFrequency: "yearly", priority: 0.3 },
    { url: baseUrl + "/dmca", lastModified: staticDate, changeFrequency: "yearly", priority: 0.3 },
    { url: baseUrl + "/cookie-policy", lastModified: staticDate, changeFrequency: "yearly", priority: 0.3 },
    { url: baseUrl + "/refund-policy", lastModified: staticDate, changeFrequency: "yearly", priority: 0.3 },
  ];

  const promptCollectionRoutes: MetadataRoute.Sitemap = PROMPT_COLLECTIONS.map((collection) => ({
    url: baseUrl + getPromptCollectionHref(collection.slug),
    lastModified: contentDate,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const promptRoutes: MetadataRoute.Sitemap = prompts
    .filter(isPromptIndexable)
    .map((prompt) => ({
      url: baseUrl + "/prompts/" + prompt.slug,
      lastModified: safeDate(prompt.updatedAt, contentDate),
      changeFrequency: "weekly" as const,
      priority: prompt.featured ? 0.78 : 0.68,
    }));

  const templateRoutes: MetadataRoute.Sitemap = templates.map((template) => ({
    url: baseUrl + "/templates/" + template.slug,
    lastModified: safeDate(template.lastUpdated, contentDate),
    changeFrequency: template.category === "html" ? ("weekly" as const) : ("monthly" as const),
    priority: template.category === "html" ? 0.76 : template.isFree ? 0.72 : 0.82,
  }));

  const blogRoutes: MetadataRoute.Sitemap = BLOG_POSTS.map((post) => ({
    url: baseUrl + "/blog/" + post.slug,
    lastModified: safeDate(post.isoDate, contentDate),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...promptCollectionRoutes, ...promptRoutes, ...templateRoutes, ...blogRoutes].map((route) => ({
    ...route,
    alternates: {
      languages: generateHreflangMap(route.url.replace(baseUrl, ""), baseUrl),
    },
  }));
}
