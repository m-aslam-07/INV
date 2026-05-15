import { Modal } from '../ui/Modal';
import { useAuthStore } from '../../hooks/useAuthStore';
import { Check, X, Sparkles } from 'lucide-react';

export function UpgradeModal() {
  const { upgradeModalOpen, closeUpgradeModal, upgradeFeature } = useAuthStore();

  const freeFeatures = [
    'All 5 templates',
    'Full GST calculation',
    'PDF download',
    'No watermark',
  ];
  const proFeatures = [
    'Logo upload',
    'Shareable invoice link',
    'UPI QR code on invoice',
    'Invoice history',
    'One-click duplicate',
    'Business profile saved',
  ];

  return (
    <Modal isOpen={upgradeModalOpen} onClose={closeUpgradeModal} title="Upgrade to Pro">
      <div className="space-y-5">
        {upgradeFeature && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
            <p className="text-sm text-blue-700">
              <Sparkles size={14} className="inline mr-1" />
              <strong>{upgradeFeature}</strong> is a Pro feature
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-3">Free</h4>
            <ul className="space-y-2">
              {freeFeatures.map(f => (
                <li key={f} className="flex items-center gap-2 text-xs text-gray-600">
                  <Check size={12} className="text-green-500" /> {f}
                </li>
              ))}
              {proFeatures.map(f => (
                <li key={f} className="flex items-center gap-2 text-xs text-gray-400">
                  <X size={12} className="text-gray-300" /> {f}
                </li>
              ))}
            </ul>
          </div>

          <div className="p-4 rounded-xl border-2 border-blue-600 relative">
            <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full font-medium">
              Popular
            </span>
            <h4 className="font-semibold text-gray-900 mb-1">Pro</h4>
            <p className="text-sm text-gray-500 mb-3">₹199/mo</p>
            <ul className="space-y-2">
              {[...freeFeatures, ...proFeatures].map(f => (
                <li key={f} className="flex items-center gap-2 text-xs text-gray-600">
                  <Check size={12} className="text-green-500" /> {f}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <a
          href="https://strikin.lemonsqueezy.com/checkout"
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-3 rounded-xl font-medium transition-colors"
        >
          Upgrade to Pro — ₹199/mo
        </a>
        <p className="text-center text-xs text-gray-400">
          Or save ₹900/yr with annual plan at ₹1,499/yr
        </p>
      </div>
    </Modal>
  );
}
