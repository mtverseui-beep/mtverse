import type { Metadata } from 'next'
import { AuthForm } from '@/components/auth/auth-form'

export const metadata: Metadata = {
  title: 'Sign up',
  description: 'Create your mtverse account.',
  robots: { index: false, follow: false },
}

export default function SignUpPage() {
  return <AuthForm mode="sign-up" />
}
