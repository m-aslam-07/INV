import { Link } from 'react-router-dom';
import { Navbar } from '../components/landing/Navbar';
import { Footer } from '../components/landing/Footer';
import { XCircle, ArrowRight, RefreshCw } from 'lucide-react';

export default function PaymentCancelPage() {
  return (
    <div className="bg-white min-h-screen flex flex-col overflow-x-hidden">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 py-12 sm:py-16">
        <div className="w-full max-w-md text-center animate-fade-in">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle size={32} className="text-gray-400" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment cancelled</h1>
          <p className="text-gray-500 mb-6">
            No charges were made. You can try again anytime or continue using the free plan.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/upgrade"
              className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6 py-2.5 text-sm font-medium transition-colors"
            >
              <RefreshCw size={14} /> Try again
            </Link>
            <Link
              to="/app"
              className="inline-flex items-center justify-center gap-2 border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl px-6 py-2.5 text-sm font-medium transition-colors"
            >
              Continue free <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
