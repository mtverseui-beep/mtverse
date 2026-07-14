import { Save, Globe, Shield, CreditCard, Database } from 'lucide-react'
import type { Metadata } from 'next'
import { SITE_URL } from '@/lib/site-url'
import { ModernSelect } from '@/components/design-system/modern-select'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Admin Settings | mtverse',
  description: 'Private mtverse admin settings for site, payment, storage, and security configuration.',
  robots: {
    index: false,
    follow: false,
  },
}

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="ds-h1">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage mtverse site configuration</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Site settings */}
        <div className="ds-card">
          <div className="flex items-center gap-3 mb-4">
            <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-300">
              <Globe className="h-4 w-4" />
            </div>
            <h2 className="ds-h3">Site</h2>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium mb-1.5 text-muted-foreground">Site name</label>
              <input className="ds-input" defaultValue="mtverse" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5 text-muted-foreground">Site URL</label>
              <input className="ds-input" defaultValue={SITE_URL} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5 text-muted-foreground">Support email</label>
              <input className="ds-input" defaultValue="hello@mtverse.dev" />
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="ds-card">
          <div className="flex items-center gap-3 mb-4">
            <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300">
              <Shield className="h-4 w-4" />
            </div>
            <h2 className="ds-h3">Security</h2>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium mb-1.5 text-muted-foreground">Admin email</label>
              <input className="ds-input" defaultValue="admin@mtverse.dev" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5 text-muted-foreground">New password</label>
              <input type="password" className="ds-input" placeholder="••••••••" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5 text-muted-foreground">Confirm password</label>
              <input type="password" className="ds-input" placeholder="••••••••" />
            </div>
          </div>
        </div>

        {/* Payments */}
        <div className="ds-card">
          <div className="flex items-center gap-3 mb-4">
            <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300">
              <CreditCard className="h-4 w-4" />
            </div>
            <h2 className="ds-h3">Payments</h2>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium mb-1.5 text-muted-foreground">Paddle environment</label>
              <ModernSelect
                value="sandbox"
                onChange={() => {}}
                ariaLabel="Paddle environment"
                options={[
                  { value: 'sandbox', label: 'Sandbox' },
                  { value: 'production', label: 'Production' },
                ]}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5 text-muted-foreground">Paddle API key</label>
              <input type="password" className="ds-input font-mono text-xs" placeholder="••••••••••••" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5 text-muted-foreground">Webhook secret</label>
              <input type="password" className="ds-input font-mono text-xs" placeholder="••••••••••••" />
            </div>
          </div>
        </div>

        {/* Storage */}
        <div className="ds-card">
          <div className="flex items-center gap-3 mb-4">
            <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300">
              <Database className="h-4 w-4" />
            </div>
            <h2 className="ds-h3">Storage (R2)</h2>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium mb-1.5 text-muted-foreground">R2 public URL</label>
              <input className="ds-input font-mono text-xs" defaultValue="https://pub-59d1b450736b455084e9eebc2ed27f14.r2.dev" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5 text-muted-foreground">Bucket name</label>
              <input className="ds-input font-mono text-xs" placeholder="mtverse" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5 text-muted-foreground">Access key ID</label>
              <input type="password" className="ds-input font-mono text-xs" placeholder="••••••••••••" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button className="ds-btn ds-btn-primary">
          <Save className="h-4 w-4" />
          Save changes
        </button>
      </div>
    </div>
  )
}
