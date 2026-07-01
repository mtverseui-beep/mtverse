import { NextRequest, NextResponse } from 'next/server'
import { authorizeAdminRequest } from '@/lib/admin-request-auth'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { saveDashboardKits } from '@/lib/dashboard-kit-store'
import type { DashboardKit } from '@/lib/dashboard-kits'

export const dynamic = 'force-dynamic'

/**
 * POST /api/admin/templates/sync
 * Force-syncs the local dashboard-kits-store.json to Redis (production store).
 * Use this after adding templates directly to the JSON file.
 */
export async function POST(request: NextRequest) {
  const auth = await authorizeAdminRequest(request)
  if (!auth.authorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const storeFile = join(process.cwd(), 'data', 'dashboard-kits-store.json')
    const raw = await readFile(storeFile, 'utf-8')
    const parsed = JSON.parse(raw) as { kits: Partial<DashboardKit>[] }

    if (!parsed?.kits?.length) {
      return NextResponse.json({ error: 'No kits found in local store file' }, { status: 400 })
    }

    // Force replace all — sync entire local store to Redis
    const kits = await saveDashboardKits(parsed.kits, true)

    return NextResponse.json({
      success: true,
      message: `Synced ${kits.length} templates from local JSON to production store.`,
      count: kits.length,
    })
  } catch (error) {
    console.error('[Admin Sync] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Sync failed' },
      { status: 500 }
    )
  }
}
