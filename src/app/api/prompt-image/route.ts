import { NextRequest, NextResponse } from 'next/server'
import { getCloudflarePromptImageHosts } from '@/lib/prompt-image-hosts'

/**
 * Edge-cached image proxy.
 * Fetches prompt preview images from the allowlisted Cloudflare R2 host and
 * streams them back through our own origin so we can:
 *   - control caching headers (1-month browser + CDN cache)
 *   - fall back to a local SVG when the upstream image is missing/dead
 *   - keep the R2 bucket URL out of the page HTML (so users see our domain)
 */

export const runtime = 'edge'
export const revalidate = 2592000 // 30 days

const FALLBACK_IMAGE_PATH = '/prompt-previews/prompt-fallback-modern.svg'

function fallbackImageResponse(request: NextRequest) {
  const response = NextResponse.redirect(new URL(FALLBACK_IMAGE_PATH, request.url), 307)
  response.headers.set('Cache-Control', 'public, max-age=300, s-maxage=3600')
  return response
}

export async function GET(request: NextRequest) {
  const rawUrl = request.nextUrl.searchParams.get('url')

  if (!rawUrl) {
    return NextResponse.json({ error: 'Missing image URL.' }, { status: 400 })
  }

  let target: URL
  try {
    target = new URL(rawUrl)
  } catch {
    return NextResponse.json({ error: 'Invalid image URL.' }, { status: 400 })
  }

  if (
    target.protocol !== 'https:' ||
    !getCloudflarePromptImageHosts().has(target.hostname)
  ) {
    return NextResponse.json({ error: 'Image host is not allowed.' }, { status: 400 })
  }

  const upstreamTarget = new URL(target.toString())
  upstreamTarget.searchParams.delete('_mv_retry')

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 8000)

  try {
    const upstream = await fetch(upstreamTarget.toString(), {
      signal: controller.signal,
      headers: {
        Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'User-Agent': 'mtverse-image-proxy/1.0',
        Referer: 'https://mtverse.dev/',
      },
      cache: 'no-store',
    })

    clearTimeout(timeout)

    if (!upstream.ok || !upstream.body) {
      return fallbackImageResponse(request)
    }

    return new Response(upstream.body, {
      status: 200,
      headers: {
        'Content-Type': upstream.headers.get('content-type') || 'image/jpeg',
        'Cache-Control':
          'public, max-age=86400, s-maxage=2592000, stale-while-revalidate=604800',
      },
    })
  } catch {
    clearTimeout(timeout)
    return fallbackImageResponse(request)
  }
}
