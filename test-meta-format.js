// Ejemplo de uso de la API de Conversiones de Meta con el formato correcto
// Este archivo demuestra cómo el payload ahora coincide con la documentación oficial

const { sendConversionEvent } = require('./src/lib/meta-conversions');
const { hashEmail, hashPhone, hashFirstName } = require('./src/utils/hashing');

// Ejemplo completo según la documentación oficial de Meta
const eventDataComplete = {
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
  contentIds: ['product123'],
  contentName: 'Product Name',
  // Nuevos parámetros según documentación oficial
  attributionShare: '0.3', // Para attribution_data
  originalEventName: 'Purchase', // Para original_event_data
  originalEventTime: 1755799452, // Para original_event_data
  orderId: 'order123', // Para original_event_data
  eventId: 'event123' // Para original_event_data
};

console.log('Formato del payload de Meta Conversions API:');
console.log('============================================');
console.log('');
console.log('Formato según ejemplo oficial de Meta:');
console.log('- fbc, fbp: valores directos (no arrays)');
console.log('- em, ph, fn: arrays (pueden contener null)');
console.log('- email, phone, firstName se hashearán automáticamente');
console.log('- attribution_data: objeto con attribution_share');
console.log('- original_event_data: objeto con event_name, event_time, etc.');
console.log('');

// El evento se enviará con el formato correcto según el ejemplo oficial:
// {
//   "data": [{
//     "event_name": "Purchase",
//     "event_time": 1755799452,
//     "action_source": "website",
//     "user_data": {
//       "em": ["7b17fb0bd173f625b58636fb796407c22b3d16fc78302d79f0fd30c2fc2fc068"],
//       "ph": [null],
//       "fbc": null,
//       "fn": [null],
//       "fb_login_id": null
//     },
//     "attribution_data": {
//       "attribution_share": "0.3"
//     },
//     "custom_data": {
//       "currency": "USD",
//       "value": "142.52"
//     },
//     "original_event_data": {
//       "event_name": "Purchase",
//       "event_time": 1755799452
//     }
//   }]
// }

// Ejemplo de uso:
// sendConversionEvent('Purchase', eventDataComplete);