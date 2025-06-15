'use client';

import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Pencil, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Categoria } from '@/types';

interface CategoryTableProps {
  categories: Categoria[];
  onDelete: (id: number) => Promise<void>;
}

export function CategoryTable({ categories, onDelete }: CategoryTableProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const { toast } = useToast();

  const handleDelete = async (id: number) => {
    try {
      setIsDeleting(id);
      await onDelete(id);
      toast({
        title: 'Categoría eliminada',
        description: 'La categoría se ha eliminado correctamente.',
      });
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({
        title: 'Error',
        description: 'No se pudo eliminar la categoría. Inténtalo de nuevo.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Prefijo</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className="h-24 text-center">
                No hay categorías registradas.
              </TableCell>
            </TableRow>
          ) : (
            categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell className="font-medium">{category.nom_categoria}</TableCell>
                <TableCell>{category.prefijo || '-'}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.push(`/admin/categories/${category.id}/edit`)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(category.id)}
                    disabled={isDeleting === category.id}
                  >
                    {isDeleting === category.id ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <Trash2 className="h-4 w-4 text-destructive" />
                    )}
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
