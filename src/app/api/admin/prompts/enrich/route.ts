import { NextRequest, NextResponse } from 'next/server'
import { guardAdminWriteRequest } from '@/lib/admin-api-guard'
import { buildPromptSeoAutofill, type PromptSeoAutofillInsight } from '@/lib/prompt-seo-autofill'
import { getAdminPrompts } from '@/lib/prompt-db'
import { PROMPT_CATEGORIES, type PromptEntry } from '@/lib/prompt-library-data'

type AdminPromptEnrichRequest = {
  prompt?: Partial<PromptEntry>
}

type AdminPromptEnrichResponse = {
  success: boolean
  message?: string
  error?: string
  code?: string
  prompt?: PromptEntry
  insights?: PromptSeoAutofillInsight[]
}

function jsonError(error: string, status: number, code: string) {
  return NextResponse.json(
    {
      success: false,
      error,
      code,
    } satisfies AdminPromptEnrichResponse,
    { status },
  )
}

export async function POST(request: NextRequest) {
  try {
    const blocked = await guardAdminWriteRequest(request, {
      key: 'prompts-enrich',
      maxRequests: 60,
      maxBytes: 768 * 1024,
    })

    if (blocked) return blocked

    const body = (await request.json()) as AdminPromptEnrichRequest

    if (!body?.prompt) {
      return jsonError('Missing prompt draft to enrich.', 400, 'missing_prompt')
    }

    const existingPrompts = await getAdminPrompts()
    const result = buildPromptSeoAutofill({
      prompt: body.prompt,
      categories: PROMPT_CATEGORIES,
      existingPrompts,
    })

    return NextResponse.json({
      success: true,
      message: 'SEO fields generated for review. Save the prompt to publish these changes.',
      prompt: result.prompt,
      insights: result.insights,
    } satisfies AdminPromptEnrichResponse)
  } catch (error) {
    console.error('Admin prompt SEO enrich failed:', error)
    return jsonError(error instanceof Error ? error.message : 'Failed to generate prompt SEO fields.', 500, 'prompt_enrich_failed')
  }
}
