import type { Metadata } from 'next'
import Link from 'next/link'
import { AlertTriangle, ArrowRight, CheckCircle2, Download } from 'lucide-react'
import PublicLayout from '@/components/layout/PublicLayout'
import { getPlanByProviderTransactionId, setPlan } from '@/lib/plan-store'
import { isMockPaymentAllowed, verifyPaymentFromSearchParams } from '@/lib/payments'
import { recordTemplatePurchase } from '@/lib/template-social-store'

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

async function verifySuccess(searchParams: URLSearchParams) {
  const result = verifyPaymentFromSearchParams(searchParams)
  const transactionId = searchParams.get('transaction_id')
  const kitSlug = searchParams.get('kit')

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
    if (!record) {
      return {
        ...result,
        valid: false,
        pending: true,
        error: 'Paddle payment confirmation is still processing.',
      }
    }

    if (record.status !== 'revoked' && kitSlug) {
      await recordTemplatePurchase(kitSlug, record.email)
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

  if (result.valid && result.email && result.plan) {
    await setPlan(
      result.email,
      result.plan,
      undefined,
      searchParams.get('session_id') || undefined,
      undefined,
      result.provider,
      result.packageId || undefined
    )

    if (kitSlug) {
      await recordTemplatePurchase(kitSlug, result.email)
    }
  }

  return result
}

export default async function PricingSuccessPage({ searchParams }: { searchParams: SearchParams }) {
  const params = toUrlSearchParams(await searchParams)
  const result = await verifySuccess(params)
  const valid = Boolean(result.valid && result.plan && result.packageId)
  const kitSlug = params.get('kit')
  const downloadHref = kitSlug ? `/api/download/template/${encodeURIComponent(kitSlug)}` : '/api/download/package/next'

  return (
    <PublicLayout>
      <main className="ds-section min-h-[70vh]">
        <div className="ds-container max-w-2xl">
          <div className="ds-card p-8 text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
              {valid ? <CheckCircle2 className="h-7 w-7" /> : <AlertTriangle className="h-7 w-7" />}
            </div>

            <h1 className="ds-h1 mb-3">{valid ? 'Payment confirmed' : 'Payment not confirmed yet'}</h1>
            <p className="ds-muted mx-auto max-w-md">
              {valid
                ? 'Your mtverse dashboard package access is active. You can download the package now.'
                : result.error || 'We could not verify this payment. Please refresh after a moment or contact support if the charge completed.'}
            </p>

            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              {valid ? (
                <Link href={downloadHref} className="ds-btn ds-btn-primary">
                  <Download className="h-4 w-4" />
                  Download package
                </Link>
              ) : null}
              <Link href="/templates" className="ds-btn ds-btn-secondary">
                Back to templates
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </main>
    </PublicLayout>
  )
}