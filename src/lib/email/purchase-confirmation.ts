import 'server-only'

import { purchaseConfirmationEmail } from '@/lib/email/templates'
import { isResendConfigured, sendEmail } from '@/lib/email/resend'
import { getProductPackage, type PackageId } from '@/lib/packages'
import { getRedisClient, hasRuntimeKvStore } from '@/lib/runtime-kv'
import { SITE_URL } from '@/lib/site-url'
import { getTemplateBySlugFromStore } from '@/lib/templates-data'

const SENT_TTL_SECONDS = 365 * 24 * 60 * 60

export async function sendPurchaseConfirmationOnce(input: {
  email: string
  packageId: PackageId
  kitSlug?: string | null
  transactionId: string
}) {
  if (!isResendConfigured()) return { status: 'skipped' as const }

  const dedupeKey = `email:purchase-confirmation:${input.transactionId}`
  const redis = hasRuntimeKvStore() ? getRedisClient() : null
  if (redis) {
    const claimed = await redis.setNx(dedupeKey, 'sending', 10 * 60)
    if (!claimed) return { status: 'duplicate' as const }
  }

  try {
    const product = getProductPackage(input.packageId)
    const template = input.kitSlug ? await getTemplateBySlugFromStore(input.kitSlug) : null
    const itemName = template?.title || product.name
    const accessUrl = input.packageId === 'ui-library'
      ? `${SITE_URL}/account`
      : input.kitSlug && !['all-paid', 'ui-library'].includes(input.packageId)
        ? `${SITE_URL}/templates/${encodeURIComponent(input.kitSlug)}`
        : `${SITE_URL}/account`
    const content = purchaseConfirmationEmail({
      itemName,
      amount: `$${product.amountUsd.toFixed(2)} USD`,
      transactionId: input.transactionId,
      accessUrl,
    })

    const result = await sendEmail({
      to: input.email,
      ...content,
      tags: [
        { name: 'category', value: 'purchase' },
        { name: 'package', value: input.packageId },
      ],
    })

    if (redis) await redis.setex(dedupeKey, SENT_TTL_SECONDS, `sent:${result.id}`)
    return { status: 'sent' as const, id: result.id }
  } catch (error) {
    if (redis) await redis.del(dedupeKey).catch(() => undefined)
    throw error
  }
}
