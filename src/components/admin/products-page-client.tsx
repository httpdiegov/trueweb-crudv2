'use client';

import { ProductTable } from '@/components/admin/product-table';
import { AdminProductGallery } from '@/components/admin/admin-product-gallery';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Grid, List, Filter, Search } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import type { Prenda } from '@/types';

interface ProductsPageClientProps {
  prendas: Prenda[];
}

export function ProductsPageClient({ prendas }: ProductsPageClientProps) {
  const [viewMode, setViewMode] = useState<'list' | 'gallery'>('list');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTalla, setSelectedTalla] = useState<string>('todas');
  const [selectedMarca, setSelectedMarca] = useState<string>('todas');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Cargar preferencia del usuario desde localStorage
  useEffect(() => {
    const savedViewMode = localStorage.getItem('admin-products-view-mode') as 'list' | 'gallery' | null;
    if (savedViewMode) {
      setViewMode(savedViewMode);
    }
    setIsLoading(false);
  }, []);

  // Guardar preferencia del usuario en localStorage
  const handleViewModeChange = (mode: 'list' | 'gallery') => {
    setViewMode(mode);
    localStorage.setItem('admin-products-view-mode', mode);
  };

  // Extraer listas únicas de tallas y marcas
  const { tallas, marcas } = useMemo(() => {
    const tallasSet = new Set<string>();
    const marcasSet = new Set<string>();

    prendas.forEach(prenda => {
      if (prenda.talla_nombre) {
        tallasSet.add(prenda.talla_nombre);
      }
      if (prenda.marca_nombre) {
        marcasSet.add(prenda.marca_nombre);
      }
    });

    return {
      tallas: Array.from(tallasSet).sort(),
      marcas: Array.from(marcasSet).sort()
    };
  }, [prendas]);

  // Filtrar productos basándose en los filtros seleccionados
  const filteredPrendas = useMemo(() => {
    return prendas.filter(prenda => {
      const tallaMatch = selectedTalla === 'todas' || prenda.talla_nombre === selectedTalla;
      const marcaMatch = selectedMarca === 'todas' || prenda.marca_nombre === selectedMarca;
      const searchMatch = searchTerm === '' || 
        prenda.nombre_prenda.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prenda.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (prenda.categoria_nombre && prenda.categoria_nombre.toLowerCase().includes(searchTerm.toLowerCase()));
      return tallaMatch && marcaMatch && searchMatch;
    });
  }, [prendas, selectedTalla, selectedMarca, searchTerm]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-4">
      {/* Header con título y toggle de vista */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Productos</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Vista:</span>
          <div className="flex border rounded-lg overflow-hidden">
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleViewModeChange('list')}
              className="rounded-none border-0"
            >
              <List className="h-4 w-4 mr-1" />
              Lista
            </Button>
            <Button
              variant={viewMode === 'gallery' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleViewModeChange('gallery')}
              className="rounded-none border-0"
            >
              <Grid className="h-4 w-4 mr-1" />
              Galería
            </Button>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4 p-4 bg-gray-50 rounded-lg border">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <Search className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Filtros y Búsqueda:</span>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          {/* Campo de búsqueda */}
          <div className="flex items-center gap-2 min-w-[200px]">
            <label className="text-sm text-gray-600 whitespace-nowrap">Buscar:</label>
            <Input
              type="text"
              placeholder="Nombre, SKU o categoría..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          
          {/* Filtro por Talla */}
          <div className="flex items-center gap-2 min-w-[150px]">
            <label className="text-sm text-gray-600 whitespace-nowrap">Talla:</label>
            <Select value={selectedTalla} onValueChange={setSelectedTalla}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleccionar talla" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas las tallas</SelectItem>
                {tallas.map(talla => (
                  <SelectItem key={talla} value={talla}>
                    {talla}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filtro por Marca */}
          <div className="flex items-center gap-2 min-w-[150px]">
            <label className="text-sm text-gray-600 whitespace-nowrap">Marca:</label>
            <Select value={selectedMarca} onValueChange={setSelectedMarca}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleccionar marca" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas las marcas</SelectItem>
                {marcas.map(marca => (
                  <SelectItem key={marca} value={marca}>
                    {marca}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Contador de resultados */}
          <div className="flex items-center text-sm text-gray-500 ml-auto">
            {filteredPrendas.length} de {prendas.length} productos
          </div>
        </div>
      </div>

      {/* Contenido según el modo de vista */}
      {viewMode === 'list' ? (
        <ProductTable prendas={filteredPrendas} />
      ) : (
        <AdminProductGallery prendas={filteredPrendas} />
      )}
    </div>
  );
}