'use client';

import { useState, useEffect, useCallback, memo } from 'react';
import { useSwipeable } from 'react-swipeable';
import NextImage from 'next/image';
import type { Imagen } from '@/types';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProductImageGalleryOptimizedProps {
  images: Imagen[];
  productName: string;
}

// Componente de imagen optimizado con lazy loading
const OptimizedProductImage = memo(({ 
  image, 
  alt, 
  isActive, 
  priority = false 
}: { 
  image: Imagen; 
  alt: string; 
  isActive: boolean; 
  priority?: boolean; 
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div className={cn(
      "aspect-[3/4] w-full relative bg-muted rounded-md overflow-hidden transition-opacity duration-300",
      !loaded && "animate-pulse",
      !isActive && "hidden"
    )}>
      <NextImage
        src={error ? `https://placehold.co/600x800.png` : image.url}
        alt={alt}
        fill
        priority={priority}
        quality={85} // Reducir calidad de 100 a 85 para mejor velocidad
        sizes="(max-width: 767px) calc(100vw - 2rem), (max-width: 1279px) calc(50vw - 3rem), 620px"
        className={cn(
          "object-cover transition-opacity duration-300",
          loaded ? "opacity-100" : "opacity-0"
        )}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        loading={priority ? "eager" : "lazy"}
      />
    </div>
  );
});

OptimizedProductImage.displayName = 'OptimizedProductImage';

// Thumbnail optimizado
const OptimizedThumbnail = memo(({ 
  image, 
  alt, 
  isActive, 
  onClick, 
  index 
}: { 
  image: Imagen; 
  alt: string; 
  isActive: boolean; 
  onClick: () => void; 
  index: number;
}) => {
  // Solo cargar thumbnails visibles (primera imagen y las 2 siguientes)
  const shouldLoad = index < 3;
  
  return (
    <button
      onClick={onClick}
      className={cn(
        "aspect-square relative rounded-md overflow-hidden border-2 transition-all duration-200 bg-muted",
        isActive ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-primary/50"
      )}
    >
      {shouldLoad && (
        <NextImage
          src={image.url}
          alt={alt}
          fill
          quality={60} // Menor calidad para thumbnails
          sizes="80px"
          className="object-cover"
          loading="lazy"
        />
      )}
    </button>
  );
});

OptimizedThumbnail.displayName = 'OptimizedThumbnail';

export function ProductImageGalleryOptimized({ images, productName }: ProductImageGalleryOptimizedProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [preloadedImages, setPreloadedImages] = useState<Set<number>>(new Set([0]));

  // Precargar imagen siguiente y anterior
  useEffect(() => {
    const preloadNext = () => {
      const nextIndex = (currentIndex + 1) % images.length;
      const prevIndex = (currentIndex - 1 + images.length) % images.length;
      
      setPreloadedImages(prev => {
        const newSet = new Set(prev);
        newSet.add(nextIndex);
        newSet.add(prevIndex);
        return newSet;
      });
    };

    const timer = setTimeout(preloadNext, 100);
    return () => clearTimeout(timer);
  }, [currentIndex, images.length]);

  const selectedImage = images?.[currentIndex];
  const hasMultipleImages = images && images.length > 1;

  const handlePreviousImage = useCallback(() => {
    if (!hasMultipleImages) return;
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  }, [images?.length, hasMultipleImages]);

  const handleNextImage = useCallback(() => {
    if (!hasMultipleImages) return;
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  }, [images?.length, hasMultipleImages]);

  const swipeHandlers = useSwipeable({
    onSwipedLeft: handleNextImage,
    onSwipedRight: handlePreviousImage,
    trackMouse: true,
    preventScrollOnSwipe: true,
    trackTouch: true
  });

  if (!images || images.length === 0) {
    return (
      <Card className="shadow-md">
        <CardContent className="p-2">
          <div className="aspect-[3/4] w-full relative bg-muted rounded-md overflow-hidden">
            <NextImage
              src="https://placehold.co/600x800.png"
              alt={productName}
              fill
              sizes="(max-width: 767px) calc(100vw - 2rem), (max-width: 1279px) calc(50vw - 3rem), 620px"
              className="object-cover"
            />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Card className="shadow-md overflow-hidden">
        <CardContent className="p-2">
          <div 
            {...swipeHandlers}
            className="relative group touch-pan-y touch-pinch-zoom select-none"
          >
            {images.map((image, index) => (
              <OptimizedProductImage
                key={image.id}
                image={image}
                alt={`${productName} - Imagen ${index + 1}`}
                isActive={index === currentIndex}
                priority={index === 0} // Solo la primera imagen tiene priority
              />
            ))}
            
            {hasMultipleImages && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handlePreviousImage}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white/90 hover:bg-white border-white/20"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleNextImage}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white/90 hover:bg-white border-white/20"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {hasMultipleImages && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <OptimizedThumbnail
              key={image.id}
              image={image}
              alt={`${productName} - Thumbnail ${index + 1}`}
              isActive={index === currentIndex}
              onClick={() => setCurrentIndex(index)}
              index={index}
            />
          ))}
        </div>
      )}
    </div>
  );
}
