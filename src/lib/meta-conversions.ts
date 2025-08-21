import { hashEmail, hashPhone, hashFirstName, validateExternalId } from '@/utils/hashing';
import { NextRequest } from 'next/server';

// Configuración para la API de conversiones de Meta
const accessToken = process.env.META_ACCESS_TOKEN;
const pixelId = process.env.META_PIXEL_ID;
const testEventCode = process.env.META_TEST_EVENT_CODE;

if (!accessToken || !pixelId) {
  console.warn('Meta Conversions API: META_ACCESS_TOKEN y META_PIXEL_ID no están configurados. Los eventos de conversión serán omitidos.');
}

// URL base de la API de conversiones de Meta
const CONVERSIONS_API_URL = `https://graph.facebook.com/v18.0/${pixelId}/events`;

/**
 * Extrae la dirección IP del cliente de los headers de la request
 * Prioriza IPv6 sobre IPv4 según las recomendaciones de Meta
 * @param request - Request de Next.js
 * @returns IP del cliente (preferiblemente IPv6) o undefined si no se encuentra
 */
export function getClientIpAddress(request: NextRequest): string | undefined {
  // Lista de headers en orden de prioridad
  const ipHeaders = [
    'cf-connecting-ip', // Cloudflare
    'x-forwarded-for', // Proxy/Load balancer
    'x-real-ip', // Nginx
    'x-client-ip', // Apache
    'x-forwarded', // Otros proxies
    'forwarded-for',
    'forwarded'
  ];

  const foundIps: string[] = [];

  // Recopilar todas las IPs válidas
  for (const header of ipHeaders) {
    const value = request.headers.get(header);
    if (value) {
      // x-forwarded-for puede contener múltiples IPs separadas por comas
      const ips = value.split(',').map(ip => ip.trim());
      for (const ip of ips) {
        if (isValidIp(ip)) {
          foundIps.push(ip);
        }
      }
    }
  }

  if (foundIps.length === 0) {
    return undefined;
  }

  // Priorizar IPv6 sobre IPv4 según recomendaciones de Meta
  const ipv6Addresses = foundIps.filter(ip => isIPv6(ip));
  const ipv4Addresses = foundIps.filter(ip => isIPv4(ip));

  // Retornar la primera IPv6 si está disponible, sino la primera IPv4
  return ipv6Addresses.length > 0 ? ipv6Addresses[0] : ipv4Addresses[0];
}

/**
 * Valida si una cadena es una dirección IP válida (IPv4 o IPv6)
 * @param ip - Cadena a validar
 * @returns true si es una IP válida
 */
function isValidIp(ip: string): boolean {
  return isIPv4(ip) || isIPv6(ip);
}

/**
 * Valida si una cadena es una dirección IPv4 válida
 * @param ip - Cadena a validar
 * @returns true si es una IPv4 válida
 */
function isIPv4(ip: string): boolean {
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  return ipv4Regex.test(ip);
}

/**
 * Valida si una cadena es una dirección IPv6 válida
 * Soporta formato completo, comprimido y casos especiales
 * @param ip - Cadena a validar
 * @returns true si es una IPv6 válida
 */
function isIPv6(ip: string): boolean {
  // Casos especiales
  if (ip === '::' || ip === '::1') {
    return true;
  }

  // IPv6 completa (8 grupos de 4 dígitos hexadecimales)
  const fullIPv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  
  // IPv6 comprimida con :: (puede aparecer solo una vez)
  const compressedIPv6Regex = /^(([0-9a-fA-F]{1,4}:)*)?::([0-9a-fA-F]{1,4}:)*[0-9a-fA-F]{1,4}$|^(([0-9a-fA-F]{1,4}:)*)?::$/;
  
  // IPv6 con notación mixta IPv4 al final
  const mixedIPv6Regex = /^(([0-9a-fA-F]{1,4}:)*)?::([0-9a-fA-F]{1,4}:)*((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  
  return fullIPv6Regex.test(ip) || compressedIPv6Regex.test(ip) || mixedIPv6Regex.test(ip);
}

// Tipos para los eventos
export interface ConversionEventData {
  userAgent?: string;
  clientIpAddress?: string;
  fbp?: string; // Facebook browser ID (+5.83% conversiones)
  fbc?: string | null; // Facebook click ID (+54.7% conversiones)
  email?: string | null; // Email hasheado SHA-256 (+42.4% conversiones)
  phone?: string | null; // Teléfono hasheado SHA-256 (+11.56% conversiones)
  firstName?: string | null; // Nombre hasheado SHA-256 (mejora coincidencias)
  externalId?: string; // Identificador externo (+5.83% conversiones)
  value?: number;
  currency?: string;
  contentIds?: string[];
  contentName?: string;
  contentCategory?: string;
  contentType?: string;
  numItems?: number;
  // Nuevos parámetros según documentación oficial de Meta
  attributionShare?: string; // Para attribution_data
  originalEventName?: string; // Para original_event_data
  originalEventTime?: number; // Para original_event_data
  orderId?: string; // Para original_event_data
  eventId?: string; // Para original_event_data
}

// Función para enviar eventos de conversión
export async function sendConversionEvent(
  eventName: string,
  eventData: ConversionEventData
): Promise<void> {
  if (!accessToken || !pixelId) {
    console.warn('Meta Conversions API: Missing configuration, skipping event');
    return;
  }

  try {
    const eventPayload = {
      data: [{
        event_name: eventName,
        event_time: Math.floor(Date.now() / 1000),
        action_source: 'website',
        user_data: {
          ...(eventData.userAgent && { client_user_agent: eventData.userAgent }),
          ...(eventData.clientIpAddress && { client_ip_address: eventData.clientIpAddress }),
          ...(eventData.fbp && { fbp: eventData.fbp }),
          ...(eventData.fbc !== undefined && { fbc: eventData.fbc }),
          ...(eventData.email !== undefined && { em: [eventData.email] }),
          ...(eventData.phone !== undefined && { ph: [eventData.phone] }),
          ...(eventData.firstName !== undefined && { fn: [eventData.firstName] }),
          ...(eventData.externalId && { external_id: eventData.externalId })
        },
        custom_data: {
          ...(eventData.value && { value: eventData.value }),
          ...(eventData.currency && { currency: eventData.currency }),
          ...(eventData.contentIds && { content_ids: eventData.contentIds }),
          ...(eventData.contentName && { content_name: eventData.contentName }),
          ...(eventData.contentCategory && { content_category: eventData.contentCategory }),
          ...(eventData.contentType && { content_type: eventData.contentType }),
          ...(eventData.numItems && { num_items: eventData.numItems })
        },
        // Parámetros adicionales según documentación oficial de Meta
        ...(eventData.attributionShare && {
          attribution_data: {
            attribution_share: eventData.attributionShare
          }
        }),
        ...(eventData.originalEventName && {
          original_event_data: {
            event_name: eventData.originalEventName,
            event_time: eventData.originalEventTime || Math.floor(Date.now() / 1000),
            ...(eventData.orderId && { order_id: eventData.orderId }),
            ...(eventData.eventId && { event_id: eventData.eventId })
          }
        })
      }],
      ...(testEventCode && { test_event_code: testEventCode })
    };

    const response = await fetch(CONVERSIONS_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(eventPayload)
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorData}`);
    }

    console.log(`Meta Conversions API: ${eventName} event sent successfully`);
  } catch (error) {
    console.error(`Meta Conversions API: Error sending ${eventName} event:`, error);
    throw error;
  }
}

// Funciones de conveniencia para eventos específicos
export async function sendAddToCartEvent(productData: {
  productId: string;
  productName: string;
  category?: string;
  value?: number;
  currency?: string;
  userAgent?: string;
  clientIpAddress?: string;
  fbp?: string;
  fbc?: string;
  email?: string; // Email sin hashear (se hasheará automáticamente)
  phone?: string; // Teléfono sin hashear (se hasheará automáticamente)
  firstName?: string; // Nombre sin hashear (se hasheará automáticamente)
  externalId?: string;
  // Nuevos parámetros según documentación oficial de Meta
  attributionShare?: string;
  originalEventName?: string;
  originalEventTime?: number;
  orderId?: string;
  eventId?: string;
}): Promise<void> {
  return sendConversionEvent('AddToCart', {
    userAgent: productData.userAgent,
    clientIpAddress: productData.clientIpAddress,
    fbp: productData.fbp,
    fbc: productData.fbc || null,
    email: hashEmail(productData.email),
    phone: hashPhone(productData.phone),
    firstName: hashFirstName(productData.firstName),
    externalId: validateExternalId(productData.externalId) || undefined,
    contentIds: [productData.productId],
    contentType: 'product',
    contentName: productData.productName,
    contentCategory: productData.category,
    value: productData.value,
    currency: productData.currency || 'USD',
    numItems: 1,
    // Nuevos parámetros
    attributionShare: productData.attributionShare,
    originalEventName: productData.originalEventName,
    originalEventTime: productData.originalEventTime,
    orderId: productData.orderId,
    eventId: productData.eventId
  });
}

export async function sendViewContentEvent(productData: {
  productId: string;
  productName: string;
  category?: string;
  value?: number;
  currency?: string;
  userAgent?: string;
  clientIpAddress?: string;
  fbp?: string;
  fbc?: string;
  email?: string; // Email sin hashear (se hasheará automáticamente)
  phone?: string; // Teléfono sin hashear (se hasheará automáticamente)
  firstName?: string; // Nombre sin hashear (se hasheará automáticamente)
  externalId?: string;
  // Nuevos parámetros según documentación oficial de Meta
  attributionShare?: string;
  originalEventName?: string;
  originalEventTime?: number;
  orderId?: string;
  eventId?: string;
}): Promise<void> {
  return sendConversionEvent('ViewContent', {
    userAgent: productData.userAgent,
    clientIpAddress: productData.clientIpAddress,
    fbp: productData.fbp,
    fbc: productData.fbc || null,
    email: hashEmail(productData.email),
    phone: hashPhone(productData.phone),
    firstName: hashFirstName(productData.firstName),
    externalId: validateExternalId(productData.externalId) || undefined,
    contentIds: [productData.productId],
    contentType: 'product',
    contentName: productData.productName,
    contentCategory: productData.category,
    value: productData.value,
    currency: productData.currency || 'USD',
    // Nuevos parámetros
    attributionShare: productData.attributionShare,
    originalEventName: productData.originalEventName,
    originalEventTime: productData.originalEventTime,
    orderId: productData.orderId,
    eventId: productData.eventId
  });
}

export async function sendInitiateCheckoutEvent(productData: {
  productId: string;
  productName: string;
  category?: string;
  value?: number;
  currency?: string;
  userAgent?: string;
  clientIpAddress?: string;
  fbp?: string;
  fbc?: string;
  email?: string; // Email sin hashear (se hasheará automáticamente)
  phone?: string; // Teléfono sin hashear (se hasheará automáticamente)
  firstName?: string; // Nombre sin hashear (se hasheará automáticamente)
  externalId?: string;
  // Nuevos parámetros según documentación oficial de Meta
  attributionShare?: string;
  originalEventName?: string;
  originalEventTime?: number;
  orderId?: string;
  eventId?: string;
}): Promise<void> {
  return sendConversionEvent('InitiateCheckout', {
    userAgent: productData.userAgent,
    clientIpAddress: productData.clientIpAddress,
    fbp: productData.fbp,
    fbc: productData.fbc || null,
    email: hashEmail(productData.email),
    phone: hashPhone(productData.phone),
    firstName: hashFirstName(productData.firstName),
    externalId: validateExternalId(productData.externalId) || undefined,
    contentIds: [productData.productId],
    contentType: 'product',
    contentName: productData.productName,
    contentCategory: productData.category,
    value: productData.value,
    currency: productData.currency || 'USD',
    numItems: 1,
    // Nuevos parámetros
    attributionShare: productData.attributionShare,
    originalEventName: productData.originalEventName,
    originalEventTime: productData.originalEventTime,
    orderId: productData.orderId,
    eventId: productData.eventId
  });
}

// Función para el evento Purchase
export async function sendPurchaseEvent(purchaseData: {
  orderId: string;
  value: number;
  currency: string;
  contentIds?: string[];
  contentNames?: string[];
  contentCategory?: string;
  numItems?: number;
  userAgent?: string;
  clientIpAddress?: string;
  fbp?: string;
  fbc?: string;
  email?: string; // Email sin hashear (se hasheará automáticamente)
  phone?: string; // Teléfono sin hashear (se hasheará automáticamente)
  firstName?: string; // Nombre sin hashear (se hasheará automáticamente)
  externalId?: string;
  // Nuevos parámetros según documentación oficial de Meta
  attributionShare?: string;
  originalEventName?: string;
  originalEventTime?: number;
  eventId?: string;
}): Promise<void> {
  return sendConversionEvent('Purchase', {
    userAgent: purchaseData.userAgent,
    clientIpAddress: purchaseData.clientIpAddress,
    fbp: purchaseData.fbp,
    fbc: purchaseData.fbc || null,
    email: hashEmail(purchaseData.email),
    phone: hashPhone(purchaseData.phone),
    firstName: hashFirstName(purchaseData.firstName),
    externalId: validateExternalId(purchaseData.externalId) || undefined,
    value: purchaseData.value,
    currency: purchaseData.currency,
    contentIds: purchaseData.contentIds,
    contentName: purchaseData.contentNames?.join(', '),
    contentCategory: purchaseData.contentCategory,
    contentType: 'product',
    numItems: purchaseData.numItems,
    // Nuevos parámetros
    attributionShare: purchaseData.attributionShare,
    originalEventName: purchaseData.originalEventName,
    originalEventTime: purchaseData.originalEventTime,
    orderId: purchaseData.orderId,
    eventId: purchaseData.eventId
  });
}

// Función para el evento Search
export async function sendSearchEvent(searchData: {
  searchTerm: string;
  userAgent?: string;
  clientIpAddress?: string;
  fbp?: string;
  fbc?: string;
  email?: string; // Email sin hashear (se hasheará automáticamente)
  phone?: string; // Teléfono sin hashear (se hasheará automáticamente)
  firstName?: string; // Nombre sin hashear (se hasheará automáticamente)
  externalId?: string;
  // Nuevos parámetros según documentación oficial de Meta
  attributionShare?: string;
  originalEventName?: string;
  originalEventTime?: number;
  orderId?: string;
  eventId?: string;
}): Promise<void> {
  return sendConversionEvent('Search', {
    userAgent: searchData.userAgent,
    clientIpAddress: searchData.clientIpAddress,
    fbp: searchData.fbp,
    fbc: searchData.fbc || null,
    email: hashEmail(searchData.email),
    phone: hashPhone(searchData.phone),
    firstName: hashFirstName(searchData.firstName),
    externalId: validateExternalId(searchData.externalId) || undefined,
    contentName: searchData.searchTerm,
    contentType: 'search',
    // Nuevos parámetros
    attributionShare: searchData.attributionShare,
    originalEventName: searchData.originalEventName,
    originalEventTime: searchData.originalEventTime,
    orderId: searchData.orderId,
    eventId: searchData.eventId
  });
}