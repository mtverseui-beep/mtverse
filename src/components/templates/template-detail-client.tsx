'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Eye,
  ShoppingCart,
  Heart,
  Share,
  Shield,
  Zap,
  Download,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'
import type { Template } from '@/lib/templates-catalog'
import { useAuth } from '@/hooks/use-auth'
import { openPaddleCheckout } from '@/lib/paddle-client'
import type { PaddleCheckoutPayload } from '@/lib/paddle-types'

type Props = {
  template: Template
}

export function TemplateDetailClient({ template }: Props) {
  const { authenticated, loading: authLoading } = useAuth()
  const router = useRouter()
  const [liked, setLiked] = useState(false)
  const [saving, setSaving] = useState(false)
  const [buying, setBuying] = useState(false)
  const [canDownload, setCanDownload] = useState(false)
  const [checkingAccess, setCheckingAccess] = useState(false)
  const hasDiscount = typeof template.originalPriceUsd === 'number' && template.originalPriceUsd > template.price

  useEffect(() => {
    let cancelled = false

    if (!authenticated) {
      setCanDownload(false)
      setLiked(false)
      setCheckingAccess(false)
      return
    }

    async function loadUserTemplateState() {
      setCheckingAccess(true)
      try {
        const [accessResponse, savedResponse] = await Promise.all([
          fetch(`/api/templates/${encodeURIComponent(template.slug)}/access`, { credentials: 'include' }),
          fetch(`/api/templates/${encodeURIComponent(template.slug)}/save`, { credentials: 'include' }),
        ])
        const accessPayload = (await accessResponse.json().catch(() => null)) as { canDownload?: boolean } | null
        const savedPayload = (await savedResponse.json().catch(() => null)) as { saved?: boolean } | null

        if (!cancelled) {
          setCanDownload(Boolean(accessResponse.ok && accessPayload?.canDownload))
          setLiked(Boolean(savedResponse.ok && savedPayload?.saved))
        }
      } catch {
        if (!cancelled) {
          setCanDownload(false)
          setLiked(false)
        }
      } finally {
        if (!cancelled) setCheckingAccess(false)
      }
    }

    void loadUserTemplateState()

    return () => {
      cancelled = true
    }
  }, [authenticated, template.slug])

  async function handleBuy() {
    if (!authenticated) {
      toast.info('Please sign in to purchase templates')
      router.push(`/sign-in?next=/templates/${template.slug}`)
      return
    }

    setBuying(true)
    try {
      const response = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageId: 'next', kitSlug: template.slug }),
      })
      const checkout = (await response.json()) as {
        url?: string
        paddle?: PaddleCheckoutPayload
        error?: string
        code?: string
      }

      if (!response.ok) {
        if (checkout.code === 'sign_in_required') {
          router.push(`/sign-in?next=/templates/${template.slug}`)
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
        successUrl.searchParams.set('package', checkout.paddle.packageId)
        successUrl.searchParams.set('provider', 'paddle')
        successUrl.searchParams.set('kit', template.slug)
        if (checkout.paddle.customerEmail) successUrl.searchParams.set('email', checkout.paddle.customerEmail)
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

  async function handleSave() {
    if (!authenticated) {
      toast.info('Please sign in to save templates')
      router.push(`/sign-in?next=/templates/${template.slug}`)
      return
    }

    setSaving(true)
    try {
      const response = await fetch(`/api/templates/${encodeURIComponent(template.slug)}/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ saved: !liked }),
      })
      const payload = (await response.json().catch(() => null)) as { saved?: boolean; error?: string } | null

      if (!response.ok || !payload) {
        throw new Error(payload?.error || 'Template could not be saved')
      }

      setLiked(Boolean(payload.saved))
      toast.success(payload.saved ? 'Saved to your library' : 'Removed from saved templates')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Template could not be saved')
    } finally {
      setSaving(false)
    }
  }

  function handleShare() {
    if (navigator.share) {
      navigator.share({
        title: template.title,
        text: template.summary,
        url: window.location.href,
      }).catch(() => {})
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied to clipboard')
    }
  }

  return (
    <div id="buy" className="ds-card sticky top-20 p-4 sm:p-5">
      <div className="flex items-baseline gap-2 mb-1">
        <span className="text-3xl sm:text-4xl font-bold text-foreground">${template.price}</span>
        {hasDiscount ? (
          <>
            <span className="text-base sm:text-lg text-muted-foreground line-through">${template.originalPriceUsd}</span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              {Math.round((1 - template.price / template.originalPriceUsd!) * 100)}% off
            </span>
          </>
        ) : null}
      </div>
      <p className="text-xs text-muted-foreground mb-3">USD · one-time payment · lifetime access</p>

      {canDownload ? (
        <Link href={`/api/download/template/${template.slug}`} className="ds-btn ds-btn-primary w-full mb-3">
          <Download className="h-4 w-4" />
          Download package
        </Link>
      ) : (
        <button
          onClick={handleBuy}
          disabled={buying || authLoading || checkingAccess}
          className="ds-btn ds-btn-primary w-full mb-3"
        >
          {buying ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Starting checkout...
            </>
          ) : (
            <>
              <ShoppingCart className="h-4 w-4" />
              Buy now - ${template.price}
            </>
          )}
        </button>
      )}

      <Link href={`/preview/${template.slug}`} target="_blank" className="ds-btn ds-btn-secondary w-full mb-2">
        <Eye className="h-4 w-4" />
        Live preview
      </Link>

      <div className="grid grid-cols-2 gap-2 mb-4">
        <button
          onClick={handleSave}
          disabled={authLoading || checkingAccess || saving}
          className={`ds-btn ds-btn-ghost ds-btn-sm ${liked ? 'text-rose-600' : ''}`}
        >
          {saving || authLoading || checkingAccess ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Heart className={`h-4 w-4 ${liked ? 'fill-current' : ''}`} />
          )}
          {liked ? 'Saved' : 'Save'}
        </button>
        <button onClick={handleShare} className="ds-btn ds-btn-ghost ds-btn-sm">
          <Share className="h-4 w-4" />
          Share
        </button>
      </div>

      <div className="flex items-center gap-3 pb-3 mb-3 border-b">
        <div className="h-10 w-10 rounded-full bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 flex items-center justify-center font-bold">
          {template.author.avatar}
        </div>
        <div>
          <div className="text-sm font-semibold">{template.author.name}</div>
          <div className="text-xs text-muted-foreground">Verified author</div>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-start gap-2">
          <Shield className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold">{template.license}</div>
            <div className="text-xs text-muted-foreground">Use in one production project</div>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <Zap className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold">Instant download</div>
            <div className="text-xs text-muted-foreground">Access immediately after purchase</div>
          </div>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t text-xs text-muted-foreground flex items-center justify-between">
        <span>Updated: {new Date(template.lastUpdated).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        <span>v1.0</span>
      </div>
    </div>
  )
}