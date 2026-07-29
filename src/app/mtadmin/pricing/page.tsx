import type { Metadata } from 'next'
import PublicLayout from '@/components/layout/PublicLayout'
import { MtadminPricingClient } from '@/components/mtadmin/mtadmin-pricing-client'
import { getMtadminProduct } from '@/lib/mtadmin-product'
import { SITE_URL } from '@/lib/site-url'

const product = getMtadminProduct()

export const metadata: Metadata = {
  title: product.seo.title,
  description: product.seo.description,
  keywords: product.seo.keywords,
  alternates: { canonical: '/mtadmin/pricing' },
  openGraph: {
    title: product.seo.title,
    description: product.seo.description,
    url: `${SITE_URL}/mtadmin/pricing`,
    type: 'website',
    images: [{ url: `${SITE_URL}${product.previewImages[0]}`, width: 1900, height: 910, alt: 'mtadmin admin dashboard preview' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: product.seo.title,
    description: product.seo.description,
    images: [`${SITE_URL}${product.previewImages[0]}`],
  },
}

export default function MtadminPricingPage() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description,
    image: product.previewImages.map((image) => `${SITE_URL}${image}`),
    url: `${SITE_URL}/mtadmin/pricing`,
    brand: { '@type': 'Brand', name: 'mtverse' },
    offers: {
      '@type': 'AggregateOffer',
      lowPrice: String(product.individualPriceUsd),
      highPrice: String(product.bundlePriceUsd),
      priceCurrency: product.currency,
      offerCount: '3',
      availability: 'https://schema.org/InStock',
      url: `${SITE_URL}/mtadmin/pricing`,
    },
  }

  return (
    <PublicLayout schemaMarkup={schema}>
      <MtadminPricingClient product={product} />
    </PublicLayout>
  )
}
