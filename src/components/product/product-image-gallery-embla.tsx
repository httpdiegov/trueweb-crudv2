"use client";

import React, { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import type { Imagen } from '@/types';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface ProductImageGalleryEmblaProps {
  images: Imagen[];
  productName: string;
  // Opciones de Embla: usamos any para evitar importar tipos internos no exportados
  options?: any;
}

export function ProductImageGalleryEmbla({ images, productName, options }: ProductImageGalleryEmblaProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: images.length > 1, ...options });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  const scrollTo = useCallback((index: number) => {
    if (!emblaApi) return;
    emblaApi.scrollTo(index);
  }, [emblaApi]);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
  }, [emblaApi, onSelect]);

  if (!images || images.length === 0) {
    return (
      <div className="aspect-[3/4] w-full rounded-md bg-muted flex items-center justify-center text-sm text-muted-foreground">
        Sin imágenes
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative group">
        <div className="overflow-hidden rounded-md relative aspect-[3/4]" ref={emblaRef}>
          <div className="flex h-full">
            {images.map((img, i) => {
              const normalizedSrc = img.url.startsWith('http')
                ? img.url
                : `https://truevintageperu.com${img.url.startsWith('/') ? '' : '/'}${img.url}`;
              return (
                <div className="flex-[0_0_100%] min-w-0 relative" key={img.id || i}>
                  <Image
                    src={normalizedSrc}
                    alt={`${productName} - Imagen ${i + 1}`}
                    fill
                    priority={i === 0}
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
              );
            })}
          </div>
        </div>

        {images.length > 1 && (
          <>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={scrollPrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background/90 rounded-full h-10 w-10 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
              aria-label="Imagen anterior"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={scrollNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background/90 rounded-full h-10 w-10 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
              aria-label="Siguiente imagen"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => scrollTo(i)}
                  aria-label={`Ir a imagen ${i + 1}`}
                  className={cn(
                    'h-2 rounded-full transition-all',
                    selectedIndex === i ? 'w-6 bg-foreground' : 'w-2 bg-foreground/30'
                  )}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Miniaturas producto">
          {images.map((img, i) => {
            const normalizedSrc = img.url.startsWith('http')
              ? img.url
              : `https://truevintageperu.com${img.url.startsWith('/') ? '' : '/'}${img.url}`;
            return (
              <button
                key={img.id || i}
                onClick={() => scrollTo(i)}
                role="tab"
                aria-selected={selectedIndex === i}
                aria-label={`Miniatura ${i + 1}`}
                className={cn(
                  'relative aspect-square h-16 min-w-16 overflow-hidden rounded-md border-2',
                  selectedIndex === i ? 'border-primary ring-2 ring-primary/30' : 'border-transparent hover:border-border'
                )}
              >
                <Image
                  src={normalizedSrc}
                  alt={`${productName} thumbnail ${i + 1}`}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
