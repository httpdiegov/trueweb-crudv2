// Ejemplo completo de uso de la API de Conversiones de Meta
// Basado en el ejemplo oficial: https://developers.facebook.com/docs/marketing-api/conversions-api/payload-helper/

const { sendConversionEvent } = require('./src/lib/meta-conversions');

// Ejemplo exacto según la documentación oficial de Meta
async function sendPurchaseEventExample() {
  const eventData = {
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    clientIpAddress: '192.168.1.1',
    fbp: 'fb.1.1554763741205.AbCdEfGhIjKlMnOpQrStUvWxYz1234567890',
    fbc: null, // Puede ser null como en el ejemplo oficial
    email: 'user@example.com', // Se hasheará automáticamente a SHA-256
    phone: null, // Puede ser null
    firstName: null, // Puede ser null
    externalId: 'user123',
    value: 142.52,
    currency: 'USD',
    // Parámetros adicionales según documentación oficial
    attributionShare: '0.3', // Para attribution_data
    originalEventName: 'Purchase', // Para original_event_data
    originalEventTime: 1755799452, // Para original_event_data
    orderId: 'order123', // Para original_event_data
    eventId: 'event123' // Para original_event_data
  };

  try {
    await sendConversionEvent('Purchase', eventData);
    console.log('✅ Evento Purchase enviado correctamente');
  } catch (error) {
    console.error('❌ Error enviando evento:', error);
  }
}

// Ejemplo de AddToCart con todos los parámetros
async function sendAddToCartEventExample() {
  const { sendAddToCartEvent } = require('./src/lib/meta-conversions');
  
  const productData = {
    productId: 'product123',
    productName: 'Producto de Ejemplo',
    category: 'electronics',
    value: 99.99,
    currency: 'USD',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    clientIpAddress: '192.168.1.1',
    fbp: 'fb.1.1554763741205.AbCdEfGhIjKlMnOpQrStUvWxYz1234567890',
    fbc: null,
    email: 'customer@example.com',
    phone: null,
    firstName: null,
    externalId: 'customer456',
    // Nuevos parámetros
    attributionShare: '0.5',
    originalEventName: 'AddToCart',
    originalEventTime: Math.floor(Date.now() / 1000),
    orderId: 'cart789',
    eventId: 'addtocart123'
  };

  try {
    await sendAddToCartEvent(productData);
    console.log('✅ Evento AddToCart enviado correctamente');
  } catch (error) {
    console.error('❌ Error enviando evento AddToCart:', error);
  }
}

console.log('Ejemplos de uso de Meta Conversions API');
console.log('======================================');
console.log('');
console.log('Formato del payload según ejemplo oficial:');
console.log('- user_data.em: array con email hasheado SHA-256');
console.log('- user_data.ph: array (puede contener null)');
console.log('- user_data.fbc: valor directo (puede ser null)');
console.log('- user_data.fn: array (puede contener null)');
console.log('- attribution_data: objeto con attribution_share');
console.log('- original_event_data: objeto con event_name, event_time, etc.');
console.log('');
console.log('Ejecutando ejemplos...');

// Ejecutar ejemplos
// sendPurchaseEventExample();
// sendAddToCartEventExample();

// Payload resultante será:
/*
{
  "data": [{
    "event_name": "Purchase",
    "event_time": 1755799452,
    "action_source": "website",
    "user_data": {
      "em": ["7b17fb0bd173f625b58636fb796407c22b3d16fc78302d79f0fd30c2fc2fc068"],
      "ph": [null],
      "fbc": null,
      "fn": [null],
      "fb_login_id": null
    },
    "attribution_data": {
      "attribution_share": "0.3"
    },
    "custom_data": {
      "currency": "USD",
      "value": "142.52"
    },
    "original_event_data": {
      "event_name": "Purchase",
      "event_time": 1755799452
    }
  }]
}
*/