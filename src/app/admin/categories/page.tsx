import { Button } from '@/components/ui/button';
import { fetchCategories } from '@/app/actions/category-actions';
import { CategoryTable } from '@/components/admin/category-table';
import Link from 'next/link';

export default async function CategoriesPage() {
  const categories = await fetchCategories();

  const handleDelete = async (id: number): Promise<void> => {
    'use server';
    const { deleteCategory } = await import('@/app/actions/category-actions');
    await deleteCategory(id);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Categorías</h2>
          <p className="text-muted-foreground">
            Gestiona las categorías de tus productos
          </p>
        </div>
        <Link href="/admin/categories/new">
          <Button>Agregar Categoría</Button>
        </Link>
      </div>
      <CategoryTable categories={categories} onDelete={handleDelete} />
    </div>
  );
}
