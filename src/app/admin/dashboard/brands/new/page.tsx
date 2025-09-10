'use client';

import { useRouter } from 'next/navigation';
import { BrandForm, type BrandFormSubmitResult } from '@/components/admin/brand-form';
import { createBrand } from '@/app/actions/brand-actions';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

// Client-side handler that calls the server action
async function handleCreateBrand(data: { nombre_marca: string }): Promise<BrandFormSubmitResult> {
  const formData = new FormData();
  formData.append('nombre_marca', data.nombre_marca);
  return await createBrand(formData);
}

export default function NewBrandPage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push('/admin/brands');
    router.refresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Nueva Marca</h2>
          <p className="text-muted-foreground">
            Agrega una nueva marca a tu catálogo
          </p>
        </div>
        <Link href="/admin/brands">
          <Button variant="outline">Volver a Marcas</Button>
        </Link>
      </div>
      <div className="max-w-2xl">
        <BrandForm 
          onSubmit={handleCreateBrand}
          onSuccess={handleSuccess}
        />
      </div>
    </div>
  );
}
