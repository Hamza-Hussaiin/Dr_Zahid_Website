import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map(toast => {
        let icon = <Info className="w-5 h-5 text-teal-600" />;
        let borderClass = 'border-teal-200 bg-white';

        if (toast.type === 'success') {
          icon = <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
          borderClass = 'border-emerald-200 bg-white';
        } else if (toast.type === 'error') {
          icon = <AlertCircle className="w-5 h-5 text-rose-600" />;
          borderClass = 'border-rose-200 bg-white';
        } else if (toast.type === 'warning') {
          icon = <AlertTriangle className="w-5 h-5 text-amber-500" />;
          borderClass = 'border-amber-200 bg-white';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-xl shadow-xl border ${borderClass} flex items-start gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200`}
          >
            <div className="shrink-0 mt-0.5">{icon}</div>
            <div className="flex-1 min-w-0">
              <h5 className="text-xs font-bold text-slate-900">{toast.title}</h5>
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="shrink-0 text-slate-400 hover:text-slate-600 p-1 rounded transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
