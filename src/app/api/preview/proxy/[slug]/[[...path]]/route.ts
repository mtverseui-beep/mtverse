import { NextRequest, NextResponse } from 'next/server'
import { getDashboardKit } from '@/lib/dashboard-kit-store'
import { getPreviewUrl } from '@/lib/dashboard-kits'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

type RouteContext = {
  params: Promise<{
    slug: string
    path?: string[]
  }>
}

const BLOCKED_HEADERS = [
  'x-frame-options',
  'content-security-policy',
  'content-security-policy-report-only',
  'content-encoding',
  'content-length',
  'transfer-encoding',
  'access-control-allow-origin',
  'access-control-allow-methods',
  'access-control-allow-headers',
]

function appendPath(base: string, path: string[]) {
  const url = new URL(base)
  if (path.length) {
    url.pathname = [url.pathname.replace(/\/+$/, ''), ...path.map((segment) => encodeURIComponent(segment))].join('/')
  }
  return url
}

function getOrigin(urlStr: string) {
  try {
    const url = new URL(urlStr)
    return url.origin
  } catch {
    return ''
  }
}

function isAllowedPreviewUrl(value: string) {
  try {
    const url = new URL(value)
    const hostname = url.hostname.toLowerCase()

    if (url.protocol !== 'https:' && !(process.env.NODE_ENV !== 'production' && url.protocol === 'http:')) {
      return false
    }

    if (process.env.NODE_ENV !== 'production' && ['localhost', '127.0.0.1', '::1'].includes(hostname)) {
      return true
    }

    if (hostname === 'mtverse.dev' || hostname === 'www.mtverse.dev' || hostname.endsWith('.mtverse.dev')) {
      return true
    }

    return hostname.endsWith('.vercel.app')
  } catch {
    return false
  }
}

async function fetchPreview(targetUrl: URL) {
  const expectedOrigin = targetUrl.origin
  let currentUrl = targetUrl

  for (let redirectCount = 0; redirectCount <= 5; redirectCount += 1) {
    const response = await fetch(currentUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'mtverse-preview-proxy/1.0',
        'Accept-Encoding': 'identity',
      },
      redirect: 'manual',
    })

    if (response.status < 300 || response.status >= 400) return response

    const location = response.headers.get('location')
    if (!location) throw new Error('Preview redirect is missing a location header.')

    const nextUrl = new URL(location, currentUrl)
    if (nextUrl.origin !== expectedOrigin) {
      throw new Error('Preview redirect left the approved origin.')
    }
    currentUrl = nextUrl
  }

  throw new Error('Preview redirect limit exceeded.')
}

function injectBaseTag(html: string, baseUrl: string): string {
  // Inject <base href="..."> into <head> so all relative URLs resolve against the origin
  const baseTag = `<base href="${baseUrl}/">`
  
  if (html.includes('<head>')) {
    return html.replace('<head>', `<head>${baseTag}`)
  }
  if (html.includes('<head ')) {
    return html.replace(/<head\s[^>]*>/, (match) => `${match}${baseTag}`)
  }
  if (html.includes('<html')) {
    return html.replace(/<html[^>]*>/, (match) => `${match}<head>${baseTag}</head>`)
  }
  return `${baseTag}${html}`
}

async function proxyRequest(request: NextRequest, context: RouteContext) {
  const { slug, path = [] } = await context.params
  const kit = await getDashboardKit(slug)

  if (!kit) {
    return NextResponse.json({ error: 'Preview not available.' }, { status: 404 })
  }

  const previewUrl = getPreviewUrl(kit)
  if (!isAllowedPreviewUrl(previewUrl)) {
    return NextResponse.json({ error: 'Preview domain is not allowed.' }, { status: 403 })
  }

  const targetUrl = appendPath(previewUrl, path)
  targetUrl.search = request.nextUrl.search

  try {
    const response = await fetchPreview(targetUrl)

    // Read the full body
    const bodyBuffer = await response.arrayBuffer()
    const contentType = response.headers.get('content-type') || ''

    // Copy response headers, excluding frame-blocking and encoding headers
    const headers = new Headers()
    response.headers.forEach((value, key) => {
      if (!BLOCKED_HEADERS.includes(key.toLowerCase())) {
        headers.set(key, value)
      }
    })

    // For HTML responses, inject <base> tag so relative assets load from the origin
    if (contentType.includes('text/html')) {
      const html = new TextDecoder().decode(bodyBuffer)
      const origin = getOrigin(previewUrl)
      const rewrittenHtml = injectBaseTag(html, origin)
      const rewrittenBody = new TextEncoder().encode(rewrittenHtml)
      
      headers.set('Content-Length', String(rewrittenBody.byteLength))
      headers.set('Content-Type', 'text/html; charset=utf-8')

      return new NextResponse(rewrittenBody, {
        status: response.status,
        statusText: response.statusText,
        headers,
      })
    }

    // For non-HTML responses, pass through as-is
    headers.set('Content-Length', String(bodyBuffer.byteLength))

    return new NextResponse(bodyBuffer, {
      status: response.status,
      statusText: response.statusText,
      headers,
    })
  } catch (error) {
    console.error('[Preview Proxy] Fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch preview content.' },
      { status: 502 }
    )
  }
}

export async function GET(request: NextRequest, context: RouteContext) {
  return proxyRequest(request, context)
}

export async function POST() {
  return NextResponse.json(
    { error: 'Preview proxy accepts read-only requests.' },
    { status: 405, headers: { Allow: 'GET' } }
  )
}
