
'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { Prenda } from '@/types';
import { useState, useEffect } from 'react';

interface ProductCardProps {
  prenda: Prenda;
}

export function ProductCard({ prenda }: ProductCardProps) {
  const placeholderUrl = `https://placehold.co/400x400.png`;

  const determineInitialImageUrl = () => {
    // Siempre intentar mostrar la primera imagen BW
    if (prenda.imagenes_bw && prenda.imagenes_bw.length > 0) {
      return prenda.imagenes_bw[0].url;
    }
    // Si no hay imágenes BW disponibles, usar la imagen a color
    if (prenda.imagenes && prenda.imagenes.length > 0) {
      return prenda.imagenes[0].url;
    }
    return placeholderUrl;
  };

  const [initialImageUrl, setInitialImageUrl] = useState(determineInitialImageUrl());
  const [currentImageUrl, setCurrentImageUrl] = useState(initialImageUrl);

  useEffect(() => {
    const newInitialUrl = determineInitialImageUrl();
    setInitialImageUrl(newInitialUrl);
    setCurrentImageUrl(newInitialUrl);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prenda.id, prenda.imagenes, prenda.imagenes_bw]);

  const handleMouseEnter = () => {
    // Si hay más de una imagen BW, mostrar la segunda al hacer hover
    if (prenda.imagenes_bw && prenda.imagenes_bw.length > 1) {
      setCurrentImageUrl(prenda.imagenes_bw[1].url);
    } 
    // Si hay solo una imagen BW, no hacer nada al hacer hover
    // Si no hay imágenes BW, mostrar la segunda imagen a color al hacer hover
    else if (prenda.imagenes && prenda.imagenes.length > 1) {
      setCurrentImageUrl(prenda.imagenes[1].url);
    }
    // Si no hay imágenes alternativas, no hacer nada al hacer hover
  };

  const handleMouseLeave = () => {
    setCurrentImageUrl(initialImageUrl);
  };

  const imageAiHint = `${prenda.categoria_nombre?.toLowerCase() || 'ropa'} ${prenda.nombre_prenda?.split(" ")[0]?.toLowerCase() || 'producto'}`.substring(0,20);

  return (
    <Link
      href={`/products/${prenda.sku}`}
      className="block group"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="relative w-full overflow-hidden bg-muted aspect-square group">
        <Image
          src={currentImageUrl}
          alt={prenda.nombre_prenda}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
          className={`object-cover transition-opacity duration-300 ${
            prenda.stock === 0 ? 'opacity-70' : ''
          }`}
          data-ai-hint={imageAiHint}
          priority={prenda.id < 7 && currentImageUrl === initialImageUrl} 
          key={currentImageUrl}
        />
        {prenda.stock === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <div className="bg-red-600 text-white text-xs sm:text-sm font-bold uppercase tracking-wider px-3 py-1.5 transform -rotate-12 scale-110">
              SOLD OUT
            </div>
          </div>
        )}
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
