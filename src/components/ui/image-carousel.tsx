'use client';

import useEmblaCarousel from 'embla-carousel-react';
import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { EmblaCarouselType } from 'embla-carousel';
import './image-carousel.css';

type ImageCarouselProps = {
  images: Array<{ url: string; alt?: string }>;
  className?: string;
  showDots?: boolean;
  showArrows?: boolean;
  autoPlay?: boolean;
  interval?: number;
};

export function ImageCarousel({
  images,
  className = '',
  showDots = true,
  showArrows = true,
  autoPlay = false,
  interval = 5000,
}: ImageCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true, 
    dragFree: false,
    containScroll: 'trimSnaps'
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback(
    (index: number) => {
      if (emblaApi) emblaApi.scrollTo(index);
    },
    [emblaApi]
  );

  const onSelect = useCallback((emblaApi: EmblaCarouselType) => {
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;

    emblaApi.on('select', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, onSelect]);

  // Auto-play functionality
  useEffect(() => {
    if (!autoPlay || isHovered) return;
    
    const timer = setInterval(() => {
      if (emblaApi) {
        const nextIndex = (selectedIndex + 1) % images.length;
        scrollTo(nextIndex);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [autoPlay, emblaApi, interval, isHovered, scrollTo, selectedIndex, images.length]);

  if (images.length === 0) {
    return (
      <div className={`relative w-full aspect-square bg-muted ${className}`}>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-muted-foreground">No hay imágenes</span>
        </div>
      </div>
    );
  }


  return (
    <div 
      className={`embla group ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="embla__viewport" ref={emblaRef}>
        <div className="embla__container">
          {images.map((image, index) => (
            <div key={index} className="embla__slide">
              <img
                src={image.url}
                alt={image.alt || `Imagen ${index + 1}`}
                className="embla__slide__img"
                draggable={false}
                loading={index > 0 ? 'lazy' : 'eager'}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      {showArrows && images.length > 1 && (
        <>
          <button 
            className="embla__button embla__button--prev"
            onClick={scrollPrev}
            aria-label="Imagen anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button 
            className="embla__button embla__button--next"
            onClick={scrollNext}
            aria-label="Siguiente imagen"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </>
      )}

      {/* Dots indicator */}
      {showDots && images.length > 1 && (
        <div className="embla__dots">
          {images.map((_, index) => (
            <button
              key={index}
              type="button"
              className={`embla__dot ${index === selectedIndex ? 'embla__dot--selected' : ''}`}
              onClick={() => scrollTo(index)}
              aria-label={`Ir a la imagen ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
