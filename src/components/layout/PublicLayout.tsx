import { Suspense } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import ScrollToTop from '@/components/shared/ScrollToTop'
import AdSenseUnit from '@/components/ads/AdSenseUnit'

interface PublicLayoutProps {
  children: React.ReactNode
  schemaMarkup?: Record<string, unknown> | Record<string, unknown>[]
  promptCount?: number
}

export default function PublicLayout({
  children,
  schemaMarkup,
  promptCount,
}: PublicLayoutProps) {
  const schemas = schemaMarkup
    ? Array.isArray(schemaMarkup)
      ? schemaMarkup
      : [schemaMarkup]
    : []

  return (
    <>
      {schemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      <div className="flex min-h-screen flex-col">
        <Suspense
          fallback={
            <div className="sticky top-0 z-[900] h-16 border-b border-border/50 bg-background/70 backdrop-blur-xl" />
          }
        >
          <Navbar promptCount={promptCount} />
        </Suspense>
        <main className="flex-1">{children}</main>
        <AdSenseUnit placement="footer" />
        <Footer promptCount={promptCount} />
        <ScrollToTop />
      </div>
    </>
  )
}
