import type { Metadata } from 'next'
import AdminLoginClient from './admin-login-client'

export const metadata: Metadata = {
  title: 'Admin Sign In | mtverse',
  description: 'Secure admin access for mtverse template operations.',
  robots: {
    index: false,
    follow: false,
  },
}

export default function AdminLoginPage() {
  return <AdminLoginClient />
}
