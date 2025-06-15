'use client';

import { Suspense, useState, useEffect, useMemo } from 'react';
import { fetchProducts } from '@/app/actions/product-actions';
import { ProductList } from '@/components/product/product-list';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ProductFilterPopover } from '@/components/product/product-filter-popover';
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronDown, Sparkles } from 'lucide-react';
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
  const [sortOption, setSortOption] = useState<string>('');
  const [isSortOpen, setIsSortOpen] = useState(false);

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

  // Apply filters and sorting
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

    // Apply sorting
    result = [...result].sort((a, b) => {
      switch (sortOption) {
        case 'price-asc':
          return a.precio - b.precio;
        case 'price-desc':
          return b.precio - a.precio;
        case 'size-asc':
          return (a.talla_nombre || '').localeCompare(b.talla_nombre || '');
        case 'size-desc':
          return (b.talla_nombre || '').localeCompare(a.talla_nombre || '');
        default:
          return 0;
      }
    });
    
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
          <div className="relative">
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2"
              onClick={() => setIsSortOpen(!isSortOpen)}
            >
              <ArrowUpDown className="h-4 w-4" />
              Ordenar
              <ChevronDown className={`h-4 w-4 transition-transform ${isSortOpen ? 'rotate-180' : ''}`} />
            </Button>
            {isSortOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-50">
                <div className="py-1" role="menu" aria-orientation="vertical">
                  <button
                    onClick={() => {
                      setSortOption('price-asc');
                      setIsSortOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 ${sortOption === 'price-asc' ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
                    role="menuitem"
                  >
                    <ArrowUp className="h-4 w-4" />
                    Precio: Menor a mayor
                  </button>
                  <button
                    onClick={() => {
                      setSortOption('price-desc');
                      setIsSortOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 ${sortOption === 'price-desc' ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
                    role="menuitem"
                  >
                    <ArrowDown className="h-4 w-4" />
                    Precio: Mayor a menor
                  </button>
                  <button
                    onClick={() => {
                      setSortOption('size-asc');
                      setIsSortOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 ${sortOption === 'size-asc' ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
                    role="menuitem"
                  >
                    <ArrowUp className="h-4 w-4" />
                    Talla: A-Z
                  </button>
                  <button
                    onClick={() => {
                      setSortOption('size-desc');
                      setIsSortOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 ${sortOption === 'size-desc' ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
                    role="menuitem"
                  >
                    <ArrowDown className="h-4 w-4" />
                    Talla: Z-A
                  </button>
                </div>
              </div>
            )}
          </div>
          {sortOption && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs text-muted-foreground"
              onClick={() => setSortOption('')}
            >
              Limpiar
            </Button>
          )}
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
