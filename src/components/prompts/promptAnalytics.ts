type PromptAnalyticsProperties = Record<string, string | number | boolean | null | undefined>

export function trackPromptEvent(name: string, properties?: PromptAnalyticsProperties) {
  void import('@vercel/analytics')
    .then(({ track }) => track(name, properties))
    .catch(() => undefined)
}
