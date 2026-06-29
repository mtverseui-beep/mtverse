import type { Metadata } from 'next'
import { AuthForm } from '@/components/auth/auth-form'

export const metadata: Metadata = {
  title: 'Reset Password',
  description: 'Reset your mtverse account password.',
}

type SearchParams = Promise<{
  token?: string | string[]
}>

export default async function ResetPasswordPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams
  const rawToken = params.token
  const token = Array.isArray(rawToken) ? rawToken[0] : rawToken

  return <AuthForm mode="reset-password" resetToken={token || ''} />
}