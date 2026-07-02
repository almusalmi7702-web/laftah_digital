import { useEffect } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastProps {
  toast: ToastMessage;
  onClose: (id: string) => void;
}

const Toast = ({ toast, onClose }: ToastProps) => {
  useEffect(() => {
    const timer = setTimeout(() => onClose(toast.id), 3500);
    return () => clearTimeout(timer);
  }, [toast.id, onClose]);

  const config = {
    success: { icon: CheckCircle, bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700' },
    error: { icon: XCircle, bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700' },
    info: { icon: Info, bg: 'bg-teal-50', border: 'border-teal-200', text: 'text-teal-700' },
  };

  const { icon: Icon, bg, border, text } = config[toast.type];

  return (
    <div className={`flex items-center gap-3 ${bg} ${border} ${text} border rounded-xl px-4 py-3 shadow-lg min-w-[280px] max-w-sm`}>
      <Icon className="w-5 h-5 flex-shrink-0" />
      <span className="text-sm font-semibold flex-1">{toast.message}</span>
      <button onClick={() => onClose(toast.id)} className="flex-shrink-0 hover:opacity-70 transition-opacity">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

interface ToastContainerProps {
  toasts: ToastMessage[];
  onClose: (id: string) => void;
}

export const ToastContainer = ({ toasts, onClose }: ToastContainerProps) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 items-center">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onClose={onClose} />
      ))}
    </div>
  );
};

export const createToast = (type: ToastType, message: string): ToastMessage => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
  type,
  message,
});
