import { fetchProductByIdOptimized } from '@/app/actions/product-actions-optimized';
import { notFound } from 'next/navigation';
import type { Imagen } from '@/types';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import ProductDetailClientOptimized from '@/components/product/product-detail-client-optimized';

// Generar metadata dinámica optimizada
export async function generateMetadata({
  params,
}: {
  params: Promise<{ sku: string }>
}): Promise<Metadata> {
  try {
    const { sku } = await params;
    const prenda = await fetchProductByIdOptimized(sku);
    
    if (!prenda) {
      return {
        title: 'Producto no encontrado - True Vintage',
        description: 'El producto que buscas no está disponible.',
      };
    }

    const primaryImage = prenda.imagenes && prenda.imagenes.length > 0 
      ? prenda.imagenes[0].url 
      : '/placeholder-product.jpg';
    
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

// Loading component optimizado
function ProductDetailSkeleton() {
  return (
    <div className="container mx-auto max-w-screen-xl px-4 py-8 md:py-12">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        <div className="aspect-[3/4] bg-gray-200 rounded-lg animate-pulse" />
        <div className="space-y-4">
          <div className="h-8 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse" />
          <div className="h-6 bg-gray-200 rounded w-1/3 animate-pulse" />
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function ProductDetailPageOptimized({
  params,
}: {
  params: Promise<{ sku: string }>
}) {
  try {
    const { sku } = await params;
    
    if (!sku) {
      console.error('No se proporcionó un SKU válido');
      notFound();
    }

    // Usar la función optimizada
    const prenda = await fetchProductByIdOptimized(sku);

    if (!prenda) {
      console.error('Producto no encontrado para SKU:', sku);
      notFound();
    }
    
    const productUrl = `https://truevintage.pe/products/${prenda.sku}`;

    const whatsappMessageDisponible = `Hola, quisiera adquirir la prenda:\n\n*${prenda.nombre_prenda}* (SKU: ${prenda.sku})\nPrecio: S/${prenda.precio.toFixed(2)}\n\nEnlace directo: ${productUrl}`;
    const whatsappMessageSeparado = `Hola, estoy interesad@ en la prenda *${prenda.nombre_prenda}* (SKU: ${prenda.sku}), veo que está separada. ¿Me podrías avisar si se libera?\n\nEnlace directo: ${productUrl}`;

    const whatsappMessage = encodeURIComponent(prenda.separado === 1 ? whatsappMessageSeparado : whatsappMessageDisponible);
    const whatsappLink = `https://wa.me/51940866278?text=${whatsappMessage}`;

    const colorImages: Imagen[] = prenda.imagenes || [];

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
      <Suspense fallback={<ProductDetailSkeleton />}>
        <ProductDetailClientOptimized 
          prenda={prenda}
          colorImages={colorImages}
          structuredData={structuredData}
          whatsappLink={whatsappLink}
        />
      </Suspense>
    );
  } catch (error) {
    console.error('Error en ProductDetailPage:', error);
    throw error;
  }
}

// Generar rutas estáticas de forma más eficiente
export async function generateStaticParams() {
  try {
    const { fetchProductsOptimized } = await import('@/app/actions/product-actions-optimized');
    const productos = await fetchProductsOptimized();
    
    if (!productos || productos.length === 0) {
      console.warn('No se encontraron productos para generar rutas estáticas');
      return [];
    }
    
    // Solo generar rutas para los primeros 50 productos más populares
    return productos.slice(0, 50).map((producto: { sku: string | number }) => ({
      sku: producto.sku.toString()
    }));
  } catch (error) {
    console.error('Error generando rutas estáticas de productos:', error);
    return [];
  }
}
