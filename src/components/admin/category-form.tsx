'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export const categoryFormSchema = z.object({
  nom_categoria: z.string().min(2, { message: 'El nombre de la categoría debe tener al menos 2 caracteres.' }),
  prefijo: z.string().min(1, { message: 'El prefijo es requerido' })
});

type CategoryFormValues = z.infer<typeof categoryFormSchema>;

interface CategoryFormProps {
  initialData?: {
    nom_categoria: string;
    prefijo: string;
  } | null;
  onSubmit: (data: CategoryFormValues) => Promise<void>;
  isEditing?: boolean;
}

export function CategoryForm({ initialData, onSubmit, isEditing = false }: CategoryFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: initialData || {
      nom_categoria: '',
      prefijo: ''
    },
  });

  const handleSubmit = async (data: CategoryFormValues) => {
    try {
      setIsLoading(true);
      await onSubmit(data);
      toast({
        title: isEditing ? 'Categoría actualizada' : 'Categoría creada',
        description: isEditing 
          ? 'La categoría se ha actualizado correctamente.' 
          : 'La categoría se ha creado correctamente.',
      });
      router.push('/admin/categories');
      router.refresh();
    } catch (error) {
      console.error('Error al guardar la categoría:', error);
      toast({
        title: 'Error',
        description: 'Ocurrió un error al guardar la categoría. Por favor, inténtalo de nuevo.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <FormField
              control={form.control}
              name="nom_categoria"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder="Nombre de la categoría" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="prefijo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prefijo</FormLabel>
                  <FormControl>
                    <Input placeholder="Prefijo para la categoría" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/admin/categories')}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : isEditing ? (
                'Actualizar'
              ) : (
                'Crear'
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
