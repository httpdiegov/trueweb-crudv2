
import { fetchProductById } from '@/app/actions/product-actions';
import { ProductImageGallery } from '@/components/product/product-image-gallery';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Truck, PackageCheck, Tag, Ruler, MessageCircle, Instagram } from 'lucide-react';
import { AddToCartWrapper } from '@/components/product/add-to-cart-wrapper';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import type { Imagen } from '@/types';



export default async function ProductDetailPage({
  params,
}: {
  params: { sku: string }
}) {
  try {
    // Destructure params asynchronously
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

    return (
      <div className="container mx-auto max-w-screen-xl px-4 py-8 md:py-12">
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
              <div className="mt-4 text-sm text-muted-foreground space-y-1">
                <p>➤ Revisar bien fotos y medidas antes de comprar.</p>
                <p>➤ Las prendas son lavadas antes de su venta.</p>
                <p>➤ Dudas al privado.</p>
                <p>➤ Envíos a nivel nacional por Olva Courier, Shalom e Indriver(Lima).</p>
              </div>
            </div>
            
            {prenda.stock > 0 ? (
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
                  <Button size="lg" variant="outline" asChild className="w-full md:w-auto border-green-600 text-green-700 hover:bg-green-50 hover:text-green-800">
                    <Link href={whatsappLink} target="_blank" rel="noopener noreferrer">
                      <MessageCircle className="mr-2 h-5 w-5" />
                      Comprar por WhatsApp
                    </Link>
                  </Button>
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
                      @truevintage.pe
                    </Link>{' '}
                    o al +51 940866278.
                  </p>
                </div>
              </>
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
                      <Instagram className="h-4 w-4" /> @truevintage.pe
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
