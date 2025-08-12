
'use client';

import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import type { Prenda } from '@/types';
import { Edit3, PlusCircle, Eye } from 'lucide-react';
import { DeleteProductDialog } from './delete-product-dialog';
import { deleteProduct, setAllProductsVisible } from '@/app/actions/product-actions';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface ProductTableProps {
  prendas: Prenda[];
}

export function ProductTable({ prendas }: ProductTableProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isSettingVisible, setIsSettingVisible] = useState(false);
  
  const handleDeleteProduct = async (id: number) => {
    return deleteProduct(id);
  };
  
  const handleSetAllVisible = async () => {
    setIsSettingVisible(true);
    try {
      const result = await setAllProductsVisible();
      
      if (result.success) {
        toast({
          title: 'Éxito',
          description: result.message,
        });
        router.refresh(); // Refrescar la página para mostrar los cambios
      } else {
        toast({
          title: 'Error',
          description: result.message,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error inesperado al actualizar los productos.',
        variant: 'destructive',
      });
    } finally {
      setIsSettingVisible(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-2 mb-4">
        <Button 
          onClick={handleSetAllVisible}
          disabled={isSettingVisible}
          variant="outline"
          className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
        >
          <Eye className="mr-2 h-5 w-5" />
          {isSettingVisible ? 'Actualizando...' : 'Hacer Todas Visibles'}
        </Button>
        <Button asChild>
          <Link href="/admin/products/new">
            <PlusCircle className="mr-2 h-5 w-5" />
            Añadir Producto
          </Link>
        </Button>
      </div>
      <div className="rounded-lg border shadow-sm overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">SKU</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead className="text-right">Precio</TableHead>
              <TableHead className="text-right">Stock</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Talla</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right w-[120px]">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {prendas.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                  No hay productos para mostrar.
                </TableCell>
              </TableRow>
            )}
            {prendas.map((prenda) => (
              <TableRow key={prenda.id}>
                <TableCell className="font-medium">{prenda.sku}</TableCell>
                <TableCell>{prenda.nombre_prenda}</TableCell>
                <TableCell className="text-right">${prenda.precio.toFixed(2)}</TableCell>
                <TableCell className="text-right">
                  <Badge variant={prenda.stock > 0 ? 'default' : 'destructive'} className={prenda.stock > 0 ? 'bg-green-600 hover:bg-green-700' : ''}>
                    {prenda.stock}
                  </Badge>
                </TableCell>
                <TableCell>{prenda.categoria_nombre || `ID: ${prenda.categoria_id}`}</TableCell>
                <TableCell>{prenda.talla_nombre || `ID: ${prenda.talla_id}`}</TableCell>
                <TableCell>
                  <Badge variant={prenda.estado === 1 ? 'default' : 'destructive'} className={prenda.estado === 1 ? 'bg-green-600 hover:bg-green-700' : ''}>
                    {prenda.estado === 1 ? 'Visible' : 'Oculto'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" asChild className="text-primary hover:text-primary hover:bg-primary/10">
                      <Link href={`/admin/products/edit/${prenda.id}`}>
                        <Edit3 className="h-4 w-4" />
                      </Link>
                    </Button>
                    <DeleteProductDialog 
                      productId={prenda.id} 
                      productName={prenda.nombre_prenda}
                      onDelete={handleDeleteProduct}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
