import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { Instagram, Search, ShoppingCart } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import { CartButton } from '@/components/cart/cart-button';
import { AdminLoginDialog } from '@/components/auth/admin-login-dialog';
import { ThemeToggle } from '@/components/theme/theme-toggle';

const LogoIcon = () => (
  <div className="relative w-28 h-10">
    <Image
      src="https://truevintageperu.com/vtg/logo.jpg"
      alt="True Vintage Logo"
      fill
      className="object-contain"
      priority
    />
  </div>
);

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2" aria-label="Homepage">
          <LogoIcon />
        </Link>
        <nav className="flex items-center gap-2 sm:gap-3">
          <Button variant="ghost" size="icon" asChild className="text-foreground/70 hover:text-foreground">
            <Link href="https://www.instagram.com/truevintage.pe" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <Instagram className="h-5 w-5" />
            </Link>
          </Button>
          <Link
            href="https://wa.me/51940866278"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <FaWhatsapp className="h-5 w-5" />
          </Link>


          <CartButton />
          <ThemeToggle />
          {/* Botón de administrador con autenticación */}
          <AdminLoginDialog />
        </nav>
      </div>
    </header>
  );
}
