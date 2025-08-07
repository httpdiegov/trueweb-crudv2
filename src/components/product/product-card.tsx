
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
    
    try {
      // Remove any query parameters and hash
      let cleanUrl = url.split('?')[0].split('#')[0];
      
      // Ensure the URL is properly encoded
      cleanUrl = encodeURI(cleanUrl);
      
      // If it's already a full URL, return as is
      if (cleanUrl.startsWith('http')) {
        return cleanUrl;
      }
      
      // If it's a relative path, ensure it starts with a slash
      if (!cleanUrl.startsWith('/')) {
        cleanUrl = `/${cleanUrl}`;
      }
      
      // For local development, use the full URL
      if (process.env.NODE_ENV === 'development') {
        // Remove any double slashes that might cause issues
        cleanUrl = cleanUrl.replace(/([^:]\/)\/+/g, '$1');
        return `https://truevintageperu.com${cleanUrl}`;
      }
      
      // In production, use relative paths for Next.js optimization
      return cleanUrl;
    } catch (error) {
      console.error('Error cleaning image URL:', { url, error });
      return null;
    }
  };

  const getBestAvailableImage = (): { url: string; isBw01: boolean } => {
    // Try to get the bw01 image first
    if (prenda.imagenes_bw?.length) {
      // First try to find bw01 or bw1
      const bw01Image = prenda.imagenes_bw.find(img => 
        img?.url?.match(/-bw0?1\.(png|jpg|jpeg|webp)$/i)
      );
      
      // If we found a bw01 image, use it
      if (bw01Image?.url) {
        const cleanUrl = cleanImageUrl(bw01Image.url);
        if (cleanUrl) {
          return { url: cleanUrl, isBw01: true };
        }
      }
      
      // If no bw01, try any other BW image
      for (const img of prenda.imagenes_bw) {
        if (img?.url) {
          const cleanUrl = cleanImageUrl(img.url);
          if (cleanUrl) {
            return { 
              url: cleanUrl, 
              isBw01: img.url.includes('-bw01.') || img.url.includes('-bw1.') 
            };
          }
        }
      }
    }
    
    // Fall back to color images if no BW images available
    if (prenda.imagenes?.length) {
      for (const img of prenda.imagenes) {
        if (img?.url) {
          const cleanUrl = cleanImageUrl(img.url);
          if (cleanUrl) {
            return { url: cleanUrl, isBw01: false };
          }
        }
      }
    }
    
    // If no valid images found, use placeholder
    return { url: placeholderUrl, isBw01: false };
  };

  const [imageState, setImageState] = useState<{
    url: string;
    isBw01: boolean;
    isLoading: boolean;
    error: boolean;
  }>(() => ({
    ...getBestAvailableImage(),
    isLoading: true,
    error: false
  }));
  
  // Efecto para manejar la carga inicial y cambios en las imágenes
  useEffect(() => {
    // Clear any failed image caches for this product
    if (prenda.imagenes_bw?.length) {
      prenda.imagenes_bw.forEach(img => {
        if (img?.url) {
          const cleanUrl = cleanImageUrl(img.url);
          if (cleanUrl) {
            sessionStorage.removeItem(`failed:${cleanUrl}`);
          }
        }
      });
    }
    
    const bestImage = getBestAvailableImage();
    
    setImageState({
      ...bestImage,
      isLoading: true,
      error: false
    });
  }, [prenda.id, JSON.stringify(prenda.imagenes), JSON.stringify(prenda.imagenes_bw)]);





  return (
    <Link
      href={`/products/${prenda.sku}`}
      className="block group"

    >
      <div className="relative w-full overflow-hidden bg-muted aspect-square group">
        {imageState.isLoading && !imageState.error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        )}
        
        <Image
          src={imageState.url}
          alt={prenda.nombre_prenda || 'Producto'}
          fill
          className={`object-cover transition-opacity duration-300 ${imageState.isLoading ? 'opacity-0' : 'opacity-100'}`}
          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          quality={100}
          unoptimized={process.env.NODE_ENV === 'development'}
          onLoad={() => {
            setImageState(prev => ({ ...prev, isLoading: false }));
          }}
          onError={(e) => {
            // Mark this URL as failed in session storage
            if (imageState.url && imageState.url !== placeholderUrl) {
              sessionStorage.setItem(`failed:${imageState.url}`, 'true');
            }
            
            // Get all available images in order of preference
            const allImages = [];
            
            // 1. BW01 images first
            if (prenda.imagenes_bw?.length) {
              // First try to find bw01 or bw1
              const bw01Image = prenda.imagenes_bw.find(img => 
                img?.url?.match(/-bw0?1\.(png|jpg|jpeg|webp)$/i)
              );
              if (bw01Image?.url) {
                const cleanUrl = cleanImageUrl(bw01Image.url);
                if (cleanUrl) allImages.push({ url: cleanUrl, isBw01: true });
              }
              
              // Then add other BW images
              for (const img of prenda.imagenes_bw) {
                if (img?.url) {
                  const cleanUrl = cleanImageUrl(img.url);
                  if (cleanUrl && !cleanUrl.includes('bw01') && !cleanUrl.includes('bw1')) {
                    allImages.push({ url: cleanUrl, isBw01: false });
                  }
                }
              }
            }
            
            // 2. Then color images
            if (prenda.imagenes?.length) {
              for (const img of prenda.imagenes) {
                if (img?.url) {
                  const cleanUrl = cleanImageUrl(img.url);
                  if (cleanUrl) allImages.push({ url: cleanUrl, isBw01: false });
                }
              }
            }
            
            // Find the first image that hasn't failed yet and isn't the current one
            const nextImage = allImages.find(img => 
              img.url !== imageState.url && 
              !sessionStorage.getItem(`failed:${img.url}`)
            );
            
            if (nextImage) {
              setImageState({
                ...nextImage,
                isLoading: true,
                error: false
              });
            } else {
              // No more images to try, show error
              setImageState(prev => ({
                ...prev,
                isLoading: false,
                error: true
              }));
            }
          }}
        />
        
        {imageState.error && !imageState.isLoading && (
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
