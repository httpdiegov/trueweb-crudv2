'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Edit2, Trash2, Eye, EyeOff, Plus } from 'lucide-react';
import { deleteProduct, updateMultipleProductsStock, updateMultipleProductsStatus } from '@/app/actions/product-actions';
import { toast } from '@/hooks/use-toast';
import type { Prenda } from '@/types';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface AdminProductGalleryProps {
  prendas: Prenda[];
}

export function AdminProductGallery({ prendas }: AdminProductGalleryProps) {
  const router = useRouter();
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [stockUpdates, setStockUpdates] = useState<Record<string, number>>({});
  const [statusUpdates, setStatusUpdates] = useState<Record<string, boolean>>({});
  const [isUpdating, setIsUpdating] = useState(false);

  // Función para obtener la mejor imagen disponible
  const getBestImage = (prenda: Prenda) => {
    // Priorizar imágenes B&N
    const bwImages = prenda.imagenes_bw || [];
    if (bwImages.length > 0 && bwImages[0].url) {
      return bwImages[0].url;
    }
    
    // Si no hay B&N, usar imágenes a color
    const colorImages = prenda.imagenes || [];
    if (colorImages.length > 0 && colorImages[0].url) {
      return colorImages[0].url;
    }
    
    return '/placeholder-product.jpg';
  };

  const handleSelectProduct = (sku: string) => {
    setSelectedProducts(prev => 
      prev.includes(sku) 
        ? prev.filter(s => s !== sku)
        : [...prev, sku]
    );
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === prendas.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(prendas.map(p => p.sku));
    }
  };

  const handleStockChange = async (sku: string, stock: number) => {
    const product = prendas.find(p => p.sku === sku);
    if (!product) return;

    try {
      await updateMultipleProductsStock([product.id], stock);
      toast({
        title: 'Éxito',
        description: `Stock actualizado a ${stock} para ${product.nombre_prenda}`
      });
      router.refresh();
    } catch (error) {
      console.error('Error updating stock:', error);
      toast({
        title: 'Error',
        description: 'Error al actualizar el stock',
        variant: 'destructive'
      });
    }
  };

  const handleStatusChange = async (sku: string, visible: boolean) => {
    const product = prendas.find(p => p.sku === sku);
    if (!product) return;

    try {
      await updateMultipleProductsStatus([product.id], visible ? 1 : 0);
      toast({
        title: 'Éxito',
        description: `Producto ${visible ? 'visible' : 'oculto'}: ${product.nombre_prenda}`
      });
      router.refresh();
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: 'Error',
        description: 'Error al actualizar el estado',
        variant: 'destructive'
      });
    }
  };

  const handleBulkUpdate = async () => {
    if (Object.keys(stockUpdates).length === 0 && Object.keys(statusUpdates).length === 0) {
      toast({
        title: 'Error',
        description: 'No hay cambios para aplicar',
        variant: 'destructive'
      });
      return;
    }

    setIsUpdating(true);
    try {
      // Actualizar cada producto individualmente
      const updatePromises = [];
      
      // Procesar actualizaciones de stock
      for (const [sku, newStock] of Object.entries(stockUpdates)) {
        const product = prendas.find(p => p.sku === sku);
        if (product) {
          updatePromises.push(
            updateMultipleProductsStock([product.id], newStock)
          );
        }
      }
      
      // Procesar actualizaciones de estado
      for (const [sku, visible] of Object.entries(statusUpdates)) {
        const product = prendas.find(p => p.sku === sku);
        if (product) {
          updatePromises.push(
            updateMultipleProductsStatus([product.id], visible ? 1 : 0)
          );
        }
      }
      
      await Promise.all(updatePromises);
      
      toast({
        title: 'Éxito',
        description: 'Productos actualizados correctamente'
      });
      setStockUpdates({});
      setStatusUpdates({});
      router.refresh();
    } catch (error) {
      console.error('Error updating products:', error);
      toast({
        title: 'Error',
        description: 'Error al actualizar productos',
        variant: 'destructive'
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (sku: string) => {
    const product = prendas.find(p => p.sku === sku);
    if (!product) return;

    if (!confirm(`¿Estás seguro de que quieres eliminar el producto ${product.nombre_prenda}?`)) {
      return;
    }

    try {
      await deleteProduct(product.id);
      toast({
        title: 'Éxito',
        description: 'Producto eliminado correctamente'
      });
      router.refresh();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: 'Error',
        description: 'Error al eliminar producto',
        variant: 'destructive'
      });
    }
  };

  const handleMakeAllVisible = async () => {
    const hiddenProducts = prendas.filter(p => p.estado === 0);
    if (hiddenProducts.length === 0) {
      toast({
        title: 'Info',
        description: 'Todos los productos ya están visibles'
      });
      return;
    }

    setIsUpdating(true);
    try {
      const productIds = hiddenProducts.map(p => p.id);
      await updateMultipleProductsStatus(productIds, 1);
      toast({
        title: 'Éxito',
        description: `${hiddenProducts.length} productos ahora están visibles`
      });
      router.refresh();
    } catch (error) {
      console.error('Error making products visible:', error);
      toast({
        title: 'Error',
        description: 'Error al hacer productos visibles',
        variant: 'destructive'
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Controles superiores */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center gap-2">
          <Checkbox
            checked={selectedProducts.length === prendas.length && prendas.length > 0}
            onCheckedChange={handleSelectAll}
          />
          <span className="text-sm text-muted-foreground">
            {selectedProducts.length} de {prendas.length} seleccionados
          </span>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={handleBulkUpdate}
            disabled={isUpdating || (Object.keys(stockUpdates).length === 0 && Object.keys(statusUpdates).length === 0)}
            size="sm"
            className="hidden"
          >
            {isUpdating ? 'Actualizando...' : 'Aplicar Cambios'}
          </Button>
          <Button
            onClick={handleMakeAllVisible}
            disabled={isUpdating}
            variant="outline"
            size="sm"
          >
            Hacer Todos Visibles
          </Button>
          <Button asChild size="sm">
            <Link href="/admin/products/new">
              <Plus className="h-4 w-4 mr-1" />
              Nuevo Producto
            </Link>
          </Button>
        </div>
      </div>

      {/* Grid de productos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {prendas.map((prenda) => {
          const currentStock = prenda.stock;
          const currentVisible = prenda.estado === 1;
          const imageUrl = getBestImage(prenda);
          
          return (
            <Card key={prenda.sku} className="group relative overflow-hidden">
              <CardContent className="p-0">
                {/* Checkbox de selección */}
                <div className="absolute top-2 left-2 z-10">
                  <Checkbox
                    checked={selectedProducts.includes(prenda.sku)}
                    onCheckedChange={() => handleSelectProduct(prenda.sku)}
                    className="bg-white/80 backdrop-blur-sm"
                  />
                </div>

                {/* Imagen del producto */}
                <div className="aspect-square relative overflow-hidden bg-gray-100">
                  <img
                    src={imageUrl}
                    alt={prenda.nombre_prenda}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder-product.jpg';
                    }}
                  />
                  
                  {/* Overlay con acciones */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button size="sm" variant="secondary" asChild>
                      <Link href={`/admin/products/edit/${prenda.id}`}>
                        <Edit2 className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => handleDelete(prenda.sku)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Badge de estado */}
                  {!currentVisible && (
                    <Badge variant="secondary" className="absolute top-2 right-2">
                      <EyeOff className="h-3 w-3 mr-1" />
                      Oculto
                    </Badge>
                  )}
                  
                  {currentStock === 0 && (
                    <Badge variant="destructive" className="absolute bottom-2 right-2">
                      Sin Stock
                    </Badge>
                  )}
                </div>

                {/* Información del producto */}
                <div className="p-3 space-y-2">
                  <div>
                    <h3 className="font-medium text-sm line-clamp-2">{prenda.nombre_prenda}</h3>
                    <p className="text-xs text-muted-foreground">{prenda.sku}</p>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium">${prenda.precio}</span>
                    <span className="text-muted-foreground">{prenda.talla_nombre}</span>
                  </div>
                  
                  <Badge variant="outline" className="text-xs">
                    {prenda.categoria_nombre}
                  </Badge>

                  {/* Controles de edición rápida */}
                  <div className="space-y-2 pt-2 border-t">
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-muted-foreground w-12">Stock:</label>
                      <Input
                        type="number"
                        value={currentStock}
                        onChange={(e) => handleStockChange(prenda.sku, parseInt(e.target.value) || 0)}
                        className="h-6 text-xs"
                        min="0"
                      />
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-muted-foreground w-12">Estado:</label>
                      <Select
                        value={currentVisible ? 'visible' : 'hidden'}
                        onValueChange={(value) => handleStatusChange(prenda.sku, value === 'visible')}
                      >
                        <SelectTrigger className="h-6 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="visible">
                            <div className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              Visible
                            </div>
                          </SelectItem>
                          <SelectItem value="hidden">
                            <div className="flex items-center gap-1">
                              <EyeOff className="h-3 w-3" />
                              Oculto
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {prendas.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No hay productos disponibles</p>
          <Button asChild className="mt-4">
            <Link href="/admin/products/new">
              <Plus className="h-4 w-4 mr-1" />
              Crear Primer Producto
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}