import "server-only";

import { unstable_cache } from "next/cache";
import { getPublishedPrompts } from "@/lib/prompt-db";
import { getAllTemplatesFromStore } from "@/lib/templates-data";
import type { SiteSearchResult } from "@/lib/site-search";

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function includesQuery(value: string | undefined, query: string) {
  return Boolean(value && normalize(value).includes(query));
}

function getScore(
  candidate: {
    title: string;
    description?: string;
    category?: string;
    tags?: string[];
  },
  query: string,
) {
  const normalizedTitle = normalize(candidate.title);
  let score = 0;

  if (normalizedTitle === query) score += 120;
  if (normalizedTitle.startsWith(query)) score += 90;
  if (normalizedTitle.includes(query)) score += 70;
  if (includesQuery(candidate.category, query)) score += 30;
  if (includesQuery(candidate.description, query)) score += 18;
  if (candidate.tags?.some((tag) => includesQuery(tag, query))) score += 16;

  return score;
}

const getCachedSearchSiteContent = unstable_cache(
  async (normalizedQuery: string, limit: number): Promise<SiteSearchResult[]> => {
    const [prompts, templates] = await Promise.all([
      getPublishedPrompts(),
      getAllTemplatesFromStore(),
    ]);

    const promptResults = prompts
      .filter((prompt) =>
        [
          prompt.title,
          prompt.summary,
          prompt.description,
          prompt.categoryTitle,
          prompt.subcategory,
          prompt.audience,
          prompt.visualStyle,
          ...prompt.models,
          ...prompt.tags,
          ...prompt.bestFor,
        ].some((value) => includesQuery(value, normalizedQuery)),
      )
      .map((prompt) => ({
        id: `prompt:${prompt.id}`,
        type: "prompt" as const,
        title: prompt.title,
        description: prompt.summary,
        href: `/prompts/${prompt.slug}`,
        category: "Prompt Hub",
        subcategory: prompt.subcategory,
        badge: "Prompt",
        score: getScore(
          {
            title: prompt.title,
            description: `${prompt.summary} ${prompt.description}`,
            category: `${prompt.categoryTitle} ${prompt.subcategory}`,
            tags: [...prompt.models, ...prompt.tags, ...prompt.bestFor],
          },
          normalizedQuery,
        ),
      }));

    const templateResults = templates
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
        type: "template" as const,
        title: template.title,
        description: template.summary,
        href: `/templates/${template.slug}`,
        category: "Templates",
        subcategory: template.subcategory,
        badge: template.categoryLabel || "Template",
        score: getScore(
          {
            title: template.title,
            description: `${template.summary} ${template.description}`,
            category: `${template.categoryLabel || ""} ${template.subcategory || ""}`,
            tags: [
              ...template.tags,
              ...(template.keywords || []),
              ...template.techStack,
              ...template.features.slice(0, 12),
            ],
          },
          normalizedQuery,
        ),
      }));

    return [...templateResults, ...promptResults]
      .sort((left, right) => right.score - left.score || left.title.localeCompare(right.title))
      .slice(0, limit)
      .map(({ score: _score, ...result }) => result);
  },
  ["site-search-results"],
  { revalidate: 1800, tags: ["prompts", "templates"] },
);

export async function searchSiteContent(query: string, limit = 12): Promise<SiteSearchResult[]> {
  const normalizedQuery = normalize(query);

  if (normalizedQuery.length < 2) {
    return [];
  }

  return getCachedSearchSiteContent(normalizedQuery, limit);
}
