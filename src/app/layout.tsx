import type { Metadata } from "next";
import { Suspense } from "react";
import { Inter, Instrument_Serif } from "next/font/google";
import "./globals.css";
import "./design-system.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import ThemeProvider from "@/components/providers/ThemeProvider";
import AppToaster from "@/components/providers/AppToaster";
import NavigationProgress from "@/components/providers/NavigationProgress";
import AppInsights from "@/components/providers/AppInsights";
import { AuthProvider } from "@/hooks/use-auth";
import { generateHreflangMap } from "@/lib/seo-languages";
import { SITE_URL } from "@/lib/site-url";
import { getGoogleAdsenseClient, isGoogleAdsenseEnabled } from "@/lib/adsense";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "mtverse — Free AI Prompts & Premium Templates",
    template: "%s | mtverse",
  },
  description:
    "Browse 2,300+ free AI prompts for ChatGPT, Midjourney, Nano Banana, Gemini, and Flux. Plus premium Next.js templates for dashboards, ecommerce, and SaaS.",
  keywords: [
    "AI prompts",
    "free AI prompts",
    "ChatGPT prompts",
    "Midjourney prompts",
    "Nano Banana prompts",
    "Gemini prompts",
    "Flux prompts",
    "image generation prompts",
    "AI image prompts",
    "prompt library",
    "Next.js templates",
    "dashboard templates",
    "ecommerce templates",
    "SaaS templates",
    "portfolio templates",
    "premium templates",
  ],
  authors: [{ name: "mtverse", url: SITE_URL }],
  creator: "mtverse",
  publisher: "mtverse",
  icons: {
    icon: "/SiteLogo.png",
    apple: "/SiteLogo.png",
  },
  manifest: "/manifest.webmanifest",
  alternates: {
    canonical: "/",
    languages: generateHreflangMap("/", SITE_URL),
  },
  openGraph: {
    title: "mtverse — Free AI Prompts & Premium Templates",
    description:
      "2,300+ free AI prompts for ChatGPT, Midjourney, Nano Banana, Gemini, Flux. Plus premium Next.js templates.",
    url: SITE_URL,
    siteName: "mtverse",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/SiteLogo.png",
        width: 512,
        height: 512,
        alt: "mtverse — Free AI Prompts & Premium Templates",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "mtverse — Free AI Prompts & Premium Templates",
    description:
      "2,300+ free AI prompts for ChatGPT, Midjourney, Nano Banana, Gemini, Flux. Plus premium Next.js templates.",
    images: ["/SiteLogo.png"],
  },
  robots: {
    index: true,
    follow: true,
    "max-image-preview": "large",
    "max-snippet": -1,
    "max-video-preview": -1,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  category: "technology",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const adsenseClient = getGoogleAdsenseClient();
  const shouldLoadAdsense = isGoogleAdsenseEnabled();

  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        {/* PWA theme color */}
        <meta name="theme-color" content="#4f46e5" />
        {/* AdSense account metadata and script. Enable the script only after publisher configuration is intentional. */}
        {shouldLoadAdsense && (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClient}`}
            crossOrigin="anonymous"
          />
        )}
        {adsenseClient && (
          <meta name="google-adsense-account" content={adsenseClient} />
        )}
      </head>
      <body
        className={`${inter.variable} ${instrumentSerif.variable} antialiased bg-background text-foreground font-sans`}
      >
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
  );
}
