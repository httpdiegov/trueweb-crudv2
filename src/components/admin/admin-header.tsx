'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, ShoppingBag, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function AdminHeader() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/admin/login');
      router.refresh();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-sidebar text-sidebar-foreground">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
        <Link href="/admin/dashboard" className="flex items-center gap-2">
          <LayoutDashboard className="h-6 w-6" />
          <span className="font-headline text-xl font-semibold">
            Admin TrueVintage
          </span>
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link
            href="/"
            className="flex items-center gap-1 text-sidebar-foreground/80 transition-colors hover:text-sidebar-foreground"
          >
            <ShoppingBag className="h-4 w-4" />
            Ver Tienda
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="flex items-center gap-1 text-sidebar-foreground/80 hover:text-sidebar-foreground"
          >
            <LogOut className="h-4 w-4" />
            Cerrar Sesión
          </Button>
        </nav>
      </div>
    </header>
  );
}
