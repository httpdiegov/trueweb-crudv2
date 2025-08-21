// Configuración para la API de conversiones de Meta
const accessToken = process.env.META_ACCESS_TOKEN;
const pixelId = process.env.META_PIXEL_ID;
const testEventCode = process.env.META_TEST_EVENT_CODE;

if (!accessToken || !pixelId) {
  throw new Error('META_ACCESS_TOKEN y META_PIXEL_ID son requeridos');
}

// URL base de la API de conversiones de Meta
const CONVERSIONS_API_URL = `https://graph.facebook.com/v18.0/${pixelId}/events`;

// Tipos para los eventos
export interface ConversionEventData {
  userAgent?: string;
  clientIpAddress?: string;
  fbp?: string; // Facebook browser ID
  fbc?: string; // Facebook click ID
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
          ...(eventData.fbc && { fbc: eventData.fbc })
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
}): Promise<void> {
  return sendConversionEvent('AddToCart', {
    userAgent: productData.userAgent,
    clientIpAddress: productData.clientIpAddress,
    fbp: productData.fbp,
    fbc: productData.fbc,
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
}): Promise<void> {
  return sendConversionEvent('ViewContent', {
    userAgent: productData.userAgent,
    clientIpAddress: productData.clientIpAddress,
    fbp: productData.fbp,
    fbc: productData.fbc,
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
}): Promise<void> {
  return sendConversionEvent('InitiateCheckout', {
    userAgent: productData.userAgent,
    clientIpAddress: productData.clientIpAddress,
    fbp: productData.fbp,
    fbc: productData.fbc,
    contentIds: [productData.productId],
    contentType: 'product',
    contentName: productData.productName,
    contentCategory: productData.category,
    value: productData.value,
    currency: productData.currency || 'USD',
    numItems: 1
  });
}