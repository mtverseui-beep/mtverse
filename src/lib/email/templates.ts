import 'server-only'

import { SITE_URL } from '@/lib/site-url'

type EmailContent = {
  subject: string
  html: string
  text: string
}

const BRAND_BLUE = '#3157f6'
const TEXT = '#111827'
const MUTED = '#667085'

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function emailShell(input: {
  preheader: string
  eyebrow?: string
  title: string
  intro: string
  buttonLabel?: string
  buttonUrl?: string
  details?: Array<{ label: string; value: string }>
  bodyHtml?: string
  footerNote?: string
}) {
  const details = input.details?.length
    ? `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:24px 0;border:1px solid #e6e8ec;border-radius:8px;border-collapse:separate;overflow:hidden;">${input.details
        .map(
          (item, index) => `<tr>
            <td style="padding:12px 16px;${index ? 'border-top:1px solid #e6e8ec;' : ''}color:${MUTED};font-size:13px;">${escapeHtml(item.label)}</td>
            <td align="right" style="padding:12px 16px;${index ? 'border-top:1px solid #e6e8ec;' : ''}color:${TEXT};font-size:13px;font-weight:600;">${escapeHtml(item.value)}</td>
          </tr>`,
        )
        .join('')}</table>`
    : ''

  const button = input.buttonLabel && input.buttonUrl
    ? `<table role="presentation" cellspacing="0" cellpadding="0" style="margin:26px auto 20px;"><tr><td bgcolor="${BRAND_BLUE}" style="border-radius:8px;"><a href="${escapeHtml(input.buttonUrl)}" style="display:inline-block;padding:13px 24px;color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;">${escapeHtml(input.buttonLabel)}</a></td></tr></table>`
    : ''

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>@media only screen and (max-width:480px){.email-header{padding:18px 20px!important}.email-content{padding:28px 20px 24px!important}.email-title{font-size:24px!important}.email-footer{padding:18px 20px!important}}</style></head>
<body style="margin:0;padding:0;background:#f3f5f8;font-family:Inter,Arial,sans-serif;color:${TEXT};">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(input.preheader)}</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center" style="padding:28px 12px;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border:1px solid #e6e8ec;border-radius:8px;overflow:hidden;">
      <tr><td class="email-header" style="padding:22px 28px;border-bottom:1px solid #eef0f3;">
        <a href="${SITE_URL}" style="display:inline-flex;align-items:center;color:${TEXT};text-decoration:none;font-size:20px;font-weight:800;"><img src="${SITE_URL}/SiteLogo.png" width="32" height="32" alt="mtverse" style="display:inline-block;margin-right:10px;border:0;border-radius:7px;vertical-align:middle;">mtverse</a>
      </td></tr>
      <tr><td class="email-content" style="padding:36px 28px 30px;text-align:center;">
        ${input.eyebrow ? `<div style="display:inline-block;margin-bottom:16px;padding:6px 10px;border-radius:999px;background:#eef1ff;color:#3c4fd5;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.08em;">${escapeHtml(input.eyebrow)}</div>` : ''}
        <h1 class="email-title" style="margin:0 0 14px;font-size:30px;line-height:1.18;letter-spacing:0;color:${TEXT};">${escapeHtml(input.title)}</h1>
        <p style="margin:0 auto;max-width:490px;color:${MUTED};font-size:15px;line-height:1.7;">${escapeHtml(input.intro)}</p>
        ${details}
        ${input.bodyHtml || ''}
        ${button}
        ${input.buttonUrl ? `<p style="margin:14px 0 0;color:#98a2b3;font-size:12px;line-height:1.6;word-break:break-all;">If the button does not work, open:<br><a href="${escapeHtml(input.buttonUrl)}" style="color:${BRAND_BLUE};">${escapeHtml(input.buttonUrl)}</a></p>` : ''}
      </td></tr>
      <tr><td class="email-footer" style="padding:20px 28px;background:#f8fafc;border-top:1px solid #eef0f3;text-align:center;color:#7b8494;font-size:12px;line-height:1.65;">
        ${escapeHtml(input.footerNote || 'mtverse template support and account notifications.')}<br>
        <a href="${SITE_URL}/contact" style="color:#4b5fce;text-decoration:none;">Contact support</a>&nbsp;&nbsp;&middot;&nbsp;&nbsp;<a href="${SITE_URL}/privacy" style="color:#4b5fce;text-decoration:none;">Privacy</a>
      </td></tr>
    </table>
  </td></tr></table>
</body></html>`
}

export function passwordResetEmail(input: { name: string; resetUrl: string }): EmailContent {
  const name = input.name.trim() || 'there'
  return {
    subject: 'Reset your mtverse password',
    html: emailShell({
      preheader: 'Use this secure link to reset your mtverse password.',
      eyebrow: 'Account security',
      title: `Reset your password, ${name}`,
      intro: 'We received a request to reset your mtverse password. This secure link expires in 60 minutes and can be used once.',
      buttonLabel: 'Reset password',
      buttonUrl: input.resetUrl,
      footerNote: 'If you did not request this change, you can safely ignore this email.',
    }),
    text: `Hi ${name},\n\nReset your mtverse password using this secure link:\n${input.resetUrl}\n\nThe link expires in 60 minutes and can be used once. If you did not request this, ignore this email.`,
  }
}

export function purchaseConfirmationEmail(input: {
  itemName: string
  amount: string
  transactionId: string
  accessUrl: string
}): EmailContent {
  return {
    subject: `Your ${input.itemName} access is ready`,
    html: emailShell({
      preheader: 'Your mtverse payment is confirmed and download access is active.',
      eyebrow: 'Payment confirmed',
      title: 'Your template access is ready',
      intro: 'Payment was confirmed successfully. Sign in with the purchase email to open your account and download the files covered by this order.',
      details: [
        { label: 'Item', value: input.itemName },
        { label: 'Paid', value: input.amount },
        { label: 'Transaction', value: input.transactionId },
      ],
      buttonLabel: 'Open download access',
      buttonUrl: input.accessUrl,
      footerNote: 'Keep this email as your purchase record. Download links remain protected by your mtverse account.',
    }),
    text: `Payment confirmed\n\nItem: ${input.itemName}\nPaid: ${input.amount}\nTransaction: ${input.transactionId}\n\nOpen your download access: ${input.accessUrl}`,
  }
}

export function newsletterWelcomeEmail(input: { unsubscribeUrl: string }): EmailContent {
  return {
    subject: 'You are subscribed to mtverse template updates',
    html: emailShell({
      preheader: 'New template releases and practical product updates from mtverse.',
      eyebrow: 'Subscription confirmed',
      title: 'Template updates, without the noise',
      intro: 'You are now subscribed to occasional mtverse updates about new dashboard, ecommerce, landing page, and HTML templates.',
      bodyHtml: `<p style="margin:24px auto 0;max-width:480px;color:#667085;font-size:14px;line-height:1.7;">We will send only useful release notes and important template updates. <a href="${escapeHtml(input.unsubscribeUrl)}" style="color:#3157f6;">Unsubscribe anytime</a>.</p>`,
      buttonLabel: 'Browse templates',
      buttonUrl: `${SITE_URL}/templates`,
      footerNote: 'You requested template release updates from mtverse.',
    }),
    text: `You are subscribed to mtverse template updates.\n\nBrowse templates: ${SITE_URL}/templates\n\nUnsubscribe: ${input.unsubscribeUrl}`,
  }
}

export function feedbackReceivedEmail(input: { name: string; subject: string; referenceId: string }): EmailContent {
  const name = input.name.trim() || 'there'
  return {
    subject: `We received your message (${input.referenceId})`,
    html: emailShell({
      preheader: 'Your mtverse support message has been received.',
      eyebrow: 'Message received',
      title: `Thanks for reaching out, ${name}`,
      intro: 'Your message reached the mtverse team. We will review it and reply to your email, usually within 24 hours.',
      details: [
        { label: 'Subject', value: input.subject },
        { label: 'Reference', value: input.referenceId },
      ],
      buttonLabel: 'Browse templates',
      buttonUrl: `${SITE_URL}/templates`,
      footerNote: 'Reply to this email if you need to add useful context to your request.',
    }),
    text: `Hi ${name},\n\nWe received your message.\nSubject: ${input.subject}\nReference: ${input.referenceId}\n\nWe usually reply within 24 hours.`,
  }
}

export function feedbackAdminEmail(input: { name: string; email: string; subject: string; message: string; referenceId: string }): EmailContent {
  const safeMessage = escapeHtml(input.message).replaceAll('\n', '<br>')
  return {
    subject: `[mtverse feedback] ${input.subject}`,
    html: emailShell({
      preheader: `New feedback from ${input.name}`,
      eyebrow: 'New feedback',
      title: input.subject,
      intro: `A new message was submitted by ${input.name} (${input.email}).`,
      details: [
        { label: 'Reference', value: input.referenceId },
        { label: 'Email', value: input.email },
      ],
      bodyHtml: `<div style="margin-top:20px;padding:16px;border:1px solid #e6e8ec;border-radius:8px;text-align:left;color:#344054;font-size:14px;line-height:1.7;">${safeMessage}</div>`,
      footerNote: 'Internal mtverse contact notification.',
    }),
    text: `New feedback\n\nFrom: ${input.name} <${input.email}>\nSubject: ${input.subject}\nReference: ${input.referenceId}\n\n${input.message}`,
  }
}
