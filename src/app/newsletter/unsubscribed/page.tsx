import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle2, CircleAlert } from 'lucide-react'
import PublicLayout from '@/components/layout/PublicLayout'

export const metadata: Metadata = {
  title: 'Newsletter preferences | mtverse',
  robots: { index: false, follow: false },
}

export default async function NewsletterUnsubscribedPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams
  const success = status === 'success'
  return (
    <PublicLayout>
      <main className="ds-bg-section flex min-h-[65vh] items-center justify-center px-4 py-16">
        <div className="w-full max-w-md rounded-lg border border-border bg-card p-7 text-center shadow-sm">
          <div className={`mx-auto flex h-11 w-11 items-center justify-center rounded-full ${success ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'}`}>
            {success ? <CheckCircle2 className="h-5 w-5" /> : <CircleAlert className="h-5 w-5" />}
          </div>
          <h1 className="mt-4 text-xl font-bold">{success ? 'You are unsubscribed' : 'This link is no longer valid'}</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {success ? 'You will no longer receive mtverse template updates.' : 'The unsubscribe link may have expired or already been replaced.'}
          </p>
          <Link href="/templates" className="ds-btn ds-btn-secondary mt-6">Browse templates</Link>
        </div>
      </main>
    </PublicLayout>
  )
}
