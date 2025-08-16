"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';

interface WhatsAppBuyButtonProps {
  href: string;
  sku: string;
  precio: number;
  className?: string;
}

export function WhatsAppBuyButton({ href, sku, precio, className }: WhatsAppBuyButtonProps) {
  return (
    <Button
      size="lg"
      variant="outline"
      asChild
      className={`w-full md:w-auto border-green-600 text-green-700 hover:bg-green-50 hover:text-green-800 ${className || ''}`}
    >
      <Link
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => {
          if (typeof window !== 'undefined' && window.fbq) {
            try {
              window.fbq('track', 'InitiateCheckout', {
                num_items: 1,
                value: precio,
                currency: 'PEN',
                contents: [{ id: sku, quantity: 1, item_price: precio }],
                content_type: 'product',
              });
            } catch (err) {
              console.error('Error al enviar InitiateCheckout desde PDP:', err);
            }
          }
        }}
      >
        <MessageCircle className="mr-2 h-5 w-5" />
        Comprar por WhatsApp
      </Link>
    </Button>
  );
}