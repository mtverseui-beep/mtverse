// SEO Languages - Multi-language hreflang support

export type SeoLanguage = {
  /** BCP 47 language tag */
  code: string
  /** Language name in its native script */
  name: string
  /** Text direction - "rtl" for Arabic and Hebrew */
  direction: 'ltr' | 'rtl'
}

/**
 * Comprehensive list of 31 languages for hreflang alternate tags.
 * Ordered roughly by global internet usage.
 */
export const SEO_LANGUAGES: SeoLanguage[] = [
  { code: 'en', name: 'English', direction: 'ltr' },
  { code: 'es', name: 'Spanish', direction: 'ltr' },
  { code: 'fr', name: 'French', direction: 'ltr' },
  { code: 'de', name: 'German', direction: 'ltr' },
  { code: 'it', name: 'Italian', direction: 'ltr' },
  { code: 'pt', name: 'Portuguese', direction: 'ltr' },
  { code: 'ja', name: 'Japanese', direction: 'ltr' },
  { code: 'ko', name: 'Korean', direction: 'ltr' },
  { code: 'zh', name: 'Chinese', direction: 'ltr' },
  { code: 'ru', name: 'Russian', direction: 'ltr' },
  { code: 'ar', name: 'Arabic', direction: 'rtl' },
  { code: 'hi', name: 'Hindi', direction: 'ltr' },
  { code: 'bn', name: 'Bengali', direction: 'ltr' },
  { code: 'tr', name: 'Turkish', direction: 'ltr' },
  { code: 'nl', name: 'Dutch', direction: 'ltr' },
  { code: 'pl', name: 'Polish', direction: 'ltr' },
  { code: 'sv', name: 'Swedish', direction: 'ltr' },
  { code: 'da', name: 'Danish', direction: 'ltr' },
  { code: 'fi', name: 'Finnish', direction: 'ltr' },
  { code: 'no', name: 'Norwegian', direction: 'ltr' },
  { code: 'cs', name: 'Czech', direction: 'ltr' },
  { code: 'sk', name: 'Slovak', direction: 'ltr' },
  { code: 'ro', name: 'Romanian', direction: 'ltr' },
  { code: 'hu', name: 'Hungarian', direction: 'ltr' },
  { code: 'el', name: 'Greek', direction: 'ltr' },
  { code: 'he', name: 'Hebrew', direction: 'rtl' },
  { code: 'th', name: 'Thai', direction: 'ltr' },
  { code: 'vi', name: 'Vietnamese', direction: 'ltr' },
  { code: 'id', name: 'Indonesian', direction: 'ltr' },
  { code: 'ms', name: 'Malay', direction: 'ltr' },
  { code: 'uk', name: 'Ukrainian', direction: 'ltr' },
] as const

/**
 * A plain-text string listing all supported languages with their codes.
 * Useful for embedding in meta tags or page footers for language discovery.
 *
 * Example output:
 *   "English (en), Spanish (es), French (fr), ..."
 */
export const LANGUAGE_DISCOVERY_META: string = SEO_LANGUAGES.map(
  (lang) => `${lang.name} (${lang.code})`
).join(', ')

function getPublicHreflangLanguages() {
  if (process.env.NEXT_PUBLIC_ENABLE_MULTILINGUAL_HREFLANG === 'true') {
    return SEO_LANGUAGES
  }

  return SEO_LANGUAGES.filter((lang) => lang.code === 'en')
}

/**
 * Generates an array of hreflang alternate entries for the given canonical
 * path. The "x-default" entry always points to the English version.
 *
 * @param canonicalPath - A site-relative path, e.g. "/prompts" or "/about"
 * @param baseUrl - The absolute site origin, e.g. "https://mtverse.dev"
 * @returns Array of { lang, url } objects ready for <link rel="alternate"> tags
 */
export function generateLanguageAlternates(
  canonicalPath: string,
  baseUrl: string
): Array<{ lang: string; url: string }> {
  const path = canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`
  const origin = baseUrl.replace(/\/+$/, '')

  const alternates: Array<{ lang: string; url: string }> = getPublicHreflangLanguages().map(
    (lang) => ({
      lang: lang.code,
      url: `${origin}${path}`,
    })
  )

  // Always add x-default pointing to the English version
  alternates.unshift({
    lang: 'x-default',
    url: `${origin}${path}`,
  })

  return alternates
}

/**
 * Generates hreflang link tags as a serialisable array for Next.js Metadata API.
 * Each entry is a { url, hreflang } pair suitable for `metadata.alternates.languages`.
 */
export function generateHreflangMap(
  canonicalPath: string,
  baseUrl: string
): Record<string, string> {
  const alternates = generateLanguageAlternates(canonicalPath, baseUrl)
  const map: Record<string, string> = {}

  for (const entry of alternates) {
    map[entry.lang] = entry.url
  }

  return map
}

// Keep backwards-compatible POPULAR_SITE_LANGUAGES export
export const POPULAR_SITE_LANGUAGES: ReadonlyArray<{ code: string; label: string }> = SEO_LANGUAGES.map((lang) => ({
  code: lang.code,
  label: lang.name,
}))
