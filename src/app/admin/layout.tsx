'use client';

import { AdminHeader } from '@/components/admin/admin-header';
import { Toaster } from '@/components/ui/toaster';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/components/theme/theme-provider';
import { useEffect, useState } from 'react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  
  // Wait until after client-side hydration to display
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) {
    return (
      <div className="flex min-h-screen flex-col bg-muted/40">
        <div className="h-16 border-b" />
        <main className="flex-1 p-4 md:p-8">
          <div className="container mx-auto max-w-screen-lg">
            {children}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-muted/40">
      <AdminHeader />
      <main className="flex-1 p-4 md:p-8">
        <div className="container mx-auto max-w-screen-lg">
          {children}
        </div>
      </main>
      <Toaster />
    </div>
  );
}
