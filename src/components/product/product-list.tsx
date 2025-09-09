'use client';

import type { Prenda } from '@/types';
import { ProductCard } from './product-card';
import { Badge } from '@/components/ui/badge';
import { Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';

interface ProductListProps {
  prendas: Prenda[];
  showNewArrivals?: boolean;
  dropValue?: string;
}

export function ProductList({ prendas, showNewArrivals = false, dropValue = '' }: ProductListProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [touchStart, setTouchStart] = useState({ x: 0, y: 0 });
  const [isAnimating, setIsAnimating] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [touchDirection, setTouchDirection] = useState<'horizontal' | 'vertical' | null>(null);
  
  // Detectar si es móvil
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640); // sm breakpoint
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Resetear a página 1 cuando cambien las prendas (filtros aplicados)
  useEffect(() => {
    setCurrentPage(0);
  }, [prendas]);

  if (!prendas || prendas.length === 0) {
    return <p className="col-span-full text-center text-muted-foreground py-10">No se encontraron productos.</p>;
  }

  // Para móviles: carrusel horizontal como Instagram
  if (isMobile) {
    const itemsPerPage = 6;
    const totalPages = Math.ceil(prendas.length / itemsPerPage);
    const startIndex = currentPage * itemsPerPage;
    const currentItems = prendas.slice(startIndex, startIndex + itemsPerPage);

    // Funciones para manejar el deslizamiento táctil - CON DETECCIÓN DE DIRECCIÓN
    const handleTouchStart = (e: React.TouchEvent) => {
      if (isAnimating) return;
      const touch = e.targetTouches[0];
      setTouchStart({ x: touch.clientX, y: touch.clientY });
      setIsDragging(true);
      setTouchDirection(null);
      setDragOffset(0);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
      if (!isDragging || isAnimating) return;
      
      const touch = e.targetTouches[0];
      const deltaX = touch.clientX - touchStart.x;
      const deltaY = touch.clientY - touchStart.y;
      
      // Determinar dirección del movimiento si aún no se ha determinado
      if (touchDirection === null && (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10)) {
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          setTouchDirection('horizontal');
        } else {
          setTouchDirection('vertical');
        }
      }
      
      // Solo procesar movimiento horizontal si la dirección es horizontal
      if (touchDirection === 'horizontal') {
        // Prevenir scroll vertical cuando estamos en modo horizontal
        e.preventDefault();
        setDragOffset(-deltaX);
      }
      // Si es vertical, no hacemos nada - dejamos que el navegador maneje el scroll
    };

    const handleTouchEnd = () => {
      if (!isDragging) return;
      
      setIsDragging(false);
      
      const threshold = 50; // Umbral más bajo
      
      // Solo cambiar página si fue un movimiento horizontal
      if (touchDirection === 'horizontal' && Math.abs(dragOffset) > threshold) {
        if (dragOffset > 0) {
          // Deslizar hacia la izquierda (siguiente)
          setIsAnimating(true);
          if (currentPage < totalPages - 1) {
            setCurrentPage(prev => prev + 1);
          } else {
            // Si estamos en la última página, volver al principio (scroll infinito)
            setCurrentPage(0);
          }
        } else if (dragOffset < 0) {
          // Deslizar hacia la derecha (anterior)
          setIsAnimating(true);
          if (currentPage > 0) {
            setCurrentPage(prev => prev - 1);
          } else {
            // Si estamos en la primera página, ir al final (scroll infinito)
            setCurrentPage(totalPages - 1);
          }
        }
      }
      
      // Reset
      setDragOffset(0);
      setTouchStart({ x: 0, y: 0 });
      setTouchDirection(null);
      setTimeout(() => setIsAnimating(false), 150);
    };

    return (
      <div className="relative w-full">
        {/* Contenedor con manejo inteligente de touch */}
        <div 
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div 
            className="grid grid-cols-2 gap-4 px-4 transition-all duration-150 ease-out"
            style={{
              transform: `translateX(${isDragging && touchDirection === 'horizontal' ? -dragOffset * 0.3 : 0}px)`,
              opacity: isAnimating ? 0.7 : 1
            }}
          >
            {currentItems.map((prenda, index) => (
              <div 
                key={prenda.id} 
                className="relative"
              >
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
                <div key={`empty-${index}`} className="aspect-[3/4] bg-transparent" />
              ))
            }
          </div>
        </div>

        {/* Indicadores de página (puntos) */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-6 space-x-2">
            {Array.from({ length: totalPages }).map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-150 ${
                  index === currentPage ? 'bg-blue-500 scale-125' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        )}

        {/* Contador */}
        <div className="text-center mt-2 text-sm text-muted-foreground">
          {currentPage + 1} de {totalPages} páginas • {prendas.length} productos
        </div>
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
