import type { Metadata } from 'next'
import { LegalPage, legalMetadata } from '@/components/legal/legal-page'

export const metadata: Metadata = legalMetadata(
  'Refund Policy',
  'mtverse refund policy for premium template purchases.',
  '/refund-policy'
)

export default function RefundPolicyPage() {
  return (
    <LegalPage
      title="Refund Policy"
      description="Our refund policy for premium template purchases."
      lastUpdated="June 27, 2026"
    >
      <h2>14-Day Money-Back Guarantee</h2>
      <p>
        We want you to be happy with your purchase. If you are not satisfied with a premium template, you may request a full refund
        within 14 days of your purchase date — no questions asked.
      </p>

      <h2>How to Request a Refund</h2>
      <ol className="list-decimal pl-6 space-y-2">
        <li>Email us at <a href="mailto:refunds@mtverse.dev">refunds@mtverse.dev</a> within 14 days of your purchase</li>
        <li>Include your order ID (from your purchase confirmation email) and the email address used for the purchase</li>
        <li>Optionally, let us know why you&apos;re requesting a refund — this helps us improve</li>
        <li>We will process your refund within 5-7 business days</li>
      </ol>

      <h2>Refund Processing</h2>
      <ul>
        <li>Refunds are processed through Paddle (our payment processor)</li>
        <li>The refund will appear on your original payment method within 5-10 business days</li>
        <li>You will receive a confirmation email when the refund is processed</li>
        <li>Your license key will be deactivated upon refund</li>
      </ul>

      <h2>Eligibility</h2>
      <p>All premium template purchases are eligible for a refund within the 14-day window, provided:</p>
      <ul>
        <li>The template has not been downloaded more than once (excluding the initial download)</li>
        <li>The request is made within 14 days of the purchase date</li>
        <li>You provide the correct order ID and email address</li>
      </ul>

      <h2>Non-Refundable Items</h2>
      <p>The following are not eligible for refunds:</p>
      <ul>
        <li>Free prompts (no purchase was made)</li>
        <li>Template purchases older than 14 days</li>
        <li>Custom development or consulting services</li>
        <li>Purchases made with fraudulent or unauthorized payment methods</li>
      </ul>

      <h2>License After Refund</h2>
      <p>
        When a refund is processed, your license key is deactivated and you may no longer:
      </p>
      <ul>
        <li>Download the template</li>
        <li>Receive updates</li>
        <li>Use the template in new projects</li>
      </ul>
      <p>
        If you have already used the template in a production project, you may keep that deployment — but you will not receive
        future updates.
      </p>

      <h2>Defective or Misrepresented Products</h2>
      <p>
        If a template is significantly defective or not as described, you may request a refund at any time (even after 14 days).
        In such cases, we will investigate and process a refund if the claim is valid.
      </p>

      <h2>Contact Us</h2>
      <p>For refund requests or questions about our refund policy:</p>
      <ul>
        <li>Email: <a href="mailto:refunds@mtverse.dev">refunds@mtverse.dev</a></li>
        <li>Include your order ID and purchase email</li>
        <li>Response time: within 24 hours on business days</li>
      </ul>
    </LegalPage>
  )
}
