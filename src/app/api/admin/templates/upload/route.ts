import { NextRequest, NextResponse } from 'next/server'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { guardAdminWriteRequest } from '@/lib/admin-api-guard'
import {
  buildR2PublicUrl,
  buildR2TemplatePackageKey,
  buildR2TemplatePreviewKey,
  getCloudflareR2Config,
  isCloudflareR2Configured,
} from '@/lib/cloudflare-r2'
import { slugify } from '@/lib/utils'

export const runtime = 'nodejs'

const TEMPLATE_IMAGE_TYPES = new Map([
  ['image/jpeg', 'jpg'],
  ['image/jpg', 'jpg'],
  ['image/png', 'png'],
  ['image/webp', 'webp'],
])

function jsonError(error: string, status: number, code?: string) {
  return NextResponse.json({ success: false, error, code }, { status })
}

function getImageExtension(file: File) {
  const typeExtension = TEMPLATE_IMAGE_TYPES.get(file.type.toLowerCase())
  if (typeExtension) return typeExtension

  const extension = file.name.split('.').pop()?.toLowerCase()
  if (extension === 'jpeg') return 'jpg'
  if (extension && ['jpg', 'png', 'webp'].includes(extension)) return extension
  return ''
}

function isZipFile(file: File) {
  return file.type === 'application/zip' || file.type === 'application/x-zip-compressed' || file.name.toLowerCase().endsWith('.zip')
}

async function uploadToR2(file: File, key: string, contentType: string) {
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

  await s3Client.send(
    new PutObjectCommand({
      Bucket: config.bucket,
      Key: key,
      Body: Buffer.from(await file.arrayBuffer()),
      ContentType: contentType,
    })
  )
}

export async function POST(request: NextRequest) {
  try {
    const blocked = await guardAdminWriteRequest(request, {
      key: 'template-upload',
      maxRequests: 20,
      maxBytes: 260 * 1024 * 1024,
    })

    if (blocked) return blocked

    if (!isCloudflareR2Configured()) {
      return jsonError('Template uploads are not configured. Add Cloudflare R2 credentials.', 400, 'template_upload_not_configured')
    }

    const formData = await request.formData()
    const file = formData.get('file')
    const type = String(formData.get('type') || 'screenshot').trim()
    const slugValue = String(formData.get('slug') || formData.get('title') || '').trim()
    const slug = slugify(slugValue || `dashboard-kit-${Date.now()}`)

    if (!(file instanceof File)) {
      return jsonError('Choose a file before uploading.', 400, 'missing_file')
    }

    if (type === 'package') {
      if (!isZipFile(file)) return jsonError('Only ZIP files are supported for package uploads.', 400, 'invalid_package_type')
      if (file.size > 250 * 1024 * 1024) return jsonError('Package is too large. Upload a ZIP under 250 MB.', 413, 'package_too_large')

      const key = buildR2TemplatePackageKey(slug, file.name || 'mtverse-next-package.zip')
      await uploadToR2(file, key, file.type || 'application/zip')

      return NextResponse.json({
        success: true,
        type: 'package',
        key,
        packageKey: key,
        packageFilename: file.name || 'mtverse-next-package.zip',
        message: 'Package ZIP uploaded to Cloudflare R2.',
      })
    }

    if (!file.type.startsWith('image/')) {
      return jsonError('Only image uploads are supported for screenshots.', 400, 'invalid_image_type')
    }

    const extension = getImageExtension(file)
    if (!extension) return jsonError('Only JPG, PNG, and WebP screenshots are supported.', 400, 'unsupported_image_type')
    if (file.size > 15 * 1024 * 1024) return jsonError('Screenshot is too large. Upload an image under 15 MB.', 413, 'image_too_large')

    const key = buildR2TemplatePreviewKey(slug, file.name || 'screenshot', extension)
    await uploadToR2(file, key, file.type || 'image/jpeg')

    return NextResponse.json({
      success: true,
      type: 'screenshot',
      key,
      imageUrl: buildR2PublicUrl(key),
      message: 'Screenshot uploaded to Cloudflare R2.',
    })
  } catch (error) {
    console.error('Admin template upload failed:', error)
    return jsonError('Upload failed. Check the file type, file size, R2 bucket permissions, and template upload environment values.', 500, 'template_upload_failed')
  }
}
