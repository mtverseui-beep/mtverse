import { Readable } from 'node:stream'
import JSZip from 'jszip'
import { GetObjectCommand, NoSuchKey, S3Client, type GetObjectCommandOutput } from '@aws-sdk/client-s3'
import { NextRequest, NextResponse } from 'next/server'
import { getCurrentCustomerEmail } from '@/lib/auth/current-customer'
import { getCloudflareR2Config, isCloudflareR2Configured } from '@/lib/cloudflare-r2'
import { getDashboardKits } from '@/lib/dashboard-kit-store'
import { getPackageDownloadFilename, getPackageDownloadKey } from '@/lib/package-downloads'
import { getPlan } from '@/lib/plan-store'
import { getFreeDownloadStatus } from '@/lib/template-social-store'
import { isPackageId, type PackageId } from '@/lib/packages'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type RouteContext = {
  params: Promise<{
    packageId: string
  }>
}

const HTML_PACKAGE_PREFIX = 'templates/html/'
const HTML_BUNDLE_PACKAGE_ID: PackageId = 'free-unlock'

function hasPaidTemplateAccess(record: Awaited<ReturnType<typeof getPlan>>) {
  if (!record) return false
  return record.plan === 'pro' || record.plan === 'business' || record.plan === 'extended'
}

function canDownloadStaticPackage(record: Awaited<ReturnType<typeof getPlan>>, packageId: PackageId) {
  if (packageId !== 'next' && packageId !== 'pro') return false
  return hasPaidTemplateAccess(record)
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

async function toBuffer(body: GetObjectCommandOutput['Body']) {
  if (!body) return Buffer.alloc(0)

  const maybeByteArray = body as {
    transformToByteArray?: () => Promise<Uint8Array>
  }

  if (typeof maybeByteArray.transformToByteArray === 'function') {
    return Buffer.from(await maybeByteArray.transformToByteArray())
  }

  const chunks: Buffer[] = []
  for await (const chunk of body as AsyncIterable<Buffer | Uint8Array | string>) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
  }
  return Buffer.concat(chunks)
}

function isMissingR2Object(error: unknown) {
  if (error instanceof NoSuchKey) return true
  const statusCode = (error as { $metadata?: { httpStatusCode?: number } })?.$metadata?.httpStatusCode
  return statusCode === 404
}

function safeBundleSegment(value: string | undefined) {
  return (value || 'html')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'html'
}

function createR2Client() {
  const config = getCloudflareR2Config()
  return {
    config,
    s3Client: new S3Client({
      region: 'auto',
      endpoint: config.endpoint,
      forcePathStyle: true,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    }),
  }
}

async function createHtmlBundleResponse(email: string, planRecord: Awaited<ReturnType<typeof getPlan>>) {
  const freeStatus = await getFreeDownloadStatus(email)
  const hasPaidPlan = hasPaidTemplateAccess(planRecord)

  if (!hasPaidPlan && !freeStatus.unlocked) {
    return NextResponse.json({ error: 'Unlock the all HTML templates bundle for $5 before downloading.' }, { status: 403 })
  }

  if (!isCloudflareR2Configured()) {
    return NextResponse.json({ error: 'HTML bundle downloads are not configured yet.' }, { status: 503 })
  }

  const kits = await getDashboardKits()
  const htmlKits = kits
    .filter((kit) => kit.status === 'available' && kit.category === 'html' && kit.packageKey?.startsWith(HTML_PACKAGE_PREFIX) && kit.packageKey.endsWith('.zip'))
    .sort((left, right) => {
      const category = (left.subcategory || '').localeCompare(right.subcategory || '')
      return category || left.title.localeCompare(right.title)
    })

  if (!htmlKits.length) {
    return NextResponse.json({ error: 'HTML bundle packages are not available yet.' }, { status: 404 })
  }

  const { config, s3Client } = createR2Client()
  const bundle = new JSZip()
  const manifest = htmlKits.map((kit) => ({
    slug: kit.slug,
    title: kit.title,
    category: kit.subcategory || 'HTML',
    filename: kit.packageFilename || `${kit.slug}.zip`,
    livePreviewUrl: kit.livePreviewUrl || null,
  }))

  bundle.file('README.txt', [
    'mtverse All HTML Templates Bundle',
    '',
    `Generated: ${new Date().toISOString()}`,
    `Templates included: ${htmlKits.length}`,
    '',
    'Each folder contains the original ZIP package for one static HTML template.',
    'Use the live preview links from manifest.json to inspect each template before editing.',
  ].join('\n'))
  bundle.file('manifest.json', JSON.stringify(manifest, null, 2))

  for (const kit of htmlKits) {
    try {
      const object = await s3Client.send(new GetObjectCommand({ Bucket: config.bucket, Key: kit.packageKey }))
      const buffer = await toBuffer(object.Body)
      if (!buffer.length) continue

      const categoryFolder = safeBundleSegment(kit.subcategory)
      const filename = kit.packageFilename || `${kit.slug}.zip`
      bundle.file(`${categoryFolder}/${filename}`, buffer)
    } catch (error) {
      if (isMissingR2Object(error)) continue
      throw error
    }
  }

  const archive = await bundle.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  })

  const filename = getPackageDownloadFilename(HTML_BUNDLE_PACKAGE_ID)
  const headers = new Headers({
    'Content-Type': 'application/zip',
    'Content-Disposition': `attachment; filename="${filename}"`,
    'Cache-Control': 'private, no-store',
    'X-Content-Type-Options': 'nosniff',
    'Content-Length': String(archive.length),
  })

  return new Response(new Uint8Array(archive), { headers })
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

  const { checkRateLimit, getRateLimitRetryAfterSeconds } = await import('@/lib/rate-limit')
  const rateLimit = await checkRateLimit(`download:package:${email}`, {
    max: 5,
    windowMs: 15 * 60 * 1000,
  })

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: 'Too many downloads. Please wait before downloading again.',
        retryAfter: getRateLimitRetryAfterSeconds(rateLimit.resetAt),
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(getRateLimitRetryAfterSeconds(rateLimit.resetAt)),
        },
      }
    )
  }

  const planRecord = await getPlan(email)

  if (rawPackageId === HTML_BUNDLE_PACKAGE_ID) {
    try {
      return await createHtmlBundleResponse(email, planRecord)
    } catch (error) {
      console.error('[HTML Bundle Download] R2 zip generation failed:', error)
      return NextResponse.json({ error: 'HTML bundle generation failed.' }, { status: 502 })
    }
  }

  if (!canDownloadStaticPackage(planRecord, rawPackageId)) {
    return NextResponse.json({ error: 'This package is not included in your purchase.' }, { status: 403 })
  }

  if (!isCloudflareR2Configured()) {
    return NextResponse.json({ error: 'Package downloads are not configured yet.' }, { status: 503 })
  }

  const { config, s3Client } = createR2Client()
  const key = getPackageDownloadKey(rawPackageId)
  const filename = getPackageDownloadFilename(rawPackageId)

  try {
    const object = await s3Client.send(new GetObjectCommand({ Bucket: config.bucket, Key: key }))
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
      return NextResponse.json({ error: 'Package ZIP is missing in storage.' }, { status: 404 })
    }

    console.error('[Package Download] R2 stream failed:', error)
    return NextResponse.json({ error: 'Package download failed.' }, { status: 502 })
  }
}
