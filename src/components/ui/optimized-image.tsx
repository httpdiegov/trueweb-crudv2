'use client';

import { useState, useEffect, memo } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  priority?: boolean;
  className?: string;
  sizes?: string;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  onClick?: () => void;
  onLoad?: () => void;
  onError?: () => void;
  fallbackSrc?: string;
  loading?: 'lazy' | 'eager';
  unoptimized?: boolean;
}

const OptimizedImageComponent = ({
  src,
  alt,
  width,
  height,
  fill = false,
  priority = false,
  className,
  sizes,
  quality = 85,
  placeholder = 'empty',
  blurDataURL,
  onClick,
  onLoad,
  onError,
  fallbackSrc = 'https://placehold.co/400x400.png',
  loading = 'lazy',
  unoptimized,
  ...props
}: OptimizedImageProps) => {
  const [imageState, setImageState] = useState({
    src: src,
    isLoading: true,
    hasError: false,
    retryCount: 0
  });

  // Reset state when src changes
  useEffect(() => {
    setImageState({
      src: src,
      isLoading: true,
      hasError: false,
      retryCount: 0
    });
  }, [src]);

  // Generate blur placeholder automatically for external images
  const generateBlurDataURL = (url: string): string => {
    if (url.includes('placehold.co')) {
      return 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAhEQACAQIHAQAAAAAAAAAAAAABAgADBAUGEWGRobHB/9oADAMBAAIRAxEAPwA5dv8Aczyr4hwbp8mvfQfeUa+5VlPrHhvxvBA42rwV7h4OM0NMYnhtx5eqhWYvunlmng==';
    }
    return 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDAREAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/vgA=';
  };

  const handleImageLoad = () => {
    setImageState(prev => ({
      ...prev,
      isLoading: false,
      hasError: false
    }));
    onLoad?.();
  };

  const handleImageError = () => {
    setImageState(prev => {
      // If we haven't exceeded retry limit and have a fallback
      if (prev.retryCount < 1 && fallbackSrc && prev.src !== fallbackSrc) {
        return {
          ...prev,
          src: fallbackSrc,
          retryCount: prev.retryCount + 1,
          isLoading: true
        };
      }
      
      // Mark as error
      return {
        ...prev,
        isLoading: false,
        hasError: true
      };
    });
    onError?.();
  };

  // Auto-generate sizes if not provided
  const autoSizes = sizes || (
    fill 
      ? '100vw' 
      : width && width > 0 
        ? `${Math.min(width, 1920)}px`
        : '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
  );

  const imageProps = {
    src: imageState.src,
    alt: alt,
    className: cn(
      'transition-opacity duration-300',
      imageState.isLoading && 'opacity-0',
      !imageState.isLoading && !imageState.hasError && 'opacity-100',
      className
    ),
    sizes: autoSizes,
    quality,
    priority,
    loading: priority ? 'eager' : loading,
    placeholder: blurDataURL || (placeholder === 'blur') ? 'blur' as const : 'empty' as const,
    blurDataURL: blurDataURL || (placeholder === 'blur' ? generateBlurDataURL(imageState.src) : undefined),
    onLoad: handleImageLoad,
    onError: handleImageError,
    onClick,
    unoptimized: unoptimized || (process.env.NODE_ENV === 'development' && imageState.src.includes('truevintageperu.com')),
    ...props
  };

  if (fill) {
    return (
      <div className="relative w-full h-full">
        {imageState.isLoading && !imageState.hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 animate-pulse">
            <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
          </div>
        )}
        
        {imageState.hasError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 text-gray-400 text-sm">
            <svg className="w-12 h-12 mb-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
            <span>Imagen no disponible</span>
          </div>
        ) : (
          <Image
            {...imageProps}
            fill
          />
        )}
      </div>
    );
  }

  return (
    <div className="relative" style={{ width, height }}>
      {imageState.isLoading && !imageState.hasError && (
        <div 
          className="absolute inset-0 flex items-center justify-center bg-gray-100 animate-pulse"
          style={{ width, height }}
        >
          <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
        </div>
      )}
      
      {imageState.hasError ? (
        <div 
          className="flex flex-col items-center justify-center bg-gray-100 text-gray-400 text-sm"
          style={{ width, height }}
        >
          <svg className="w-12 h-12 mb-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
          </svg>
          <span>Imagen no disponible</span>
        </div>
      ) : (
        <Image
          {...imageProps}
          width={width}
          height={height}
        />
      )}
    </div>
  );
};

export const OptimizedImage = memo(OptimizedImageComponent);
OptimizedImage.displayName = 'OptimizedImage';
