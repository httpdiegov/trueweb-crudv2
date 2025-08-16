
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
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import type { Prenda } from '@/types';
import { Edit3, PlusCircle, Eye, Package, ToggleLeft } from 'lucide-react';
import { DeleteProductDialog } from './delete-product-dialog';
import { deleteProduct, setAllProductsVisible, updateMultipleProductsStock, updateMultipleProductsStatus } from '@/app/actions/product-actions';
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
  
  // Estados para selección múltiple
  const [selectedProducts, setSelectedProducts] = useState<Set<number>>(new Set());
  const [isAllSelected, setIsAllSelected] = useState(false);
  
  // Estados para edición rápida
  const [bulkStock, setBulkStock] = useState<string>('');
  const [bulkStatus, setBulkStatus] = useState<string>('');
  const [isUpdatingStock, setIsUpdatingStock] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  
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
  
  // Funciones para manejo de selección múltiple
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set(prendas.map(p => p.id));
      setSelectedProducts(allIds);
      setIsAllSelected(true);
    } else {
      setSelectedProducts(new Set());
      setIsAllSelected(false);
    }
  };
  
  const handleSelectProduct = (productId: number, checked: boolean) => {
    const newSelected = new Set(selectedProducts);
    if (checked) {
      newSelected.add(productId);
    } else {
      newSelected.delete(productId);
      setIsAllSelected(false);
    }
    setSelectedProducts(newSelected);
    
    // Verificar si todos están seleccionados
    if (newSelected.size === prendas.length) {
      setIsAllSelected(true);
    }
  };
  
  // Funciones para edición masiva
  const handleBulkStockUpdate = async () => {
    if (selectedProducts.size === 0) {
      toast({
        title: 'Error',
        description: 'Selecciona al menos un producto.',
        variant: 'destructive',
      });
      return;
    }
    
    const stockValue = parseInt(bulkStock);
    if (isNaN(stockValue) || stockValue < 0) {
      toast({
        title: 'Error',
        description: 'Ingresa un valor de stock válido.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsUpdatingStock(true);
    try {
      const result = await updateMultipleProductsStock(Array.from(selectedProducts), stockValue);
      
      if (result.success) {
        toast({
          title: 'Éxito',
          description: result.message,
        });
        setBulkStock('');
        setSelectedProducts(new Set());
        setIsAllSelected(false);
        router.refresh();
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
        description: 'Error inesperado al actualizar el stock.',
        variant: 'destructive',
      });
    } finally {
      setIsUpdatingStock(false);
    }
  };
  
  const handleBulkStatusUpdate = async () => {
    if (selectedProducts.size === 0) {
      toast({
        title: 'Error',
        description: 'Selecciona al menos un producto.',
        variant: 'destructive',
      });
      return;
    }
    
    if (bulkStatus === '') {
      toast({
        title: 'Error',
        description: 'Selecciona un estado.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsUpdatingStatus(true);
    try {
      const statusValue = parseInt(bulkStatus);
      const result = await updateMultipleProductsStatus(Array.from(selectedProducts), statusValue);
      
      if (result.success) {
        toast({
          title: 'Éxito',
          description: result.message,
        });
        setBulkStatus('');
        setSelectedProducts(new Set());
        setIsAllSelected(false);
        router.refresh();
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
        description: 'Error inesperado al actualizar el estado.',
        variant: 'destructive',
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Barra de acciones para selección múltiple */}
      {selectedProducts.size > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-700">
              {selectedProducts.size} producto{selectedProducts.size !== 1 ? 's' : ''} seleccionado{selectedProducts.size !== 1 ? 's' : ''}
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                setSelectedProducts(new Set());
                setIsAllSelected(false);
              }}
            >
              Limpiar selección
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Actualización de stock */}
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-blue-600" />
              <Input
                type="number"
                placeholder="Nuevo stock"
                value={bulkStock}
                onChange={(e) => setBulkStock(e.target.value)}
                className="w-32"
                min="0"
              />
              <Button 
                onClick={handleBulkStockUpdate}
                disabled={isUpdatingStock || !bulkStock}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isUpdatingStock ? 'Actualizando...' : 'Actualizar Stock'}
              </Button>
            </div>
            
            {/* Actualización de estado */}
            <div className="flex items-center gap-2">
              <ToggleLeft className="h-4 w-4 text-blue-600" />
              <Select value={bulkStatus} onValueChange={setBulkStatus}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Visible</SelectItem>
                  <SelectItem value="0">Oculto</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                onClick={handleBulkStatusUpdate}
                disabled={isUpdatingStatus || !bulkStatus}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isUpdatingStatus ? 'Actualizando...' : 'Actualizar Estado'}
              </Button>
            </div>
          </div>
        </div>
      )}
      
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
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={handleSelectAll}
                  aria-label="Seleccionar todos los productos"
                />
              </TableHead>
              <TableHead className="w-[100px]">SKU</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead className="text-right">Precio</TableHead>
              <TableHead className="text-right">Stock</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Talla</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Separado</TableHead>
              <TableHead className="text-right w-[120px]">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {prendas.length === 0 && (
              <TableRow>
                <TableCell colSpan={10} className="h-24 text-center text-muted-foreground">
                  No hay productos para mostrar.
                </TableCell>
              </TableRow>
            )}
            {prendas.map((prenda) => (
              <TableRow key={prenda.id} className={selectedProducts.has(prenda.id) ? 'bg-blue-50' : ''}>
                <TableCell>
                  <Checkbox
                    checked={selectedProducts.has(prenda.id)}
                    onCheckedChange={(checked) => handleSelectProduct(prenda.id, checked as boolean)}
                    aria-label={`Seleccionar ${prenda.nombre_prenda}`}
                  />
                </TableCell>
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
                <TableCell>
                  <Badge variant={prenda.separado === 1 ? 'default' : 'secondary'} className={prenda.separado === 1 ? 'bg-orange-600 hover:bg-orange-700' : 'bg-gray-500 hover:bg-gray-600'}>
                    {prenda.separado === 1 ? 'Separado' : 'No Separado'}
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
