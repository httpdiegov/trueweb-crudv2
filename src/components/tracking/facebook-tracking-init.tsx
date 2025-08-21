'use client';

import { useEffect } from 'react';
import { initializeFacebookTracking } from '@/utils/facebook-tracking';

/**
 * Componente para inicializar el tracking de Facebook
 * Se ejecuta en el lado del cliente para capturar fbclid y configurar cookies
 */
export function FacebookTrackingInit() {
  useEffect(() => {
    // Inicializar tracking de Facebook al montar el componente
    initializeFacebookTracking();
  }, []);

  // Este componente no renderiza nada visible
  return null;
}