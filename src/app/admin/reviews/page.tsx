import type { Metadata } from 'next'
import Link from 'next/link'
import { MessageSquare, Star } from 'lucide-react'
import { getAllTemplatesFromStore } from '@/lib/templates-data'
import { getRecentTemplateReviews } from '@/lib/template-social-store'

export const metadata: Metadata = {
  title: 'Reviews - Admin',
  description: 'Review customer feedback for templates',
}

export const dynamic = 'force-dynamic'

export default async function AdminReviewsPage() {
  const [reviews, templates] = await Promise.all([
    getRecentTemplateReviews(50),
    getAllTemplatesFromStore(),
  ])
  const templateTitleMap = new Map(templates.map((template) => [template.slug, template.title]))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="ds-h1">Reviews</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {reviews.length} real customer {reviews.length === 1 ? 'review' : 'reviews'} received
        </p>
      </div>

      {reviews.length === 0 ? (
        <div className="ds-card py-16 text-center">
          <MessageSquare className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm font-medium">No customer reviews yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            Reviews submitted from template pages will appear here immediately.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {reviews.map((review) => (
            <article key={review.id} className="ds-card">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-sm font-semibold">{review.title}</h2>
                    <span className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs text-muted-foreground">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      {review.rating}/5
                    </span>
                    {review.verifiedPurchase ? (
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">
                        Verified buyer
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{review.comment}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span>{review.name}</span>
                    {review.email ? <span>{review.email}</span> : null}
                    <span>{new Date(review.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                </div>
                <Link href={`/templates/${review.slug}`} className="ds-btn ds-btn-secondary ds-btn-sm shrink-0">
                  {templateTitleMap.get(review.slug) || 'View template'}
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}