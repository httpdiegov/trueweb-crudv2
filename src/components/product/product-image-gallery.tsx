
'use client';

import { useState, useEffect, useCallback } from 'react';
import NextImage from 'next/image';
import type { Imagen } from '@/types';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProductImageGalleryProps {
  images: Imagen[];
  productName: string;
}

export function ProductImageGallery({ images, productName }: ProductImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setCurrentIndex(0); // Reset to first image if images array changes
  }, [images]);

  const selectedImage = images && images.length > 0 ? images[currentIndex] : null;

  const placeholderImage: Imagen = {
    id: 0,
    prenda_id: 0,
    url: `https://placehold.co/600x800.png`,
  };

  const displayImage = selectedImage || placeholderImage;
  const hasMultipleImages = images && images.length > 1;

  const handlePreviousImage = useCallback(() => {
    if (!hasMultipleImages) return;
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  }, [images, hasMultipleImages]);

  const handleNextImage = useCallback(() => {
    if (!hasMultipleImages) return;
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  }, [images, hasMultipleImages]);

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

  const handleThumbnailClick = (index: number) => {
    setCurrentIndex(index);
  };

  if (!images || images.length === 0) {
    return (
      <Card className="shadow-md">
        <CardContent className="p-2">
          <div className="aspect-[3/4] w-full relative bg-muted rounded-md overflow-hidden">
            <NextImage
              src={placeholderImage.url}
              alt={productName}
              fill
              sizes="(max-width: 767px) calc(100vw - 2rem), (max-width: 1279px) calc(50vw - 3rem), 620px"
              className="object-cover"
              data-ai-hint={"product detail placeholder"}
            />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Card className="shadow-md">
        <CardContent className="p-2">
          <div className="aspect-[3/4] w-full relative bg-muted rounded-md overflow-hidden group">
            <NextImage
              src={displayImage.url}
              alt={`${productName} - Vista ${currentIndex + 1} de ${images.length}`}
              fill
              sizes="(max-width: 767px) calc(100vw - 2rem), (max-width: 1279px) calc(50vw - 3rem), 620px"
              className="object-cover transition-opacity duration-300 ease-in-out"
              priority
              quality={100}
              data-ai-hint={"product detail"}
              key={displayImage.id} // Re-render if image ID changes, helping with transitions if URLs are stable
            />
            {hasMultipleImages && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handlePreviousImage}
                  aria-label="Imagen anterior"
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-background/50 hover:bg-background/80 text-foreground opacity-0 group-hover:opacity-100 transition-opacity rounded-full"
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleNextImage}
                  aria-label="Siguiente imagen"
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-background/50 hover:bg-background/80 text-foreground opacity-0 group-hover:opacity-100 transition-opacity rounded-full"
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {hasMultipleImages && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
          {images.map((image, index) => (
            <button
              key={image.id}
              onClick={() => handleThumbnailClick(index)}
              aria-label={`Ver imagen ${index + 1}`}
              className={cn(
                "aspect-square relative rounded-md overflow-hidden border-2 transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                currentIndex === index ? "border-primary" : "border-transparent hover:border-muted-foreground/50"
              )}
            >
              <NextImage
                src={image.url}
                alt={`${productName} - Miniatura ${index + 1}`}
                fill
                sizes="100px" // Thumbnails are small, 100px should be sufficient
                className="object-cover"
                quality={100}
                data-ai-hint={"product thumbnail"}
              />
               {currentIndex === index && (
                <div className="absolute inset-0 bg-primary/30 ring-2 ring-primary"></div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
