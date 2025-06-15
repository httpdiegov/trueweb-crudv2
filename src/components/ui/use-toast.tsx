"use client";

import * as React from 'react';
import { X } from 'lucide-react';

import { cn } from '@/lib/utils';

type ToastVariant = 'default' | 'destructive';

interface ToastProps {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
  onDismiss?: () => void;
}

interface ToastContextType {
  toast: (props: Omit<ToastProps, 'id'>) => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

const Toast: React.FC<ToastProps> = ({
  title,
  description,
  variant = 'default',
  onDismiss,
}) => {
  return (
    <div
      className={cn(
        'pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5',
        variant === 'destructive' ? 'bg-red-50' : 'bg-white',
      )}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-1 w-0">
            <p
              className={cn(
                'text-sm font-medium',
                variant === 'destructive' ? 'text-red-800' : 'text-gray-900',
              )}
            >
              {title}
            </p>
            {description && (
              <p
                className={cn(
                  'mt-1 text-sm',
                  variant === 'destructive' ? 'text-red-700' : 'text-gray-500',
                )}
              >
                {description}
              </p>
            )}
          </div>
          {onDismiss && (
            <button
              type="button"
              className="inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
              onClick={onDismiss}
            >
              <span className="sr-only">Cerrar</span>
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

interface ToastProviderProps {
  children: React.ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = React.useState<ToastProps[]>([]);

  const toast = React.useCallback(
    ({ title, description, variant = 'default' }: Omit<ToastProps, 'id'>) => {
      const id = Math.random().toString(36).substring(2, 11);
      const newToast = { id, title, description, variant };
      
      setToasts((prevToasts) => [...prevToasts, newToast]);
      
      // Auto-dismiss after 5 seconds
      setTimeout(() => {
        setToasts((prevToasts) => prevToasts.filter((t) => t.id !== id));
      }, 5000);
    },
    [],
  );

  const dismissToast = React.useCallback((id: string) => {
    setToasts((prevToasts) => prevToasts.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {toasts.map((toastItem) => (
          <Toast
            key={toastItem.id}
            {...toastItem}
            onDismiss={() => dismissToast(toastItem.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export function useToast() {
  const context = React.useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export default ToastProvider;
