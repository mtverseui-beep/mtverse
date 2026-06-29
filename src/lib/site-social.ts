// ─────────────────────────────────────────────────────────
// Site social & contact links — driven by env vars.
// Set these in .env.local to configure all links site-wide.
// ─────────────────────────────────────────────────────────

export const SOCIAL_EMAIL = process.env.NEXT_PUBLIC_SOCIAL_EMAIL || 'hello@mtverse.dev'
export const SOCIAL_GITHUB = process.env.NEXT_PUBLIC_SOCIAL_GITHUB || 'https://github.com/mtverse'
export const SOCIAL_TWITTER = process.env.NEXT_PUBLIC_SOCIAL_TWITTER || 'https://x.com/mtverse'

/** GitHub username/org slug extracted from the URL, e.g. "mtverse" */
export function getGithubHandle() {
  return SOCIAL_GITHUB.replace(/^https?:\/\/github\.com\//, '').replace(/\/$/, '')
}

/** Twitter/X handle extracted from the URL, e.g. "@mtverse" */
export function getTwitterHandle() {
  const slug = SOCIAL_TWITTER.replace(/^https?:\/\/(www\.)?(x|twitter)\.com\//, '').replace(/\/$/, '')
  return slug ? `@${slug}` : '@mtverse'
}
