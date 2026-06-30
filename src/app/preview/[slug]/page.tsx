import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Eye } from 'lucide-react'
import { getDashboardKit } from '@/lib/dashboard-kit-store'
import { PreviewIframe } from '@/components/preview/preview-iframe'

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

  // Use direct external URL for the iframe since template deployments
  // now have Content-Security-Policy: frame-ancestors configured.
  const directPreviewUrl = kit.livePreviewUrl?.trim() || `/api/preview/proxy/${slug}`

  return (
    <main className="fixed inset-0 overflow-hidden bg-background" style={{ width: '100vw', height: '100dvh' }}>
      <h1 className="sr-only">{kit.title} live preview</h1>
      {directPreviewUrl ? (
        <PreviewIframe url={directPreviewUrl} directUrl={directPreviewUrl} title={kit.title} />
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
