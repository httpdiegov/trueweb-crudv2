import { Button } from '@/components/ui/button';
import { fetchBrands } from '@/app/actions/brand-actions';
import { BrandTable } from '@/components/admin/brand-table';
import Link from 'next/link';

export default async function BrandsPage() {
  const brands = await fetchBrands();

  const handleDelete = async (id: number) => {
    'use server';
    const { deleteBrand } = await import('@/app/actions/brand-actions');
    await deleteBrand(id);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Marcas</h2>
          <p className="text-muted-foreground">
            Gestiona las marcas de tus productos
          </p>
        </div>
        <Link href="/admin/brands/new">
          <Button>Agregar Marca</Button>
        </Link>
      </div>
      <BrandTable brands={brands} onDelete={handleDelete} />
    </div>
  );
}
