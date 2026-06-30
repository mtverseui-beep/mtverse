import { MetadataRoute } from "next";
import { getPublishedPrompts, isPromptIndexable } from "@/lib/prompt-db";
import { getPromptCollectionHref, PROMPT_COLLECTIONS } from "@/lib/prompt-collections";
import { getAllTemplatesFromStore } from "@/lib/templates-data";
import { BLOG_POSTS } from "@/lib/blog-posts";
import { SITE_URL } from "@/lib/site-url";
import { generateHreflangMap } from "@/lib/seo-languages";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_URL;
  const staticDate = new Date("2026-06-27");
  const contentDate = new Date("2026-06-27");
  const prompts = await getPublishedPrompts().catch(() => []);
  const templates = await getAllTemplatesFromStore();

  // ── Static public pages ────────────────────────────────
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: contentDate, changeFrequency: "weekly", priority: 1.0 },
    { url: `${baseUrl}/prompts`, lastModified: contentDate, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/templates`, lastModified: contentDate, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/pricing`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/blog`, lastModified: contentDate, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/about`, lastModified: staticDate, changeFrequency: "yearly", priority: 0.6 },
    { url: `${baseUrl}/contact`, lastModified: staticDate, changeFrequency: "yearly", priority: 0.6 },
    { url: `${baseUrl}/faq`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/support`, lastModified: staticDate, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/changelog`, lastModified: contentDate, changeFrequency: "weekly", priority: 0.5 },
    // Legal pages (important for AdSense)
    { url: `${baseUrl}/privacy`, lastModified: staticDate, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/terms`, lastModified: staticDate, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/disclaimer`, lastModified: staticDate, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/dmca`, lastModified: staticDate, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/cookie-policy`, lastModified: staticDate, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/refund-policy`, lastModified: staticDate, changeFrequency: "yearly", priority: 0.3 },
  ];

  // ── Prompt collection pages ────────────────────────────
  const promptCollectionRoutes: MetadataRoute.Sitemap = PROMPT_COLLECTIONS.map(
    (collection) => ({
      url: `${baseUrl}${getPromptCollectionHref(collection.slug)}`,
      lastModified: contentDate,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })
  );

  // ── Individual prompt slugs ────────────────────────────
  const promptRoutes: MetadataRoute.Sitemap = prompts
    .filter(isPromptIndexable)
    .map((prompt) => ({
      url: `${baseUrl}/prompts/${prompt.slug}`,
      lastModified: new Date(prompt.updatedAt),
      changeFrequency: "weekly" as const,
      priority: 0.75,
    }));

  // ── Template routes ────────────────────────────────────
  const templateRoutes: MetadataRoute.Sitemap = templates.map((template) => ({
    url: `${baseUrl}/templates/${template.slug}`,
    lastModified: new Date(template.lastUpdated),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  // ── Blog post routes ───────────────────────────────────
  const blogRoutes: MetadataRoute.Sitemap = BLOG_POSTS.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.isoDate),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // ── Add hreflang alternates to key routes ──────────────
  const routesWithHreflang = [...staticRoutes, ...promptCollectionRoutes, ...promptRoutes, ...templateRoutes, ...blogRoutes].map((route) => ({
    ...route,
    alternates: {
      languages: generateHreflangMap(route.url.replace(baseUrl, ""), baseUrl),
    },
  }));

  return routesWithHreflang;
}
