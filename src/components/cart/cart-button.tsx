'use client';

import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/cart-context';

export function CartButton() {
  const { toggleCart, totalItems } = useCart();

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      className="relative"
      onClick={toggleCart}
    >
      <ShoppingCart className="h-5 w-5" />
      {totalItems > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-medium text-white">
          {totalItems}
        </span>
      )}
    </Button>
  );
}
