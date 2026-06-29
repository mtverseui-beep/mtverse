import type { Metadata } from 'next'
import { SITE_URL } from '@/lib/site-url'
import ContactClient from './contact-client'

const title = 'Contact mtverse | Template Support and Partnerships'
const description = 'Contact mtverse for template support, billing questions, partnership requests, custom dashboard templates, and production-ready website template help.'

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    'contact mtverse',
    'template support',
    'dashboard template support',
    'Next.js template support',
    'website template help',
    'custom dashboard templates',
    'SaaS dashboard templates support',
  ],
  alternates: { canonical: '/contact' },
  openGraph: {
    title,
    description,
    url: SITE_URL + '/contact',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
  },
  robots: { index: true, follow: true, 'max-image-preview': 'large' },
}

export default function ContactPage() {
  return <ContactClient />
}
