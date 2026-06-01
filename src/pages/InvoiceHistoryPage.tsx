import { Link } from 'react-router-dom';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { InvoiceHistoryBrowser } from '../components/app/InvoiceHistoryBrowser';
import { ArrowLeft, Sparkles } from 'lucide-react';

export default function InvoiceHistoryPage() {
  return (
    <ProtectedRoute requirePro>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white overflow-x-hidden">
        <header className="sticky top-0 z-20 border-b border-gray-100 bg-white/90 backdrop-blur">
          <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
            <div>
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-gray-400">
                <Sparkles size={14} /> PRO
              </div>
              <h1 className="mt-1 text-xl sm:text-2xl font-semibold text-gray-900">Invoice History</h1>
            </div>
            <Link
              to="/app"
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <ArrowLeft size={14} /> Back to editor
            </Link>
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-gray-100 bg-white shadow-sm shadow-gray-100">
            <InvoiceHistoryBrowser />
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
