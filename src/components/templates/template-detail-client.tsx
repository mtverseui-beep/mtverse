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

function getCheckoutPackageId(template: Template) {
  if (template.isFree) return 'free-unlock' as const
  if (template.slug === 'ooster') return 'ooster-pro' as const
  return template.pricingTier === 'pro' ? 'pro' as const : 'next' as const
}

export function TemplateDetailClient({ template }: Props) {
  const { authenticated, loading: authLoading } = useAuth()
  const router = useRouter()
  const [liked, setLiked] = useState(false)
  const [saving, setSaving] = useState(false)
  const [buying, setBuying] = useState(false)
  const [canDownload, setCanDownload] = useState(false)
  const [checkingAccess, setCheckingAccess] = useState(false)
  const [freeRemaining, setFreeRemaining] = useState(5)
  const [freeLimitReached, setFreeLimitReached] = useState(false)
  const [freeUnlocked, setFreeUnlocked] = useState(false)
  const [alreadyDownloaded, setAlreadyDownloaded] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [downloadError, setDownloadError] = useState<string | null>(null)
  const [accessError, setAccessError] = useState<string | null>(null)
  const freeDownloadsUsed = Math.max(0, 5 - freeRemaining)
  const showFreeDownloadStatus = template.isFree && authenticated && !freeUnlocked && (freeDownloadsUsed > 0 || alreadyDownloaded || freeLimitReached)
  const hasDiscount = typeof template.originalPriceUsd === 'number' && template.originalPriceUsd > template.price

  useEffect(() => {
    let cancelled = false

    if (!authenticated) {
      setCanDownload(false)
      setLiked(false)
      setAccessError(null)
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
        const accessPayload = (await accessResponse.json().catch(() => null)) as { canDownload?: boolean; isFree?: boolean; freeRemaining?: number; freeLimitReached?: boolean; freeUnlocked?: boolean; alreadyDownloaded?: boolean } | null
        const savedPayload = (await savedResponse.json().catch(() => null)) as { saved?: boolean } | null

        if (!cancelled) {
          setCanDownload(Boolean(accessResponse.ok && accessPayload?.canDownload))
          setLiked(Boolean(savedResponse.ok && savedPayload?.saved))
          setAccessError(accessResponse.ok ? null : 'Could not verify template access right now. Please refresh and try again.')
          if (accessPayload) {
            setFreeRemaining(accessPayload.freeRemaining ?? 5)
            setFreeLimitReached(Boolean(accessPayload.freeLimitReached))
            setFreeUnlocked(Boolean(accessPayload.freeUnlocked))
            setAlreadyDownloaded(Boolean(accessPayload.alreadyDownloaded))
          }
        }
      } catch {
        if (!cancelled) {
          setCanDownload(false)
          setLiked(false)
          setAccessError('Could not verify template access right now. Please refresh and try again.')
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
      toast.info(template.isFree ? 'Please sign in to download free templates' : 'Please sign in to purchase templates')
      router.push(`/sign-in?next=/templates/${template.slug}`)
      return
    }

    setBuying(true)
    try {
      if (template.isFree && !freeLimitReached) {
        setDownloadError(accessError || 'Free download access could not be verified right now. Please refresh and try again.')
        return
      }

      const packageId = getCheckoutPackageId(template)
      const response = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageId, kitSlug: template.slug }),
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

  async function handleDownload() {
    setDownloading(true)
    setDownloadError(null)
    try {
      const response = await fetch(`/api/download/template/${template.slug}`, { credentials: 'include' })
      if (!response.ok) {
        const data = await response.json().catch(() => null) as { error?: string } | null
        if (response.status === 403 && template.isFree && !alreadyDownloaded) {
          setCanDownload(false)
          setFreeLimitReached(true)
          setFreeRemaining(0)
        }
        if (response.status === 401) {
          setAccessError('Please sign in again to continue downloading.')
        }
        setDownloadError(data?.error || 'Download failed. Please try again.')
        return
      }
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = template.slug + '.zip'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      if (template.isFree && !freeUnlocked && !alreadyDownloaded) {
        setAlreadyDownloaded(true)
        setFreeRemaining((current) => Math.max(0, current - 1))
        setFreeLimitReached(false)
      }

      setCanDownload(true)
      setAccessError(null)
      toast.success('Download started!')
    } catch {
      setDownloadError('Network error. Please check your connection and try again.')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div id="buy" className="ds-card sticky top-20 p-4 sm:p-5">
      <div className="flex items-baseline gap-2 mb-1">
        {template.isFree ? (
          <span className="text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400">Free</span>
        ) : (
          <>
            <span className="text-3xl sm:text-4xl font-bold text-foreground">${template.price}</span>
            {hasDiscount ? (
              <>
                <span className="text-base sm:text-lg text-muted-foreground line-through">${template.originalPriceUsd}</span>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  {Math.round((1 - template.price / template.originalPriceUsd!) * 100)}% off
                </span>
              </>
            ) : null}
          </>
        )}
      </div>
      <p className="text-xs text-muted-foreground mb-3">
        {template.isFree ? 'Free download - sign in required' : 'USD - one-time payment - lifetime access'}
      </p>

      {/* Free template: keep status visible after download too */}
      {showFreeDownloadStatus && (
        <p className="text-xs text-muted-foreground mb-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5">
          {alreadyDownloaded
            ? `This template is already unlocked. ${freeRemaining}/5 free downloads remaining`
            : freeLimitReached
              ? '5/5 free downloads used'
              : `${freeRemaining}/5 free downloads remaining`}
        </p>
      )}

      {/* Download button for already-downloaded or canDownload */}
      {canDownload && !freeLimitReached ? (
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="ds-btn ds-btn-primary w-full mb-3"
        >
          {downloading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Downloading...
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              {template.isFree ? 'Download Free' : 'Download package'}
            </>
          )}
        </button>
      ) : freeLimitReached && template.isFree ? (
        /* Free limit reached — show unlock CTA */
        <button
          onClick={handleBuy}
          disabled={buying || authLoading || checkingAccess}
          className="ds-btn ds-btn-accent w-full mb-3"
        >
          {buying ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Starting checkout...
            </>
          ) : (
            <>
              <ShoppingCart className="h-4 w-4" />
              Unlock unlimited - $5
            </>
          )}
        </button>
      ) : (
        /* Standard buy button */
        <button
          onClick={handleBuy}
          disabled={buying || authLoading || checkingAccess}
          className="ds-btn ds-btn-primary w-full mb-3"
        >
          {buying || authLoading || checkingAccess ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {buying ? 'Starting checkout...' : 'Loading...'}
            </>
          ) : template.isFree ? (
            <>
              <Download className="h-4 w-4" />
              Download Free
            </>
          ) : (
            <>
              <ShoppingCart className="h-4 w-4" />
              Buy now - ${template.price}
            </>
          )}
        </button>
      )}

      {/* Free limit reached info */}
      {freeLimitReached && template.isFree && (
        <p className="text-xs text-center text-muted-foreground mb-3">
          You&apos;ve used all 5 free downloads. Unlock unlimited for a one-time $5 payment.
        </p>
      )}

      {accessError ? (
        <p className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-200">
          {accessError}
        </p>
      ) : null}

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

      {/* Error Modal */}
      {downloadError && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-zinc-950/50 backdrop-blur-sm p-4" onClick={() => setDownloadError(null)}>
          <div className="w-full max-w-sm rounded-2xl border border-border bg-background p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
              <Shield className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Download failed</h3>
            <p className="text-sm text-muted-foreground mb-5">{downloadError}</p>
            <button
              onClick={() => setDownloadError(null)}
              className="ds-btn ds-btn-primary w-full"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  )
}