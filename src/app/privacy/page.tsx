import type { Metadata } from 'next'
import Link from 'next/link'
import { LegalPage, legalMetadata } from '@/components/legal/legal-page'

export const metadata: Metadata = legalMetadata(
  'Privacy Policy',
  'How mtverse collects, uses, and protects your personal information.',
  '/privacy'
)

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      description="How we collect, use, and protect your personal information."
      lastUpdated="June 27, 2026"
    >
      <p>
        mtverse (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) operates the website at mtverse.dev (the &quot;Service&quot;).
        This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Service.
      </p>

      <h2>1. Information We Collect</h2>
      <h3>1.1 Information You Provide</h3>
      <ul>
        <li><strong>Account information:</strong> Name, email address, and password when you create an account.</li>
        <li><strong>Payment information:</strong> Processed securely through Paddle. We do not store credit card details.</li>
        <li><strong>Communication:</strong> Emails you send us for support, feedback, or inquiries.</li>
      </ul>

      <h3>1.2 Information Collected Automatically</h3>
      <ul>
        <li><strong>Usage data:</strong> IP address, browser type, pages visited, referring URLs, time spent on pages, and click data.</li>
        <li><strong>Cookies and similar technologies:</strong> Session cookies, authentication cookies, and analytics cookies.</li>
        <li><strong>Device information:</strong> Device type, operating system, and screen resolution.</li>
      </ul>

      <h2>2. How We Use Your Information</h2>
      <ul>
        <li>To provide, maintain, and improve our Service</li>
        <li>To create and manage your account</li>
        <li>To process transactions and deliver purchased templates</li>
        <li>To send you technical notices, updates, and support messages</li>
        <li>To respond to your comments, questions, and customer service requests</li>
        <li>To monitor and analyze trends, usage, and activities in connection with our Service</li>
        <li>To detect, investigate, and prevent fraudulent transactions and other illegal activities</li>
        <li>To personalize content and advertising (where applicable)</li>
      </ul>

      <h2>3. Cookies and Tracking Technologies</h2>
      <p>
        We use cookies and similar tracking technologies to track activity on our Service and store certain information.
        Cookies are files with a small amount of data that may include an anonymous unique identifier.
      </p>
      <p>Types of cookies we use:</p>
      <ul>
        <li><strong>Essential cookies:</strong> Required for the website to function correctly (authentication, security).</li>
        <li><strong>Analytics cookies:</strong> Help us understand how visitors interact with our website (Cloudflare Web Analytics).</li>
        <li><strong>Advertising cookies:</strong> Used to deliver relevant ads (Google AdSense, if enabled).</li>
      </ul>
      <p>
        You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. If you do not accept cookies,
        some portions of the Service may not function properly. See our <Link href="/cookie-policy">Cookie Policy</Link> for more details.
      </p>

      <h2>4. Sharing Your Information</h2>
      <p>We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except in the following circumstances:</p>
      <ul>
        <li><strong>Service providers:</strong> We share information with third-party service providers who perform services on our behalf (payment processors, secure data storage, hosting/CDN providers, and analytics or advertising partners).</li>
        <li><strong>Legal compliance:</strong> We may disclose information when required by law or in response to valid requests by public authorities.</li>
        <li><strong>Business transfers:</strong> Information may be transferred as part of a merger, acquisition, or sale of assets.</li>
      </ul>

      <h2>5. Third-Party Services</h2>
      <p>Our Service uses third-party services that may collect information:</p>
      <ul>
        <li><strong>Google AdSense:</strong> May serve ads and use cookies to personalize content. See <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer">Google&apos;s Advertising Policy</a>.</li>
        <li><strong>Paddle:</strong> Processes payments. See <a href="https://www.paddle.com/legal/privacy" target="_blank" rel="noopener noreferrer">Paddle&apos;s Privacy Policy</a>.</li>
        <li><strong>Netlify:</strong> Hosts our website. See <a href="https://www.netlify.com/privacy/" target="_blank" rel="noopener noreferrer">Netlify&apos;s Privacy Policy</a>.</li>
        <li><strong>Cloudflare:</strong> Provides analytics and content delivery services. See <a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noopener noreferrer">Cloudflare&apos;s Privacy Policy</a>.</li>
      </ul>

      <h2>6. Data Security</h2>
      <p>
        We implement appropriate technical and organizational measures to protect your personal information against unauthorized access,
        alteration, disclosure, or destruction. These measures include SSL encryption, secure password hashing (scrypt), HMAC-signed sessions,
        and rate limiting. However, no method of transmission over the Internet or electronic storage is 100% secure.
      </p>

      <h2>7. Your Data Rights</h2>
      <p>Depending on your location, you may have the following rights:</p>
      <ul>
        <li><strong>Access:</strong> Request a copy of your personal data</li>
        <li><strong>Rectification:</strong> Request correction of inaccurate data</li>
        <li><strong>Erasure:</strong> Request deletion of your data (&quot;right to be forgotten&quot;)</li>
        <li><strong>Restriction:</strong> Request restriction of processing</li>
        <li><strong>Portability:</strong> Request transfer of your data to another service</li>
        <li><strong>Objection:</strong> Object to certain processing activities</li>
      </ul>
      <p>To exercise these rights, contact us at <a href="mailto:privacy@mtverse.dev">privacy@mtverse.dev</a>.</p>

      <h2>8. Children&apos;s Privacy</h2>
      <p>
        Our Service is not intended for individuals under the age of 13. We do not knowingly collect personal information from children under 13.
        If you believe we have collected such information, please contact us immediately and we will delete it.
      </p>

      <h2>9. International Data Transfers</h2>
      <p>
        Your information may be transferred to and processed in countries other than your country of residence, including the United States.
        We take steps to ensure your data is protected in accordance with this Privacy Policy and applicable law.
      </p>

      <h2>10. Changes to This Privacy Policy</h2>
      <p>
        We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page
        and updating the &quot;Last updated&quot; date. You are advised to review this Privacy Policy periodically for any changes.
      </p>

      <h2>11. Contact Us</h2>
      <p>If you have questions about this Privacy Policy, please contact us:</p>
      <ul>
        <li>Email: <a href="mailto:privacy@mtverse.dev">privacy@mtverse.dev</a></li>
        <li>Contact page: <Link href="/contact">/contact</Link></li>
      </ul>
    </LegalPage>
  )
}
