import { fetchProducts } from '@/app/actions/product-actions';
import { ProductTable } from '@/components/admin/product-table';

export default async function ProductsPage() {
  const prendas = await fetchProducts();

  return <ProductTable prendas={prendas} />;
}
