
'use client';

import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { useSwipeable } from 'react-swipeable';
import type { Imagen } from '@/types';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LazyImage } from '@/components/ui/lazy-image';

interface ProductImageGalleryProps {
  images: Imagen[];
  productName: string;
}

// 🚀 Optimized ProductImageGallery with React.memo and performance improvements
export const ProductImageGallery = memo(function ProductImageGallery({ images, productName }: ProductImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setCurrentIndex(0); // Reset to first image if images array changes
  }, [images]);

  // 📊 Memoized computations to avoid recalculations
  const { selectedImage, placeholderImage, displayImage, hasMultipleImages } = useMemo(() => {
    const selected = images && images.length > 0 ? images[currentIndex] : null;
    const placeholder: Imagen = {
      id: 0,
      prenda_id: 0,
      url: `https://placehold.co/600x800.png`,
    };
    
    return {
      selectedImage: selected,
      placeholderImage: placeholder,
      displayImage: selected || placeholder,
      hasMultipleImages: images && images.length > 1
    };
  }, [images, currentIndex]);

  // 🎯 Memoized navigation handlers - optimized dependencies
  const handlePreviousImage = useCallback(() => {
    if (!hasMultipleImages) return;
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  }, [images?.length, hasMultipleImages]);

  const handleNextImage = useCallback(() => {
    if (!hasMultipleImages) return;
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  }, [images?.length, hasMultipleImages]);

  // 🎯 Memoized thumbnail click handler
  const handleThumbnailClick = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!hasMultipleImages) return;
      if (event.key === 'ArrowLeft') {
        handlePreviousImage();
      } else if (event.key === 'ArrowRight') {
        handleNextImage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handlePreviousImage, handleNextImage, hasMultipleImages]);

  // 🎯 Swipe handlers configuration - useSwipeable debe estar en el top level
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => handleNextImage(),
    onSwipedRight: () => handlePreviousImage(),
    trackMouse: true,
    preventScrollOnSwipe: true,
    trackTouch: true
  });

  if (!images || images.length === 0) {
    return (
      <Card className="shadow-md">
        <CardContent className="p-2">
          <div className="aspect-[3/4] w-full relative bg-muted rounded-md overflow-hidden">
            <LazyImage
              src={placeholderImage.url}
              alt={productName}
              className="w-full h-full object-cover"
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
            className="aspect-[3/4] w-full relative bg-muted rounded-md overflow-hidden group touch-pan-y touch-pinch-zoom select-none"
          >
            <LazyImage
              src={displayImage.url}
              alt={`${productName} - Vista ${currentIndex + 1} de ${images.length}`}
              className="w-full h-full object-cover transition-opacity duration-300 ease-in-out select-none touch-none"
            />
            {hasMultipleImages && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handlePreviousImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background/90 rounded-full h-10 w-10 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 focus:ring-2 focus:ring-ring focus:ring-offset-2 z-10"
                  aria-label="Imagen anterior"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleNextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background/90 rounded-full h-10 w-10 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 focus:ring-2 focus:ring-ring focus:ring-offset-2 z-10"
                  aria-label="Siguiente imagen"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => handleThumbnailClick(index)}
                      className={`h-2 rounded-full transition-all ${currentIndex === index ? 'w-6 bg-foreground' : 'w-2 bg-foreground/30'}`}
                      aria-label={`Ir a la imagen ${index + 1} de ${images.length}`}
                      aria-current={currentIndex === index ? 'step' : undefined}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {hasMultipleImages && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
          {images.map((image, index) => (
            <ThumbnailButton
              key={image.id}
              image={image}
              index={index}
              isSelected={currentIndex === index}
              productName={productName}
              onClick={handleThumbnailClick}
            />
          ))}
        </div>
      )}
    </div>
  );
});

// 🎯 Optimized thumbnail button component
const ThumbnailButton = memo(function ThumbnailButton({
  image,
  index,
  isSelected,
  productName,
  onClick
}: {
  image: Imagen;
  index: number;
  isSelected: boolean;
  productName: string;
  onClick: (index: number) => void;
}) {
  const handleClick = useCallback(() => {
    onClick(index);
  }, [onClick, index]);

  return (
    <button
      onClick={handleClick}
      aria-label={`Ver imagen ${index + 1}`}
      className={cn(
        "aspect-square relative rounded-md overflow-hidden border-2 transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
        isSelected ? "border-primary" : "border-transparent hover:border-muted-foreground/50"
      )}
    >
      <LazyImage
        src={image.url}
        alt={`${productName} - Miniatura ${index + 1}`}
        className="w-full h-full object-cover"
      />
      {isSelected && (
        <div className="absolute inset-0 bg-primary/30 ring-2 ring-primary"></div>
      )}
    </button>
  );
});

// 🔍 Better debugging in React DevTools
ProductImageGallery.displayName = 'ProductImageGallery';
ThumbnailButton.displayName = 'ThumbnailButton';
