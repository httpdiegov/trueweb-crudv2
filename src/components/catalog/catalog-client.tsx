'use client';

import { Suspense, useState, useEffect, useMemo } from 'react';
import { fetchProducts } from '@/app/actions/product-actions';
import { ProductList } from '@/components/product/product-list';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ProductFilterPopover } from '@/components/product/product-filter-popover';
import { ArrowUpDown, Sparkles } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import type { Categoria, Talla, Prenda } from '@/types';

interface CatalogClientProps {
  initialCategories: Categoria[];
  initialSizes: Talla[];
  initialDropValue: string;
  category?: string;
  size?: string;
}

export function CatalogClient({
  initialCategories,
  initialSizes,
  initialDropValue,
  category,
  size
}: CatalogClientProps) {
  const [showNewArrivals, setShowNewArrivals] = useState(false);
  const [categories] = useState(initialCategories);
  const [sizes] = useState(initialSizes);
  const [dropValue] = useState(initialDropValue);
  const [products, setProducts] = useState<Prenda[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const toggleNewArrivals = () => {
    setShowNewArrivals(!showNewArrivals);
  };

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setIsLoading(true);
        const data = await fetchProducts();
        setProducts(data);
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, []);

  // Apply filters
  let filteredProducts = [...products];
  
  if (showNewArrivals && dropValue) {
    const dropProducts = filteredProducts.filter(p => p.drop_name === dropValue);
    const nonDropProducts = filteredProducts.filter(p => p.drop_name !== dropValue);
    filteredProducts = [...dropProducts, ...nonDropProducts];
  }

  // Helper to safely extract array from URL params
  const getArrayFromParam = useMemo(() => (paramValue: string | string[] | undefined): string[] => {
    if (!paramValue) return [];
    if (Array.isArray(paramValue)) return paramValue.filter(Boolean);
    if (typeof paramValue === 'string') return paramValue.split(',').filter(Boolean);
    return [];
  }, []);

  // Process search params with useMemo to prevent unnecessary recalculations
  const { categoriesParams, sizesParams } = useMemo(() => {
    const getArrayFromParam = (param: string | string[] | undefined): string[] => {
      if (!param) return [];
      if (Array.isArray(param)) return param.filter(Boolean);
      if (typeof param === 'string') return param.split(',').filter(Boolean);
      return [];
    };

    return {
      categoriesParams: getArrayFromParam(category),
      sizesParams: getArrayFromParam(size)
    };
  }, [category, size]);

  // Apply filters
  filteredProducts = useMemo(() => {
    let result = [...products];
    
    if (showNewArrivals && dropValue) {
      const dropProducts = result.filter(p => p.drop_name === dropValue);
      const nonDropProducts = result.filter(p => p.drop_name !== dropValue);
      result = [...dropProducts, ...nonDropProducts];
    }

    if (categoriesParams.length > 0) {
      result = result.filter(p => 
        p.categoria_nombre && categoriesParams.includes(p.categoria_nombre)
      );
    }
    
    if (sizesParams.length > 0) {
      result = result.filter(p => 
        p.talla_nombre && sizesParams.includes(p.talla_nombre)
      );
    }
    
    return result;
  }, [products, showNewArrivals, dropValue, categoriesParams, sizesParams]);

  return (
    <div className="container mx-auto max-w-screen-2xl px-2 py-4 sm:px-4 sm:py-6 md:px-6 md:py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl md:text-3xl font-bold">Catálogo</h1>
        <div className="flex items-center gap-2">
          <ProductFilterPopover availableCategories={categories} availableSizes={sizes} />
          <Button 
            variant={showNewArrivals ? "default" : "outline"} 
            size="sm" 
            className="gap-2"
            onClick={toggleNewArrivals}
          >
            <Sparkles className="h-4 w-4" />
            Nuevos Ingresos
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowUpDown className="h-4 w-4" />
            Ordenar
          </Button>
        </div>
      </div>
      
      <section>
        {isLoading ? (
          <ProductListLoadingSkeleton />
        ) : (
          <ProductList 
            prendas={filteredProducts} 
            showNewArrivals={showNewArrivals}
            dropValue={dropValue}
          />
        )}
      </section>
    </div>
  );
}

function ProductListLoadingSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="flex flex-col space-y-2">
          <Skeleton className="h-[280px] w-full sm:h-[320px] md:h-[350px]" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  );
}

// This needs to be a separate component to use Suspense
async function FilteredProductList({ 
  searchParams, 
  showNewArrivals = false, 
  dropValue = '' 
}: { 
  searchParams: { [key: string]: string | string[] | undefined };
  showNewArrivals: boolean;
  dropValue: string;
}) {
  // First, fetch all products
  const products = await fetchProducts();
  let filteredProducts = [...products];

  // Apply drop filtering if needed
  if (showNewArrivals && dropValue) {
    // Split products into drop and non-drop
    const dropProducts = filteredProducts.filter(p => p.drop_name === dropValue);
    const nonDropProducts = filteredProducts.filter(p => p.drop_name !== dropValue);
    // Combine with drop products first
    filteredProducts = [...dropProducts, ...nonDropProducts];
  }

  // Helper to parse comma-separated strings from URL params into arrays
  const getArrayFromParam = (paramValue: string | string[] | undefined): string[] => {
    if (!paramValue) return [];
    if (Array.isArray(paramValue)) return paramValue.filter(Boolean);
    return paramValue.split(',').filter(Boolean);
  };

  // Apply category and size filters from URL
  const { category, size } = searchParams;
  const categoriesParams = getArrayFromParam(category);
  const sizesParams = getArrayFromParam(size);
  
  if (categoriesParams.length > 0) {
    filteredProducts = filteredProducts.filter(p => p.categoria_nombre && categoriesParams.includes(p.categoria_nombre));
  }
  if (sizesParams.length > 0) {
    filteredProducts = filteredProducts.filter(p => p.talla_nombre && sizesParams.includes(p.talla_nombre));
  }
  
  return <ProductList 
    prendas={filteredProducts} 
    showNewArrivals={showNewArrivals} 
    dropValue={dropValue} 
  />;
}
