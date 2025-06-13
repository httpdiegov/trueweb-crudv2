import { fetchProducts } from '@/app/actions/product-actions';
import { ProductTable } from '@/components/admin/product-table';
import { Skeleton } from '@/components/ui/skeleton';
import { Suspense } from 'react';

function ProductTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-10 w-1/4" />
      </div>
      <div className="rounded-lg border shadow-sm overflow-hidden">
        <div className="p-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-4 py-2 border-b last:border-b-0">
              <Skeleton className="h-6 w-1/6" />
              <Skeleton className="h-6 w-2/6" />
              <Skeleton className="h-6 w-1/6" />
              <Skeleton className="h-6 w-1/6" />
              <Skeleton className="h-6 w-1/6" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

async function Products() {
  const prendas = await fetchProducts();
  return <ProductTable prendas={prendas} />;
}

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={<ProductTableSkeleton />}>
      <Products />
    </Suspense>
  );
}
