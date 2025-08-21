'use client';

import { useEffect } from 'react';

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
    if (typeof window !== 'undefined') {
      fetch('/api/conversions/view-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product.sku,
          productName: product.nombre_prenda,
          category: product.categoria_nombre || 'Ropa Vintage',
          value: product.precio,
          currency: 'PEN'
        })
      }).catch(error => {
        console.error('Error al enviar evento ViewContent:', error);
      });
      
      // También disparar evento ViewContent al Meta Pixel (frontend)
      if (window.fbq) {
        window.fbq('track', 'ViewContent', {
          content_type: 'product',
          content_ids: [product.sku],
          content_name: product.nombre_prenda,
          content_category: product.categoria_nombre || 'Vintage',
          value: product.precio,
          currency: 'PEN'
        });
      }
    }
  }, [product]);

  // Este componente no renderiza nada visible
  return null;
}