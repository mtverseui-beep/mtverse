import { NextRequest, NextResponse } from 'next/server'

import { getCurrentCustomerEmail } from '@/lib/auth/current-customer'
import { hasPlanPackageAccess, getPlan } from '@/lib/plan-store'
import { createUiLibraryAccessToken } from '@/lib/ui-library-access'

export const dynamic = 'force-dynamic'

function getAllowedOrigins() {
  const configured = process.env.NEXT_PUBLIC_UI_LIBRARY_URL?.trim()
  const origins = new Set(['https://ui.mtverse.dev'])

  if (configured) origins.add(configured.replace(/\/$/, ''))
  if (process.env.NODE_ENV !== 'production') {
    origins.add('http://localhost:3000')
    origins.add('http://127.0.0.1:3000')
    origins.add('http://localhost:3001')
    origins.add('http://127.0.0.1:3001')
  }

  return origins
}

function corsHeaders(origin: string | null) {
  const allowedOrigin = origin && getAllowedOrigins().has(origin) ? origin : null

  return {
    ...(allowedOrigin ? { 'Access-Control-Allow-Origin': allowedOrigin } : {}),
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Cache-Control': 'private, no-store, max-age=0',
    Vary: 'Origin',
  }
}

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin')

  if (origin && !getAllowedOrigins().has(origin)) {
    return new NextResponse(null, { status: 403, headers: corsHeaders(null) })
  }

  return new NextResponse(null, { status: 204, headers: corsHeaders(origin) })
}

export async function GET(request: NextRequest) {
  const origin = request.headers.get('origin')
  const headers = corsHeaders(origin)

  if (origin && !getAllowedOrigins().has(origin)) {
    return NextResponse.json({ error: 'Origin is not allowed.' }, { status: 403, headers })
  }

  const email = await getCurrentCustomerEmail(request)
  if (!email) {
    return NextResponse.json(
      { authenticated: false, canAccess: false, error: 'Sign in to access component source code.' },
      { status: 401, headers }
    )
  }

  const plan = await getPlan(email)
  if (!hasPlanPackageAccess(plan, 'ui-library')) {
    return NextResponse.json(
      { authenticated: true, canAccess: false, error: 'UI Library lifetime access is required.' },
      { status: 403, headers }
    )
  }

  const access = createUiLibraryAccessToken(email)
  return NextResponse.json(
    { authenticated: true, canAccess: true, accessToken: access.token, expiresAt: access.expiresAt },
    { headers }
  )
}
