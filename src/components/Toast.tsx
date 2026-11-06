import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, X, Info } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  description?: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: (id: string) => void }> = ({
  toast,
  onDismiss,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
    error: <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />,
    info: <Info className="w-5 h-5 text-cyan-400 shrink-0" />,
  };

  const borders = {
    success: 'border-emerald-500/40 bg-[#071a15] text-emerald-100',
    error: 'border-rose-500/40 bg-[#1f0d11] text-rose-100',
    info: 'border-cyan-500/40 bg-[#081827] text-cyan-100',
  };

  return (
    <div
      className={`pointer-events-auto p-3.5 rounded-xl border shadow-xl flex items-start gap-3 backdrop-blur-md transition-all animate-in slide-in-from-bottom-3 duration-200 ${borders[toast.type]}`}
    >
      {icons[toast.type]}
      <div className="flex-1 text-xs">
        <div className="font-bold text-white leading-tight">{toast.title}</div>
        {toast.description && (
          <div className="mt-0.5 text-slate-300 leading-relaxed text-[11px]">{toast.description}</div>
        )}
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-slate-400 hover:text-white p-0.5 rounded cursor-pointer"
        aria-label="Close notification"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
