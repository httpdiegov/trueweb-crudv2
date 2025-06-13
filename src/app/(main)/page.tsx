
import { Suspense } from 'react';
import { fetchProducts, fetchAvailableCategories, fetchAvailableSizes } from '@/app/actions/product-actions';
import { ProductList } from '@/components/product/product-list';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ProductFilterPopover } from '@/components/product/product-filter-popover';
import { ArrowUpDown } from 'lucide-react';
import type { Prenda, Categoria, Talla } from '@/types';

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

async function FilteredProductList({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined }}) {
  let products = await fetchProducts();

  // Helper to parse comma-separated strings from URL params into arrays
  const getArrayFromParam = (paramValue: string | string[] | undefined): string[] => {
    if (!paramValue) return [];
    if (Array.isArray(paramValue)) return paramValue.filter(Boolean); // Already an array
    return paramValue.split(',').filter(Boolean); // Split string and filter empty
  };

  const { category, size } = await searchParams; // Destructure here
  const categoriesParams = getArrayFromParam(category);
  const sizesParams = getArrayFromParam(size);
  
  if (categoriesParams.length > 0) {
    products = products.filter(p => p.categoria_nombre && categoriesParams.includes(p.categoria_nombre));
  }
  if (sizesParams.length > 0) {
    products = products.filter(p => p.talla_nombre && sizesParams.includes(p.talla_nombre));
  }
  
  return <ProductList prendas={products} />;
}

interface HomePageProps {
  params: {}; 
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const availableCategories = await fetchAvailableCategories();
  const availableSizes = await fetchAvailableSizes();

  return (
    <div className="container mx-auto max-w-screen-2xl px-2 py-4 sm:px-4 sm:py-6 md:px-6 md:py-8">
      <div className="mb-6 flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-2 px-2 sm:px-0">
        <ProductFilterPopover 
          availableCategories={availableCategories} 
          availableSizes={availableSizes} 
        />
        <Button variant="default" size="default" className="w-full sm:w-auto">
          <ArrowUpDown className="mr-2 h-4 w-4" />
          Ordenar productos
        </Button>
      </div>

      <section>
        <Suspense fallback={<ProductListLoadingSkeleton />}>
          <FilteredProductList searchParams={searchParams} />
        </Suspense>
      </section>
    </div>
  );
}
