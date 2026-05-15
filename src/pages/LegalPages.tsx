import { Navbar } from '../components/landing/Navbar';
import { Footer } from '../components/landing/Footer';

export function PrivacyPage() {
  return (
    <div className="bg-white min-h-screen">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
        <div className="prose prose-gray text-sm text-gray-600 space-y-4">
          <p>Last updated: January 2026</p>
          <h2 className="text-lg font-semibold text-gray-900 mt-6">1. Data Collection</h2>
          <p>Strikin is a client-side application. All invoice data you enter is stored locally in your browser's localStorage. We do not collect, store, or transmit your invoice data to any server.</p>
          <h2 className="text-lg font-semibold text-gray-900 mt-6">2. Authentication</h2>
          <p>If you choose to create an account for Pro features, we collect your email address through Supabase authentication. This is used solely for account management.</p>
          <h2 className="text-lg font-semibold text-gray-900 mt-6">3. Payments</h2>
          <p>Payments are processed through Lemon Squeezy. We do not store any payment card information. Please refer to Lemon Squeezy's privacy policy for payment data handling.</p>
          <h2 className="text-lg font-semibold text-gray-900 mt-6">4. Cookies</h2>
          <p>We use localStorage for saving your invoice drafts and preferences. No tracking cookies are used.</p>
          <h2 className="text-lg font-semibold text-gray-900 mt-6">5. Contact</h2>
          <p>For privacy inquiries, contact us at privacy@strikin.in</p>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export function TermsPage() {
  return (
    <div className="bg-white min-h-screen">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Terms of Service</h1>
        <div className="prose prose-gray text-sm text-gray-600 space-y-4">
          <p>Last updated: January 2026</p>
          <h2 className="text-lg font-semibold text-gray-900 mt-6">1. Service Description</h2>
          <p>Strikin provides a free online invoice generator tool. The service is provided "as is" without warranties of any kind.</p>
          <h2 className="text-lg font-semibold text-gray-900 mt-6">2. Usage</h2>
          <p>You may use Strikin to create invoices for legitimate business purposes. You are responsible for the accuracy of information entered.</p>
          <h2 className="text-lg font-semibold text-gray-900 mt-6">3. Pro Subscription</h2>
          <p>Pro features require a paid subscription. Subscriptions are billed monthly or annually through Lemon Squeezy. You may cancel at any time.</p>
          <h2 className="text-lg font-semibold text-gray-900 mt-6">4. Data</h2>
          <p>Your data is stored locally in your browser. We are not responsible for data loss due to browser cache clearing or device changes.</p>
          <h2 className="text-lg font-semibold text-gray-900 mt-6">5. Limitation of Liability</h2>
          <p>Strikin is not a certified accounting tool. Invoices generated should be verified for compliance with applicable tax laws.</p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
