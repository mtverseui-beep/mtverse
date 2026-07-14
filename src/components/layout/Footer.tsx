'use client'

import { useEffect, useState, type ComponentType } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Github, Twitter, Mail, ArrowRight, LayoutGrid, LayoutDashboard, ShoppingBag, Code2, Rocket } from 'lucide-react'
import { SOCIAL_GITHUB, SOCIAL_TWITTER, SOCIAL_EMAIL } from '@/lib/site-social'

const FOOTER_COLUMNS: Array<{
  heading: string
  links: Array<{ name: string; href: string; icon?: ComponentType<{ className?: string }> }>
}> = [
  {
    heading: 'Templates',
    links: [
      { name: 'All templates', href: '/templates', icon: LayoutGrid },
      { name: 'Free HTML templates', href: '/html-templates', icon: Code2 },
      { name: 'Dashboard templates', href: '/template-categories/dashboards', icon: LayoutDashboard },
      { name: 'Ecommerce templates', href: '/template-categories/ecommerce', icon: ShoppingBag },
      { name: 'Landing pages', href: '/template-categories/landing', icon: Rocket },
    ],
  },
  {
    heading: 'Template guides',
    links: [
      { name: 'Next.js dashboards', href: '/template-hubs/nextjs-dashboard-templates' },
      { name: 'React admin templates', href: '/template-hubs/react-admin-dashboard-templates' },
      { name: 'SaaS templates', href: '/template-hubs/saas-templates' },
      { name: 'Portfolio templates', href: '/template-hubs/portfolio-html-templates' },
      { name: 'Agency websites', href: '/template-hubs/agency-website-templates' },
    ],
  },
  {
    heading: 'Product',
    links: [
      { name: 'Pricing', href: '/pricing' },
      { name: 'Account', href: '/account' },
      { name: 'Blog', href: '/blog' },
      { name: 'FAQ', href: '/faq' },
      { name: 'Support', href: '/support' },
      { name: 'About', href: '/about' },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { name: 'Privacy', href: '/privacy' },
      { name: 'Cookie Policy', href: '/cookie-policy' },
      { name: 'Terms', href: '/terms' },
      { name: 'Disclaimer', href: '/disclaimer' },
      { name: 'DMCA', href: '/dmca' },
      { name: 'Refund Policy', href: '/refund-policy' },
      { name: 'Editorial Standards', href: '/editorial-policy' },
    ],
  },
]

const SOCIAL_LINKS = [
  { name: 'GitHub', href: SOCIAL_GITHUB, icon: Github },
  { name: 'Twitter / X', href: SOCIAL_TWITTER, icon: Twitter },
  { name: 'Email', href: 'mailto:' + SOCIAL_EMAIL, icon: Mail },
]

const AUTH_NEXT_BLOCKED_PATHS = ['/sign-in', '/sign-up', '/forgot-password', '/reset-password', '/admin-login', '/api']

function getCurrentAuthNextPath() {
  if (typeof window === 'undefined') return '/'

  const pathname = window.location.pathname || '/'
  const normalizedPathname = pathname.replace(/\/+$/, '') || '/'
  const isBlocked = AUTH_NEXT_BLOCKED_PATHS.some((path) => normalizedPathname === path || normalizedPathname.startsWith(`${path}/`))

  if (isBlocked) return '/account'
  return `${pathname}${window.location.search}${window.location.hash}`
}

function getAuthHref(href: string, nextPath: string) {
  if (href !== '/sign-in' && href !== '/sign-up') return href
  return `${href}?next=${encodeURIComponent(nextPath || '/')}`
}

export default function Footer() {
  const pathname = usePathname()
  const year = new Date().getFullYear()
  const [authNextPath, setAuthNextPath] = useState('/')

  useEffect(() => {
    setAuthNextPath(getCurrentAuthNextPath())
  }, [pathname])

  return (
    <footer className="mt-auto border-t border-border/50 bg-[var(--ds-bg-sunken)]">
      <div className="mx-auto max-w-[1920px] px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-6">
          <div className="col-span-2 space-y-3 lg:col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/SiteLogo.png" alt="mtverse" width={32} height={32} className="rounded-lg" />
              <span className="text-base font-bold tracking-tight">mtverse</span>
            </Link>
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              Next.js dashboards, React admin UI kits, landing pages, ecommerce projects, and free responsive HTML website templates with preview-first browsing.
            </p>
            <div className="flex items-center gap-2 pt-2">
              {SOCIAL_LINKS.map((social) => {
                const Icon = social.icon
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    target={social.href.startsWith('mailto:') ? undefined : '_blank'}
                    rel={social.href.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-input bg-background text-muted-foreground transition-all hover:-translate-y-0.5 hover:border-primary-300 hover:text-foreground"
                    aria-label={social.name}
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                )
              })}
            </div>
          </div>

          {FOOTER_COLUMNS.map((column) => (
            <div key={column.heading} className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">{column.heading}</h3>
              <ul className="space-y-2">
                {column.links.map((link) => {
                  const Icon = link.icon
                  return (
                    <li key={link.name}>
                      <Link href={getAuthHref(link.href, authNextPath)} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
                        {Icon ? <Icon className="h-3 w-3 opacity-60" /> : null}
                        {link.name}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-border/50 pt-6 sm:flex-row sm:items-center">
          <p className="text-xs text-muted-foreground">(c) {year} mtverse. All rights reserved.</p>
          <Link href="/templates" className="inline-flex items-center gap-1 text-xs font-medium text-primary-600 hover:underline">
            Explore templates
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </footer>
  )
}