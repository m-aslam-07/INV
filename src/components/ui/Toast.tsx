import { useToastStore } from '../../hooks/useToastStore';
import { CheckCircle, Info, AlertCircle, X } from 'lucide-react';

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-2">
      {toasts.map((toast) => {
        const icons = {
          success: <CheckCircle size={16} className="text-green-500 flex-shrink-0" />,
          info: <Info size={16} className="text-blue-500 flex-shrink-0" />,
          error: <AlertCircle size={16} className="text-red-500 flex-shrink-0" />,
        };
        const bgColors = {
          success: 'bg-green-50 border-green-200',
          info: 'bg-blue-50 border-blue-200',
          error: 'bg-red-50 border-red-200',
        };

        return (
          <div
            key={toast.id}
            className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border shadow-lg animate-slide-up ${bgColors[toast.type]}`}
          >
            {icons[toast.type]}
            <span className="text-sm font-medium text-gray-800">{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-2 p-0.5 rounded hover:bg-black/5 transition-colors"
            >
              <X size={14} className="text-gray-400" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
