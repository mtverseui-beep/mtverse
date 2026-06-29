import { Readable } from 'node:stream'
import { GetObjectCommand, NoSuchKey, S3Client, type GetObjectCommandOutput } from '@aws-sdk/client-s3'
import { NextRequest, NextResponse } from 'next/server'
import { getCurrentCustomerEmail } from '@/lib/auth/current-customer'
import { getCloudflareR2Config, isCloudflareR2Configured } from '@/lib/cloudflare-r2'
import { getPackageDownloadFilename, getPackageDownloadKey } from '@/lib/package-downloads'
import { getPlan } from '@/lib/plan-store'
import { isPackageId, type PackageId } from '@/lib/packages'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type RouteContext = {
  params: Promise<{
    packageId: string
  }>
}

function canDownloadPackage(record: Awaited<ReturnType<typeof getPlan>>, packageId: PackageId) {
  if (!record) return false
  if (packageId !== 'next') return false
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
  const { packageId: rawPackageId } = await context.params

  if (!isPackageId(rawPackageId)) {
    return NextResponse.json({ error: 'Invalid package.' }, { status: 400 })
  }

  const email = await getCurrentCustomerEmail(request)
  if (!email) {
    return NextResponse.json({ error: 'Please sign in to download this package.' }, { status: 401 })
  }

  const planRecord = await getPlan(email)
  if (!canDownloadPackage(planRecord, rawPackageId)) {
    return NextResponse.json({ error: 'This package is not included in your purchase.' }, { status: 403 })
  }

  if (!isCloudflareR2Configured()) {
    return NextResponse.json({ error: 'Package downloads are not configured yet.' }, { status: 503 })
  }

  const config = getCloudflareR2Config()
  const key = getPackageDownloadKey(rawPackageId)
  const filename = getPackageDownloadFilename(rawPackageId)
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
        Key: key,
      })
    )
    const stream = toWebStream(object.Body)

    if (!stream) {
      return NextResponse.json({ error: 'Package file is empty.' }, { status: 502 })
    }

    const headers = new Headers({
      'Content-Type': object.ContentType || 'application/zip',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    })

    if (object.ContentLength) {
      headers.set('Content-Length', String(object.ContentLength))
    }

    return new Response(stream, { headers })
  } catch (error) {
    if (isMissingR2Object(error)) {
      return NextResponse.json(
        { error: 'Package ZIP is missing in storage.' },
        { status: 404 }
      )
    }

    console.error('[Package Download] R2 stream failed:', error)
    return NextResponse.json({ error: 'Package download failed.' }, { status: 502 })
  }
}

