import type { Metadata } from 'next'
import { AuthForm } from '@/components/auth/auth-form'

export const metadata: Metadata = {
  title: 'Forgot password',
  description: 'Reset your mtverse password.',
}

export default function ForgotPasswordPage() {
  return <AuthForm mode="forgot-password" />
}
