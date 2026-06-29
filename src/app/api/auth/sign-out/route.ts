import { NextResponse } from 'next/server'
import { CUSTOMER_SESSION_COOKIE } from '@/lib/auth/customer-session'

const NEXTAUTH_COOKIES = [
  'next-auth.session-token',
  '__Secure-next-auth.session-token',
  'next-auth.callback-url',
  '__Secure-next-auth.callback-url',
  'next-auth.csrf-token',
  '__Host-next-auth.csrf-token',
]

export async function POST() {
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

  return response
}