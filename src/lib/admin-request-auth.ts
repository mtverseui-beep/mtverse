import 'server-only'

import { cookies } from 'next/headers'
import type { NextRequest } from 'next/server'
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from '@/lib/admin-auth'

export type AdminAuthResult = {
  authorized: boolean
  email: string | null
  source: 'custom' | null
}

const UNAUTHORIZED_RESULT: AdminAuthResult = {
  authorized: false,
  email: null,
  source: null,
}

async function getCustomSessionAuth(cookieValue: string | undefined): Promise<AdminAuthResult | null> {
  if (!cookieValue) {
    return null
  }

  const session = await verifyAdminSessionToken(cookieValue)

  if (!session) {
    return null
  }

  return {
    authorized: true,
    email: session.email,
    source: 'custom',
  }
}

export async function authorizeAdminPageRequest(): Promise<AdminAuthResult> {
  const cookieStore = await cookies()
  return (await getCustomSessionAuth(cookieStore.get(ADMIN_SESSION_COOKIE)?.value)) || UNAUTHORIZED_RESULT
}

export async function authorizeAdminRequest(request: Pick<NextRequest, 'cookies'>): Promise<AdminAuthResult> {
  return (await getCustomSessionAuth(request.cookies.get(ADMIN_SESSION_COOKIE)?.value)) || UNAUTHORIZED_RESULT
}
