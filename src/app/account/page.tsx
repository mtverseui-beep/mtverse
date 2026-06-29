import type { Metadata } from 'next'
import AccountClient from './account-client'

export const metadata: Metadata = {
  title: 'Account and Downloads | mtverse',
  description: 'Manage your mtverse account, saved templates, purchased dashboard templates, license key, and protected ZIP downloads.',
  robots: {
    index: false,
    follow: false,
  },
}

export default function AccountPage() {
  return <AccountClient />
}
