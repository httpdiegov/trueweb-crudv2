"use client";

import { ProductImageGalleryOptimized } from '@/components/product/product-image-gallery-optimized';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { PackageCheck, Tag, Ruler, ChevronDown, MessageCircle } from 'lucide-react';
import { AddToCartWrapper } from '@/components/product/add-to-cart-wrapper';
import Link from 'next/link';
import type { Imagen, Prenda } from '@/types';
import Script from 'next/script';
import { memo } from 'react';

interface ProductDetailClientOptimizedProps {
  prenda: Prenda;
  colorImages: Imagen[];
  structuredData: any;
  whatsappLink: string;
}

// Componente de información del producto memoizado
const ProductInfo = memo(({ prenda }: { prenda: Prenda }) => (
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
));

ProductInfo.displayName = 'ProductInfo';

// Componente de características memoizado
const ProductFeatures = memo(({ prenda }: { prenda: Prenda }) => (
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
  </div>
));

ProductFeatures.displayName = 'ProductFeatures';

// Guía de tallas memoizada
const SizeGuide = memo(() => (
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
        <p>• Si tienes dudas, contáctanos por WhatsApp</p>
      </div>
    </CollapsibleContent>
  </Collapsible>
));

SizeGuide.displayName = 'SizeGuide';

// Botones de acción memoizados
const ActionButtons = memo(({ 
  prenda, 
  whatsappLink 
}: { 
  prenda: Prenda; 
  whatsappLink: string; 
}) => {
  const isAvailable = prenda.stock > 0 && prenda.separado !== 1;
  const buttonText = prenda.separado === 1 ? 'Separado' : isAvailable ? 'Comprar por WhatsApp' : 'Agotado';
  
  return (
    <div className="space-y-3">
      <AddToCartWrapper 
        product={prenda}
        className="w-full" 
      />
      <Link 
        href={whatsappLink}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        <Button 
          className="w-full bg-green-600 hover:bg-green-700 text-white"
          disabled={!isAvailable}
        >
          <MessageCircle className="mr-2 h-4 w-4" />
          {buttonText}
        </Button>
      </Link>
    </div>
  );
});

ActionButtons.displayName = 'ActionButtons';

export default function ProductDetailClientOptimized({ 
  prenda, 
  colorImages, 
  structuredData, 
  whatsappLink 
}: ProductDetailClientOptimizedProps) {
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
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Galería de imágenes optimizada */}
          <div>
            <ProductImageGalleryOptimized 
              images={colorImages} 
              productName={prenda.nombre_prenda} 
            />
          </div>
          
          {/* Información del producto */}
          <div className="flex flex-col">
            <h1 className="text-2xl lg:text-3xl font-semibold mb-2 text-foreground">
              {prenda.nombre_prenda}
            </h1>
            {prenda.drop_name && (
              <p className="text-sm text-muted-foreground mb-1">Colección: {prenda.drop_name}</p>
            )}
            <p className="text-xs text-muted-foreground mb-4">SKU: {prenda.sku}</p>
            <p className="text-2xl font-bold text-foreground mb-6">S/{prenda.precio.toFixed(2)}</p>
            
            {/* Información básica del producto */}
            <ProductInfo prenda={prenda} />
            
            {/* Separador si hay características o medidas */}
            {(prenda.caracteristicas || prenda.medidas) && <Separator className="my-6" />}
            
            {/* Características y medidas */}
            <ProductFeatures prenda={prenda} />
            
            {/* Guía de tallas */}
            <SizeGuide />
            
            {/* Botones de acción */}
            <ActionButtons prenda={prenda} whatsappLink={whatsappLink} />
            
            {/* Información adicional */}
            <div className="mt-8 pt-6 border-t space-y-2 text-sm text-muted-foreground">
              <p>• Todas nuestras prendas son piezas únicas vintage</p>
              <p>• Envíos a todo Lima y provincias</p>
              <p>• Consulta disponibilidad por WhatsApp</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
