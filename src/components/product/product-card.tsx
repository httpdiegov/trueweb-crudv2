'use client';

import Link from 'next/link';
import type { Prenda } from '@/types';
import { useMemo, memo } from 'react';
import { Badge } from '@/components/ui/badge';
import { LazyImage } from '@/components/ui/lazy-image';

interface ProductCardProps {
  prenda: Prenda;
}

// 🚀 Optimized ProductCard with Lazy Loading
export const ProductCard = memo(function ProductCard({ prenda }: ProductCardProps) {
  // 🖼️ Get the best image URL with simple logic
  const imageUrl = useMemo((): string => {
    const bwImages = prenda.imagenes_bw || [];
    const colorImages = prenda.imagenes || [];
    
    // Priority 1: BW01 image
    const bw01Image = bwImages.find(img => 
      img?.url?.match(/-bw0?1\.(png|jpg|jpeg|webp)$/i)
    );
    
    if (bw01Image?.url) {
      return bw01Image.url.startsWith('http') 
        ? bw01Image.url 
        : `https://truevintageperu.com${bw01Image.url}`;
    }
    
    // Priority 2: Any BW image
    const firstBwImage = bwImages.find(img => img?.url);
    if (firstBwImage?.url) {
      return firstBwImage.url.startsWith('http') 
        ? firstBwImage.url 
        : `https://truevintageperu.com${firstBwImage.url}`;
    }
    
    // Priority 3: Color images
    const firstColorImage = colorImages.find(img => img?.url);
    if (firstColorImage?.url) {
      return firstColorImage.url.startsWith('http') 
        ? firstColorImage.url 
        : `https://truevintageperu.com${firstColorImage.url}`;
    }
    
    // Fallback placeholder
    return 'https://placehold.co/400x400/e5e7eb/9ca3af?text=Sin+Imagen';
  }, [prenda.imagenes_bw, prenda.imagenes]);

  // 🎯 Product status badges
  const statusBadge = useMemo(() => {
    if (prenda.stock === 0) {
      return (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
          <div className="text-white px-6 py-3 text-sm font-bold uppercase bg-red-600 tracking-wider shadow-lg transform -rotate-12">
            SOLD OUT
          </div>
        </div>
      );
    }
    
    if (prenda.separado === 1) {
      return (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
          <div className="bg-orange-500 text-white px-6 py-3 text-sm font-bold uppercase tracking-wider shadow-lg transform -rotate-12">
            SEPARADO
          </div>
        </div>
      );
    }
    
    return null;
  }, [prenda.stock, prenda.separado]);

  return (
    <Link href={`/products/${prenda.sku}`} className="block group">
      <div className="relative w-full overflow-hidden bg-white aspect-square transition-transform duration-300 group-hover:scale-105">
        {/* 🚀 Lazy Loading Image */}
        <LazyImage
          src={imageUrl}
          alt={prenda.nombre_prenda || 'Producto sin nombre'}
          className="w-full h-full object-cover"
        />
        
        {/* Status overlay */}
        {statusBadge}
      </div>
      
      {/* Product info */}
      <div className="mt-3 space-y-1">
        <h3 className="text-sm font-medium text-gray-900 text-center truncate">
          {prenda.nombre_prenda}
        </h3>
        
        <div className="text-center">
          <div className="text-sm text-gray-900">
            {prenda.talla_nombre ? (
              <span className="text-xs text-gray-500 font-semibold">{prenda.talla_nombre} - S/{prenda.precio.toFixed(2)}</span>
            ) : (
              <span className="font-semibold">S/{prenda.precio.toFixed(2)}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
});

// 🔍 Better debugging in React DevTools
ProductCard.displayName = 'ProductCard';
