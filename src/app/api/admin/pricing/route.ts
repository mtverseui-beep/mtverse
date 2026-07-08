import { NextRequest, NextResponse } from 'next/server'
import { authorizeAdminRequest } from '@/lib/admin-request-auth'
import { guardAdminWriteRequest } from '@/lib/admin-api-guard'
import { getPricingCtaSettings, savePricingCtaSettings } from '@/lib/pricing-settings-store'

function jsonError(error: string, status: number, code?: string) {
  return NextResponse.json({ success: false, error, code }, { status, headers: { 'Cache-Control': 'no-store' } })
}

function getSafeErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback
}

export async function GET(request: NextRequest) {
  try {
    const auth = await authorizeAdminRequest(request)
    if (!auth.authorized) return jsonError('Admin session expired. Sign in again to continue.', 401, 'unauthorized')

    const settings = await getPricingCtaSettings()
    return NextResponse.json({ success: true, settings }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error('Admin pricing GET failed:', error)
    return jsonError(getSafeErrorMessage(error, 'Failed to fetch pricing settings'), 500, 'pricing_fetch_failed')
  }
}

export async function POST(request: NextRequest) {
  try {
    const blocked = await guardAdminWriteRequest(request, {
      key: 'pricing-settings',
      maxRequests: 20,
      maxBytes: 32 * 1024,
    })

    if (blocked) return blocked

    const body = (await request.json()) as { settings?: Record<string, unknown> }
    const settings = await savePricingCtaSettings(body.settings || {})
    return NextResponse.json({ success: true, settings, message: 'Pricing CTA updated.' }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error('Admin pricing POST failed:', error)
    return jsonError(getSafeErrorMessage(error, 'Failed to update pricing settings'), 500, 'pricing_save_failed')
  }
}