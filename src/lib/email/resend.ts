import 'server-only'

type SendEmailInput = {
  to: string | string[]
  subject: string
  html: string
  text: string
  replyTo?: string
  headers?: Record<string, string>
  tags?: Array<{ name: string; value: string }>
}

type ResendResponse = {
  id?: string
  message?: string
  name?: string
}

function readEnv(name: string) {
  return process.env[name]?.trim() || ''
}

export function isResendConfigured() {
  return Boolean(readEnv('RESEND_API_KEY') && readEnv('RESEND_FROM_EMAIL'))
}

export function getResendAdminEmail() {
  return readEnv('RESEND_ADMIN_EMAIL') || readEnv('ADMIN_EMAIL') || readEnv('NEXT_PUBLIC_SOCIAL_EMAIL')
}

export async function sendEmail(input: SendEmailInput) {
  const apiKey = readEnv('RESEND_API_KEY')
  const from = readEnv('RESEND_FROM_EMAIL')

  if (!apiKey || !from) {
    throw new Error('Resend email delivery is not configured.')
  }

  const replyTo = input.replyTo || readEnv('RESEND_REPLY_TO_EMAIL') || undefined
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'User-Agent': 'mtverse-email/1.0',
    },
    body: JSON.stringify({
      from,
      to: Array.isArray(input.to) ? input.to : [input.to],
      subject: input.subject,
      html: input.html,
      text: input.text,
      reply_to: replyTo,
      headers: input.headers,
      tags: input.tags,
    }),
    cache: 'no-store',
  })

  const payload = (await response.json().catch(() => ({}))) as ResendResponse
  if (!response.ok || !payload.id) {
    throw new Error(`Resend delivery failed with status ${response.status}.`)
  }

  return { id: payload.id }
}
