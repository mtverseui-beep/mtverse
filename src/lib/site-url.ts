const FALLBACK_SITE_URL = 'https://mtverse.dev'

function normalizeSiteUrl(value: string | undefined) {
  const trimmed = value?.trim()
  if (!trimmed) return ''
  return trimmed.replace(/\/+$/, '')
}

export const SITE_URL = normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL) || FALLBACK_SITE_URL

export function resolveSiteUrlFromRequestHeaders(headers: Headers) {
  const forwardedProto = headers.get('x-forwarded-proto')?.split(',')[0]?.trim()
  const forwardedHost = headers.get('x-forwarded-host')?.split(',')[0]?.trim()
  const host = forwardedHost || headers.get('host')?.trim()

  if (!host) return SITE_URL

  const protocol = forwardedProto || (host.includes('localhost') || host.startsWith('127.0.0.1') ? 'http' : 'https')
  return normalizeSiteUrl(`${protocol}://${host}`) || SITE_URL
}

export function absoluteUrl(path = '/') {
  if (/^https?:\/\//i.test(path)) return path
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`
}
