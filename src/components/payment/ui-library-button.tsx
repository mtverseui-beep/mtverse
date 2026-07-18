'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Blocks, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { useAuth } from '@/hooks/use-auth'
import { openPaddleCheckout } from '@/lib/paddle-client'
import type { PaddleCheckoutPayload } from '@/lib/paddle-types'

type UiLibraryButtonProps = {
  label?: string
  className?: string
}

export function UiLibraryButton({
  label = 'Unlock the UI Library for $25',
  className = 'ds-btn ds-btn-primary w-full',
}: UiLibraryButtonProps) {
  const { authenticated, loading: authLoading } = useAuth()
  const router = useRouter()
  const [buying, setBuying] = useState(false)

  async function handleClick() {
    if (!authenticated) {
      toast.info('Sign in to unlock the mtverse UI Library')
      router.push('/sign-in?next=/pricing')
      return
    }

    setBuying(true)
    try {
      const response = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageId: 'ui-library' }),
      })
      const checkout = (await response.json()) as {
        url?: string
        paddle?: PaddleCheckoutPayload
        error?: string
        code?: string
      }

      if (!response.ok) {
        if (checkout.code === 'sign_in_required') {
          router.push('/sign-in?next=/pricing')
          return
        }
        throw new Error(checkout.error || 'Checkout failed')
      }

      if (checkout.url) {
        router.push(checkout.url)
        return
      }

      if (checkout.paddle) {
        const successUrl = new URL('/pricing/success', window.location.origin)
        successUrl.searchParams.set('package', 'ui-library')
        successUrl.searchParams.set('provider', 'paddle')
        await openPaddleCheckout(checkout.paddle, successUrl.toString())
        return
      }

      throw new Error('Checkout did not return a redirect URL.')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to start checkout')
    } finally {
      setBuying(false)
    }
  }

  return (
    <button onClick={handleClick} disabled={buying || authLoading} className={className}>
      {buying ? <Loader2 className="h-4 w-4 animate-spin" /> : <Blocks className="h-4 w-4" />}
      {buying ? 'Opening checkout...' : authenticated ? label : 'Sign in to unlock'}
    </button>
  )
}
