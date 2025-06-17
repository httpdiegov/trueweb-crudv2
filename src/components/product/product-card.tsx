
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

  // Simple URL validation and cleanup
  const cleanImageUrl = (url: string | undefined): string | null => {
    if (!url) return null;
    
    // Remove any whitespace and normalize the URL
    const cleanUrl = url.trim();
    
    // Basic URL validation
    try {
      new URL(cleanUrl);
      return cleanUrl;
    } catch {
      console.warn('Invalid image URL:', cleanUrl);
      return null;
    }
  };

  const getBestAvailableImage = (): string => {
    // Try to get the bw01 image first
    const bw01Image = prenda.imagenes_bw?.find(img => 
      img.url && (img.url.includes('-bw01.') || img.url.includes('-bw1.'))
    );
    
    if (bw01Image?.url) {
      const cleanUrl = cleanImageUrl(bw01Image.url);
      if (cleanUrl) return cleanUrl;
    }
    
    // If no bw01, try any other BW image
    const validBwImage = prenda.imagenes_bw?.find(img => cleanImageUrl(img.url));
    if (validBwImage?.url) {
      return cleanImageUrl(validBwImage.url) || placeholderUrl;
    }
    
    // Fall back to the first valid color image
    const validColorImage = prenda.imagenes?.find(img => cleanImageUrl(img.url));
    if (validColorImage?.url) {
      return cleanImageUrl(validColorImage.url) || placeholderUrl;
    }
    
    // If no valid images found, use placeholder
    return placeholderUrl;
  };

  const [imageUrl, setImageUrl] = useState<string>(() => getBestAvailableImage());
  const [imageError, setImageError] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Update image URL when product data changes
  useEffect(() => {
    const newImageUrl = getBestAvailableImage();
    setImageUrl(newImageUrl);
    setImageError(false);
    setIsLoading(true);
  }, [prenda.id, JSON.stringify(prenda.imagenes), JSON.stringify(prenda.imagenes_bw)]);

  const imageAiHint = `${prenda.categoria_nombre?.toLowerCase() || 'ropa'} ${prenda.nombre_prenda?.split(" ")[0]?.toLowerCase() || 'producto'}`.substring(0,20);

  return (
    <Link
      href={`/products/${prenda.sku}`}
      className="block group"

    >
      <div className="relative w-full overflow-hidden bg-muted aspect-square group">
        {isLoading && !imageError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        )}
        
        <Image
          src={imageError ? placeholderUrl : imageUrl}
          alt={prenda.nombre_prenda}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
          className={`object-cover transition-opacity duration-300 ${
            prenda.stock === 0 ? 'opacity-70' : ''
          } ${isLoading ? 'opacity-0' : 'opacity-100'}`}
          data-ai-hint={imageAiHint}
          priority={prenda.id < 7}
          key={`${prenda.id}-${imageUrl}`}
          onLoadingComplete={() => setIsLoading(false)}
          onError={(e) => {
            console.warn('Failed to load image:', {
              url: imageUrl,
              productId: prenda.id,
              sku: prenda.sku,
              error: e?.nativeEvent?.type || 'Unknown error'
            });
            
            // Try to find a fallback image
            const fallbackImage = [
              ...(prenda.imagenes_bw || []),
              ...(prenda.imagenes || [])
            ].find(img => img.url && img.url !== imageUrl && cleanImageUrl(img.url));
            
            if (fallbackImage?.url) {
              setImageUrl(cleanImageUrl(fallbackImage.url) || placeholderUrl);
              setIsLoading(true);
            } else {
              setImageError(true);
              setIsLoading(false);
            }
          }}
        />
        
        {imageError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 p-4 text-center">
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
