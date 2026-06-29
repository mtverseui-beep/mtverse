import { NextRequest, NextResponse } from 'next/server'
import { authorizeAdminRequest } from '@/lib/admin-request-auth'
import { guardAdminWriteRequest } from '@/lib/admin-api-guard'
import { deleteDashboardKit, getDashboardKits, saveDashboardKit, saveDashboardKits } from '@/lib/dashboard-kit-store'
import type { DashboardKit } from '@/lib/dashboard-kits'
import { parseTemplateImportPayload } from '@/lib/template-import'

type AdminTemplatesRequestBody = {
  action?: string
  payload?: unknown
  rawJson?: string
  replaceExisting?: boolean
  kit?: Partial<DashboardKit>
  slug?: string
  id?: string
}

function jsonError(error: string, status: number, code?: string) {
  return NextResponse.json({ success: false, error, code }, { status })
}

function getSafeErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback
}


export async function GET(request: NextRequest) {
  try {
    const auth = await authorizeAdminRequest(request)
    if (!auth.authorized) return jsonError('Admin session expired. Sign in again to continue.', 401, 'unauthorized')

    const kits = await getDashboardKits()
    return NextResponse.json({ success: true, kits, count: kits.length })
  } catch (error) {
    console.error('Admin templates GET failed:', error)
    return jsonError(getSafeErrorMessage(error, 'Failed to fetch templates'), 500, 'template_fetch_failed')
  }
}

export async function POST(request: NextRequest) {
  try {
    const blocked = await guardAdminWriteRequest(request, {
      key: 'templates',
      maxBytes: 12 * 1024 * 1024,
    })

    if (blocked) return blocked

    const body = (await request.json()) as AdminTemplatesRequestBody

    if (body.action === 'import-json') {
      let payload = body.payload

      if (typeof body.rawJson === 'string') {
        try {
          payload = JSON.parse(body.rawJson)
        } catch {
          return jsonError('Invalid JSON file or pasted JSON.', 400, 'invalid_json')
        }
      }

      const existingKits = await getDashboardKits()
      const parsed = parseTemplateImportPayload(payload, existingKits, {
        replaceExisting: Boolean(body.replaceExisting),
      })

      if (!parsed.kits.length) {
        const alreadyExists = parsed.summary.skippedExisting > 0 || parsed.summary.skippedIncomingDuplicates > 0
        return NextResponse.json(
          {
            success: alreadyExists,
            error: alreadyExists ? undefined : 'No valid dashboard kit records found. Use an array, { "kits": [...] }, or { "templates": [...] } JSON.',
            code: alreadyExists ? undefined : 'no_valid_template_entries',
            message: alreadyExists
              ? 'No new templates were added because the imported templates already exist or were duplicates inside the JSON payload.'
              : undefined,
            kits: existingKits,
            summary: { ...parsed.summary, imported: 0 },
            count: existingKits.length,
          },
          { status: alreadyExists ? 200 : 400 }
        )
      }

      const kits = await saveDashboardKits(parsed.kits, Boolean(body.replaceExisting))
      return NextResponse.json({
        success: true,
        message: `Saved ${parsed.kits.length} dashboard kit records.`,
        kits,
        summary: parsed.summary,
        count: kits.length,
      })
    }

    if (!body.kit) {
      return jsonError('Missing dashboard kit payload.', 400, 'missing_template_payload')
    }

    const kit = await saveDashboardKit(body.kit)
    const kits = await getDashboardKits()

    return NextResponse.json({
      success: true,
      message: `Saved ${kit.title} successfully.`,
      kit,
      kits,
      count: kits.length,
    })
  } catch (error) {
    console.error('Admin templates POST failed:', error)
    return jsonError(getSafeErrorMessage(error, 'Failed to save template'), 500, 'template_save_failed')
  }
}

export async function PATCH(request: NextRequest) {
  return POST(request)
}

export async function DELETE(request: NextRequest) {
  try {
    const blocked = await guardAdminWriteRequest(request, {
      key: 'templates-delete',
      maxRequests: 20,
      maxBytes: 16 * 1024,
    })

    if (blocked) return blocked

    let body: AdminTemplatesRequestBody = {}
    if ((request.headers.get('content-type') || '').includes('application/json')) {
      try {
        body = (await request.json()) as AdminTemplatesRequestBody
      } catch {
        return jsonError('Invalid JSON delete payload.', 400, 'invalid_json')
      }
    }

    const target = body.slug || body.id || request.nextUrl.searchParams.get('slug') || request.nextUrl.searchParams.get('id')
    if (!target) return jsonError('Choose a dashboard kit to delete.', 400, 'missing_template_delete_target')

    const deleted = await deleteDashboardKit(target)
    const kits = await getDashboardKits()

    return NextResponse.json({
      success: true,
      message: deleted ? 'Dashboard kit deleted.' : 'Dashboard kit was not found.',
      kits,
      count: kits.length,
    })
  } catch (error) {
    console.error('Admin templates DELETE failed:', error)
    return jsonError(getSafeErrorMessage(error, 'Failed to delete template'), 500, 'template_delete_failed')
  }
}
