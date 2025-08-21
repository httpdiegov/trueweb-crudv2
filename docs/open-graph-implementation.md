# Implementación de Open Graph Tags

## Descripción

Se han implementado meta tags Open Graph dinámicos en las páginas de productos para mejorar la vista previa cuando se comparten enlaces en redes sociales como Facebook, WhatsApp, LinkedIn y Twitter.

## Funcionalidad

Cuando alguien comparte el enlace de una prenda, ahora aparecerá:
- **Imagen**: La imagen principal del producto (en lugar del icono genérico)
- **Título**: Nombre de la prenda
- **Descripción**: Información completa incluyendo categoría y precio
- **URL**: Enlace directo al producto

## Implementación Técnica

### Archivo Modificado
- `src/app/(main)/products/[sku]/page.tsx`

### Función `generateMetadata`

```typescript
export async function generateMetadata({
  params,
}: {
  params: Promise<{ sku: string }>
}): Promise<Metadata> {
  // Obtiene datos del producto dinámicamente
  // Genera metadata específica para cada producto
}
```

### Meta Tags Generados

#### Open Graph (Facebook, WhatsApp, LinkedIn)
- `og:title`: Nombre de la prenda
- `og:description`: Descripción completa con precio
- `og:image`: Imagen principal del producto (1200x630px)
- `og:url`: URL canónica del producto
- `og:site_name`: "True Vintage"
- `og:locale`: "es_PE"
- `og:type`: "website"

#### Twitter Cards
- `twitter:card`: "summary_large_image"
- `twitter:title`: Nombre de la prenda
- `twitter:description`: Descripción completa
- `twitter:images`: Imagen principal del producto

## Características

### 🖼️ **Imagen Dinámica**
- Usa la primera imagen disponible del producto
- Fallback a imagen placeholder si no hay imágenes
- URLs absolutas para compatibilidad con redes sociales
- Dimensiones optimizadas (1200x630px)

### 📝 **Contenido Dinámico**
- Título: Nombre exacto de la prenda
- Descripción: Incluye categoría y precio en soles peruanos
- URL canónica con dominio truevintage.pe

### 🛡️ **Manejo de Errores**
- Metadata de fallback si el producto no existe
- Manejo seguro de imágenes faltantes
- Logs de errores para debugging

### 🌐 **Compatibilidad**
- Facebook y Meta platforms
- WhatsApp
- LinkedIn
- Twitter/X
- Telegram
- Discord

## Ejemplo de Resultado

Cuando se comparte un enlace como `https://truevintage.pe/products/ABC123`, aparecerá:

```
[IMAGEN DEL PRODUCTO]
Camiseta Vintage Nike 90s - True Vintage
Camiseta Vintage Nike 90s - Camisetas | Precio: S/89.90 | True Vintage Perú
truevintage.pe
```

## Validación

Puedes validar la implementación usando:

### Facebook Sharing Debugger
1. Ir a: https://developers.facebook.com/tools/debug/
2. Ingresar URL del producto
3. Verificar que aparezcan imagen y datos correctos

### Twitter Card Validator
1. Ir a: https://cards-dev.twitter.com/validator
2. Ingresar URL del producto
3. Verificar preview de Twitter Card

### LinkedIn Post Inspector
1. Ir a: https://www.linkedin.com/post-inspector/
2. Ingresar URL del producto
3. Verificar preview de LinkedIn

## Beneficios

✅ **Mayor Engagement**: Las imágenes atraen más clics
✅ **Mejor UX**: Los usuarios ven exactamente qué producto se comparte
✅ **Profesionalismo**: La marca se ve más establecida
✅ **SEO Social**: Mejor indexación en redes sociales
✅ **Conversiones**: Más probabilidad de compra al ver el producto

## Notas Técnicas

- La función `generateMetadata` se ejecuta en el servidor
- Los datos se obtienen dinámicamente de la base de datos
- Las imágenes deben ser accesibles públicamente
- Se usa el dominio `truevintage.pe` para URLs canónicas
- Compatible con Next.js App Router

## Mantenimiento

- Las imágenes deben mantener buena calidad
- Verificar periódicamente con los validadores
- Monitorear logs de errores en la consola
- Actualizar URLs si cambia el dominio principal