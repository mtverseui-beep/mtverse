import { redirect } from 'next/navigation'

import { getCurrentCustomer } from '@/lib/auth/current-customer'

export const dynamic = 'force-dynamic'

type SearchParams = Promise<Record<string, string | string[] | undefined>>

function safeUiLibraryUrl(value: string | undefined) {
  const fallback = process.env.NEXT_PUBLIC_UI_LIBRARY_URL?.trim() || 'https://ui.mtverse.dev'

  if (!value) return fallback

  try {
    const url = new URL(value)
    const allowed = new Set([new URL(fallback).origin, 'https://ui.mtverse.dev'])

    if (process.env.NODE_ENV !== 'production') {
      allowed.add('http://localhost:3000')
      allowed.add('http://127.0.0.1:3000')
      allowed.add('http://localhost:3001')
      allowed.add('http://127.0.0.1:3001')
    }

    return allowed.has(url.origin) ? url.toString() : fallback
  } catch {
    return fallback
  }
}

export default async function UiLibraryContinuePage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams
  const returnTo = safeUiLibraryUrl(typeof params.returnTo === 'string' ? params.returnTo : undefined)
  const customer = await getCurrentCustomer()

  if (!customer.email) {
    const next = `/ui-library/continue?returnTo=${encodeURIComponent(returnTo)}`
    redirect(`/sign-in?next=${encodeURIComponent(next)}`)
  }

  redirect(returnTo)
}
