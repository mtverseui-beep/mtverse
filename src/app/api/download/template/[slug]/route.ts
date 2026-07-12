import { createReadStream, existsSync } from 'node:fs'
import { stat } from 'node:fs/promises'
import { join, resolve, sep } from 'node:path'
import { Readable } from 'node:stream'
import { GetObjectCommand, NoSuchKey, S3Client, type GetObjectCommandOutput } from '@aws-sdk/client-s3'
import { NextRequest, NextResponse } from 'next/server'
import { getCurrentCustomerEmail } from '@/lib/auth/current-customer'
import { getCloudflareR2Config, isCloudflareR2PackageStorageConfigured } from '@/lib/cloudflare-r2'
import { getDashboardKit } from '@/lib/dashboard-kit-store'
import { getPlan, hasPlanPackageAccess } from '@/lib/plan-store'
import {
  FreeDownloadLimitError,
  getFreeDownloadStatus,
  hasFreeDownload,
  hasTemplatePurchase,
  recordFreeDownload,
  recordTemplateDownload,
} from '@/lib/template-social-store'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type RouteContext = {
  params: Promise<{
    slug: string
  }>
}

const LOCAL_TEMPLATE_PACKAGE_ROOT = resolve(join(process.cwd(), 'data'))
const ALL_PAID_BUNDLE_PACKAGE_ID = 'all-paid'

function hasAllPaidTemplatesAccess(record: Awaited<ReturnType<typeof getPlan>>) {
  return hasPlanPackageAccess(record, ALL_PAID_BUNDLE_PACKAGE_ID)
}

function resolveLocalTemplatePackagePath(packageKey: string | undefined) {
  if (!packageKey?.startsWith('local:')) return null

  const relativePath = packageKey.slice('local:'.length).replace(/^[/\\]+/, '')
  if (!relativePath) return null

  const resolvedPath = resolve(LOCAL_TEMPLATE_PACKAGE_ROOT, relativePath)
  const safePrefix = `${LOCAL_TEMPLATE_PACKAGE_ROOT}${sep}`

  if (resolvedPath !== LOCAL_TEMPLATE_PACKAGE_ROOT && !resolvedPath.startsWith(safePrefix)) {
    return null
  }

  return resolvedPath
}

async function recordFreeDownloadIfNeeded(shouldRecordFreeDownload: boolean, slug: string, email: string) {
  if (!shouldRecordFreeDownload) return null

  try {
    await recordFreeDownload(slug, email)
  } catch (error) {
    if (error instanceof FreeDownloadLimitError) {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }
    throw error
  }

  return null
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

  let shouldRecordFreeDownload = false

  if (kit.isFree) {
    const [planRecord, alreadyDownloaded, freeStatus] = await Promise.all([
      getPlan(email),
      hasFreeDownload(slug, email),
      getFreeDownloadStatus(email),
    ])

    const canDl = freeStatus.unlocked || alreadyDownloaded || !freeStatus.limitReached

    if (!canDl) {
      return NextResponse.json(
        { error: 'Free download limit reached. Unlock unlimited free downloads for $5.' },
        { status: 403 }
      )
    }

    shouldRecordFreeDownload = !alreadyDownloaded && !freeStatus.unlocked
  } else {
    const [planRecord, purchased] = await Promise.all([
      getPlan(email),
      hasTemplatePurchase(slug, email),
    ])

    const hasBundleAccess = hasAllPaidTemplatesAccess(planRecord)

    if (!purchased && !hasBundleAccess) {
      return NextResponse.json({ error: 'This template is not included in your purchase.' }, { status: 403 })
    }
  }

  if (!kit.packageKey) {
    return NextResponse.json({ error: 'Template package key is missing.' }, { status: 404 })
  }

  const localPackagePath = resolveLocalTemplatePackagePath(kit.packageKey)
  if (localPackagePath) {
    if (!existsSync(localPackagePath)) {
      return NextResponse.json({ error: 'Local template ZIP is missing.' }, { status: 404 })
    }

    const freeDownloadError = await recordFreeDownloadIfNeeded(shouldRecordFreeDownload, slug, email)
    if (freeDownloadError) return freeDownloadError
    if (!kit.isFree) await recordTemplateDownload(slug, email)

    const fileStats = await stat(localPackagePath)
    const headers = new Headers({
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${kit.packageFilename}"`,
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
      'Content-Length': String(fileStats.size),
    })

    return new Response(Readable.toWeb(createReadStream(localPackagePath)) as ReadableStream, { headers })
  }

  if (!isCloudflareR2PackageStorageConfigured()) {
    return NextResponse.json({ error: 'Private template package storage is not configured yet.' }, { status: 503 })
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
        Bucket: config.packageBucket,
        Key: kit.packageKey,
      })
    )
    const stream = toWebStream(object.Body)

    if (!stream) {
      return NextResponse.json({ error: 'Template package file is empty.' }, { status: 502 })
    }

    const freeDownloadError = await recordFreeDownloadIfNeeded(shouldRecordFreeDownload, slug, email)
    if (freeDownloadError) return freeDownloadError
    if (!kit.isFree) await recordTemplateDownload(slug, email)

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

