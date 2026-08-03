'use client'

import { track } from '@vercel/analytics'
import { useReportWebVitals } from 'next/web-vitals'

export function WebVitalsReporter() {
  useReportWebVitals((metric) => {
    track('web_vital', {
      metric: metric.name,
      value: Math.round(metric.value),
      rating: metric.rating,
    })
  })

  return null
}