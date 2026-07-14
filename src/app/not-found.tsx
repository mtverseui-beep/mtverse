import Link from 'next/link'
import { Home, Search, ArrowLeft, Compass } from 'lucide-react'
import { HomeHeroBackground } from '@/components/design-system/hero-backgrounds'

export default function NotFound() {
  return (
    <main className="ds-bg-section relative flex min-h-screen items-center justify-center overflow-hidden">
      <HomeHeroBackground />
      <div className="ds-container relative">
        <div className="mx-auto max-w-xl space-y-6 text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-300"><Compass className="h-8 w-8" /></div>
          <div className="space-y-2"><h1 className="ds-display-2">4<span className="ds-text-emphasis">0</span>4</h1><p className="ds-lead">Page not found</p></div>
          <p className="mx-auto max-w-md text-sm text-muted-foreground">The page does not exist, has moved, or is no longer available. Continue with the template catalog or search for a project by name or framework.</p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link href="/" className="ds-btn ds-btn-primary"><Home className="h-4 w-4" />Go home</Link>
            <Link href="/templates" className="ds-btn ds-btn-secondary"><Search className="h-4 w-4" />Browse templates</Link>
            <Link href="/html-templates" className="ds-btn ds-btn-ghost"><ArrowLeft className="h-4 w-4" />Free HTML templates</Link>
          </div>
        </div>
      </div>
    </main>
  )
}