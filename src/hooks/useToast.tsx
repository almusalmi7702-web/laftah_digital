import { useState, useCallback } from 'react';
import { ToastMessage, ToastContainer, createToast, ToastType } from '../components/admin/Toast';

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((type: ToastType, message: string) => {
    setToasts((prev) => [...prev, createToast(type, message)]);
  }, []);

  const closeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const ToastPortal = <ToastContainer toasts={toasts} onClose={closeToast} />;

  return { showToast, closeToast, ToastPortal };
};
