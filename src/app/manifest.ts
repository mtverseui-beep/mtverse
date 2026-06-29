import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'mtverse - AI Prompts & Premium UI Components',
    short_name: 'mtverse',
    description:
      'Free AI prompts for image generation, ChatGPT, Midjourney, and creative workflows. Plus production-ready React UI components with Tailwind CSS and shadcn/ui.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#4f46e5',
    categories: ['productivity', 'utilities', 'developer tools'],
    id: '/',
    icons: [
      {
        src: '/logo.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/SiteLogo.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/SiteLogo.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  }
}
