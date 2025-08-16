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
    // Disparar evento ViewContent cuando se carga la página de producto
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