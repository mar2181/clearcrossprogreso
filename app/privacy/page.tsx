import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy - ClearCross Progreso',
  description:
    'Privacy policy for ClearCross Progreso. Learn how we collect, use, and protect your personal information.',
};

export default function PrivacyPage() {
  return (
    <main className="w-full">
      {/* Header */}
      <section className="bg-brand-navy text-white py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-display text-3xl sm:text-4xl font-bold mb-2">Privacy Policy</h1>
          <p className="text-white/60 text-sm">Last updated: March 2026</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-3xl mx-auto prose prose-neutral">
          <h2 className="font-display text-xl font-bold text-neutral-dark mt-8 mb-3">1. Information We Collect</h2>
          <p className="text-neutral-mid leading-relaxed mb-4">
            When you use ClearCross Progreso, we may collect the following types of information:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-neutral-mid mb-6">
            <li><strong>Personal information you provide:</strong> Name, email address, phone number, and any details you include when submitting a quote request or creating an account.</li>
            <li><strong>Usage data:</strong> Pages visited, search queries, time spent on site, and interactions with provider listings. This helps us improve the platform.</li>
            <li><strong>Device information:</strong> Browser type, operating system, and IP address, collected automatically through standard web technologies.</li>
          </ul>

          <h2 className="font-display text-xl font-bold text-neutral-dark mt-8 mb-3">2. How We Use Your Information</h2>
          <p className="text-neutral-mid leading-relaxed mb-4">We use the information we collect to:</p>
          <ul className="list-disc pl-6 space-y-2 text-neutral-mid mb-6">
            <li>Process and deliver quote requests to the providers you select</li>
            <li>Improve the ClearCross platform, including search results and provider recommendations</li>
            <li>Communicate with you about your quote requests and account</li>
            <li>Analyze usage patterns to improve our services</li>
          </ul>

          <h2 className="font-display text-xl font-bold text-neutral-dark mt-8 mb-3">3. Information Sharing</h2>
          <p className="text-neutral-mid leading-relaxed mb-4">
            We share your information only in the following circumstances:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-neutral-mid mb-6">
            <li><strong>With providers:</strong> When you submit a quote request, your contact details and procedure information are shared with the selected provider so they can respond to you.</li>
            <li><strong>Service providers:</strong> We use third-party services for hosting, analytics, and email delivery. These providers process data on our behalf under strict confidentiality agreements.</li>
            <li><strong>Legal requirements:</strong> If required by law, court order, or governmental regulation.</li>
          </ul>
          <p className="text-neutral-mid leading-relaxed mb-6">
            We do not sell your personal information to third parties.
          </p>

          <h2 className="font-display text-xl font-bold text-neutral-dark mt-8 mb-3">4. Cookies</h2>
          <p className="text-neutral-mid leading-relaxed mb-6">
            ClearCross uses cookies and similar technologies to maintain your session, remember your preferences, and understand how you use the site. You can manage cookie preferences through your browser settings.
          </p>

          <h2 className="font-display text-xl font-bold text-neutral-dark mt-8 mb-3">5. Data Security</h2>
          <p className="text-neutral-mid leading-relaxed mb-6">
            We implement reasonable technical and organizational measures to protect your personal information. However, no internet transmission is completely secure, and we cannot guarantee absolute security.
          </p>

          <h2 className="font-display text-xl font-bold text-neutral-dark mt-8 mb-3">6. Your Rights</h2>
          <p className="text-neutral-mid leading-relaxed mb-6">
            You may request access to, correction of, or deletion of your personal information at any time by contacting us at{' '}
            <a href="mailto:info@clearcrossprogreso.com" className="text-brand-blue hover:underline">
              info@clearcrossprogreso.com
            </a>
            . We will respond to your request within 30 days.
          </p>

          <h2 className="font-display text-xl font-bold text-neutral-dark mt-8 mb-3">7. Third-Party Links</h2>
          <p className="text-neutral-mid leading-relaxed mb-6">
            Our site may contain links to third-party websites, including provider websites and external resources. We are not responsible for the privacy practices of those websites.
          </p>

          <h2 className="font-display text-xl font-bold text-neutral-dark mt-8 mb-3">8. Changes to This Policy</h2>
          <p className="text-neutral-mid leading-relaxed mb-6">
            We may update this privacy policy from time to time. Changes will be posted on this page with an updated revision date. Continued use of ClearCross after changes are posted constitutes acceptance of the revised policy.
          </p>

          <h2 className="font-display text-xl font-bold text-neutral-dark mt-8 mb-3">9. Contact</h2>
          <p className="text-neutral-mid leading-relaxed mb-2">
            If you have questions about this privacy policy, contact us at:
          </p>
          <p className="text-neutral-mid">
            <a href="mailto:info@clearcrossprogreso.com" className="text-brand-blue hover:underline">
              info@clearcrossprogreso.com
            </a>
          </p>

          <div className="mt-12 pt-8 border-t border-neutral-200">
            <Link href="/" className="text-brand-blue hover:underline text-sm font-medium">
              &larr; Back to ClearCross Progreso
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
