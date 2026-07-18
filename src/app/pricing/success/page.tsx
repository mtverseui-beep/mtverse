import type { Metadata } from 'next'
import Link from 'next/link'
import { AlertTriangle, ArrowLeft, Blocks, CheckCircle2, Clock3, ExternalLink, PackageCheck } from 'lucide-react'
import PublicLayout from '@/components/layout/PublicLayout'
import { PackageDownloadButton } from '@/components/payment/package-download-button'
import { getPlanByProviderTransactionId, setPlan } from '@/lib/plan-store'
import { isMockPaymentAllowed, verifyPaymentFromSearchParams } from '@/lib/payments'
import { getVerifiedPaddleTransaction } from '@/lib/paddle-transaction'
import { hasTemplatePurchase, recordTemplatePurchase, setFreeUnlocked } from '@/lib/template-social-store'
import { getCurrentCustomer } from '@/lib/auth/current-customer'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Payment Confirmation | mtverse',
  description: 'Secure mtverse payment confirmation and template download access status.',
  robots: {
    index: false,
    follow: false,
  },
}

type SearchParams = Promise<Record<string, string | string[] | undefined>>

function shouldRecordTemplatePurchase(packageId: string | null | undefined, kitSlug: string | null) {
  return Boolean(kitSlug && !['free-unlock', 'all-paid', 'ui-library'].includes(packageId || ''))
}

function toUrlSearchParams(input: Record<string, string | string[] | undefined>) {
  const params = new URLSearchParams()

  for (const [key, value] of Object.entries(input)) {
    if (Array.isArray(value)) {
      for (const item of value) params.append(key, item)
    } else if (typeof value === 'string') {
      params.set(key, value)
    }
  }

  return params
}

async function verifySuccess(searchParams: URLSearchParams, currentEmail: string | null) {
  const result = verifyPaymentFromSearchParams(searchParams)
  const transactionId = searchParams.get('transaction_id') || searchParams.get('_ptxn') || searchParams.get('transactionId')
  const kitSlug = searchParams.get('kit')

  if (!currentEmail) {
    return { ...result, valid: false, email: null, error: 'Please sign in to verify this payment.' }
  }

  if (result.email && result.email !== currentEmail) {
    return { ...result, valid: false, email: null, error: 'Payment email does not match the signed-in account.' }
  }

  if (result.mock && !isMockPaymentAllowed()) {
    return {
      ...result,
      valid: false,
      error: 'Mock payment verification is disabled in production.',
    }
  }

  if (result.provider === 'paddle') {
    if (!transactionId) {
      return { ...result, valid: false, error: 'Missing Paddle transaction ID.' }
    }

    const record = await getPlanByProviderTransactionId(transactionId)
    if (record && (record.provider !== 'paddle' || record.email !== currentEmail)) {
      return { ...result, valid: false, email: null, mock: false, error: 'Payment does not belong to this account.' }
    }

    if (!record) {
      const verifiedTransaction = await getVerifiedPaddleTransaction(transactionId)
      if (!verifiedTransaction) {
        return {
          ...result,
          valid: false,
          pending: true,
          error: 'Paddle payment confirmation is still processing.',
        }
      }

      if (verifiedTransaction.email !== currentEmail) {
        return { ...result, valid: false, email: null, mock: false, error: 'Payment does not belong to this account.' }
      }

      if (verifiedTransaction.packageId === 'free-unlock') {
        await setFreeUnlocked(verifiedTransaction.email)
      } else if (verifiedTransaction.kitSlug) {
        await recordTemplatePurchase(verifiedTransaction.kitSlug, verifiedTransaction.email)
      }

      const createdRecord = await setPlan(
        verifiedTransaction.email,
        verifiedTransaction.plan,
        undefined,
        verifiedTransaction.transactionId,
        verifiedTransaction.customerId,
        'paddle',
        verifiedTransaction.packageId
      )

      return {
        ...result,
        valid: true,
        plan: createdRecord.plan,
        packageId: verifiedTransaction.packageId,
        email: createdRecord.email,
        mock: false,
      }
    }

    const verifiedTransaction = record.status !== 'revoked'
      ? await getVerifiedPaddleTransaction(transactionId)
      : null

    if (record.status !== 'revoked' && record.packageId === 'free-unlock') {
      await setFreeUnlocked(record.email)
    }

    if (verifiedTransaction?.packageId === 'free-unlock') {
      await setFreeUnlocked(verifiedTransaction.email)
    } else if (verifiedTransaction?.kitSlug) {
      await recordTemplatePurchase(verifiedTransaction.kitSlug, verifiedTransaction.email)
    }

    return {
      ...result,
      valid: record.status !== 'revoked',
      plan: record.status === 'revoked' ? null : record.plan,
      packageId: record.packageId || result.packageId,
      email: record.email,
      mock: false,
      error: record.status === 'revoked' ? 'This license has been revoked.' : undefined,
    }
  }

  if (result.valid && result.packageId === 'free-unlock') {
    await setFreeUnlocked(currentEmail)
  } else if (result.valid && result.plan) {
    await setPlan(
      currentEmail,
      result.plan,
      undefined,
      searchParams.get('session_id') || undefined,
      undefined,
      result.provider,
      result.packageId || undefined
    )

    if (shouldRecordTemplatePurchase(result.packageId, kitSlug)) {
      await recordTemplatePurchase(kitSlug, currentEmail)
    }
  }

  return { ...result, email: currentEmail }
}

export default async function PricingSuccessPage({ searchParams }: { searchParams: SearchParams }) {
  const params = toUrlSearchParams(await searchParams)
  const customer = await getCurrentCustomer()
  const result = await verifySuccess(params, customer.email)
  const kitSlug = params.get('kit')
  const isHtmlBundle = result.packageId === 'free-unlock'
  const isAllPaidBundle = result.packageId === 'all-paid'
  const isUiLibrary = result.packageId === 'ui-library'
  const uiLibraryUrl = process.env.NEXT_PUBLIC_UI_LIBRARY_URL?.trim() || 'https://ui.mtverse.dev'
  const templateAccessReady = Boolean(
    !kitSlug ||
    isHtmlBundle ||
    isAllPaidBundle ||
    isUiLibrary ||
    (result.email && await hasTemplatePurchase(kitSlug, result.email))
  )
  const valid = Boolean(result.valid && result.packageId && templateAccessReady)
  const paymentConfirmedWaitingForAccess = Boolean(result.valid && result.packageId && kitSlug && !templateAccessReady)
  const packageDownload = isHtmlBundle || isAllPaidBundle || isUiLibrary || !kitSlug
  const downloadHref = packageDownload
    ? `/api/download/package/${encodeURIComponent(result.packageId || 'next')}`
    : `/api/download/template/${encodeURIComponent(kitSlug)}`
  const successCopy = isHtmlBundle
    ? 'Your all HTML templates bundle access is active. The server will prepare one ZIP with every HTML template package.'
    : isAllPaidBundle
      ? 'Your all paid templates bundle is active. The server will prepare one ZIP with every paid template package and future updates stay included in your account.'
      : isUiLibrary
        ? 'Your mtverse UI Library lifetime access is active. Download the complete dashboard ZIP or open the library for protected component source.'
        : 'Your mtverse template package access is active. You can download the package now.'
  const waitingCopy = 'Payment confirmed. Your template access is still being prepared. Refresh this page in a few seconds; if it does not unlock, send the transaction ID to support.'

  return (
    <PublicLayout>
      <main className="ds-section min-h-[70vh] bg-gradient-to-b from-background via-muted/20 to-background">
        <div className="ds-container max-w-3xl">
          <div className="ds-card overflow-hidden p-0 text-center">
            <div className="border-b border-border/70 bg-muted/20 px-5 py-4 text-left sm:px-8">
              <Link href="/templates" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground">
                <ArrowLeft className="h-4 w-4" />
                Back to templates
              </Link>
            </div>

            <div className="p-6 sm:p-8 lg:p-10">
              <div className={`mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl ${valid ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'}`}>
                {valid ? <CheckCircle2 className="h-7 w-7" /> : <AlertTriangle className="h-7 w-7" />}
              </div>

              <div className="mx-auto mb-3 inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs font-bold text-muted-foreground shadow-sm">
                {valid ? <PackageCheck className="h-3.5 w-3.5 text-emerald-600" /> : <Clock3 className="h-3.5 w-3.5 text-amber-600" />}
                {valid ? 'Access active' : 'Verification pending'}
              </div>

              <h1 className="text-3xl font-black tracking-normal text-foreground sm:text-4xl">
                {valid ? 'Payment confirmed' : 'Payment not confirmed yet'}
              </h1>
              <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
                {valid
                  ? successCopy
                  : paymentConfirmedWaitingForAccess
                    ? waitingCopy
                    : result.error || 'We could not verify this payment. Please refresh after a moment or contact support if the charge completed.'}
              </p>

              {valid && (isHtmlBundle || isAllPaidBundle || isUiLibrary) ? (
                <div className="mx-auto mt-6 grid max-w-xl gap-3 rounded-2xl border border-border/70 bg-muted/25 p-4 text-left sm:grid-cols-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Bundle</p>
                    <p className="mt-1 text-sm font-semibold text-foreground">{isUiLibrary ? 'UI Library' : isAllPaidBundle ? 'All paid templates' : 'All HTML templates'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Delivery</p>
                    <p className="mt-1 text-sm font-semibold text-foreground">{isUiLibrary ? 'Protected source + ZIP' : 'Generated ZIP'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Access</p>
                    <p className="mt-1 text-sm font-semibold text-foreground">Lifetime</p>
                  </div>
                </div>
              ) : null}

              <div className={isUiLibrary ? "mx-auto mt-7 grid max-w-xl gap-3 sm:grid-cols-3" : "mx-auto mt-7 grid max-w-xl gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start"}>
                {valid && isUiLibrary ? (
                  <>
                    <PackageDownloadButton
                      href={downloadHref}
                      label="Download ZIP"
                      loadingLabel="Preparing ZIP..."
                      className="min-w-0"
                    />
                    <Link href={uiLibraryUrl} className="ds-btn ds-btn-secondary h-12 min-w-0 px-4 text-sm">
                      <Blocks className="h-4 w-4" />
                      <span className="truncate">Open UI Library</span>
                      <ExternalLink className="h-4 w-4 shrink-0" />
                    </Link>
                  </>
                ) : valid ? (

                  <PackageDownloadButton
                    href={downloadHref}
                    label={isHtmlBundle ? 'Download all HTML ZIP' : isAllPaidBundle ? 'Download all paid ZIP' : 'Download package'}
                    loadingLabel={isHtmlBundle ? 'Preparing all HTML ZIP...' : isAllPaidBundle ? 'Preparing all paid ZIP...' : 'Preparing ZIP...'}
                    detail={isHtmlBundle || isAllPaidBundle ? 'The server is collecting template packages and creating one ZIP. Keep this tab open; the download starts automatically when the archive is ready.' : undefined}
                    resetMs={isHtmlBundle || isAllPaidBundle ? 45000 : 12000}
                    className="min-w-0"
                  />
                ) : null}
                <Link href="/templates" className="ds-btn ds-btn-secondary h-12 self-start px-5 text-sm">
                  Browse templates
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </PublicLayout>
  )
}
