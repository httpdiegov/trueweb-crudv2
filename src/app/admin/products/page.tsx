import { fetchProducts } from '@/app/actions/product-actions';
import { ProductsPageClient } from '@/components/admin/products-page-client';
import type { Prenda } from '@/types';



export default async function ProductsPage() {
  const prendas = await fetchProducts();

  return <ProductsPageClient prendas={prendas} />;
}
