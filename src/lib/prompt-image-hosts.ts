const DEFAULT_CLOUDFLARE_PROMPT_HOSTS = [
  'pub-59d1b450736b455084e9eebc2ed27f14.r2.dev',
]

function hostnameFromUrl(value?: string) {
  if (!value) return ''

  try {
    return new URL(value).hostname
  } catch {
    return ''
  }
}

export function getCloudflarePromptImageHosts() {
  return new Set([
    ...DEFAULT_CLOUDFLARE_PROMPT_HOSTS,
    hostnameFromUrl(process.env.CLOUDFLARE_R2_PUBLIC_URL),
  ].filter(Boolean))
}

export function isCloudflarePromptImageUrl(value: string) {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && getCloudflarePromptImageHosts().has(url.hostname)
  } catch {
    return false
  }
}
