import { NextRequest, NextResponse } from 'next/server'
import { authorizeAdminRequest } from '@/lib/admin-request-auth'
import { guardAdminWriteRequest } from '@/lib/admin-api-guard'
import { deletePrompt, getAdminPrompts, savePrompt, savePrompts } from '@/lib/prompt-db'
import { parsePromptImportPayload, type PromptImportSummary } from '@/lib/prompt-import'
import type { PromptEntry } from '@/lib/prompt-library-data'
import { isCloudflarePromptImageUrl } from '@/lib/prompt-image-hosts'

type AdminPromptsResponse = {
  success?: boolean
  error?: string
  code?: string
  details?: string
  message?: string
  prompts?: PromptEntry[]
  prompt?: PromptEntry
  summary?: PromptImportSummary
}

type AdminPromptsRequestBody = {
  action?: string
  payload?: unknown
  rawJson?: string
  replaceExisting?: boolean
  prompt?: PromptEntry
  id?: string
  slug?: string
  title?: string
}

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

function getSafeErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) {
    return error.message
  }

  return fallback
}

function isLocalPromptReadOnlyError(error: unknown) {
  return error instanceof Error && /Prompt Hub admin writes need UPSTASH/i.test(error.message)
}

async function isAuthorizedRequest(request: NextRequest) {
  return (await authorizeAdminRequest(request)).authorized
}

function findPromptsWithInvalidPreview(prompts: PromptEntry[]) {
  return prompts.filter(prompt => !isCloudflarePromptImageUrl(prompt.previewImage))
}

export async function GET(request: NextRequest) {
  try {
    const isAuthorized = await isAuthorizedRequest(request)

    if (!isAuthorized) {
      return jsonError('Admin session expired. Sign in again to continue.', 401, 'unauthorized')
    }

    const prompts = await getAdminPrompts()
    return NextResponse.json({ success: true, prompts, count: prompts.length })
  } catch (error) {
    console.error('Admin prompts GET failed:', error)
    return jsonError(getSafeErrorMessage(error, 'Failed to fetch prompt data'), 500, 'prompt_fetch_failed')
  }
}

export async function POST(request: NextRequest) {
  try {
    const blocked = await guardAdminWriteRequest(request, {
      key: 'prompts',
      maxBytes: 10 * 1024 * 1024,
    })

    if (blocked) return blocked

    const body = (await request.json()) as AdminPromptsRequestBody

    if (body?.action === 'import-json') {
      let payload = body?.payload as unknown

      if (typeof body?.rawJson === 'string') {
        try {
          payload = JSON.parse(body.rawJson)
        } catch {
          return jsonError('Invalid JSON file or pasted JSON.', 400, 'invalid_json')
        }
      }

      const existingPrompts = await getAdminPrompts()
      const parsed = parsePromptImportPayload(payload, existingPrompts, {
        replaceExisting: Boolean(body?.replaceExisting),
      })

      if (parsed.prompts.length === 0) {
        const summary = {
          ...parsed.summary,
          imported: 0,
        }
        const alreadyExists = summary.skippedExisting > 0 || summary.skippedIncomingDuplicates > 0

        return NextResponse.json(
          {
            success: alreadyExists,
            error: alreadyExists ? undefined : 'No valid prompts were found in the imported JSON.',
            code: alreadyExists ? undefined : 'no_valid_prompt_entries',
            message: alreadyExists
              ? 'No new prompts were added because the imported titles already exist or were duplicates inside the JSON payload.'
              : undefined,
            prompts: existingPrompts,
            summary,
          } satisfies AdminPromptsResponse,
          { status: alreadyExists ? 200 : 400 }
        )
      }

      const invalidPreviewPrompts = findPromptsWithInvalidPreview(parsed.prompts)
      if (invalidPreviewPrompts.length > 0) {
        return jsonError(
          `All prompt preview images must be Cloudflare R2 URLs. Fix: ${invalidPreviewPrompts.slice(0, 5).map(prompt => prompt.title).join(', ')}${invalidPreviewPrompts.length > 5 ? '...' : ''}`,
          400,
          'invalid_prompt_preview_host'
        )
      }

      await savePrompts(parsed.prompts)
      const prompts = await getAdminPrompts()

      return NextResponse.json({
        success: true,
        message: `Imported ${parsed.prompts.length} prompts successfully.`,
        prompts,
        summary: {
          ...parsed.summary,
          imported: parsed.prompts.length,
        },
      } satisfies AdminPromptsResponse)
    }

    const prompt = body?.prompt as PromptEntry | undefined

    if (!prompt) {
      return jsonError('Missing prompt payload', 400, 'missing_prompt_payload')
    }

    if (!isCloudflarePromptImageUrl(prompt.previewImage)) {
      return jsonError(
        'Prompt preview image must be a Cloudflare R2 URL.',
        400,
        'invalid_prompt_preview_host'
      )
    }

    const savedPrompt = await savePrompt(prompt)

    return NextResponse.json({
      success: true,
      message: `Saved "${savedPrompt.title}" successfully.`,
      prompt: savedPrompt,
    } satisfies AdminPromptsResponse)
  } catch (error) {
    console.error('Admin prompts POST failed:', error)
    const status = isLocalPromptReadOnlyError(error) ? 409 : 500
    const code = isLocalPromptReadOnlyError(error) ? 'prompt_local_read_only' : 'prompt_save_failed'
    return jsonError(getSafeErrorMessage(error, 'Failed to save prompt'), status, code)
  }
}

export async function PATCH(request: NextRequest) {
  return POST(request)
}

export async function DELETE(request: NextRequest) {
  try {
    const blocked = await guardAdminWriteRequest(request, {
      key: 'prompts-delete',
      maxRequests: 30,
      maxBytes: 16 * 1024,
    })

    if (blocked) return blocked

    let body: AdminPromptsRequestBody = {}
    const contentType = request.headers.get('content-type') || ''

    if (contentType.includes('application/json')) {
      try {
        body = (await request.json()) as AdminPromptsRequestBody
      } catch {
        return jsonError('Invalid JSON delete payload.', 400, 'invalid_json')
      }
    }

    const id = body.id || request.nextUrl.searchParams.get('id') || undefined
    const slug = body.slug || request.nextUrl.searchParams.get('slug') || undefined
    const title = body.title || request.nextUrl.searchParams.get('title') || undefined

    if (!id && !slug && !title) {
      return jsonError('Choose a prompt to delete.', 400, 'missing_prompt_delete_target')
    }

    await deletePrompt({ id, slug, title })
    const prompts = await getAdminPrompts()

    return NextResponse.json({
      success: true,
      message: 'Prompt deleted successfully.',
      prompts,
    } satisfies AdminPromptsResponse)
  } catch (error) {
    console.error('Admin prompts DELETE failed:', error)
    const status = isLocalPromptReadOnlyError(error) ? 409 : 500
    const code = isLocalPromptReadOnlyError(error) ? 'prompt_local_read_only' : 'prompt_delete_failed'
    return jsonError(getSafeErrorMessage(error, 'Failed to delete prompt'), status, code)
  }
}
