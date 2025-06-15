
'use client';

import Link from 'next/link';
import type { Prenda } from '@/types';
import { ImageCarousel } from '@/components/ui/image-carousel';
import { useState, useEffect } from 'react';

interface ProductCardProps {
  prenda: Prenda;
}

export function ProductCard({ prenda }: ProductCardProps) {
  const placeholderUrl = `https://placehold.co/400x400`;

  // Combinar imágenes BW y a color, priorizando las BW
  const allImages = [
    ...(prenda.imagenes_bw || []),
    ...(prenda.imagenes || [])
  ].filter((img, index, self) => 
    index === self.findIndex((t) => t.url === img.url)
  );
  
  // Si no hay imágenes, usar el placeholder
  const imagesToShow = allImages.length > 0 
    ? allImages.map(img => ({
        url: img.url,
        alt: prenda.nombre_prenda
      }))
    : [{ url: placeholderUrl, alt: 'Imagen no disponible' }];

  // Eliminamos el estado de imagen actual ya que ahora lo maneja el carrusel
  const imageAiHint = `${prenda.categoria_nombre?.toLowerCase() || 'ropa'} ${prenda.nombre_prenda?.split(" ")[0]?.toLowerCase() || 'producto'}`.substring(0,20);

  return (
    <Link
      href={`/products/${prenda.sku}`}
      className="block group"
    >
      <div className="relative w-full overflow-hidden bg-muted aspect-square">
        <ImageCarousel 
          images={imagesToShow}
          className="w-full h-full"
          showDots={imagesToShow.length > 1}
          showArrows={imagesToShow.length > 1}
          autoPlay={false}
        />
      </div>
      <div className="mt-2 text-center">
        <h3 className="text-xs sm:text-sm font-medium text-foreground truncate group-hover:underline">
          {prenda.nombre_prenda}
        </h3>
        {prenda.talla_nombre && (
           <p className="text-xs text-muted-foreground mt-0.5">{prenda.talla_nombre}</p>
        )}
        <p className="text-sm font-semibold text-foreground mt-0.5">S/{prenda.precio.toFixed(2)}</p>
      </div>
    </Link>
  );
}
