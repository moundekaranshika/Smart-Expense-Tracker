import React, { createContext, useContext, useState, useCallback, useId } from 'react';
import { AlertCircle, CheckCircle, Info, XCircle, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message: string;
}

interface ToastContextType {
  showToast: (type: ToastType, title: string, message: string) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((type: ToastType, title: string, message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, message }]);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      
      {/* Toast Portal Container */}
      <div id="toast-portal" className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full no-print">
        <AnimatePresence>
          {toasts.map((toast) => {
            const Icon = {
              success: CheckCircle,
              error: XCircle,
              warning: AlertCircle,
              info: Info,
            }[toast.type];

            const colors = {
              success: 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/45 dark:border-emerald-800 dark:text-emerald-300',
              error: 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/45 dark:border-rose-800 dark:text-rose-300',
              warning: 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/45 dark:border-amber-800 dark:text-amber-300',
              info: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950/45 dark:border-blue-800 dark:text-blue-300',
            }[toast.type];

            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 100, transition: { duration: 0.2 } }}
                className={`p-4 rounded-xl border flex gap-3 shadow-lg backdrop-blur-md ${colors}`}
                id={`toast-${toast.id}`}
              >
                <Icon className="w-5 h-5 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-sm leading-none mb-1 font-display">{toast.title}</h4>
                  <p className="text-xs opacity-90 leading-normal">{toast.message}</p>
                </div>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10 shrink-0 h-fit"
                  id={`close-toast-${toast.id}`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
