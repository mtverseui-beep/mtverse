import { NextRequest, NextResponse } from 'next/server'

const ADMIN_SESSION_COOKIE = 'multiverse_admin_session'

function buildSignInUrl(request: NextRequest) {
  const signInUrl = new URL('/admin-login', request.url)
  const nextPath = `${request.nextUrl.pathname}${request.nextUrl.search}`

  signInUrl.searchParams.set('next', nextPath)

  return signInUrl
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
    
    // Decode payload
    const normalized = payloadPart.replace(/-/g, '+').replace(/_/g, '/')
    const padding = normalized.length % 4 === 0 ? '' : '='.repeat(4 - (normalized.length % 4))
    const binaryString = atob(`${normalized}${padding}`)
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }
    
    const decoder = new TextDecoder()
    const payload = JSON.parse(decoder.decode(bytes))

    // Verify signature
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
  const isAdminRoute = pathname === '/admin' || pathname.startsWith('/admin/')
  const cookieValue = request.cookies.get(ADMIN_SESSION_COOKIE)?.value
  const customSession = cookieValue ? await verifyAdminSessionToken(cookieValue) : null
  const hasValidAdminSession = Boolean(customSession)

  if (isAdminRoute && !hasValidAdminSession) {
    return NextResponse.redirect(buildSignInUrl(request))
  }

  if (pathname === '/admin-login' && hasValidAdminSession) {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  return NextResponse.next()
}

export default async function middleware(request: NextRequest) {
  return handleRequest(request)
}

export const config = {
  matcher: ['/admin/:path*', '/admin-login'],
}
