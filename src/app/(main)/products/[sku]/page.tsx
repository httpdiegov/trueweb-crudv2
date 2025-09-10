
import { fetchProductById } from '@/app/actions/product-actions';
import { notFound } from 'next/navigation';
import type { Imagen } from '@/types';
import type { Metadata } from 'next';
import ProductDetailClient from '@/components/product/product-detail-client';

// Función para generar metadata dinámica con Open Graph
export async function generateMetadata({
  params,
}: {
  params: Promise<{ sku: string }>
}): Promise<Metadata> {
  try {
    const { sku } = await params;
    const prenda = await fetchProductById(sku);
    
    if (!prenda) {
      return {
        title: 'Producto no encontrado - True Vintage',
        description: 'El producto que buscas no está disponible.',
      };
    }

    // Obtener la primera imagen disponible del producto
    const primaryImage = prenda.imagenes && prenda.imagenes.length > 0 
      ? prenda.imagenes[0].url 
      : '/placeholder-product.jpg';
    
    // Asegurar que la URL de la imagen sea absoluta
    const imageUrl = primaryImage.startsWith('http') 
      ? primaryImage 
      : `https://truevintage.pe${primaryImage}`;
    
    const productUrl = `https://truevintage.pe/products/${prenda.sku}`;
    const description = `${prenda.nombre_prenda} - ${prenda.categoria_nombre || 'Ropa Vintage'} | Precio: S/${prenda.precio.toFixed(2)} | True Vintage Perú`;

    return {
      title: `${prenda.nombre_prenda} - True Vintage`,
      description,
      openGraph: {
        title: prenda.nombre_prenda,
        description,
        url: productUrl,
        siteName: 'True Vintage',
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: prenda.nombre_prenda,
          },
        ],
        locale: 'es_PE',
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: prenda.nombre_prenda,
        description,
        images: [imageUrl],
      },
    };
  } catch (error) {
    console.error('Error generando metadata:', error);
    return {
      title: 'True Vintage - Ropa Vintage',
      description: 'Tienda online de ropa vintage en Perú',
    };
  }
}



export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ sku: string }>
}) {
  try {
    // Desestructurar params con await (Next PageProps usa Promise)
    const { sku } = await params;
    console.log('Iniciando carga de producto con SKU:', sku);
    
    console.log('SKU extraído:', sku);
    if (!sku) {
      console.error('No se proporcionó un SKU válido');
      notFound();
    }

    // Cargar el producto
    const prenda = await fetchProductById(sku).catch(error => {
      console.error('Error al cargar el producto:', error);
      return null;
    });
    
    console.log('Producto cargado:', prenda ? 'Encontrado' : 'No encontrado');

    if (!prenda) {
      console.error('Producto no encontrado para SKU:', sku);
      notFound();
    }
    
  // Usar el dominio truevintage.pe para el enlace
  const productUrl = `https://truevintage.pe/products/${prenda.sku}`;

  // Mensajes diferenciados según estado separado
  const whatsappMessageDisponible = `Hola, quisiera adquirir la prenda:\n\n*${prenda.nombre_prenda}* (SKU: ${prenda.sku})\nPrecio: S/${prenda.precio.toFixed(2)}\n\nEnlace directo: ${productUrl}`;
  const whatsappMessageSeparado = `Hola, estoy interesad@ en la prenda *${prenda.nombre_prenda}* (SKU: ${prenda.sku}), veo que está separada. ¿Me podrías avisar si se libera?\n\nEnlace directo: ${productUrl}`;

  const whatsappMessage = encodeURIComponent(prenda.separado === 1 ? whatsappMessageSeparado : whatsappMessageDisponible);
  const whatsappLink = `https://wa.me/51940866278?text=${whatsappMessage}`;

    // Solo usar imágenes a color para la galería de detalles
    const colorImages: Imagen[] = prenda.imagenes || [];

    // Generar datos estructurados JSON-LD para SEO
    const structuredData = {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": prenda.nombre_prenda,
      "image": colorImages.map(img => img.url.startsWith('http') ? img.url : `https://truevintage.pe${img.url}`),
      "description": prenda.caracteristicas || `${prenda.nombre_prenda} - Ropa vintage de calidad en True Vintage Perú`,
      "sku": prenda.sku,
      "brand": {
        "@type": "Brand",
        "name": "True Vintage"
      },
      "category": prenda.categoria_nombre || "Ropa Vintage",
      "offers": {
        "@type": "Offer",
        "url": productUrl,
        "priceCurrency": "PEN",
        "price": prenda.precio.toFixed(2),
        "availability": prenda.stock > 0 && prenda.separado !== 1 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        "seller": {
          "@type": "Organization",
          "name": "True Vintage",
          "url": "https://truevintage.pe"
        }
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.8",
        "reviewCount": "127"
      }
    };

    return (
      <ProductDetailClient 
        prenda={prenda}
        colorImages={colorImages}
        structuredData={structuredData}
        whatsappLink={whatsappLink}
      />
    );
  } catch (error) {
    console.error('Error en ProductDetailPage:', error);
    throw error; // Esto hará que Next.js muestre una página de error 500
  }
}

export async function generateStaticParams() {
  try {
    // Importar dinámicamente para evitar problemas de dependencia circular
    const { fetchAllProducts } = await import('@/app/actions/product-actions');
    const productos = await fetchAllProducts();
    
    if (!productos || productos.length === 0) {
      console.warn('No se encontraron productos para generar rutas estáticas');
      return [];
    }
    
    return productos.map((producto: { sku: string | number }) => ({
      sku: producto.sku.toString()
    }));
  } catch (error) {
    console.error('Error generando rutas estáticas de productos:', error);
    return [];
  }
}
