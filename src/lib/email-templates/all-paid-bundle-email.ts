import 'server-only'

import type { PricingCtaSettings } from '@/lib/pricing-settings-store'
import { SITE_URL } from '@/lib/site-url'

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function buildAllPaidBundleEmail(settings: PricingCtaSettings, siteUrl = SITE_URL) {
  const pricingUrl = `${siteUrl}/pricing`
  const templatesUrl = `${siteUrl}/templates`
  const subject = settings.emailSubject
  const preheader = settings.emailPreheader
  const headline = settings.emailHeadline
  const body = settings.emailBody

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(subject)}</title>
  </head>
  <body style="margin:0;background:#f6f8fb;color:#111827;font-family:Inter,Arial,sans-serif;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader)}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f6f8fb;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#ffffff;border:1px solid #e5e7eb;border-radius:24px;overflow:hidden;box-shadow:0 18px 60px rgba(15,23,42,0.08);">
            <tr>
              <td style="padding:32px 32px 18px;">
                <p style="margin:0 0 14px;display:inline-block;border-radius:999px;background:#eef2ff;color:#4f46e5;font-size:12px;font-weight:800;letter-spacing:.04em;text-transform:uppercase;padding:8px 12px;">${escapeHtml(settings.badge)}</p>
                <h1 style="margin:0;color:#0f172a;font-size:32px;line-height:1.15;font-weight:900;">${escapeHtml(headline)}</h1>
                <p style="margin:16px 0 0;color:#475569;font-size:16px;line-height:1.7;">${escapeHtml(body)}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:4px 32px 24px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-radius:18px;background:#f8fafc;border:1px solid #e2e8f0;">
                  <tr>
                    <td style="padding:18px;color:#334155;font-size:14px;line-height:1.7;">
                      <strong style="display:block;color:#0f172a;font-size:15px;margin-bottom:8px;">Included with the $149 bundle</strong>
                      <div>All current paid mtverse templates</div>
                      <div>Future paid template updates included</div>
                      <div>Protected account download and one generated ZIP archive</div>
                      <div>Commercial project use under the mtverse license</div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:0 32px 34px;">
                <a href="${pricingUrl}" style="display:inline-block;border-radius:14px;background:#4f46e5;color:#ffffff;text-decoration:none;font-size:15px;font-weight:800;padding:14px 20px;">Get the all paid bundle</a>
                <a href="${templatesUrl}" style="display:inline-block;margin-left:12px;color:#475569;text-decoration:none;font-size:14px;font-weight:700;">Browse templates</a>
              </td>
            </tr>
          </table>
          <p style="max-width:640px;margin:16px auto 0;color:#94a3b8;font-size:12px;line-height:1.6;">You are receiving this because you asked for mtverse template updates or offers. Visit mtverse to manage purchases and downloads.</p>
        </td>
      </tr>
    </table>
  </body>
</html>`

  const text = `${headline}\n\n${body}\n\nIncluded: all current paid mtverse templates, future paid template updates, protected account download, and one generated ZIP archive.\n\nGet the bundle: ${pricingUrl}\nBrowse templates: ${templatesUrl}`

  return { subject, preheader, html, text, pricingUrl, templatesUrl }
}