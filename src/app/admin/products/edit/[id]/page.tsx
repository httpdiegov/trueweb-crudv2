'use client';

import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { ProductForm } from '@/components/admin/product-form';
import { fetchProductById } from '@/app/actions/product-actions';
import { handleUpdateProduct } from '@/app/actions/update-product-action';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Prenda } from '@/types';

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  
  const [product, setProduct] = useState<Prenda | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Obtener el ID de los parámetros de la URL
  const id = params?.id ? String(params.id) : '';

  // Cargar los datos del producto
  const loadProduct = useCallback(async () => {
    if (!id) {
      setError('No se proporcionó un ID de producto');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Cargando producto con ID:', id);
      const productData = await fetchProductById(id);
      
      if (!productData) {
        throw new Error(`No se encontró ningún producto con el ID: ${id}`);
      }
      
      console.log('Producto cargado:', productData);
      setProduct(productData);
    } catch (err) {
      console.error('Error al cargar el producto:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar el producto');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadProduct();
  }, [loadProduct]);

  const handleUpdate = useCallback(async (formData: FormData) => {
    try {
      if (!product?.id) {
        throw new Error('ID de producto no válido');
      }
      
      const result = await handleUpdateProduct(product.id.toString(), formData);
      
      if (result?.success) {
        toast({
          title: '¡Éxito!',
          description: 'El producto se ha actualizado correctamente',
          variant: 'default',
        });
        
        // Redirigir después de un breve retraso para mostrar el toast
        setTimeout(() => {
          router.push('/admin/products');
          router.refresh();
        }, 1000);
        
        return result;
      } else {
        throw new Error(result?.message || 'Error al actualizar el producto');
      }
    } catch (error) {
      console.error('Error al actualizar el producto:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error al actualizar el producto',
        variant: 'destructive',
      });
      // Relanzar el error para que el formulario lo maneje
      throw error;
    }
  }, [product, router, toast]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-red-500">{error || 'Producto no encontrado'}</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <ProductForm
        key={product.id}
        initialData={product}
        onSubmitAction={handleUpdate}
        isEditing={true}
      />
    </div>
  );
}
