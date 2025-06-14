import { AdminHeader } from '@/components/admin/admin-header';
import { Toaster } from '@/components/ui/toaster';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-muted/40">
      <AdminHeader />
      <main className="flex-1 p-4 md:p-8">
        <div className="container mx-auto max-w-screen-lg">
          {children}
          <Toaster />
        </div>
      </main>
    </div>
  );
}
