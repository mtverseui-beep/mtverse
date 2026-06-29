import { NextRequest, NextResponse } from 'next/server'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import sharp from 'sharp'
import { guardAdminWriteRequest } from '@/lib/admin-api-guard'
import {
  buildR2PromptPreviewKey,
  buildR2PromptPreviewUrl,
  getCloudflareR2Config,
  isCloudflareR2Configured,
} from '@/lib/cloudflare-r2'
import { slugify } from '@/lib/utils'

export const runtime = 'nodejs'

const PROMPT_PREVIEW_IMAGE_TYPES = new Map([
  ['image/jpeg', 'jpg'],
  ['image/jpg', 'jpg'],
  ['image/png', 'png'],
  ['image/webp', 'webp'],
])

function jsonError(error: string, status: number, code?: string, details?: string) {
  return NextResponse.json(
    {
      success: false,
      error,
      code,
      details,
    },
    { status }
  )
}

function getPromptPreviewExtension(file: File) {
  const typeExtension = PROMPT_PREVIEW_IMAGE_TYPES.get(file.type.toLowerCase())
  if (typeExtension) return typeExtension

  const nameExtension = file.name.split('.').pop()?.toLowerCase()
  if (nameExtension === 'jpeg') return 'jpg'
  if (nameExtension && ['jpg', 'png', 'webp'].includes(nameExtension)) return nameExtension

  return ''
}

async function uploadImageToR2(file: File, slug: string, extension: string) {
  const config = getCloudflareR2Config()

  if (!config.endpoint || !config.bucket) {
    throw new Error('Cloudflare R2 is not configured.')
  }

  const key = buildR2PromptPreviewKey(slug, extension)
  const body = Buffer.from(await file.arrayBuffer())
  const contentType = file.type || 'image/jpeg'

  const s3Client = new S3Client({
    region: 'auto',
    endpoint: config.endpoint,
    forcePathStyle: true,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  })

  const command = new PutObjectCommand({
    Bucket: config.bucket,
    Key: key,
    Body: body,
    ContentType: contentType,
  })

  try {
    await s3Client.send(command)
  } catch (error) {
    console.error('R2 Upload Error:', error)
    throw new Error(`R2 upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }

  const imageUrl = buildR2PromptPreviewUrl(slug, extension)

  return {
    key,
    imageUrl,
  }
}

async function readImageDimensions(body: Buffer) {
  const metadata = await sharp(body).metadata()
  const width = metadata.width
  const height = metadata.height

  if (!width || !height) return {}

  return {
    previewWidth: width,
    previewHeight: height,
  }
}

export async function POST(request: NextRequest) {
  try {
    const blocked = await guardAdminWriteRequest(request, {
      key: 'prompt-upload',
      maxRequests: 20,
      maxBytes: 20 * 1024 * 1024,
    })

    if (blocked) return blocked

    if (!isCloudflareR2Configured()) {
      return jsonError(
        'Preview uploads are not configured. Add Cloudflare R2 credentials.',
        400,
        'preview_upload_not_configured'
      )
    }

    const formData = await request.formData()
    const file = formData.get('file')
    const slugValue = String(formData.get('slug') || formData.get('title') || '').trim()
    const slug = slugify(slugValue || `prompt-preview-${Date.now()}`)

    if (!(file instanceof File)) {
      return jsonError('Choose an image file before uploading.', 400, 'missing_image_file')
    }

    if (!file.type.startsWith('image/')) {
      return jsonError('Only image uploads are supported for prompt previews.', 400, 'invalid_image_type')
    }

    const extension = getPromptPreviewExtension(file)
    if (!extension) {
      return jsonError('Only JPG, PNG, and WebP preview uploads are supported.', 400, 'unsupported_image_type')
    }

    if (file.size > 10 * 1024 * 1024) {
      return jsonError('Image is too large. Upload a preview under 10 MB.', 413, 'image_too_large')
    }

    const imageBuffer = Buffer.from(await file.arrayBuffer())
    const dimensions = await readImageDimensions(imageBuffer)
    const upload = { ...(await uploadImageToR2(file, slug, extension)), provider: 'Cloudflare R2' }

    return NextResponse.json({
      success: true,
      message: `Image uploaded to ${upload.provider || 'preview storage'} successfully.`,
      imageUrl: upload.imageUrl,
      key: upload.key,
      ...dimensions,
    })
  } catch (error) {
    console.error('Admin prompt preview upload failed:', error)
    return jsonError(error instanceof Error ? error.message : 'Failed to upload prompt preview image.', 500, 'r2_upload_failed')
  }
}
