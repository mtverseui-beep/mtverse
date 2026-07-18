'use client'

import { Share2 } from 'lucide-react'
import { toast } from 'sonner'

export function BlogShareButton({ title }: { title: string }) {
  async function share() {
    const url = window.location.href
    try {
      if (navigator.share) {
        await navigator.share({ title, url })
        return
      }
      await navigator.clipboard.writeText(url)
      toast.success('Article link copied')
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return
      toast.error('Unable to share this article')
    }
  }

  return (
    <button
      type="button"
      onClick={() => void share()}
      className="inline-flex h-9 items-center gap-2 rounded-md border border-border bg-background px-3 text-sm font-medium text-muted-foreground hover:text-foreground"
      aria-label="Share this article"
    >
      <Share2 className="h-4 w-4" />
      Share
    </button>
  )
}
