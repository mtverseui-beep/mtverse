import { NextRequest, NextResponse } from 'next/server'
import { CUSTOMER_SESSION_COOKIE, verifyCustomerSessionToken } from '@/lib/auth/customer-session'
import { recordAuthEvent } from '@/lib/auth/auth-event-log'

const NEXTAUTH_COOKIES = [
  'next-auth.session-token',
  '__Secure-next-auth.session-token',
  'next-auth.callback-url',
  '__Secure-next-auth.callback-url',
  'next-auth.csrf-token',
  '__Host-next-auth.csrf-token',
]

export async function POST(request: NextRequest) {
  const session = verifyCustomerSessionToken(request.cookies.get(CUSTOMER_SESSION_COOKIE)?.value || '')
  const response = NextResponse.json({ success: true })
  const secure = process.env.NODE_ENV === 'production'

  response.cookies.set(CUSTOMER_SESSION_COOKIE, '', {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  })

  for (const name of NEXTAUTH_COOKIES) {
    response.cookies.set(name, '', {
      httpOnly: true,
      secure,
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    })
  }

  await recordAuthEvent({
    request,
    type: 'sign_out',
    status: 'success',
    provider: session?.email ? 'email' : 'oauth',
    email: session?.email || null,
    reason: 'sign_out',
    message: 'Customer signed out.',
  })

  return response
}