'use client';

import { useState, useEffect } from 'react';
import { fetchProducts } from '@/app/actions/product-actions';
import { ProductList } from '@/components/product/product-list';
import { Skeleton } from '@/components/ui/skeleton';
import type { Prenda } from '@/types';

interface CatalogClientProps {
  initialCategories: any[];
  initialSizes: any[];
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
  const [products, setProducts] = useState<Prenda[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar productos al montar el componente
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

  return (
    <div className="container mx-auto max-w-screen-2xl px-2 py-4 sm:px-4 sm:py-6 md:px-6 md:py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl md:text-3xl font-bold">Catálogo</h1>
      </div>
      
      <section>
        {isLoading ? (
          <ProductListLoadingSkeleton />
        ) : (
          <ProductList 
            prendas={products} 
            showNewArrivals={false}
            dropValue=""
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
  
  // Debug logs
  console.log('Categories from URL:', categoriesParams);
  console.log('Sizes from URL:', sizesParams);
  console.log('Products before filtering:', filteredProducts.length);
  
  if (categoriesParams.length > 0) {
    filteredProducts = filteredProducts.filter(p => {
      const matches = p.categoria_nombre && categoriesParams.includes(p.categoria_nombre);
      return matches;
    });
    console.log('After category filter:', filteredProducts.length);
  }
  
  if (sizesParams.length > 0) {
    filteredProducts = filteredProducts.filter(p => {
      const matches = p.talla_nombre && sizesParams.includes(p.talla_nombre);
      return matches;
    });
    console.log('After size filter:', filteredProducts.length);
  }
  
  return <ProductList 
    prendas={filteredProducts} 
    showNewArrivals={showNewArrivals} 
    dropValue={dropValue} 
  />;
}
