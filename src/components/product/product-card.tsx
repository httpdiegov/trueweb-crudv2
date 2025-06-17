
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

  // Helper function to normalize image URLs (in case some slip through)
  const normalizeImageUrl = (url: string | undefined): string => {
    if (!url) return placeholderUrl;
    
    // Only normalize if the URL contains -bw followed by a single digit
    // and not already followed by another digit (to avoid double-normalization)
    return url.replace(/(-bw)(\d)(?=\D|$)/i, (match, prefix, num) => {
      return `${prefix}0${num}`;
    });
  };

  const determineInitialImageUrl = (): string => {
    try {
      // Try to use the first BW image if available
      if (prenda.imagenes_bw && prenda.imagenes_bw.length > 0 && prenda.imagenes_bw[0]?.url) {
        const bwUrl = normalizeImageUrl(prenda.imagenes_bw[0].url);
        console.log('Using BW image:', bwUrl);
        return bwUrl;
      }
      
      // Fall back to color images if no BW images
      if (prenda.imagenes && prenda.imagenes.length > 0 && prenda.imagenes[0]?.url) {
        const colorUrl = prenda.imagenes[0].url;
        console.log('Using color image:', colorUrl);
        return colorUrl;
      }
      
      console.log('No images available, using placeholder');
      return placeholderUrl;
    } catch (error) {
      console.error('Error determining initial image URL:', error);
      return placeholderUrl;
    }
  };

  const [imageUrl, setImageUrl] = useState(determineInitialImageUrl());
  const [imageError, setImageError] = useState(false);

  // Update image URL when product data changes
  useEffect(() => {
    const newImageUrl = determineInitialImageUrl();
    console.log('Image data changed for product:', {
      id: prenda.id,
      hasImages: prenda.imagenes && prenda.imagenes.length > 0,
      hasBwImages: prenda.imagenes_bw && prenda.imagenes_bw.length > 0,
      newImageUrl
    });
    
    setImageUrl(newImageUrl);
    setImageError(false);
  }, [
    prenda.id,
    prenda.imagenes,
    prenda.imagenes_bw
  ]);

  const imageAiHint = `${prenda.categoria_nombre?.toLowerCase() || 'ropa'} ${prenda.nombre_prenda?.split(" ")[0]?.toLowerCase() || 'producto'}`.substring(0,20);

  return (
    <Link
      href={`/products/${prenda.sku}`}
      className="block group"

    >
      <div className="relative w-full overflow-hidden bg-muted aspect-square group">
        {!imageError ? (
          <Image
            src={imageUrl}
            alt={prenda.nombre_prenda}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
            className={`object-cover transition-opacity duration-300 ${
              prenda.stock === 0 ? 'opacity-70' : ''
            }`}
            data-ai-hint={imageAiHint}
            priority={prenda.id < 7} 
            key={prenda.id}
            onError={(e) => {
              console.error(`Failed to load image: ${imageUrl}`);
              console.log('Image error details:', e);
              
              // Try to fall back to the first color image if we were trying to show a BW image
              if (imageUrl.includes('-bw') && prenda.imagenes?.[0]?.url) {
                const fallbackUrl = prenda.imagenes[0].url;
                console.log('Falling back to first color image:', fallbackUrl);
                setImageUrl(fallbackUrl);
              } else if (prenda.imagenes_bw?.[0]?.url && !imageUrl.includes('-bw')) {
                // If we were showing a color image that failed, try the first BW image
                const fallbackUrl = prenda.imagenes_bw[0].url;
                console.log('Falling back to first BW image:', fallbackUrl);
                setImageUrl(fallbackUrl);
              } else {
                console.log('No fallback image available, showing error state');
                setImageError(true);
              }
            }}
          />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <span className="text-gray-400 text-sm">Imagen no disponible</span>
          </div>
        )}
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
