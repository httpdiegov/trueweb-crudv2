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
  // ...eliminar lógica de carrusel, solo grid vertical...

  if (!prendas || prendas.length === 0) {
    return <p className="col-span-full text-center text-muted-foreground py-10">No se encontraron productos.</p>;
  }

  // ...solo grid vertical para todos...

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
