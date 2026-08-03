'use client'

import { useEffect } from 'react'
import { track } from '@vercel/analytics'

type Props = {
  confirmed: boolean
  packageId?: string | null
  templateSlug?: string | null
}

export function PurchaseAnalytics({ confirmed, packageId, templateSlug }: Props) {
  useEffect(() => {
    if (!confirmed || !packageId) return

    const key = `mtverse:purchase-event:${packageId}:${templateSlug || 'bundle'}`
    if (sessionStorage.getItem(key)) return
    sessionStorage.setItem(key, '1')

    track('purchase_confirmed', {
      packageId,
      templateSlug: templateSlug || 'bundle',
    })
  }, [confirmed, packageId, templateSlug])

  return null
}