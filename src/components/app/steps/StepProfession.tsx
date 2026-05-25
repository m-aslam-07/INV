import { useInvoiceStore } from '../../../hooks/useInvoiceStore';
import { getAllTemplates } from '../../invoice/templateRegistry';
import { StepDesign } from './StepDesign';

const DOC_TYPES = [
  { key: 'invoice', label: 'Invoice' },
  { key: 'proforma', label: 'Proforma' },
  { key: 'proposal', label: 'Proposal' },
  { key: 'receipt', label: 'Receipt' },
] as const;

export function StepProfession() {
  const store = useInvoiceStore();

  return (
    <div className="space-y-6">
      {/* Doc Type Toggle */}
      <div>
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Document Type</p>
        <div className="flex rounded-lg bg-gray-50 p-1">
          {DOC_TYPES.map(dt => (
            <button key={dt.key} onClick={() => store.setDocType(dt.key)}
              className={`flex-1 py-2 text-sm rounded-md font-medium transition-all duration-150 ${store.docType === dt.key ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}>
              {dt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Template */}
      <div>
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Template</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 overflow-y-auto max-h-80 pr-2 custom-scrollbar">
          {getAllTemplates().map(t => (
            <button key={t.key} onClick={() => store.updateStyle({ template: t.key })}
              className={`p-3 rounded-xl border-2 text-xs font-medium capitalize transition-all text-left ${store.style.template === t.key ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-100 text-gray-600 hover:border-gray-200'}`}>
              <span className="block truncate">{t.label}</span>
            </button>
          ))}
        </div>
      </div>
      {/* Bring Design Customiser into Template step */}
      <div className="pt-4">
        <StepDesign />
      </div>
    </div>
  );
}
