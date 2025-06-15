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
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

export const brandFormSchema = z.object({
  nombre_marca: z.string().min(2, { message: 'El nombre de la marca debe tener al menos 2 caracteres.' })
});

type BrandFormValues = z.infer<typeof brandFormSchema>;

export interface BrandFormSubmitResult {
  success: boolean;
  message: string;
  id?: number;
}

interface BrandFormProps {
  initialData?: {
    nombre_marca: string;
  } | null;
  onSubmit: (data: BrandFormValues) => Promise<BrandFormSubmitResult>;
  onSuccess?: () => void;
  isEditing?: boolean;
}

export function BrandForm({ initialData, onSubmit, onSuccess, isEditing = false }: BrandFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<BrandFormValues>({
    resolver: zodResolver(brandFormSchema),
    defaultValues: initialData || {
      nombre_marca: ''
    },
  });

  const handleSubmit = async (data: BrandFormValues) => {
    try {
      setIsLoading(true);
      const result = await onSubmit(data);
      if (result.success) {
        if (onSuccess) {
          onSuccess();
        }
      } else {
        throw new Error(result.message);
      }
      toast({
        title: isEditing ? 'Marca actualizada' : 'Marca creada',
        description: isEditing 
          ? 'La marca se ha actualizado correctamente.' 
          : 'La marca se ha creado correctamente.',
      });
      router.push('/admin/brands');
      router.refresh();
    } catch (error) {
      console.error('Error al guardar la marca:', error);
      toast({
        title: 'Error',
        description: 'Ocurrió un error al guardar la marca. Por favor, inténtalo de nuevo.',
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
              name="nombre_marca"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder="Nombre de la marca" {...field} />
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
              onClick={() => router.push('/admin/brands')}
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
