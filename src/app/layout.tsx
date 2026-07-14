import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Inter, Instrument_Serif } from 'next/font/google'
import './globals.css'
import './design-system.css'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as SonnerToaster } from '@/components/ui/sonner'
import ThemeProvider from '@/components/providers/ThemeProvider'
import AppToaster from '@/components/providers/AppToaster'
import NavigationProgress from '@/components/providers/NavigationProgress'
import AppInsights from '@/components/providers/AppInsights'
import { AuthProvider } from '@/hooks/use-auth'
import { generateHreflangMap } from '@/lib/seo-languages'
import { SITE_URL } from '@/lib/site-url'
import { getGoogleAdsenseClient, isGoogleAdsenseEnabled } from '@/lib/adsense'

const inter = Inter({
  variable: '--font-sans',
  subsets: ['latin'],
  display: 'swap',
})

const instrumentSerif = Instrument_Serif({
  variable: '--font-serif',
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
})

const yandexVerification = process.env.YANDEX_SITE_VERIFICATION?.trim()
const naverVerification = process.env.NAVER_SITE_VERIFICATION?.trim()

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'mtverse - Next.js Dashboard Templates & Free HTML Templates',
    template: '%s | mtverse',
  },
  description:
    'Preview premium Next.js dashboard, React admin, ecommerce, SaaS, landing page, and free responsive HTML templates with secure source downloads.',
  keywords: [
    'Next.js templates',
    'Next.js dashboard templates',
    'React admin templates',
    'admin UI kits',
    'SaaS templates',
    'ecommerce templates',
    'landing page templates',
    'free HTML templates',
    'responsive website templates',
    'portfolio templates',
    'Tailwind CSS templates',
    'TypeScript dashboard templates',
  ],
  authors: [{ name: 'mtverse', url: SITE_URL }],
  creator: 'mtverse',
  publisher: 'mtverse',
  verification: {
    ...(yandexVerification ? { yandex: yandexVerification } : {}),
    ...(naverVerification ? { other: { 'naver-site-verification': naverVerification } } : {}),
  },
  icons: { icon: '/SiteLogo.png', apple: '/SiteLogo.png' },
  manifest: '/manifest.webmanifest',
  alternates: {
    canonical: '/',
    languages: generateHreflangMap('/', SITE_URL),
  },
  openGraph: {
    title: 'mtverse - Next.js Dashboard Templates & Free HTML Templates',
    description: 'Preview dashboard, ecommerce, SaaS, landing page, portfolio, and responsive HTML website templates.',
    url: SITE_URL,
    siteName: 'mtverse',
    type: 'website',
    locale: 'en_US',
    images: [{ url: '/SiteLogo.png', width: 512, height: 512, alt: 'mtverse website template marketplace' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'mtverse - Next.js Dashboard Templates & Free HTML Templates',
    description: 'Live template previews, source-code packages, free HTML downloads, and protected delivery.',
    images: ['/SiteLogo.png'],
  },
  robots: {
    index: true,
    follow: true,
    'max-image-preview': 'large',
    'max-snippet': -1,
    'max-video-preview': -1,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  category: 'technology',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const adsenseClient = getGoogleAdsenseClient()
  const shouldLoadAdsense = isGoogleAdsenseEnabled()

  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <meta name="theme-color" content="#4f46e5" />
        {shouldLoadAdsense ? (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClient}`}
            crossOrigin="anonymous"
          />
        ) : null}
        {adsenseClient ? <meta name="google-adsense-account" content={adsenseClient} /> : null}
      </head>
      <body className={`${inter.variable} ${instrumentSerif.variable} antialiased bg-background text-foreground font-sans`}>
        <ThemeProvider>
          <AuthProvider>
            {children}
            <Suspense fallback={null}>
              <NavigationProgress />
            </Suspense>
            <AppToaster />
            <Toaster />
            <SonnerToaster />
            <AppInsights />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}