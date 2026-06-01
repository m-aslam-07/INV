import { Link } from 'react-router-dom';
import { Zap } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center">
                <Zap size={14} className="text-white" />
              </div>
              <span className="font-semibold text-gray-900">Strikin</span>
            </div>
            <p className="text-sm text-gray-500">Free GST invoice generator for Indian freelancers</p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-3 text-sm">Product</h4>
            <div className="space-y-2">
              <Link to="/app" className="block text-sm text-gray-500 hover:text-gray-700">Invoice Generator</Link>
              <Link to="/templates" className="block text-sm text-gray-500 hover:text-gray-700">Templates</Link>
              <Link to="/pricing" className="block text-sm text-gray-500 hover:text-gray-700">Pricing</Link>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-3 text-sm">Resources</h4>
            <div className="space-y-2">
              <Link to="/blog" className="block text-sm text-gray-500 hover:text-gray-700">Blog</Link>
              <a href="#features" className="block text-sm text-gray-500 hover:text-gray-700">Features</a>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-3 text-sm">Legal</h4>
            <div className="space-y-2">
              <Link to="/legal/privacy" className="block text-sm text-gray-500 hover:text-gray-700">Privacy Policy</Link>
              <Link to="/legal/terms" className="block text-sm text-gray-500 hover:text-gray-700">Terms of Service</Link>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-100 pt-6 text-center">
          <p className="text-xs text-gray-400">© {new Date().getFullYear()} Strikin. Built with ❤️ for Indian freelancers.</p>
        </div>
      </div>
    </footer>
  );
}
