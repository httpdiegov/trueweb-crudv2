/**
 * Utilidades para generar event_id únicos para deduplicación de eventos de Meta
 * Según la documentación de Meta: https://developers.facebook.com/docs/marketing-api/conversions-api/deduplication
 */

/**
 * Genera un event_id único para deduplicación de eventos entre Meta Pixel y Conversions API
 * El event_id debe ser único por evento y consistente entre píxel y API
 * 
 * @param eventType - Tipo de evento (ej: 'AddToCart', 'Purchase', etc.)
 * @param productId - ID del producto (opcional, para eventos específicos de producto)
 * @param timestamp - Timestamp opcional (por defecto usa Date.now())
 * @returns string - Event ID único en formato: eventType_productId_timestamp_random
 */
export function generateEventId(
  eventType: string,
  productId?: string,
  timestamp?: number
): string {
  const ts = timestamp || Date.now();
  const random = Math.random().toString(36).substring(2, 8); // 6 caracteres aleatorios
  
  if (productId) {
    return `${eventType}_${productId}_${ts}_${random}`;
  }
  
  return `${eventType}_${ts}_${random}`;
}

/**
 * Genera un event_id específico para eventos AddToCart
 * 
 * @param productSku - SKU del producto
 * @param timestamp - Timestamp opcional
 * @returns string - Event ID único para AddToCart
 */
export function generateAddToCartEventId(
  productSku: string,
  timestamp?: number
): string {
  return generateEventId('AddToCart', productSku.replace(/[^a-zA-Z0-9]/g, '_'), timestamp);
}

/**
 * Genera un event_id específico para eventos Purchase
 * 
 * @param orderId - ID de la orden
 * @param timestamp - Timestamp opcional
 * @returns string - Event ID único para Purchase
 */
export function generatePurchaseEventId(
  orderId: string,
  timestamp?: number
): string {
  return generateEventId('Purchase', orderId.replace(/[^a-zA-Z0-9]/g, '_'), timestamp);
}

/**
 * Genera un event_id específico para eventos InitiateCheckout
 * 
 * @param sessionId - ID de sesión o identificador único del checkout
 * @param timestamp - Timestamp opcional
 * @returns string - Event ID único para InitiateCheckout
 */
export function generateInitiateCheckoutEventId(
  sessionId?: string,
  timestamp?: number
): string {
  const id = sessionId ? sessionId.replace(/[^a-zA-Z0-9]/g, '_') : 'session';
  return generateEventId('InitiateCheckout', id, timestamp);
}

/**
 * Valida si un event_id tiene el formato correcto
 * 
 * @param eventId - Event ID a validar
 * @returns boolean - true si es válido
 */
export function validateEventId(eventId: string): boolean {
  if (!eventId || typeof eventId !== 'string') {
    return false;
  }
  
  // Verificar que no sea demasiado largo (Meta recomienda máximo 40 caracteres)
  if (eventId.length > 40) {
    return false;
  }
  
  // Verificar que solo contenga caracteres alfanuméricos y guiones bajos
  const validPattern = /^[a-zA-Z0-9_]+$/;
  return validPattern.test(eventId);
}