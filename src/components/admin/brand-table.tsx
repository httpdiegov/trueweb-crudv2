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
import { Marca as Brand } from '@/types';

interface BrandTableProps {
  brands: Brand[];
  onDelete: (id: number) => Promise<void>;
}

export function BrandTable({ brands, onDelete }: BrandTableProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const { toast } = useToast();

  const handleDelete = async (id: number) => {
    try {
      setIsDeleting(id);
      await onDelete(id);
      toast({
        title: 'Marca eliminada',
        description: 'La marca se ha eliminado correctamente.',
      });
    } catch (error) {
      console.error('Error deleting brand:', error);
      toast({
        title: 'Error',
        description: 'No se pudo eliminar la marca. Inténtalo de nuevo.',
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
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {brands.length === 0 ? (
            <TableRow>
              <TableCell colSpan={2} className="h-24 text-center">
                No hay marcas registradas.
              </TableCell>
            </TableRow>
          ) : (
            brands.map((brand) => (
              <TableRow key={brand.id}>
                <TableCell className="font-medium">{brand.nombre_marca}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.push(`/admin/brands/${brand.id}`)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={isDeleting === brand.id}
                    onClick={() => handleDelete(brand.id)}
                  >
                    {isDeleting === brand.id ? (
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
