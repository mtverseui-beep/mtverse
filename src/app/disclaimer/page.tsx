import type { Metadata } from 'next'
import { LegalPage, legalMetadata } from '@/components/legal/legal-page'

export const metadata: Metadata = legalMetadata(
  'Disclaimer',
  'Important limitations relating to mtverse website template listings, previews, source packages, and third-party dependencies.',
  '/disclaimer',
)

export default function DisclaimerPage() {
  return (
    <LegalPage title="Disclaimer" description="Limitations relating to template listings, previews, source packages, and external services." lastUpdated="July 14, 2026">
      <h2>General Information</h2>
      <p>Information on mtverse is provided in good faith for general product-evaluation and development purposes. We do not warrant that every description, screenshot, price, dependency, or external link will remain unchanged.</p>

      <h2>Template Compatibility</h2>
      <p>Templates are provided as-is. Framework releases, package managers, browser behavior, hosting providers, operating systems, and third-party dependencies can change. You are responsible for testing the downloaded project in your own environment before production deployment.</p>

      <h2>Preview Differences</h2>
      <p>Live previews and screenshots demonstrate the template at a point in time. Fonts, external images, sample data, animations, integrations, and responsive rendering may differ from the downloaded package or your customized deployment.</p>

      <h2>Package Scope</h2>
      <p>The exact package scope is described on each template page. A visual preview does not imply that backend services, databases, paid assets, hosting, third-party accounts, or external APIs are included unless stated.</p>

      <h2>Third-Party Dependencies</h2>
      <p>Templates may use open-source frameworks, packages, icons, fonts, images, or services governed by separate licenses and terms. You are responsible for reviewing those requirements and replacing assets when necessary.</p>

      <h2>Security and Production Use</h2>
      <p>A successful build or preview is not a security audit. Before production use, review authentication, authorization, secrets, dependency vulnerabilities, data validation, payment configuration, privacy requirements, accessibility, performance, and deployment settings for your application.</p>

      <h2>External Links</h2>
      <p>mtverse may link to external previews, documentation, payment pages, social platforms, or third-party websites. We do not control their availability, content, security, or privacy practices.</p>

      <h2>Reviews and Results</h2>
      <p>User reviews reflect individual experiences. They do not guarantee that every buyer will achieve the same implementation time, performance, business result, or compatibility outcome.</p>

      <h2>No Professional Advice</h2>
      <p>Template listings and guides are not legal, financial, security, accessibility, or compliance advice. Obtain qualified advice when your project requires it.</p>

      <h2>Contact</h2>
      <p>Questions about this Disclaimer can be sent to <a href="mailto:legal@mtverse.dev">legal@mtverse.dev</a>.</p>
    </LegalPage>
  )
}