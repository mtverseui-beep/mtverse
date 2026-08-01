import { NextResponse } from 'next/server'
import { getPricingCtaSettings } from '@/lib/pricing-settings-store'
import { getWeeklyOfferRuntime } from '@/lib/weekly-offer'

export const dynamic = 'force-dynamic'

export async function GET() {
  const settings = await getPricingCtaSettings()
  const runtime = getWeeklyOfferRuntime(settings.offer)

  return NextResponse.json(
    { settings: settings.offer, runtime },
    { headers: { 'Cache-Control': 'no-store' } },
  )
}
