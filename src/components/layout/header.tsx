import Link from 'next/link';
import { Instagram, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CartButton } from '@/components/cart/cart-button';
import { AdminLoginDialog } from '@/components/auth/admin-login-dialog';

const LogoIcon = () => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 28 28"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="text-primary"
  >
    <circle cx="14" cy="14" r="13" stroke="currentColor" strokeWidth="2" />
    <path
      d="M10 10H18M14 10V20"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2" aria-label="Homepage">
          <LogoIcon />
        </Link>
        <nav className="flex items-center gap-2 sm:gap-3">
          <Button variant="ghost" size="icon" asChild className="text-foreground/70 hover:text-foreground">
            <Link href="https://www.instagram.com/truevintage.pe" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <Instagram className="h-5 w-5" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" className="text-foreground/70 hover:text-foreground" aria-label="Search">
            <Search className="h-5 w-5" />
          </Button>
          <CartButton />
           {/* Botón de administrador con autenticación */}
          <AdminLoginDialog />
        </nav>
      </div>
    </header>
  );
}
