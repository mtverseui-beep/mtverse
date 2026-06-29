'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Github, Twitter, Mail, ArrowRight, LayoutGrid, PenTool, LayoutDashboard, ShoppingBag } from 'lucide-react'
import { SOCIAL_GITHUB, SOCIAL_TWITTER, SOCIAL_EMAIL } from '@/lib/site-social'

const FOOTER_COLUMNS: Array<{
  heading: string
  links: Array<{ name: string; href: string; icon?: React.ComponentType<{ className?: string }> }>
}> = [
  {
    heading: 'Product',
    links: [
      { name: 'Prompts', href: '/prompts', icon: PenTool },
      { name: 'Templates', href: '/templates', icon: LayoutGrid },
      { name: 'Featured', href: '/prompts?sort=featured' },
      { name: 'Trending', href: '/prompts?sort=hot' },
    ],
  },
  {
    heading: 'Templates',
    links: [
      { name: 'All templates', href: '/templates' },
      { name: 'Dashboards', href: '/templates?category=dashboards', icon: LayoutDashboard },
      { name: 'Ecommerce', href: '/templates?category=ecommerce', icon: ShoppingBag },
      { name: 'Portfolio', href: '/templates?category=portfolio' },
      { name: 'SaaS', href: '/templates?category=saas' },
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
    ],
  },
]

const SOCIAL_LINKS = [
  { name: 'GitHub', href: SOCIAL_GITHUB, icon: Github },
  { name: 'Twitter / X', href: SOCIAL_TWITTER, icon: Twitter },
  { name: 'Email', href: `mailto:${SOCIAL_EMAIL}`, icon: Mail },
]

export default function Footer({ promptCount }: { promptCount?: number }) {
  const year = new Date().getFullYear()

  return (
    <footer className="mt-auto border-t border-border/50 bg-[var(--ds-bg-sunken)]">
      <div className="mx-auto max-w-[1920px] px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-6">
          {/* Brand column */}
          <div className="col-span-2 lg:col-span-2 space-y-3">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/SiteLogo.png"
                alt="mtverse"
                width={32}
                height={32}
                className="rounded-lg"
              />
              <span className="text-base font-bold tracking-tight">mtverse</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
              {promptCount
                ? `${promptCount.toLocaleString()} curated AI prompts and premium templates for image generation, writing, coding, and more.`
                : 'Curated AI prompts and premium templates for image generation, writing, coding, and more.'}
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

          {/* Link columns */}
          {FOOTER_COLUMNS.map((col) => (
            <div key={col.heading} className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">{col.heading}</h3>
              <ul className="space-y-2">
                {col.links.map((link) => {
                  const Icon = link.icon
                  return (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1.5"
                      >
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

        {/* Bottom strip */}
        <div className="mt-10 pt-6 border-t border-border/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            © {year} mtverse. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <Link
              href="/templates"
              className="inline-flex items-center gap-1 font-medium text-primary-600 hover:underline"
            >
              Templates
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
