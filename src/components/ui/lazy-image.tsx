'use client';

import { useEffect, useRef, useState } from 'react';

// 🖼️ Simple Lazy Image Component
interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
}

export function LazyImage({ 
  src, 
  alt, 
  className = '', 
}: LazyImageProps) {
  const [imageSrc, setImageSrc] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Simple intersection observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Load image when intersecting or when src changes
  useEffect(() => {
    if (isIntersecting) {
      // When src changes, we want to show the loading state again briefly
      setIsLoaded(false);
      const img = new Image();
      img.onload = () => {
        setImageSrc(src);
        setIsLoaded(true);
      };
      img.onerror = () => {
        // Keep placeholder on error, but mark as loaded to avoid loops
        setIsLoaded(true);
      };
      img.src = src;
    }
  }, [isIntersecting, src]);

  // Don't render img element until we have a valid src
  if (!imageSrc) {
    return (
      <div
        ref={imgRef}
        className={`bg-transparent ${className}`}
        role="img"
        aria-label={alt}
      />
    );
  }

  return (
    <img
      ref={imgRef}
      src={imageSrc}
      alt={alt}
      className={`transition-opacity duration-300 ${
        isLoaded ? 'opacity-100' : 'opacity-0'
      } ${className}`}
      loading="lazy"
    />
  );
}
