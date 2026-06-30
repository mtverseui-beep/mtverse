import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getDashboardKit } from '@/lib/dashboard-kit-store'

type Params = Promise<{ slug: string }>

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params
  const kit = await getDashboardKit(slug)

  if (!kit) {
    return { title: 'Preview not found', robots: { index: false, follow: false } }
  }

  return {
    title: kit.title + ' Preview',
    description: kit.metaDescription || kit.summary,
    robots: { index: false, follow: false },
  }
}

export default async function DashboardKitPreviewPage({ params }: { params: Params }) {
  const { slug } = await params
  const kit = await getDashboardKit(slug)

  if (!kit) {
    notFound()
  }

  const previewImage = kit.screenshots[0] || kit.coverImage

  return (
    <main className="fixed inset-0 overflow-hidden bg-[#f6f7fb]" style={{ width: '100vw', height: '100dvh' }}>
      <h1 className="sr-only">{kit.title} preview</h1>
      {previewImage ? (
        <Image
          src={previewImage}
          alt={kit.title + ' preview'}
          fill
          priority
          sizes="100vw"
          className="object-contain"
          unoptimized
        />
      ) : (
        <div className="flex h-full items-center justify-center p-8 text-center">
          <div>
            <p className="text-2xl font-black text-zinc-950">{kit.title}</p>
            <p className="mt-2 text-sm font-medium text-zinc-500">Preview image is being prepared.</p>
          </div>
        </div>
      )}
    </main>
  )
}