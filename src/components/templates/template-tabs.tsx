'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, Star, MessageSquare, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import type { Template, TemplateReview } from '@/lib/templates-catalog'
import { useAuth } from '@/hooks/use-auth'
import { useRouter } from 'next/navigation'

type Props = {
  template: Template
}

export function TemplateTabs({ template }: Props) {
  const [activeTab, setActiveTab] = useState<'about' | 'reviews'>('about')
  const { authenticated, user } = useAuth()
  const router = useRouter()

  const [reviews, setReviews] = useState<TemplateReview[]>(template.reviews)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [newReview, setNewReview] = useState({ rating: 5, title: '', comment: '' })

  useEffect(() => {
    setReviews(template.reviews)
  }, [template.slug, template.reviews])

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null

  function handleWriteReview() {
    if (!authenticated) {
      toast.info('Please sign in to write a review')
      router.push(`/sign-in?next=/templates/${template.slug}`)
      return
    }
    setShowReviewForm(!showReviewForm)
  }

  async function handleSubmitReview(e: React.FormEvent) {
    e.preventDefault()
    if (!newReview.title.trim() || !newReview.comment.trim()) {
      toast.error('Please fill in all fields')
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch(`/api/templates/${encodeURIComponent(template.slug)}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(newReview),
      })
      const payload = (await response.json().catch(() => null)) as { error?: string; social?: { reviews: TemplateReview[] } } | null

      if (!response.ok || !payload?.social) {
        throw new Error(payload?.error || 'Review could not be submitted')
      }

      setReviews(payload.social.reviews)
      setNewReview({ rating: 5, title: '', comment: '' })
      setShowReviewForm(false)
      toast.success('Review submitted. Thank you for your feedback.')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Review could not be submitted')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <div className="flex items-center gap-1 p-1 bg-muted rounded-full border w-fit mb-6">
        <button
          onClick={() => setActiveTab('about')}
          className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
            activeTab === 'about'
              ? 'bg-background shadow-sm text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          About
        </button>
        <button
          onClick={() => setActiveTab('reviews')}
          className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
            activeTab === 'reviews'
              ? 'bg-background shadow-sm text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Reviews ({reviews.length})
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'about' ? (
          <motion.div
            key="about"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">{template.description}</p>

            <h3 className="ds-h4 mb-3">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {template.tags.map((tag) => (
                <span key={tag} className="text-xs px-2.5 py-1 rounded-full border bg-background hover:border-primary-300 hover:text-primary-600 transition-colors cursor-pointer">
                  #{tag}
                </span>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="reviews"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center justify-between gap-4 mb-6 pb-6 border-b">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-4xl font-bold">{avgRating ?? 'New'}</div>
                  <div className="flex gap-0.5 mt-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`h-3.5 w-3.5 ${
                          avgRating && s <= Math.round(Number(avgRating))
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-muted-foreground/30'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">{reviews.length} reviews</div>
                </div>
              </div>
              <button onClick={handleWriteReview} className="ds-btn ds-btn-primary ds-btn-sm">
                <MessageSquare className="h-4 w-4" />
                Write a review
              </button>
            </div>

            <AnimatePresence>
              {showReviewForm && (
                <motion.form
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  onSubmit={handleSubmitReview}
                  className="ds-card mb-6 overflow-hidden"
                >
                  <div className="p-5 space-y-4">
                    <h3 className="ds-h4">Write your review</h3>

                    <div>
                      <label className="block text-sm font-medium mb-2">Your rating</label>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setNewReview({ ...newReview, rating: s })}
                            className="transition-transform hover:scale-110"
                            aria-label={`${s} star rating`}
                          >
                            <Star
                              className={`h-7 w-7 ${
                                s <= newReview.rating
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-muted-foreground/30'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1.5">Review title</label>
                      <input
                        type="text"
                        required
                        value={newReview.title}
                        onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
                        placeholder="Summarize your experience"
                        className="ds-input"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1.5">Your review</label>
                      <textarea
                        required
                        rows={4}
                        value={newReview.comment}
                        onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                        placeholder="What did you like or dislike?"
                        className="ds-input resize-none"
                      />
                    </div>

                    <div className="flex gap-2">
                      <button type="submit" disabled={submitting} className="ds-btn ds-btn-primary">
                        {submitting ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <Check className="h-4 w-4" />
                            Submit review
                          </>
                        )}
                      </button>
                      <button type="button" onClick={() => setShowReviewForm(false)} className="ds-btn ds-btn-ghost">
                        Cancel
                      </button>
                    </div>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            <div className="space-y-4">
              {reviews.length === 0 ? (
                <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                  No reviews yet. Be the first to review this template after purchase.
                </div>
              ) : null}
              {reviews.map((review, i) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  className="ds-card"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="h-10 w-10 rounded-full bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 flex items-center justify-center font-bold text-sm shrink-0">
                      {review.name[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-sm">{review.name}</span>
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`h-3 w-3 ${
                                s <= review.rating
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-muted-foreground/30'
                              }`}
                            />
                          ))}
                        </div>
                        {review.verifiedPurchase ? (
                          <span className="rounded-full border px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-300">
                            Verified buyer
                          </span>
                        ) : null}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(review.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </div>
                  </div>
                  <h4 className="text-sm font-semibold mb-1">{review.title}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{review.comment}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}