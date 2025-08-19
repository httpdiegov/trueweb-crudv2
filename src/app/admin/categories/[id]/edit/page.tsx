import { notFound } from 'next/navigation';
import { fetchCategoryById, updateCategory } from '@/app/actions/category-actions';
import { CategoryForm } from '@/components/admin/category-form';
import type { categoryFormSchema } from '@/components/admin/category-form';
import * as z from 'zod';

type CategoryFormValues = z.infer<typeof categoryFormSchema>;

interface EditCategoryPageProps {
  params: {
    id: string;
  };
}

export default async function EditCategoryPage({ params }: EditCategoryPageProps) {
  const categoryId = parseInt(params.id);
  
  if (isNaN(categoryId)) {
    notFound();
  }

  const category = await fetchCategoryById(categoryId);
  
  if (!category) {
    notFound();
  }

  const handleUpdateCategory = async (data: CategoryFormValues) => {
    'use server';
    const formData = new FormData();
    formData.append('nom_categoria', data.nom_categoria);
    formData.append('prefijo', data.prefijo);
    
    await updateCategory(categoryId, formData);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Editar Categoría</h1>
          <p className="text-gray-600 mt-2">
            Modifica los datos de la categoría "{category.nom_categoria}"
          </p>
        </div>
        
        <CategoryForm 
          initialData={{
            nom_categoria: category.nom_categoria,
            prefijo: category.prefijo || ''
          }}
          onSubmit={handleUpdateCategory}
          isEditing={true}
        />
      </div>
    </div>
  );
}