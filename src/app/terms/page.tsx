import type { Metadata } from 'next'
import { LegalPage, legalMetadata } from '@/components/legal/legal-page'

export const metadata: Metadata = legalMetadata(
  'Terms of Service',
  'The terms and conditions for browsing, downloading, and purchasing mtverse website templates.',
  '/terms',
)

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" description="Terms for mtverse template browsing, accounts, purchases, licenses, and downloads." lastUpdated="July 14, 2026">
      <p>These Terms of Service govern your use of mtverse.dev and its website template catalog, account features, checkout, licensing, and downloads.</p>

      <h2>1. Acceptance and Eligibility</h2>
      <p>By accessing or using the Service, you agree to these Terms. You must be at least 13 years old and legally able to enter into this agreement.</p>

      <h2>2. Accounts</h2>
      <p>Certain features require an account, including free downloads, paid purchases, saved templates, bundle access, and download history. You are responsible for accurate account information, session security, and activity under your account.</p>

      <h2>3. Acceptable Use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>Use the Service for unlawful, harmful, or fraudulent activity</li>
        <li>Attempt unauthorized access to accounts, files, APIs, admin routes, or payment systems</li>
        <li>Upload or transmit malware or interfere with Service availability</li>
        <li>Scrape, crawl, or copy the catalog at scale without permission</li>
        <li>Bypass download limits, purchase checks, signed URLs, or entitlement controls</li>
        <li>Misrepresent a template, license, or mtverse content as your own marketplace inventory</li>
      </ul>

      <h2>4. Free HTML Templates</h2>
      <p>Free template downloads follow the account limits and access rules shown on the Service. The separate HTML bundle unlock provides the access described on its pricing and checkout pages. Free status does not transfer ownership of the original template listing or mtverse branding.</p>

      <h2>5. Paid Templates and Bundles</h2>
      <h3>5.1 Purchase Scope</h3>
      <p>A single-template purchase unlocks only the selected template. It does not unlock another template. Bundle products are separate and include only the catalog scope described before checkout.</p>

      <h3>5.2 License Grant</h3>
      <p>Unless a template page states otherwise, a paid template purchase provides a single-production-project license. You may customize the template and use it in one personal or commercial production project.</p>

      <h3>5.3 Restrictions</h3>
      <ul>
        <li>Do not resell, sublicense, redistribute, or publish the source package as-is</li>
        <li>Do not use one license for multiple production projects</li>
        <li>Do not include the source package in a competing template club, builder, repository, or download service</li>
        <li>Do not share account-only download links, license keys, or protected archives</li>
        <li>Purchase another license when the same paid template is used for another production project</li>
      </ul>

      <h2>6. Payments</h2>
      <p>Supported payments are processed by Paddle. mtverse does not store full card details. Prices are shown in USD unless stated otherwise and may change for future purchases. A completed checkout is subject to payment verification before access is granted.</p>

      <h2>7. Downloads and Availability</h2>
      <p>Downloads are attached to the signed-in account and applicable entitlement. Generated bundles may take time to prepare. You are responsible for keeping a backup of downloaded source packages and reviewing dependencies before production use.</p>

      <h2>8. Refunds</h2>
      <p>Refund requests are handled under the published <a href="/refund-policy">Refund Policy</a>. Approved refunds may revoke the corresponding license and future download access.</p>

      <h2>9. Intellectual Property</h2>
      <p>The Service, catalog text, branding, screenshots, software, and original content are protected by applicable intellectual property laws. A template license grants usage rights; it does not transfer ownership of the original package or marketplace listing.</p>

      <h2>10. Third-Party Software and Services</h2>
      <p>Templates may rely on open-source packages, frameworks, fonts, images, icons, or external services. Their separate licenses and terms continue to apply. You are responsible for reviewing dependencies before publication.</p>

      <h2>11. Disclaimer and Liability</h2>
      <p>The Service and templates are provided on an as-is and as-available basis. To the maximum extent permitted by law, mtverse is not liable for indirect, incidental, consequential, or punitive damages arising from use of the Service or a template package.</p>

      <h2>12. Termination</h2>
      <p>Access may be suspended or terminated for fraud, chargeback abuse, license violations, unauthorized distribution, security threats, or other material violations of these Terms.</p>

      <h2>13. Governing Law and Changes</h2>
      <p>These Terms are governed by the laws of India, without regard to conflict-of-law rules. We may update these Terms and will publish the revised date on this page.</p>

      <h2>14. Contact</h2>
      <p>Questions about these Terms can be sent to <a href="mailto:terms@mtverse.dev">terms@mtverse.dev</a> or through the <a href="/contact">contact page</a>.</p>
    </LegalPage>
  )
}