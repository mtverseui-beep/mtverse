'use client'

import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'

export function PricingFreeAccountCta() {
  const { authenticated, loading } = useAuth()

  if (loading) {
    return (
      <span className="ds-btn ds-btn-secondary pointer-events-none w-full mb-6 opacity-70">
        <Loader2 className="h-4 w-4 animate-spin" />
        Checking account...
      </span>
    )
  }

  if (authenticated) {
    return (
      <Link href="/templates?category=html" className="ds-btn ds-btn-secondary w-full mb-6">
        Browse free templates
      </Link>
    )
  }

  return (
    <Link href="/sign-up" className="ds-btn ds-btn-secondary w-full mb-6">
      Create free account
    </Link>
  )
}
