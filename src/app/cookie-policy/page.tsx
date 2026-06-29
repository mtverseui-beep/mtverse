import type { Metadata } from 'next'
import { LegalPage, legalMetadata } from '@/components/legal/legal-page'

export const metadata: Metadata = legalMetadata(
  'Cookie Policy',
  'How mtverse uses cookies and similar technologies on our website.',
  '/cookie-policy'
)

export default function CookiePolicyPage() {
  return (
    <LegalPage
      title="Cookie Policy"
      description="How we use cookies and similar technologies."
      lastUpdated="June 27, 2026"
    >
      <p>
        This Cookie Policy explains how mtverse (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) uses cookies and similar technologies
        on our website mtverse.dev (the &quot;Service&quot;). By using the Service, you consent to our use of cookies as described in this policy.
      </p>

      <h2>What Are Cookies?</h2>
      <p>
        Cookies are small text files that websites place on your device when you visit them. They allow the website to recognize your device
        and remember information about your visit, such as your preferences, login state, or items in a shopping cart.
      </p>

      <h2>Types of Cookies We Use</h2>

      <h3>1. Essential Cookies</h3>
      <p>These cookies are necessary for the website to function and cannot be switched off. They include:</p>
      <ul>
        <li><strong>Authentication cookies:</strong> Remember your login state (mtverse_session, multiverse_admin_session)</li>
        <li><strong>Security cookies:</strong> Protect against CSRF and other attacks</li>
        <li><strong>Theme cookies:</strong> Remember your light/dark mode preference</li>
      </ul>

      <h3>2. Analytics Cookies</h3>
      <p>These cookies help us understand how visitors interact with our website:</p>
      <ul>
        <li><strong>Vercel Analytics:</strong> Tracks page views and performance metrics</li>
        <li><strong>Google Analytics (if enabled):</strong> Tracks user behavior and demographics</li>
      </ul>

      <h3>3. Advertising Cookies</h3>
      <p>These cookies are used to deliver relevant advertisements:</p>
      <ul>
        <li><strong>Google AdSense (if enabled):</strong> Serves personalized ads based on your interests and browsing history</li>
      </ul>

      <h3>4. Functional Cookies</h3>
      <p>These cookies enable enhanced functionality:</p>
      <ul>
        <li><strong>Remember me:</strong> Keeps you logged in for 30 days (instead of 7)</li>
        <li><strong>Recently viewed:</strong> Remembers templates you&apos;ve viewed</li>
      </ul>

      <h2>Third-Party Cookies</h2>
      <p>
        In addition to our own cookies, we use cookies from third-party services. These third parties may use cookies to:
      </p>
      <ul>
        <li>Process payments securely (Paddle)</li>
        <li>Analyze website traffic (Google Analytics, Vercel Analytics)</li>
        <li>Serve advertisements (Google AdSense)</li>
        <li>Provide social media features (GitHub, Google OAuth)</li>
      </ul>

      <h2>Managing Cookies</h2>
      <p>You can control and manage cookies in several ways:</p>
      <ul>
        <li><strong>Browser settings:</strong> Most browsers allow you to accept, reject, or delete cookies. Check your browser&apos;s help documentation.</li>
        <li><strong>Opt-out tools:</strong> Use <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer">Google Analytics Opt-out Browser Add-on</a> to opt out of Google Analytics.</li>
        <li><strong>Ad settings:</strong> Visit <a href="https://ads.google.com/home/settings/" target="_blank" rel="noopener noreferrer">Google Ad Settings</a> to manage personalized advertising.</li>
      </ul>

      <h2>Impact of Disabling Cookies</h2>
      <p>
        If you disable essential cookies, some features of the Service may not function properly. For example, you may not be able to
        log in, make purchases, or access protected content. Disabling analytics or advertising cookies will not affect core functionality
        but may impact your experience.
      </p>

      <h2>Cookie Duration</h2>
      <ul>
        <li><strong>Session cookies:</strong> Deleted when you close your browser</li>
        <li><strong>Persistent cookies:</strong> Remain until they expire or you delete them (7-30 days typically)</li>
      </ul>

      <h2>Updates to This Policy</h2>
      <p>
        We may update this Cookie Policy from time to time. We will notify you of changes by updating the &quot;Last updated&quot; date
        at the top of this page.
      </p>

      <h2>Contact Us</h2>
      <p>For questions about this Cookie Policy, contact us at <a href="mailto:privacy@mtverse.dev">privacy@mtverse.dev</a>.</p>
    </LegalPage>
  )
}
