
import { fetchProductById } from '@/app/actions/product-actions';
import { ProductImageGallery } from '@/components/product/product-image-gallery';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { PackageCheck, Tag, Ruler, Instagram, ChevronDown, MessageCircle } from 'lucide-react';
import { AddToCartWrapper } from '@/components/product/add-to-cart-wrapper';
import { WhatsAppBuyButton } from '@/components/product/whatsapp-buy-button';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Imagen } from '@/types';
import type { Metadata } from 'next';
import { ProductPageClient } from '@/components/product/product-page-client';
import Script from 'next/script';

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
    
  const whatsappMessage = encodeURIComponent(
`Hola, quisiera adquirir la prenda:

*${prenda.nombre_prenda}* (SKU: ${prenda.sku})
Precio: S/${prenda.precio.toFixed(2)}

Enlace directo: ${productUrl}`
  );
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
      <>
        <Script
          id="product-structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData)
          }}
        />
        <div className="container mx-auto max-w-screen-xl px-4 py-8 md:py-12">
          <ProductPageClient product={{
            id: prenda.id,
            sku: prenda.sku,
            nombre_prenda: prenda.nombre_prenda,
            precio: prenda.precio,
            categoria_nombre: prenda.categoria_nombre
          }} />
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          <div>
            <ProductImageGallery images={colorImages} productName={prenda.nombre_prenda} />
          </div>
          <div className="flex flex-col">
            <h1 className="text-2xl lg:text-3xl font-semibold mb-2 text-foreground">
              {prenda.nombre_prenda}
            </h1>
            {prenda.drop_name && (
              <p className="text-sm text-muted-foreground mb-1">Colección: {prenda.drop_name}</p>
            )}
            <p className="text-xs text-muted-foreground mb-4">SKU: {prenda.sku}</p>

            <p className="text-2xl font-bold text-foreground mb-6">S/{prenda.precio.toFixed(2)}</p>

            <div className="space-y-4 mb-6">
              {prenda.categoria_nombre && (
                <div className="flex items-center gap-2">
                  <Tag className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium text-sm">Categoría:</span>
                  <Badge variant="outline" className="font-normal">{prenda.categoria_nombre}</Badge>
                </div>
              )}
              {prenda.talla_nombre && (
                <div className="flex items-center gap-2">
                  <Ruler className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium text-sm">Talla:</span>
                  <Badge variant="outline" className="font-normal">{prenda.talla_nombre}</Badge>
                </div>
              )}
              <div className="flex items-center gap-2">
                <PackageCheck className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium text-sm">Stock:</span>
                <span className="text-sm">{prenda.stock > 0 ? `${prenda.stock} unidades` : 'Agotado'}</span>
              </div>

            </div>
            
            {(prenda.caracteristicas || prenda.medidas) && <Separator className="my-6" />}

            <div>
              {prenda.caracteristicas && (
                <div>
                  <h3 className="text-lg font-medium mb-1">Características</h3>
                  <div className="text-sm text-muted-foreground mb-4 space-y-1">
                    {prenda.caracteristicas.split('\n').map((line, i) => (
                      <p key={i} className="whitespace-pre-line">{line}</p>
                    ))}
                  </div>
                </div>
              )}
              {prenda.medidas && (
                <div>
                  <h3 className="text-lg font-medium mb-1">Medidas</h3>
                  <div className="text-sm text-muted-foreground mb-4 space-y-1">
                    {prenda.medidas.split('\n').map((line, i) => (
                      <p key={i} className="whitespace-pre-line">{line}</p>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Guía de tallas */}
              <Collapsible className="mb-4">
                <CollapsibleTrigger className="flex items-center justify-between w-full p-3 text-left bg-muted/50 hover:bg-muted rounded-md transition-colors">
                  <span className="text-sm font-medium">Guía de tallas</span>
                  <ChevronDown className="h-4 w-4 transition-transform duration-200 data-[state=open]:rotate-180" />
                </CollapsibleTrigger>
                <CollapsibleContent className="px-3 pb-3">
                  <div className="text-sm text-muted-foreground space-y-2 mt-2">
                    <p className="font-medium text-foreground">¿Cómo elegir tu talla?</p>
                    <p>• Las prendas vintage pueden tener tallaje diferente al actual</p>
                    <p>• Siempre revisa las medidas específicas de cada prenda</p>
                    <p>• Compara con una prenda similar que tengas en casa</p>
                    <p>• En caso de duda, contáctanos por WhatsApp o Instagram</p>
                    
                    {/* Imagen de guía de tallas específica por categoría */}
                    {prenda.categoria_nombre?.toLowerCase() === 'trackpants' && (
                      <div className="mt-4 mb-4">
                        <img 
                          src="/medidas/trackpants/trackpants.png" 
                          alt="Guía de medidas para trackpants" 
                          className="w-full max-w-md mx-auto rounded-lg border border-gray-200 shadow-sm"
                        />
                      </div>
                    )}
                    
                    {prenda.categoria_nombre?.toLowerCase() === 'jackets' && (
                      <div className="mt-4 mb-4">
                        <img 
                          src="/medidas/jackets/jackets.png" 
                          alt="Guía de medidas para jackets" 
                          className="w-full max-w-md mx-auto rounded-lg border border-gray-200 shadow-sm"
                        />
                      </div>
                    )}
                    
                    {prenda.categoria_nombre?.toLowerCase() === 'hoodies' && (
                      <div className="mt-4 mb-4">
                        <img 
                          src="/medidas/hoodies/hoodies.png" 
                          alt="Guía de medidas para hoodies" 
                          className="w-full max-w-md mx-auto rounded-lg border border-gray-200 shadow-sm"
                        />
                      </div>
                    )}
                    
                    <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded text-amber-800">
                      <p className="text-xs font-medium">💡 Tip: Las medidas están tomadas con la prenda extendida sobre una superficie plana.</p>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
              <div className="mt-4 text-sm text-muted-foreground space-y-1">
                <p>➤ Revisar bien fotos y medidas antes de comprar.</p>
                <p>➤ Las prendas son lavadas antes de su venta.</p>
                <p>➤ Dudas al privado.</p>
                <p>➤ Envíos a nivel nacional por Olva Courier, Shalom e Indriver(Lima).</p>
              </div>
            </div>
            
            {prenda.stock > 0 && prenda.separado !== 1 ? (
              <>
                <div className="mt-8 flex flex-col gap-3 md:flex-row">
                  <AddToCartWrapper product={{
                    id: prenda.id,
                    sku: prenda.sku,
                    nombre_prenda: prenda.nombre_prenda,
                    precio: prenda.precio,
                    imagenes: prenda.imagenes || [],
                    imagenes_bw: prenda.imagenes_bw || []
                  }} className="w-full md:w-auto" />
                  <WhatsAppBuyButton 
                    href={whatsappLink} 
                    sku={prenda.sku} 
                    precio={prenda.precio} 
                    productName={prenda.nombre_prenda}
                  />
                </div>

                <div className="mt-6 text-xs text-muted-foreground text-center md:text-left">
                  <p>
                    ¿Sin WhatsApp? Envíanos foto de la prenda en Instagram{' '}
                    <Link
                      href="https://www.instagram.com/truevintage.pe"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline font-medium inline-flex items-center gap-1"
                    >
                      <Instagram className="h-3 w-3" />
                      Instagram
                    </Link>{' '}
                    o al +51 940866278.
                  </p>
                </div>
              </>
            ) : prenda.separado === 1 ? (
              <div className="mt-8 p-4 bg-orange-50 border border-orange-200 rounded-md text-center">
                <p className="text-orange-700 font-medium">Esta prenda fue separada por otro cliente</p>
                <p className="text-sm text-orange-600 mt-1">Escribenos al privado para avisarte en caso se libere</p>
                <p className="text-sm text-orange-600 mt-2">Puedes separar cualquier prenda con solo S/30! Tienes 1 semana para cancelar el pago completo</p>
                <p className="text-sm text-orange-600 mt-2">Entérate de nuevas prendas en nuestras redes sociales</p>
                <div className="mt-3 flex flex-col sm:flex-row gap-2 justify-center">
                  <Button variant="outline" size="sm" asChild>
                    <Link 
                      href="https://www.instagram.com/truevintage.pe" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-1"
                    >
                      <Instagram className="h-4 w-4" /> Instagram
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link 
                      href={whatsappLink}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-1"
                    >
                      <MessageCircle className="h-4 w-4" /> WhatsApp
                    </Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-md text-center">
                <p className="text-red-700 font-medium">Esta prenda está agotada</p>
                <p className="text-sm text-red-600 mt-1">Entérate de lo nuevo en nuestro Instagram</p>
                <div className="mt-3">
                  <Button variant="outline" size="sm" asChild>
                    <Link 
                      href="https://www.instagram.com/truevintage.pe" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 mx-auto"
                    >
                      <Instagram className="h-4 w-4" /> Instagram
                    </Link>
                  </Button>
                </div>
              </div>
            )}
            
            <Link href="/" className="text-primary hover:underline mt-8 text-center md:text-left text-sm">
              &larr; Volver al catálogo
            </Link>
          </div>
        </div>
        </div>
      </>
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
