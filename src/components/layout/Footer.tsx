'use client'

import { useEffect, useState, type ComponentType } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Github, Twitter, Mail, ArrowRight, LayoutGrid, PenTool, LayoutDashboard, ShoppingBag, Code2 } from 'lucide-react'
import { SOCIAL_GITHUB, SOCIAL_TWITTER, SOCIAL_EMAIL } from '@/lib/site-social'

const FOOTER_COLUMNS: Array<{
  heading: string
  links: Array<{ name: string; href: string; icon?: ComponentType<{ className?: string }> }>
}> = [
  {
    heading: 'Product',
    links: [
      { name: 'Prompts', href: '/prompts', icon: PenTool },
      { name: 'Templates', href: '/templates', icon: LayoutGrid },
      { name: 'HTML templates', href: '/html-templates', icon: Code2 },
      { name: 'Pricing', href: '/pricing' },
      { name: 'Blog', href: '/blog' },
      { name: 'Featured prompts', href: '/prompts?sort=featured' },
    ],
  },
  {
    heading: 'Templates',
    links: [
      { name: 'All templates', href: '/templates' },
      { name: 'HTML templates', href: '/html-templates', icon: Code2 },
      { name: 'Dashboards', href: '/templates?category=dashboards', icon: LayoutDashboard },
      { name: 'Ecommerce', href: '/templates?category=ecommerce', icon: ShoppingBag },
      { name: 'Portfolio HTML', href: '/templates?category=html&subcategory=portfolio' },
      { name: 'SaaS HTML', href: '/templates?category=html&subcategory=saas' },
    ],
  },
  {
    heading: 'Account',
    links: [
      { name: 'Sign in', href: '/sign-in' },
      { name: 'Sign up', href: '/sign-up' },
      { name: 'Forgot password', href: '/forgot-password' },
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

export default function Footer({ promptCount }: { promptCount?: number }) {
  const pathname = usePathname()
  const year = new Date().getFullYear()
  const [authNextPath, setAuthNextPath] = useState('/')

  useEffect(() => {
    setAuthNextPath(getCurrentAuthNextPath())
  }, [pathname])

  return (
    <footer className="mt-auto border-t border-border/50 bg-[var(--ds-bg-sunken)]">
      <div className="mx-auto max-w-[1920px] px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-6">
          <div className="col-span-2 lg:col-span-2 space-y-3">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/SiteLogo.png" alt="mtverse" width={32} height={32} className="rounded-lg" />
              <span className="text-base font-bold tracking-tight">mtverse</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
              {promptCount
                ? promptCount.toLocaleString() + ' curated AI prompts, free HTML website templates, and premium dashboard templates for creators.'
                : 'Curated AI prompts, free HTML website templates, and premium dashboard templates for creators.'}
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
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-input bg-background text-muted-foreground hover:text-foreground hover:border-primary-300 hover:-translate-y-0.5 transition-all"
                    aria-label={social.name}
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                )
              })}
            </div>
          </div>

          {FOOTER_COLUMNS.map((col) => (
            <div key={col.heading} className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">{col.heading}</h3>
              <ul className="space-y-2">
                {col.links.map((link) => {
                  const Icon = link.icon
                  return (
                    <li key={link.name}>
                      <Link href={getAuthHref(link.href, authNextPath)} className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1.5">
                        {Icon && <Icon className="h-3 w-3 opacity-60" />}
                        {link.name}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 pt-6 border-t border-border/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            (c) {year} mtverse. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <Link href="/html-templates" className="inline-flex items-center gap-1 font-medium text-primary-600 hover:underline">
              HTML templates
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
