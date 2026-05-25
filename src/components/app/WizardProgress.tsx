import { Check } from 'lucide-react';

const STEPS = [
  { num: 1, label: 'Template' },
  { num: 2, label: 'Details' },
  { num: 3, label: 'Line Items' },
  { num: 4, label: 'Tax & Discount' },
];

interface Props { current: number; onChange: (step: number) => void; }

export function WizardProgress({ current, onChange }: Props) {
  return (
    <div className="px-4 pt-4 pb-2 bg-white border-b border-gray-100 flex-shrink-0">
      <div className="flex items-center justify-between relative">
        {/* Connector line */}
        <div className="absolute top-4 left-[10%] right-[10%] h-0.5 bg-gray-100 z-0" />
          <div
            className="absolute top-4 left-[10%] h-0.5 bg-blue-500 z-0 transition-all duration-500 ease-out"
            style={{ width: `${((current - 1) / 3) * 80}%` }}
          />
        {STEPS.map((s) => {
          const done = current > s.num;
          const active = current === s.num;
          return (
            <button
              key={s.num}
              onClick={() => (done || active) && onChange(s.num)}
              className="flex flex-col items-center gap-1.5 z-10 group"
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                  done
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                    : active
                    ? 'bg-blue-600 text-white ring-4 ring-blue-100 shadow-lg shadow-blue-200'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {done ? <Check size={14} strokeWidth={3} /> : s.num}
              </div>
              <span
                className={`text-[10px] font-medium transition-colors ${
                  active ? 'text-blue-700' : done ? 'text-blue-500' : 'text-gray-400'
                }`}
              >
                {s.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
