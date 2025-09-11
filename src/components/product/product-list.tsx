'use client';

import type { Prenda } from '@/types';
import { ProductCard } from './product-card';
import { Badge } from '@/components/ui/badge';
import { Sparkles } from 'lucide-react';
import { useState, useEffect, memo, useMemo, useCallback } from 'react';

interface ProductListProps {
  prendas: Prenda[];
  showNewArrivals?: boolean;
  dropValue?: string;
}

// Memoized ProductListItem to prevent unnecessary re-renders
interface ProductListItemProps {
  prenda: Prenda;
  showNewArrivals: boolean;
  dropValue: string;
  isNewArrival: boolean;
}

const ProductListItem = memo(({ prenda, showNewArrivals, dropValue, isNewArrival }: ProductListItemProps) => {
  return (
    <div className="relative">
      {showNewArrivals && isNewArrival && (
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
  );
});
ProductListItem.displayName = 'ProductListItem';

export const ProductList = memo(({ prendas, showNewArrivals = false, dropValue = '' }: ProductListProps) => {
  // Memoize empty state to prevent re-renders when prendas array is empty
  const emptyState = useMemo(() => (
    <p className="col-span-full text-center text-muted-foreground py-10">
      No se encontraron productos.
    </p>
  ), []);

  // Early return for empty state
  if (!prendas || prendas.length === 0) {
    return emptyState;
  }

  // Memoize product items to prevent unnecessary re-calculations
  const productItems = useMemo(() => 
    prendas.map(prenda => {
      const isNewArrival = Boolean(showNewArrivals && dropValue && prenda.drop_name === dropValue);
      
      return (
        <ProductListItem
          key={prenda.id}
          prenda={prenda}
          showNewArrivals={showNewArrivals}
          dropValue={dropValue}
          isNewArrival={isNewArrival}
        />
      );
    })
  , [prendas, showNewArrivals, dropValue]);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-3 sm:gap-x-6 sm:gap-y-4">
      {productItems}
    </div>
  );
});
ProductList.displayName = 'ProductList';
