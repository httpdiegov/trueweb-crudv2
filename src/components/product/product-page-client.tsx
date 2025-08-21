'use client';

import { useEffect } from 'react';
import { getFacebookTrackingData } from '@/utils/facebook-tracking';
import { generateViewContentEventId } from '@/utils/event-id';
import { Prenda } from '@/types';

interface ProductPageClientProps {
  product: Prenda;
}

export function ProductPageClient({ product }: ProductPageClientProps) {
  useEffect(() => {
    // Generar event_id único para deduplicación
    const eventId = generateViewContentEventId(product.sku);
    
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
            eventId: eventId, // Event ID para deduplicación
            ...trackingData,
          }),
        });
      } catch (error) {
        console.error('Error al enviar evento ViewContent:', error);
      }
    };

    sendViewContent();

    // También disparar evento ViewContent al Meta Pixel (frontend)
    if (typeof window !== 'undefined' && window.fbq && process.env.NEXT_PUBLIC_META_PIXEL_ID) {
      window.fbq('trackSingle', process.env.NEXT_PUBLIC_META_PIXEL_ID, 'ViewContent', {
        content_type: 'product',
        content_ids: [product.sku],
        content_name: product.nombre_prenda,
        content_category: product.categoria_nombre || 'Vintage',
        value: product.precio,
        currency: 'PEN',
        eventID: eventId // Event ID para deduplicación
      });
    }
  }, [product]);

  // Este componente no renderiza nada visible
  return null;
}