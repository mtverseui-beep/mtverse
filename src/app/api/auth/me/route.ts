import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { Session } from 'next-auth'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/oauth'
import { CUSTOMER_SESSION_COOKIE, verifyCustomerSessionToken } from '@/lib/auth/customer-session'
import { getCustomerUser, upsertCustomerProfile } from '@/lib/auth/customer-store'
import { getPlan, hasPlanPackageAccess } from '@/lib/plan-store'

function hasInvalidOAuthUrlEnv() {
  return [process.env.NEXTAUTH_URL, process.env.AUTH_URL].some(value => value !== undefined && value.trim() === '')
}

export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get(CUSTOMER_SESSION_COOKIE)?.value
  const session = token ? verifyCustomerSessionToken(token) : null
  let oauthSession: Session | null = null

  if (!session && !hasInvalidOAuthUrlEnv()) {
    try {
      oauthSession = await getServerSession(authOptions)
    } catch (error) {
      console.error('OAuth session lookup failed:', error)
    }
  }

  const email = session?.email || oauthSession?.user?.email

  if (!email) {
    return NextResponse.json({
      authenticated: false,
      user: null,
      plan: 'free',
      licenseKey: null,
      entitlements: { uiLibrary: false },
    })
  }

  const userPromise = oauthSession?.user?.email
    ? upsertCustomerProfile({
        email,
        name: oauthSession.user.name,
        image: oauthSession.user.image,
        provider: 'oauth',
      })
    : getCustomerUser(email)

  const [user, planRecord] = await Promise.all([
    userPromise,
    getPlan(email),
  ])

  return NextResponse.json({
    authenticated: true,
    user: user || {
      email,
      name: oauthSession?.user?.name || session?.name || email.split('@')[0],
      image: oauthSession?.user?.image || null,
    },
    plan: planRecord?.plan || 'free',
    licenseKey: planRecord?.licenseKey || null,
    entitlements: {
      uiLibrary: hasPlanPackageAccess(planRecord, 'ui-library'),
    },
  })
}
