import 'server-only'

import { cookies } from 'next/headers'
import { getServerSession } from 'next-auth'
import type { NextRequest } from 'next/server'
import { authOptions } from '@/lib/auth/oauth'
import { CUSTOMER_SESSION_COOKIE, verifyCustomerSessionToken } from '@/lib/auth/customer-session'
import { getPlan } from '@/lib/plan-store'
import type { PlanLevel } from '@/lib/plan-access'

export async function getCurrentCustomerEmail(request: Pick<NextRequest, 'cookies'>) {
  const sessionToken = request.cookies.get(CUSTOMER_SESSION_COOKIE)?.value
  const customerSession = sessionToken ? verifyCustomerSessionToken(sessionToken) : null

  if (customerSession?.email) {
    return customerSession.email.toLowerCase().trim()
  }

  const oauthSession = await getServerSession(authOptions)
  const oauthEmail = oauthSession?.user?.email

  return oauthEmail ? oauthEmail.toLowerCase().trim() : null
}

export async function getCurrentCustomer() {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get(CUSTOMER_SESSION_COOKIE)?.value
  const customerSession = sessionToken ? verifyCustomerSessionToken(sessionToken) : null
  const oauthSession = customerSession ? null : await getServerSession(authOptions)
  const email = customerSession?.email || oauthSession?.user?.email || null
  const normalizedEmail = email ? email.toLowerCase().trim() : null
  const planRecord = normalizedEmail ? await getPlan(normalizedEmail) : null

  return {
    email: normalizedEmail,
    name: customerSession?.name || oauthSession?.user?.name || null,
    image: oauthSession?.user?.image || null,
    plan: (planRecord?.plan || 'free') as PlanLevel,
    licenseKey: planRecord?.licenseKey || null,
    packageId: planRecord?.packageId || null,
  }
}
