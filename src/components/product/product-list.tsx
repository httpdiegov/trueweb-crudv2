import type { Prenda } from '@/types';
import { ProductCard } from './product-card';

interface ProductListProps {
  prendas: Prenda[];
}

export function ProductList({ prendas }: ProductListProps) {
  if (!prendas || prendas.length === 0) {
    return <p className="col-span-full text-center text-muted-foreground py-10">No se encontraron productos.</p>;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-2 gap-y-4 sm:gap-x-3 sm:gap-y-6">
      {prendas.map(prenda => (
        <ProductCard key={prenda.id} prenda={prenda} />
      ))}
    </div>
  );
}
