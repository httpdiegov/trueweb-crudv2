'use client';

import type { Prenda } from '@/types';
import { ProductCard } from './product-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';

interface ProductListProps {
  prendas: Prenda[];
  showNewArrivals?: boolean;
  dropValue?: string;
}

export function ProductList({ prendas, showNewArrivals = false, dropValue = '' }: ProductListProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  
  // Detectar si es móvil
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640); // sm breakpoint
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!prendas || prendas.length === 0) {
    return <p className="col-span-full text-center text-muted-foreground py-10">No se encontraron productos.</p>;
  }

  // Para móviles: carrusel horizontal
  if (isMobile) {
    const itemsPerPage = 6;
    const totalPages = Math.ceil(prendas.length / itemsPerPage);
    const startIndex = currentPage * itemsPerPage;
    const currentItems = prendas.slice(startIndex, startIndex + itemsPerPage);

    const goToNext = () => {
      setCurrentPage((prev) => (prev + 1) % totalPages);
    };

    const goToPrev = () => {
      setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
    };

    // Funciones para manejar el deslizamiento táctil
    const handleTouchStart = (e: React.TouchEvent) => {
      setTouchStart(e.targetTouches[0].clientX);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
      setTouchEnd(e.targetTouches[0].clientX);
    };

    const handleTouchEnd = () => {
      if (!touchStart || !touchEnd) return;
      
      const distance = touchStart - touchEnd;
      const isLeftSwipe = distance > 50;
      const isRightSwipe = distance < -50;

      if (isLeftSwipe && totalPages > 1) {
        goToNext();
      }
      if (isRightSwipe && totalPages > 1) {
        goToPrev();
      }
    };

    return (
      <div className="relative w-full">
        {/* Grid fijo de 6 prendas en móviles */}
        <div 
          className="grid grid-cols-2 gap-4 min-h-[600px] touch-pan-y select-none"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {currentItems.map((prenda, index) => (
            <div key={prenda.id} className="relative">
              {showNewArrivals && dropValue && prenda.drop_name === dropValue && (
                <Badge 
                  className="absolute top-2 right-2 z-10 flex items-center gap-1 bg-amber-500 hover:bg-amber-600"
                  variant="default"
                >
                  <Sparkles className="h-3 w-3" />
                  <span>Nuevo</span>
                </Badge>
              )}
              <ProductCard prenda={prenda} />
            </div>
          ))}
          {/* Rellenar espacios vacíos si hay menos de 6 productos */}
          {currentItems.length < itemsPerPage && 
            Array.from({ length: itemsPerPage - currentItems.length }).map((_, index) => (
              <div key={`empty-${index}`} className="invisible" />
            ))
          }
        </div>

        {/* Controles de navegación */}
        {totalPages > 1 && (
          <>
            {/* Botón anterior */}
            <Button
              variant="outline"
              size="icon"
              className="absolute left-2 top-1/2 transform -translate-y-1/2 z-20 bg-white/90 backdrop-blur-sm shadow-lg hover:bg-white"
              onClick={goToPrev}
              disabled={currentPage === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {/* Botón siguiente */}
            <Button
              variant="outline"
              size="icon"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 z-20 bg-white/90 backdrop-blur-sm shadow-lg hover:bg-white"
              onClick={goToNext}
              disabled={currentPage === totalPages - 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            {/* Indicadores de página */}
            <div className="flex justify-center mt-4 gap-2">
              {Array.from({ length: totalPages }).map((_, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentPage ? 'bg-primary' : 'bg-gray-300'
                  }`}
                  onClick={() => setCurrentPage(index)}
                />
              ))}
            </div>

            {/* Contador */}
            <div className="text-center mt-2 text-sm text-muted-foreground">
              {currentPage + 1} de {totalPages} páginas • {prendas.length} productos
            </div>
          </>
        )}
      </div>
    );
  }

  // Para desktop: grid normal
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-6 sm:gap-x-6 sm:gap-y-8">
      {prendas.map(prenda => (
        <div key={prenda.id} className="relative">
          {showNewArrivals && dropValue && prenda.drop_name === dropValue && (
            <Badge 
              className="absolute top-2 right-2 z-10 flex items-center gap-1 bg-amber-500 hover:bg-amber-600"
              variant="default"
            >
              <Sparkles className="h-3 w-3" />
              <span>Nuevo</span>
            </Badge>
          )}
          <ProductCard prenda={prenda} />
        </div>
      ))}
    </div>
  );
}
