import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Service - ClearCross Progreso',
  description:
    'Terms of service for ClearCross Progreso. Please review before using our medical price comparison platform.',
};

export default function TermsPage() {
  return (
    <main className="w-full">
      {/* Header */}
      <section className="bg-brand-navy text-white py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-display text-3xl sm:text-4xl font-bold mb-2">Terms of Service</h1>
          <p className="text-white/60 text-sm">Last updated: March 2026</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-3xl mx-auto prose prose-neutral">
          <h2 className="font-display text-xl font-bold text-neutral-dark mt-8 mb-3">1. Acceptance of Terms</h2>
          <p className="text-neutral-mid leading-relaxed mb-6">
            By accessing or using ClearCross Progreso ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Platform.
          </p>

          <h2 className="font-display text-xl font-bold text-neutral-dark mt-8 mb-3">2. Description of Service</h2>
          <p className="text-neutral-mid leading-relaxed mb-6">
            ClearCross Progreso is a comparison and discovery platform that helps users browse, compare, and request quotes from healthcare and wellness providers in Nuevo Progreso, Mexico. We are an information platform, not a healthcare provider. We do not provide medical advice, diagnoses, or treatment.
          </p>

          <h2 className="font-display text-xl font-bold text-neutral-dark mt-8 mb-3">3. Not Medical Advice</h2>
          <p className="text-neutral-mid leading-relaxed mb-6">
            The information on ClearCross is for general informational purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment. Always consult with a qualified healthcare professional before making healthcare decisions. ClearCross does not endorse any specific provider, procedure, or treatment plan.
          </p>

          <h2 className="font-display text-xl font-bold text-neutral-dark mt-8 mb-3">4. Pricing Information</h2>
          <p className="text-neutral-mid leading-relaxed mb-6">
            Prices displayed on ClearCross are based on information provided by listed providers and are subject to change. While we strive to keep pricing accurate and up to date, ClearCross does not guarantee that any price shown will be the final price charged by a provider. Always confirm pricing directly with your chosen provider before committing to a procedure or purchase.
          </p>

          <h2 className="font-display text-xl font-bold text-neutral-dark mt-8 mb-3">5. Provider Listings</h2>
          <p className="text-neutral-mid leading-relaxed mb-6">
            ClearCross lists providers based on information gathered through our research and provider submissions. While we make reasonable efforts to verify provider credentials and information, we do not guarantee the accuracy, completeness, or reliability of any provider listing. Users are responsible for conducting their own due diligence before engaging any provider.
          </p>

          <h2 className="font-display text-xl font-bold text-neutral-dark mt-8 mb-3">6. User Accounts</h2>
          <p className="text-neutral-mid leading-relaxed mb-6">
            If you create an account on ClearCross, you are responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
          </p>

          <h2 className="font-display text-xl font-bold text-neutral-dark mt-8 mb-3">7. Quote Requests</h2>
          <p className="text-neutral-mid leading-relaxed mb-6">
            When you submit a quote request through ClearCross, your information is shared with the selected provider. ClearCross facilitates the connection but is not a party to any agreement between you and the provider. Any disputes regarding services, pricing, or quality must be resolved directly between you and the provider.
          </p>

          <h2 className="font-display text-xl font-bold text-neutral-dark mt-8 mb-3">8. Limitation of Liability</h2>
          <p className="text-neutral-mid leading-relaxed mb-6">
            ClearCross Progreso is provided "as is" without warranties of any kind. To the maximum extent permitted by law, ClearCross shall not be liable for any direct, indirect, incidental, consequential, or punitive damages arising from your use of the Platform, reliance on any information provided, or any interaction with providers listed on the Platform.
          </p>

          <h2 className="font-display text-xl font-bold text-neutral-dark mt-8 mb-3">9. User Conduct</h2>
          <p className="text-neutral-mid leading-relaxed mb-4">You agree not to:</p>
          <ul className="list-disc pl-6 space-y-2 text-neutral-mid mb-6">
            <li>Use the Platform for any unlawful purpose</li>
            <li>Submit false or misleading information</li>
            <li>Attempt to access other users accounts or data</li>
            <li>Scrape, crawl, or use automated tools to extract data from the Platform without permission</li>
            <li>Interfere with the proper operation of the Platform</li>
          </ul>

          <h2 className="font-display text-xl font-bold text-neutral-dark mt-8 mb-3">10. Changes to Terms</h2>
          <p className="text-neutral-mid leading-relaxed mb-6">
            We may update these Terms of Service from time to time. Changes will be posted on this page with an updated revision date. Continued use of the Platform after changes are posted constitutes acceptance of the revised terms.
          </p>

          <h2 className="font-display text-xl font-bold text-neutral-dark mt-8 mb-3">11. Contact</h2>
          <p className="text-neutral-mid leading-relaxed mb-2">
            If you have questions about these terms, contact us at:
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
