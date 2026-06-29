import { NextResponse } from 'next/server'
import { getGoogleAdsTxtLine } from '@/lib/adsense'


export function GET() {
  const line = getGoogleAdsTxtLine()

  if (!line) {
    return new NextResponse('ads.txt not configured\n', {
      status: 404,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
      },
    })
  }

  return new NextResponse(`${line}\n`, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}