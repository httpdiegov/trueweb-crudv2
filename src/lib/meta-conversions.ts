import { hashEmail, hashPhone, validateExternalId } from '@/utils/hashing';
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
 * Mejora la calidad de coincidencias según Meta
 * @param headers - Headers de la request
 * @returns IP del cliente o null si no se encuentra
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

  for (const header of ipHeaders) {
    const value = request.headers.get(header);
    if (value) {
      // x-forwarded-for puede contener múltiples IPs separadas por comas
      // La primera IP es la del cliente original
      const ip = value.split(',')[0].trim();
      if (isValidIp(ip)) {
        return ip;
      }
    }
  }

  return undefined;
}

/**
 * Valida si una cadena es una dirección IP válida (IPv4 o IPv6)
 * @param ip - Cadena a validar
 * @returns true si es una IP válida
 */
function isValidIp(ip: string): boolean {
  // Regex para IPv4
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  
  // Regex básica para IPv6
  const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::1$|^::$/;
  
  return ipv4Regex.test(ip) || ipv6Regex.test(ip);
}

// Tipos para los eventos
export interface ConversionEventData {
  userAgent?: string;
  clientIpAddress?: string;
  fbp?: string; // Facebook browser ID (+5.83% conversiones)
  fbc?: string; // Facebook click ID (+54.7% conversiones)
  email?: string; // Email hasheado SHA-256 (+42.4% conversiones)
  phone?: string; // Teléfono hasheado SHA-256 (+11.56% conversiones)
  externalId?: string; // Identificador externo (+5.83% conversiones)
  value?: number;
  currency?: string;
  contentIds?: string[];
  contentName?: string;
  contentCategory?: string;
  contentType?: string;
  numItems?: number;
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
          ...(eventData.fbc && { fbc: eventData.fbc }),
          ...(eventData.email && { em: eventData.email }),
          ...(eventData.phone && { ph: eventData.phone }),
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
        }
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
  externalId?: string;
}): Promise<void> {
  return sendConversionEvent('AddToCart', {
    userAgent: productData.userAgent,
    clientIpAddress: productData.clientIpAddress,
    fbp: productData.fbp,
    fbc: productData.fbc,
    email: hashEmail(productData.email) || undefined,
    phone: hashPhone(productData.phone) || undefined,
    externalId: validateExternalId(productData.externalId) || undefined,
    contentIds: [productData.productId],
    contentType: 'product',
    contentName: productData.productName,
    contentCategory: productData.category,
    value: productData.value,
    currency: productData.currency || 'USD',
    numItems: 1
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
  externalId?: string;
}): Promise<void> {
  return sendConversionEvent('ViewContent', {
    userAgent: productData.userAgent,
    clientIpAddress: productData.clientIpAddress,
    fbp: productData.fbp,
    fbc: productData.fbc,
    email: hashEmail(productData.email) || undefined,
    phone: hashPhone(productData.phone) || undefined,
    externalId: validateExternalId(productData.externalId) || undefined,
    contentIds: [productData.productId],
    contentType: 'product',
    contentName: productData.productName,
    contentCategory: productData.category,
    value: productData.value,
    currency: productData.currency || 'USD'
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
  externalId?: string;
}): Promise<void> {
  return sendConversionEvent('InitiateCheckout', {
    userAgent: productData.userAgent,
    clientIpAddress: productData.clientIpAddress,
    fbp: productData.fbp,
    fbc: productData.fbc,
    email: hashEmail(productData.email) || undefined,
    phone: hashPhone(productData.phone) || undefined,
    externalId: validateExternalId(productData.externalId) || undefined,
    contentIds: [productData.productId],
    contentType: 'product',
    contentName: productData.productName,
    contentCategory: productData.category,
    value: productData.value,
    currency: productData.currency || 'USD',
    numItems: 1
  });
}