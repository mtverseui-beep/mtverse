import type { Metadata } from 'next'
import { LegalPage, legalMetadata } from '@/components/legal/legal-page'

export const metadata: Metadata = legalMetadata(
  'Terms of Service',
  'The terms and conditions for using mtverse services and purchasing templates.',
  '/terms'
)

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      description="The terms and conditions for using our services."
      lastUpdated="June 27, 2026"
    >
      <p>Welcome to mtverse. These Terms of Service (&quot;Terms&quot;) govern your use of mtverse.dev (the &quot;Service&quot;).</p>

      <h2>1. Acceptance of Terms</h2>
      <p>
        By accessing or using the Service, you agree to be bound by these Terms. If you do not agree to these Terms,
        you may not access or use the Service.
      </p>

      <h2>2. Use of the Service</h2>
      <h3>2.1 Eligibility</h3>
      <p>You must be at least 13 years old to use the Service. By using the Service, you represent and warrant that you meet this requirement.</p>

      <h3>2.2 Account Registration</h3>
      <p>
        To access certain features of the Service, you must register for an account. You agree to provide accurate, current, and complete
        information during registration and to update such information to keep it accurate, current, and complete.
      </p>

      <h3>2.3 Acceptable Use</h3>
      <p>You agree not to:</p>
      <ul>
        <li>Use the Service for any unlawful purpose</li>
        <li>Violate any applicable local, state, national, or international law</li>
        <li>Harass, abuse, threaten, or impersonate other users</li>
        <li>Attempt to gain unauthorized access to any portion of the Service</li>
        <li>Use the Service to upload or transmit viruses, malware, or harmful code</li>
        <li>Scrape, crawl, or use robots to collect data from the Service without permission</li>
        <li>Use the prompts for illegal, harmful, or fraudulent purposes</li>
      </ul>

      <h2>3. Free Prompts</h2>
      <p>
        All prompts available on the Service are free to browse, copy after sign-in, and use. You may use prompts for personal and commercial projects
        without attribution. However, you may not resell or redistribute the prompts as-is as part of a competing prompt library or service.
      </p>

      <h2>4. Premium Templates</h2>
      <h3>4.1 License Grant</h3>
      <p>
        When you purchase a template, you receive a single-project license that allows you to:
      </p>
      <ul>
        <li>Use the template in one production project</li>
        <li>Modify and customize the template for your project</li>
        <li>Use the template for personal or commercial purposes</li>
      </ul>

      <h3>4.2 Restrictions</h3>
      <p>You may NOT:</p>
      <ul>
        <li>Resell, sublicense, or redistribute the template as-is</li>
        <li>Use the template in more than one production project (purchase additional licenses for additional projects)</li>
        <li>Include the template in a product builder, template club, or similar service</li>
        <li>Claim ownership or authorship of the template</li>
        <li>Use the template in a way that competes with mtverse</li>
      </ul>

      <h3>4.3 License Key</h3>
      <p>
        Upon purchase, you will receive a license key. Your license key is linked to your email address and is required for
        template downloads and support. Keep your license key confidential.
      </p>

      <h2>5. Payments and Billing</h2>
      <h3>5.1 Payment Processing</h3>
      <p>
        Payments are processed securely through Paddle. We do not store your credit card information. By making a purchase,
        you agree to Paddle&apos;s terms of service and privacy policy.
      </p>

      <h3>5.2 Pricing</h3>
      <p>
        All prices are listed in US Dollars (USD) unless otherwise stated. Prices may change at any time without notice.
        However, prices for existing purchases will not be affected.
      </p>

      <h3>5.3 Refunds</h3>
      <p>
        We offer a 14-day money-back guarantee on all template purchases. If you are not satisfied with your purchase,
        contact us within 14 days of purchase for a full refund. See our <a href="/refund-policy">Refund Policy</a> for details.
      </p>

      <h2>6. Intellectual Property</h2>
      <h3>6.1 Our Rights</h3>
      <p>
        The Service and its original content, features, and functionality (including but not limited to the website design,
        logo, text, graphics, and software) are owned by mtverse and are protected by international copyright, trademark,
        patent, trade secret, and other intellectual property laws.
      </p>

      <h3>6.2 Your Content</h3>
      <p>
        You retain all rights to any content you create using our prompts or templates. We claim no ownership over your
        creative work.
      </p>

      <h2>7. Disclaimers</h2>
      <p>
        The Service is provided on an &quot;as-is&quot; and &quot;as-available&quot; basis without warranties of any kind, either express or implied.
        We do not warrant that the Service will be uninterrupted, secure, or error-free, that defects will be corrected,
        or that the Service is free of viruses or other harmful components.
      </p>
      <p>See our <a href="/disclaimer">Disclaimer</a> for full details.</p>

      <h2>8. Limitation of Liability</h2>
      <p>
        To the maximum extent permitted by law, mtverse shall not be liable for any indirect, incidental, special, consequential,
        or punitive damages, including without limitation loss of profits, data, use, goodwill, or other intangible losses,
        resulting from your access to or use of the Service.
      </p>

      <h2>9. Indemnification</h2>
      <p>
        You agree to defend, indemnify, and hold harmless mtverse from and against any claims, liabilities, damages, losses,
        and expenses, including attorney&apos;s fees, arising out of or in any way connected with your access to or use of the Service
        or your violation of these Terms.
      </p>

      <h2>10. Termination</h2>
      <p>
        We may terminate or suspend your account and access to the Service at our sole discretion, without notice, for conduct
        that we believe violates these Terms or is harmful to other users of the Service, us, or third parties, or for any other reason.
      </p>

      <h2>11. Governing Law</h2>
      <p>
        These Terms shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law provisions.
      </p>

      <h2>12. Changes to These Terms</h2>
      <p>
        We reserve the right to modify these Terms at any time. We will notify users of significant changes by posting a notice
        on the Service. Your continued use of the Service after changes constitutes acceptance of the new Terms.
      </p>

      <h2>13. Contact Us</h2>
      <p>If you have questions about these Terms, please contact us:</p>
      <ul>
        <li>Email: <a href="mailto:terms@mtverse.dev">terms@mtverse.dev</a></li>
        <li>Contact page: <a href="/contact">/contact</a></li>
      </ul>
    </LegalPage>
  )
}
