'use client';

import { ToastProvider as ToastProviderUI } from '@/components/ui/use-toast';
import { Toaster } from '@/components/ui/toaster';

export function ToastProvider({ children }: { children: React.ReactNode }) {
  return (
    <ToastProviderUI>
      {children}
      <Toaster />
    </ToastProviderUI>
  );
}
