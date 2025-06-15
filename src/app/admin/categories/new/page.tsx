'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { CategoryForm } from '@/components/admin/category-form';
import { createCategory } from '@/app/actions/category-actions';

export default function NewCategoryPage() {
  const router = useRouter();

  const handleSubmit = async (data: { nom_categoria: string; prefijo: string }) => {
    try {
      const formData = new FormData();
      formData.append('nom_categoria', data.nom_categoria);
      formData.append('prefijo', data.prefijo);
      
      await createCategory(formData);
      
      router.push('/admin/categories');
      router.refresh();
    } catch (error) {
      console.error('Error creating category:', error);
      throw error; // This will be caught by the form's error handling
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Nueva Categoría</h2>
          <p className="text-muted-foreground">
            Agrega una nueva categoría a tu catálogo
          </p>
        </div>
        <Link href="/admin/categories">
          <Button variant="outline">Volver a Categorías</Button>
        </Link>
      </div>
      <div className="max-w-2xl">
        <CategoryForm 
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}
