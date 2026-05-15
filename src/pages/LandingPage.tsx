import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/landing/Navbar';
import { Footer } from '../components/landing/Footer';
import {
  Code2, Palette, Camera, Building2, PenTool, TrendingUp, GraduationCap, Stethoscope, Hammer, Calculator,
  Receipt, Smartphone, FileText, Star, ChevronDown, ChevronUp, Zap, Languages, QrCode, Layout, Eye, UserX,
  ArrowRight
} from 'lucide-react';

const ICONS: Record<string, React.ReactNode> = {
  Code2: <Code2 size={20} />, Palette: <Palette size={20} />, Camera: <Camera size={20} />,
  Building2: <Building2 size={20} />, PenTool: <PenTool size={20} />, TrendingUp: <TrendingUp size={20} />,
  GraduationCap: <GraduationCap size={20} />, Stethoscope: <Stethoscope size={20} />,
  Hammer: <Hammer size={20} />, Calculator: <Calculator size={20} />,
};

const professions = [
  { key: 'developer', label: 'Developer', icon: 'Code2' },
  { key: 'designer', label: 'Designer', icon: 'Palette' },
  { key: 'photographer', label: 'Photographer', icon: 'Camera' },
  { key: 'architect', label: 'Architect', icon: 'Building2' },
  { key: 'writer', label: 'Writer', icon: 'PenTool' },
  { key: 'marketer', label: 'Marketer', icon: 'TrendingUp' },
  { key: 'tutor', label: 'Tutor', icon: 'GraduationCap' },
  { key: 'doctor', label: 'Doctor', icon: 'Stethoscope' },
  { key: 'contractor', label: 'Contractor', icon: 'Hammer' },
  { key: 'ca', label: 'CA', icon: 'Calculator' },
];

const features = [
  { icon: <Receipt size={20} />, title: 'GST Auto-Split', desc: 'Auto-calculates CGST, SGST, or IGST based on states' },
  { icon: <QrCode size={20} />, title: 'UPI QR Code', desc: 'Add UPI payment QR code to your invoices' },
  { icon: <Languages size={20} />, title: 'Amount in Words', desc: 'Auto-generates total in Indian number system' },
  { icon: <Layout size={20} />, title: '24 Templates', desc: 'Professional templates for every style' },
  { icon: <Eye size={20} />, title: 'Live Preview', desc: 'See changes in real-time as you type' },
  { icon: <UserX size={20} />, title: 'No Signup', desc: 'Start creating invoices instantly, no account needed' },
];

const faqs = [
  { q: 'Is Strikin free?', a: 'Yes! The core invoice generator is completely free — unlimited invoices, all templates, full GST calculation, and PDF download at no cost.' },
  { q: 'Is my data saved anywhere?', a: 'Your data is saved locally in your browser. Nothing is sent to any server. Your invoices stay on your device.' },
  { q: 'Can I add my logo?', a: 'Logo upload is available on the Pro plan. Your logo appears on every invoice you create.' },
  { q: 'Is it GST compliant?', a: 'Yes. Strikin auto-calculates CGST, SGST, and IGST based on your state and client state, with proper tax breakdowns.' },
  { q: 'What data is saved?', a: 'All form data is saved to your browser localStorage. Nothing leaves your device unless you explicitly share a link.' },
  { q: 'Does it work on mobile?', a: 'Yes! Strikin is fully responsive with a tab layout on mobile devices.' },
  { q: 'Do I need to sign up?', a: 'No signup required for the free tier. Just open the app and start creating invoices immediately.' },
  { q: 'Can I edit after downloading?', a: 'Yes. Your last draft is always auto-saved. You can edit and re-download as many times as you want.' },
];

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="bg-white min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="py-20 md:py-24 text-center px-4">
        <div className="max-w-4xl mx-auto">
          <span className="inline-block bg-blue-50 text-blue-700 rounded-full px-4 py-1 text-sm font-medium mb-6">
            🇮🇳 Built for India · GST-compliant
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-4">
            Professional GST invoices<br />in 2 minutes
          </h1>
          <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto mb-8">
            The only invoice tool built specifically for Indian freelancers. Auto-calculates CGST, SGST, IGST. Supports UPI, GSTIN, Amount in words. Free forever.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-4">
            <Link to="/app" className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-6 py-3 font-medium transition-colors inline-flex items-center justify-center gap-2">
              Create your invoice free <ArrowRight size={16} />
            </Link>
            <Link to="/templates" className="border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg px-6 py-3 font-medium transition-colors">
              See templates
            </Link>
          </div>
          <p className="text-sm text-gray-400">No signup required · No watermark · Download as PDF</p>
        </div>

        {/* Hero Mockup */}
        <div className="max-w-5xl mx-auto mt-12 animate-float">
          <div className="border border-gray-200 shadow-xl rounded-2xl overflow-hidden bg-white">
            <div className="h-8 bg-gray-50 border-b border-gray-100 flex items-center px-4 gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
            </div>
            <div className="grid md:grid-cols-2 divide-x divide-gray-100">
              <div className="p-6 text-left space-y-3">
                <div className="flex gap-2 mb-4">
                  {['Invoice', 'Proforma', 'Proposal', 'Receipt'].map((t, i) => (
                    <span key={t} className={`px-3 py-1 rounded-md text-xs font-medium ${i === 0 ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-500'}`}>{t}</span>
                  ))}
                </div>
                <div className="space-y-2">
                  <div className="h-8 bg-gray-50 rounded-lg px-3 flex items-center text-sm text-gray-600">Acme Design Studio</div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="h-8 bg-gray-50 rounded-lg px-3 flex items-center text-sm text-gray-400">hello@acme.in</div>
                    <div className="h-8 bg-gray-50 rounded-lg px-3 flex items-center text-sm text-gray-400">+91 98765 43210</div>
                  </div>
                  <div className="h-8 bg-gray-50 rounded-lg px-3 flex items-center text-sm text-gray-400">INV-0042</div>
                </div>
              </div>
              <div className="p-6 text-left bg-gray-50/50">
                <div className="bg-white rounded-lg border border-gray-100 p-4 shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-blue-600">Acme Design Studio</h3>
                    <span className="text-xs text-gray-400">INVOICE</span>
                  </div>
                  <div className="border-t border-gray-100 pt-2 space-y-1 text-xs text-gray-500">
                    <div className="flex justify-between"><span>UI/UX Design</span><span className="font-medium text-gray-700">₹30,000</span></div>
                    <div className="flex justify-between"><span>Brand identity</span><span className="font-medium text-gray-700">₹18,000</span></div>
                    <div className="flex justify-between border-t border-gray-100 pt-1 mt-1"><span className="font-medium">Total</span><span className="font-bold text-blue-600">₹48,000</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Professions */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Built for your profession</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {professions.map(p => (
              <Link key={p.key} to={`/app?profession=${p.key}`}
                className="bg-white border border-gray-100 rounded-xl p-4 hover:border-blue-200 hover:shadow-sm transition-all group text-center">
                <div className="text-gray-400 group-hover:text-blue-600 transition-colors flex justify-center mb-2">{ICONS[p.icon]}</div>
                <p className="text-sm font-medium text-gray-900">{p.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">3 templates</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-16 px-4 bg-gray-50/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Everything you need</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {features.map(f => (
              <div key={f.title} className="bg-white border border-gray-100 rounded-xl p-5">
                <div className="bg-blue-50 rounded-lg p-2 w-fit text-blue-600 mb-3">{f.icon}</div>
                <h3 className="text-sm font-medium text-gray-900 mb-1">{f.title}</h3>
                <p className="text-sm text-gray-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">How it works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Pick your profession', desc: 'Select your profession and get pre-filled sample line items instantly.' },
              { step: '2', title: 'Fill in the details', desc: 'Add your business info, client details, and customize the design.' },
              { step: '3', title: 'Download PDF', desc: 'Preview your invoice in real-time and download a professional PDF.' },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <span className="text-4xl font-bold text-blue-600">{s.step}</span>
                <h3 className="text-base font-semibold text-gray-900 mt-2 mb-1">{s.title}</h3>
                <p className="text-sm text-gray-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Simple pricing</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white border border-gray-100 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-1">Free</h3>
              <p className="text-3xl font-bold text-gray-900 mb-4">₹0</p>
              <ul className="space-y-2 mb-6 text-sm text-gray-600">
                <li>✓ All templates</li><li>✓ Full GST calculation</li><li>✓ PDF download</li><li>✓ No watermark</li>
              </ul>
              <Link to="/app" className="block text-center py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50">Start free</Link>
            </div>
            <div className="bg-white border-2 border-blue-600 rounded-xl p-6 relative">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs px-3 py-1 rounded-full font-medium">Most popular</span>
              <h3 className="font-semibold text-gray-900 mb-1">Pro</h3>
              <p className="text-3xl font-bold text-gray-900 mb-4">₹199<span className="text-sm font-normal text-gray-400">/mo</span></p>
              <ul className="space-y-2 mb-6 text-sm text-gray-600">
                <li>✓ Everything in Free</li><li>✓ Logo upload</li><li>✓ Shareable link</li><li>✓ UPI QR code</li><li>✓ Invoice history</li>
              </ul>
              <a href="https://strikin.lemonsqueezy.com/checkout" className="block text-center py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700">Upgrade to Pro</a>
            </div>
            <div className="bg-white border border-gray-100 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-1">Annual</h3>
              <p className="text-3xl font-bold text-gray-900 mb-1">₹1,499<span className="text-sm font-normal text-gray-400">/yr</span></p>
              <span className="inline-block bg-green-50 text-green-700 text-xs px-2 py-0.5 rounded-full mb-3">Save ₹900</span>
              <ul className="space-y-2 mb-6 text-sm text-gray-600">
                <li>✓ Everything in Pro</li><li>✓ Priority support</li><li>✓ Best value</li>
              </ul>
              <a href="https://strikin.lemonsqueezy.com/checkout" className="block text-center py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50">Get annual</a>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-4 bg-gray-50/50">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Frequently asked questions</h2>
          <div className="space-y-2">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-xl overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-4 text-left">
                  <span className="text-sm font-medium text-gray-900">{faq.q}</span>
                  {openFaq === i ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                </button>
                <div style={{ maxHeight: openFaq === i ? '200px' : '0', overflow: 'hidden', transition: 'max-height 0.3s ease-out' }}>
                  <p className="px-4 pb-4 text-sm text-gray-500">{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to create your first invoice?</h2>
        <p className="text-gray-500 mb-6">Join 2,400+ Indian freelancers using Strikin</p>
        <Link to="/app" className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-8 py-3 font-medium transition-colors inline-flex items-center gap-2">
          Create your invoice free <ArrowRight size={16} />
        </Link>
      </section>

      <Footer />
    </div>
  );
}
