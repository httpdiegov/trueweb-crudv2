'use client';

import { useEffect } from 'react';

/**
 * Componente para inicializar un session_id único que ayuda con la deduplicación de eventos
 */
export default function SessionInit() {
  useEffect(() => {
    // Generar un session_id único si no existe
    if (typeof window !== 'undefined' && !sessionStorage.getItem('session_id')) {
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 12)}`;
      sessionStorage.setItem('session_id', sessionId);
    }
  }, []);

  return null; // Este componente no renderiza nada
}