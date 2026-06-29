import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Eye } from 'lucide-react'
import { getDashboardKit } from '@/lib/dashboard-kit-store'

type Params = Promise<{ slug: string }>

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params
  const kit = await getDashboardKit(slug)
  if (!kit) return { title: 'Preview not found', robots: { index: false, follow: false } }
  return {
    title: `Live Preview - ${kit.title}`,
    description: `Live preview of ${kit.title}. Try the template before you buy.`,
    robots: { index: false, follow: false },
  }
}

export default async function PreviewPage({ params }: { params: Params }) {
  const { slug } = await params
  const kit = await getDashboardKit(slug)

  if (!kit) {
    notFound()
  }

  const previewBaseUrl = process.env.NEXT_PUBLIC_PREVIEW_BASE_URL?.replace(/\/+$/, '') || ''
  const livePreviewUrl =
    (kit as { livePreviewUrl?: string }).livePreviewUrl ||
    (kit.previewPath && previewBaseUrl ? `${previewBaseUrl}${kit.previewPath}` : '')
  const hasLivePreview = Boolean(livePreviewUrl && livePreviewUrl.startsWith('http'))

  return (
    <main className="fixed inset-0 overflow-hidden bg-background" style={{ width: '100vw', height: '100dvh' }}>
      <h1 className="sr-only">{kit.title} live preview</h1>
      {hasLivePreview ? (
        <iframe
          src={`/api/preview/live/${encodeURIComponent(kit.slug)}`}
          title={`${kit.title} live preview`}
          className="block border-0 bg-background"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', minWidth: '100%', minHeight: '100%' }}
          allow="accelerometer; camera; clipboard-read; clipboard-write; encrypted-media; geolocation; gyroscope; microphone; payment; picture-in-picture; publickey-credentials-get; screen-wake-lock; xr-spatial-tracking"
          allowFullScreen
          referrerPolicy="no-referrer"
          loading="eager"
        />
      ) : (
        <div className="flex h-full items-center justify-center p-8">
          <div className="max-w-md text-center">
            <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <Eye className="h-6 w-6" />
            </div>
            <h2 className="ds-h2">Live preview not available</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              This template does not have a live preview configured yet.
            </p>
          </div>
        </div>
      )}
    </main>
  )
}