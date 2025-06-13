import Link from 'next/link';
import { LayoutDashboard, ShoppingBag } from 'lucide-react';

export function AdminHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-sidebar text-sidebar-foreground">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
        <Link href="/admin" className="flex items-center gap-2">
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
          {/* Add more admin navigation links here if needed, e.g., Users, Orders */}
        </nav>
      </div>
    </header>
  );
}
