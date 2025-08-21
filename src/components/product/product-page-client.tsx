'use client';

import { useEffect } from 'react';
import { getFacebookTrackingData } from '@/utils/facebook-tracking';

interface ProductPageClientProps {
  product: {
    id: number;
    sku: string;
    nombre_prenda: string;
    precio: number;
    categoria_nombre?: string;
  };
}

export function ProductPageClient({ product }: ProductPageClientProps) {
  useEffect(() => {
    // Enviar evento ViewContent a Meta Conversions API
    const sendViewContent = async () => {
      try {
        const trackingData = getFacebookTrackingData();
        
        await fetch('/api/conversions/view-content', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            productId: product.sku,
            productName: product.nombre_prenda,
            category: product.categoria_nombre || 'Ropa Vintage',
            value: product.precio,
            currency: 'PEN',
            email: trackingData.email,
            phone: trackingData.phone,
            firstName: trackingData.firstName,
            ...trackingData,
          }),
        });
      } catch (error) {
        console.error('Error al enviar evento ViewContent:', error);
      }
    };

    sendViewContent();

    // También disparar evento ViewContent al Meta Pixel (frontend)
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'ViewContent', {
        content_type: 'product',
        content_ids: [product.sku],
        content_name: product.nombre_prenda,
        content_category: product.categoria_nombre || 'Vintage',
        value: product.precio,
        currency: 'PEN'
      });
    }
  }, [product]);

  // Este componente no renderiza nada visible
  return null;
}