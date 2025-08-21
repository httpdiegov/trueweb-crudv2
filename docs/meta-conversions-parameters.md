# Documentación de Parámetros de la API de Conversiones de Meta

## Parámetros de User Data

### Parámetros Básicos de Identificación

#### `email` (em)
- **Tipo**: Array de strings hasheados con SHA-256
- **Impacto**: Mejora significativamente la coincidencia de usuarios
- **Formato**: Se hashea automáticamente en nuestra implementación
- **Ejemplo**: `["7d865e959b2466918c9863afca942d0fb89d7c9ac0c99bafc3749504ded97730"]`

#### `phone` (ph)
- **Tipo**: Array de strings hasheados con SHA-256
- **Impacto**: Excelente para coincidencia de usuarios móviles
- **Formato**: Se hashea automáticamente (incluir código de país)
- **Ejemplo**: `["254aa248acb47dd654ca3ea53f48c2c26d641d23d7e2e93a1ec56ab7e3eda4b8"]`

#### `firstName` (fn)
- **Tipo**: Array de strings hasheados con SHA-256
- **Impacto**: Mejora la precisión de coincidencia cuando se combina con otros datos
- **Formato**: Se hashea automáticamente en minúsculas
- **Ejemplo**: `["50ae61e841fac4e8f9e40baf2ad36ec868922ea48368c18f9535e47db56dd7fb"]`

#### `externalId` (external_id)
- **Tipo**: Array de strings hasheados con SHA-256
- **Impacto**: Permite vincular eventos con sistemas internos del anunciante
- **Formato**: Se hashea automáticamente
- **Ejemplo**: `["f660ab912ec121d1b1e928a0bb4bc61b15f5ad44d5efdc4e1c92a25e99b8e44a"]`

### Parámetros de Seguimiento de Facebook

#### `fbp` (Facebook Browser ID)
- **Tipo**: String directo (no array)
- **Impacto**: Crítico para vincular eventos del servidor con actividad del navegador
- **Formato**: Cookie `_fbp` del navegador
- **Ejemplo**: `"fb.1.1596403881668.1116446470"`

#### `fbc` (Facebook Click ID)
- **Tipo**: String directo o null (no array)
- **Impacto**: Esencial para atribuir conversiones a clics en anuncios de Facebook
- **Formato**: Cookie `_fbc` del navegador o parámetro `fbclid` de URL
- **Ejemplo**: `"fb.1.1554763741205.AbCdEfGhIjKlMnOpQrStUvWxYz1234567890"`
- **Nota**: Puede ser `null` si no hay click ID disponible

### Parámetros Técnicos

#### `clientIpAddress` (client_ip_address)
- **Tipo**: String
- **Impacto**: Mejora la geolocalización y coincidencia de usuarios
- **Formato**: Dirección IP del cliente
- **Ejemplo**: `"192.168.1.1"`

#### `userAgent` (client_user_agent)
- **Tipo**: String
- **Impacto**: Ayuda en la identificación del dispositivo y navegador
- **Formato**: User-Agent del navegador
- **Ejemplo**: `"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"`

## Parámetros de Attribution Data

#### `attributionShare` (attribution_share)
- **Tipo**: Number (0.0 a 1.0)
- **Impacto**: Define qué porcentaje del valor de conversión atribuir a este evento
- **Uso**: Útil para modelos de atribución personalizados
- **Ejemplo**: `0.5` (50% del valor de conversión)

## Parámetros de Original Event Data

#### `originalEventName` (event_name)
- **Tipo**: String
- **Impacto**: Vincula eventos de servidor con eventos originales del pixel
- **Formato**: Nombre del evento original
- **Ejemplo**: `"Purchase"`

#### `originalEventTime` (event_time)
- **Tipo**: Number (Unix timestamp)
- **Impacto**: Permite sincronización temporal precisa entre eventos
- **Formato**: Timestamp Unix del evento original
- **Ejemplo**: `1640995200`

#### `orderId` (order_id)
- **Tipo**: String
- **Impacto**: Previene duplicación de eventos de compra
- **Formato**: ID único de la orden
- **Ejemplo**: `"order_12345"`

#### `eventId` (event_id)
- **Tipo**: String
- **Impacto**: Deduplicación de eventos entre pixel y API de conversiones
- **Formato**: ID único del evento
- **Ejemplo**: `"event_abc123"`

## Mejores Prácticas

### Para Máxima Calidad de Coincidencias:
1. **Siempre incluir**: `email`, `phone`, `fbp`, `fbc` (cuando esté disponible)
2. **Datos adicionales**: `firstName`, `externalId` para mayor precisión
3. **Información técnica**: `clientIpAddress`, `userAgent` para contexto

### Para Deduplicación:
1. **Usar `eventId`** para evitar eventos duplicados entre pixel y servidor
2. **Usar `orderId`** para transacciones únicas
3. **Sincronizar `originalEventTime`** con eventos del pixel

### Para Atribución:
1. **Configurar `attributionShare`** para modelos de atribución personalizados
2. **Vincular con `originalEventName`** para seguimiento completo

## Formato de Payload Completo

```javascript
{
  "data": [{
    "event_name": "Purchase",
    "event_time": 1640995200,
    "action_source": "website",
    "event_source_url": "https://example.com/checkout",
    "user_data": {
      "em": ["7d865e959b2466918c9863afca942d0fb89d7c9ac0c99bafc3749504ded97730"],
      "ph": ["254aa248acb47dd654ca3ea53f48c2c26d641d23d7e2e93a1ec56ab7e3eda4b8"],
      "fn": ["50ae61e841fac4e8f9e40baf2ad36ec868922ea48368c18f9535e47db56dd7fb"],
      "external_id": ["f660ab912ec121d1b1e928a0bb4bc61b15f5ad44d5efdc4e1c92a25e99b8e44a"],
      "fbp": "fb.1.1596403881668.1116446470",
      "fbc": "fb.1.1554763741205.AbCdEfGhIjKlMnOpQrStUvWxYz1234567890",
      "client_ip_address": "192.168.1.1",
      "client_user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    },
    "custom_data": {
      "value": 99.99,
      "currency": "USD",
      "content_ids": ["product_123"],
      "content_name": "Producto Ejemplo",
      "content_category": "Electrónicos",
      "content_type": "product",
      "num_items": 1
    },
    "attribution_data": {
      "attribution_share": 0.8
    },
    "original_event_data": {
      "event_name": "Purchase",
      "event_time": 1640995200,
      "order_id": "order_12345",
      "event_id": "event_abc123"
    }
  }]
}
```

## Notas Importantes

1. **Hashing Automático**: Nuestra implementación hashea automáticamente `email`, `phone`, `firstName` y `externalId`
2. **Formato de Arrays**: `em`, `ph`, `fn`, `external_id` deben ser arrays, incluso con un solo valor
3. **FBC Nullable**: `fbc` puede ser `null` si no hay click ID disponible
4. **Deduplicación**: Usar `eventId` y `orderId` para evitar eventos duplicados
5. **Calidad de Datos**: Más parámetros de identificación = mejor coincidencia de usuarios