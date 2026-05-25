import { useInvoiceStore } from '../../../hooks/useInvoiceStore';

const BRAND_COLORS = ['#2563EB', '#16a34a', '#7c3aed', '#ea580c', '#e11d48', '#0d9488', '#6b7280', '#000000'];

export function StepDesign() {
  const store = useInvoiceStore();

  return (
    <div className="space-y-5">
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Design Customiser</p>

      {/* Brand Color */}
      <div>
        <p className="text-xs text-gray-400 mb-2">Brand Color</p>
        <div className="flex items-center gap-2">
          <input type="color" value={store.style.brandColor} onChange={e => store.updateStyle({ brandColor: e.target.value })}
            className="w-8 h-8 rounded-lg border border-gray-200 cursor-pointer" />
          {BRAND_COLORS.map(c => (
            <button key={c} onClick={() => store.updateStyle({ brandColor: c })}
              className={`w-6 h-6 rounded-full border-2 transition-all ${store.style.brandColor === c ? 'border-gray-900 scale-110' : 'border-transparent'}`}
              style={{ backgroundColor: c }} />
          ))}
        </div>
      </div>

      {/* Size & Spacing */}
      <div className="flex gap-4">
        <div>
          <p className="text-xs text-gray-400 mb-2">Size</p>
          <div className="flex rounded-lg bg-gray-50 p-0.5">
            {(['sm', 'md', 'lg'] as const).map(s => (
              <button key={s} onClick={() => store.updateStyle({ fontSize: s })}
                className={`px-3 py-1 text-xs rounded-md ${store.style.fontSize === s ? 'bg-white shadow-sm font-medium' : 'text-gray-500'}`}>
                {s.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-2">Spacing</p>
          <div className="flex rounded-lg bg-gray-50 p-0.5">
            {(['compact', 'normal', 'airy'] as const).map(s => (
              <button key={s} onClick={() => store.updateStyle({ spacing: s })}
                className={`px-3 py-1 text-xs rounded-md capitalize ${store.style.spacing === s ? 'bg-white shadow-sm font-medium' : 'text-gray-500'}`}>
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
