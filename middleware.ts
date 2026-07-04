import { NextRequest, NextResponse } from 'next/server'

const ADMIN_SESSION_COOKIE = 'multiverse_admin_session'
const CANONICAL_HOST = 'www.mtverse.dev'
const LEGACY_GONE_PROMPT_SLUGS = new Set([
  'nano-banana-pro-0879-elegant-confidence-in-cinematic-light',
  'nano-banana-pro-0354-step-back-in-time-edo-castle-town-in-stunning-detail',
  'nano-banana-pro-0033-transform-your-menu-with-tasty-visuals',
  'nano-banana-pro-0274-craft-the-perfect-scene-with-nano-banana-s-3x3-grid-magic',
  'nano-banana-pro-0548-the-quest-for-the-perfect-knot-a-nano-banana-s-dilemma',
  'nano-banana-pro-0689-confident-glamour-in-vintage-noir',
])

function buildSignInUrl(request: NextRequest) {
  const signInUrl = new URL('/admin-login', request.url)
  const nextPath = `${request.nextUrl.pathname}${request.nextUrl.search}`

  signInUrl.searchParams.set('next', nextPath)

  return signInUrl
}

function getRequestHost(request: NextRequest) {
  return request.headers.get('host')?.toLowerCase().split(':')[0] || ''
}

function buildCanonicalHostRedirect(request: NextRequest) {
  const url = request.nextUrl.clone()
  url.hostname = CANONICAL_HOST
  url.protocol = 'https'
  return NextResponse.redirect(url, 308)
}

function getPromptSlugFromPath(pathname: string) {
  if (!pathname.startsWith('/prompts/')) return ''
  const rawSlug = pathname.slice('/prompts/'.length).replace(/\/+$/, '')
  try {
    return decodeURIComponent(rawSlug)
  } catch {
    return rawSlug
  }
}

function buildGoneResponse() {
  return new NextResponse('Gone', {
    status: 410,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'X-Robots-Tag': 'noindex, nofollow',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  })
}

async function verifyAdminSessionToken(token: string): Promise<{ email: string; exp: number; iat: number } | null> {
  try {
    const [payloadPart, signaturePart] = token.split('.')

    if (!payloadPart || !signaturePart) {
      return null
    }

    const secret = process.env.ADMIN_SESSION_SECRET
    if (!secret) {
      return null
    }

    const encoder = new TextEncoder()

    const normalized = payloadPart.replace(/-/g, '+').replace(/_/g, '/')
    const padding = normalized.length % 4 === 0 ? '' : '='.repeat(4 - (normalized.length % 4))
    const binaryString = atob(`${normalized}${padding}`)
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }

    const decoder = new TextDecoder()
    const payload = JSON.parse(decoder.decode(bytes))

    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    )

    const normalizedSig = signaturePart.replace(/-/g, '+').replace(/_/g, '/')
    const sigPadding = normalizedSig.length % 4 === 0 ? '' : '='.repeat(4 - (normalizedSig.length % 4))
    const sigBinaryString = atob(`${normalizedSig}${sigPadding}`)
    const signatureBytes = new Uint8Array(sigBinaryString.length)
    for (let i = 0; i < sigBinaryString.length; i++) {
      signatureBytes[i] = sigBinaryString.charCodeAt(i)
    }

    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      signatureBytes,
      new Uint8Array(encoder.encode(JSON.stringify(payload)))
    )

    if (!isValid) {
      return null
    }

    const now = Math.floor(Date.now() / 1000)
    if (!payload.email || payload.exp <= now) {
      return null
    }

    return payload
  } catch {
    return null
  }
}

async function handleRequest(request: NextRequest) {
  const { pathname } = request.nextUrl
  const host = getRequestHost(request)

  if (host === `www.${CANONICAL_HOST}`) {
    return buildCanonicalHostRedirect(request)
  }

  if (LEGACY_GONE_PROMPT_SLUGS.has(getPromptSlugFromPath(pathname))) {
    return buildGoneResponse()
  }

  const isAdminRoute = pathname === '/admin' || pathname.startsWith('/admin/')
  const isAdminLoginRoute = pathname === '/admin-login'

  if (!isAdminRoute && !isAdminLoginRoute) {
    return NextResponse.next()
  }

  const cookieValue = request.cookies.get(ADMIN_SESSION_COOKIE)?.value
  const customSession = cookieValue ? await verifyAdminSessionToken(cookieValue) : null
  const hasValidAdminSession = Boolean(customSession)

  if (isAdminRoute && !hasValidAdminSession) {
    return NextResponse.redirect(buildSignInUrl(request))
  }

  if (isAdminLoginRoute && hasValidAdminSession) {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  return NextResponse.next()
}

export default async function middleware(request: NextRequest) {
  return handleRequest(request)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|SiteLogo.png).*)'],
}
