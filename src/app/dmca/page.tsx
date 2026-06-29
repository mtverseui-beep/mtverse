import type { Metadata } from 'next'
import { LegalPage, legalMetadata } from '@/components/legal/legal-page'

export const metadata: Metadata = legalMetadata(
  'DMCA Policy',
  'How to file a Digital Millennium Copyright Act (DMCA) notice with mtverse.',
  '/dmca'
)

export default function DmcaPage() {
  return (
    <LegalPage
      title="DMCA Policy"
      description="Digital Millennium Copyright Act notice and takedown procedure."
      lastUpdated="June 27, 2026"
    >
      <p>
        mtverse respects the intellectual property rights of others and expects users of our Service to do the same. In accordance with
        the Digital Millennium Copyright Act (DMCA), we will respond to notices of alleged copyright infringement.
      </p>

      <h2>Filing a DMCA Notice</h2>
      <p>
        If you believe that content on our Service infringes your copyright, please send a written notice to our designated copyright agent
        at the address below. Your notice must include the following information:
      </p>

      <h3>Required Information</h3>
      <ul>
        <li>A physical or electronic signature of the copyright owner or a person authorized to act on their behalf</li>
        <li>Identification of the copyrighted work claimed to have been infringed</li>
        <li>Identification of the material that is claimed to be infringing, including its location on the Service</li>
        <li>Your contact information, including your full name, mailing address, telephone number, and email address</li>
        <li>A statement that you have a good faith belief that the use of the material in the manner complained of is not authorized by the copyright owner, its agent, or the law</li>
        <li>A statement, made under penalty of perjury, that the information in the notification is accurate and that you are authorized to act on behalf of the copyright owner</li>
      </ul>

      <h2>Designated Copyright Agent</h2>
      <p>
        Send your DMCA notice to our designated copyright agent:
      </p>
      <ul>
        <li>Email: <a href="mailto:dmca@mtverse.dev">dmca@mtverse.dev</a></li>
        <li>Subject line: &quot;DMCA Takedown Notice&quot;</li>
      </ul>

      <h2>Counter-Notification</h2>
      <p>
        If you believe that your content was removed or disabled by mistake or misidentification, you may file a counter-notification.
        Your counter-notification must include:
      </p>
      <ul>
        <li>Your physical or electronic signature</li>
        <li>Identification of the material that has been removed and the location at which it appeared before removal</li>
        <li>A statement under penalty of perjury that you have a good faith belief that the material was removed or disabled as a result of mistake or misidentification</li>
        <li>Your name, address, telephone number, and email address</li>
        <li>A statement that you consent to the jurisdiction of the Federal District Court for the judicial district in which your address is located (or if your address is outside of the United States, for any judicial district in which mtverse may be found)</li>
        <li>A statement that you will accept service of process from the person who provided the original takedown notification</li>
      </ul>

      <h2>Repeat Infringers</h2>
      <p>
        We will terminate the accounts of users who are repeat infringers of copyright in appropriate circumstances.
      </p>

      <h2>False Claims</h2>
      <p>
        Please note that under Section 512(f) of the DMCA, any person who knowingly materially misrepresents that material or activity
        is infringing may be subject to liability. Do not make false claims.
      </p>

      <h2>Response Time</h2>
      <p>
        We will process and respond to your DMCA notice within 10 business days of receipt. Please provide accurate contact information
        so we can respond to your notice.
      </p>
    </LegalPage>
  )
}
