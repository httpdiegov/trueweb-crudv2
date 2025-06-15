
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
import { Edit3, PlusCircle } from 'lucide-react';
import { DeleteProductDialog } from './delete-product-dialog';
import { deleteProduct } from '@/app/actions/product-actions';
import { Badge } from '@/components/ui/badge';

interface ProductTableProps {
  prendas: Prenda[];
}

export function ProductTable({ prendas }: ProductTableProps) {
  
  const handleDeleteProduct = async (id: number) => {
    return deleteProduct(id);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end mb-4">
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
              <TableHead className="text-right w-[120px]">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {prendas.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
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
