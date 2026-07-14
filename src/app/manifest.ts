import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'mtverse - Website Templates and Dashboard UI Kits',
    short_name: 'mtverse',
    description: 'Browse Next.js dashboard templates, React admin UI kits, landing pages, ecommerce projects, and free responsive HTML website templates.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#4f46e5',
    categories: ['developer tools', 'productivity', 'business'],
    id: '/',
    icons: [
      { src: '/logo.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
      { src: '/SiteLogo.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
      { src: '/SiteLogo.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}