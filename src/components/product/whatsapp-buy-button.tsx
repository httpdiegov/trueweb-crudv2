"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import { getFacebookTrackingData } from '@/utils/facebook-tracking';

interface WhatsAppBuyButtonProps {
  href: string;
  sku: string;
  precio: number;
  productName?: string;
  className?: string;
}

export function WhatsAppBuyButton({ href, sku, precio, productName, className }: WhatsAppBuyButtonProps) {
  
  const handlePurchase = async () => {
    if (typeof window !== 'undefined') {
      // Obtener datos de tracking de Facebook
      const trackingData = getFacebookTrackingData();
      
      // Enviar evento InitiateCheckout a Meta Conversions API
      try {
        await fetch('/api/conversions/initiate-checkout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            productId: sku,
            productName: productName || `Producto ${sku}`,
            category: 'Ropa Vintage',
            value: precio,
            currency: 'PEN',
            quantity: 1,
            email: trackingData.email,
            phone: trackingData.phone,
            firstName: trackingData.firstName,
            ...trackingData
          })
        });
      } catch (error) {
        console.error('Error al enviar evento InitiateCheckout:', error);
      }
      
      // También enviar al Meta Pixel (frontend)
      if (window.fbq) {
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
      
      // Abrir WhatsApp en nueva ventana
      window.open(href, '_blank', 'noopener,noreferrer');
      
  // (Eliminado) Ya no redirigimos a una página de confirmación interna.
    }
  };
  
  return (
    <Button
      size="lg"
      variant="outline"
      onClick={handlePurchase}
      className={`w-full md:w-auto border-green-600 text-green-700 hover:bg-green-50 hover:text-green-800 ${className || ''}`}
    >
      <MessageCircle className="mr-2 h-5 w-5" />
      Comprar por WhatsApp
    </Button>
  );
}