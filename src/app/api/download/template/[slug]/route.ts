import { Readable } from 'node:stream'
import { GetObjectCommand, NoSuchKey, S3Client, type GetObjectCommandOutput } from '@aws-sdk/client-s3'
import { NextRequest, NextResponse } from 'next/server'
import { getCurrentCustomerEmail } from '@/lib/auth/current-customer'
import { getCloudflareR2Config, isCloudflareR2Configured } from '@/lib/cloudflare-r2'
import { getDashboardKit } from '@/lib/dashboard-kit-store'
import { getPlan } from '@/lib/plan-store'
import { hasTemplatePurchase, hasFreeDownload, getFreeDownloadStatus, recordFreeDownload } from '@/lib/template-social-store'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type RouteContext = {
  params: Promise<{
    slug: string
  }>
}

function canDownloadTemplate(record: Awaited<ReturnType<typeof getPlan>>) {
  if (!record) return false
  return record.packageId === 'next' || (!record.packageId && (record.plan === 'pro' || record.plan === 'business' || record.plan === 'extended'))
}

function toWebStream(body: GetObjectCommandOutput['Body']) {
  if (!body) return null

  const maybeWebStream = body as {
    transformToWebStream?: () => ReadableStream
  }

  if (typeof maybeWebStream.transformToWebStream === 'function') {
    return maybeWebStream.transformToWebStream()
  }

  return Readable.toWeb(body as NodeJS.ReadableStream) as ReadableStream
}

function isMissingR2Object(error: unknown) {
  if (error instanceof NoSuchKey) return true
  const statusCode = (error as { $metadata?: { httpStatusCode?: number } })?.$metadata?.httpStatusCode
  return statusCode === 404
}

export async function GET(request: NextRequest, context: RouteContext) {
  const { slug } = await context.params
  const kit = await getDashboardKit(slug)

  if (!kit || kit.status !== 'available') {
    return NextResponse.json({ error: 'Template package not found.' }, { status: 404 })
  }

  const email = await getCurrentCustomerEmail(request)
  if (!email) {
    return NextResponse.json({ error: 'Please sign in to download this template.' }, { status: 401 })
  }

  // Free template flow
  if (kit.isFree) {
    const [planRecord, alreadyDownloaded, freeStatus] = await Promise.all([
      getPlan(email),
      hasFreeDownload(slug, email),
      getFreeDownloadStatus(email),
    ])

    const hasPaidPlan = canDownloadTemplate(planRecord)
    const canDl = hasPaidPlan || freeStatus.unlocked || alreadyDownloaded || !freeStatus.limitReached

    if (!canDl) {
      return NextResponse.json(
        { error: 'Free download limit reached. Unlock unlimited free downloads for $5.' },
        { status: 403 }
      )
    }

    // Record the free download (won't increment if already downloaded)
    if (!alreadyDownloaded && !hasPaidPlan) {
      await recordFreeDownload(slug, email)
    }
  } else {
    // Paid template flow (unchanged)
    const [planRecord, purchased] = await Promise.all([
      getPlan(email),
      hasTemplatePurchase(slug, email),
    ])
    if (!canDownloadTemplate(planRecord) || !purchased) {
      return NextResponse.json({ error: 'This template is not included in your purchase.' }, { status: 403 })
    }
  }

  if (!isCloudflareR2Configured()) {
    return NextResponse.json({ error: 'Template downloads are not configured yet.' }, { status: 503 })
  }

  if (!kit.packageKey) {
    return NextResponse.json({ error: 'Template package key is missing.' }, { status: 404 })
  }

  const config = getCloudflareR2Config()
  const s3Client = new S3Client({
    region: 'auto',
    endpoint: config.endpoint,
    forcePathStyle: true,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  })

  try {
    const object = await s3Client.send(
      new GetObjectCommand({
        Bucket: config.bucket,
        Key: kit.packageKey,
      })
    )
    const stream = toWebStream(object.Body)

    if (!stream) {
      return NextResponse.json({ error: 'Template package file is empty.' }, { status: 502 })
    }

    const headers = new Headers({
      'Content-Type': object.ContentType || 'application/zip',
      'Content-Disposition': `attachment; filename="${kit.packageFilename}"`,
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    })

    if (object.ContentLength) {
      headers.set('Content-Length', String(object.ContentLength))
    }

    return new Response(stream, { headers })
  } catch (error) {
    if (isMissingR2Object(error)) {
      return NextResponse.json({ error: 'Template ZIP is missing in storage.' }, { status: 404 })
    }

    console.error('[Template Download] R2 stream failed:', error)
    return NextResponse.json({ error: 'Template download failed.' }, { status: 502 })
  }
}