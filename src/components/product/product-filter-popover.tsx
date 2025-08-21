
'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { XIcon, SlidersHorizontal } from 'lucide-react';
import type { Categoria, Talla } from '@/types';
import { cn } from '@/lib/utils';

interface ProductFilterPopoverProps {
  availableCategories: Categoria[];
  availableSizes: Talla[];
  initialCategory?: string;
  initialSize?: string;
}

export function ProductFilterPopover({ 
  availableCategories, 
  availableSizes,
  initialCategory,
  initialSize 
}: ProductFilterPopoverProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);

  const getInitialArrayFromParams = (paramName: string, initialValue?: string): string[] => {
    // Primero verificar si hay un valor inicial proporcionado
    if (initialValue) {
      return initialValue.split(',').filter(Boolean);
    }
    // Si no hay valor inicial, verificar los parámetros de la URL
    const paramValue = searchParams.get(paramName);
    return paramValue ? paramValue.split(',').filter(Boolean) : [];
  };

  const [selectedCats, setSelectedCats] = useState<string[]>(
    () => getInitialArrayFromParams('category', initialCategory)
  );
  const [selectedUiSizes, setSelectedUiSizes] = useState<string[]>(
    () => getInitialArrayFromParams('size', initialSize)
  );
  const [availableOnly, setAvailableOnly] = useState<boolean>(
    () => searchParams.get('available') === 'true'
  );

  const updateUrlParams = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());

    if (selectedCats.length > 0) {
      params.set('category', selectedCats.join(','));
    } else {
      params.delete('category');
    }

    if (selectedUiSizes.length > 0) {
      params.set('size', selectedUiSizes.join(','));
    } else {
      params.delete('size');
    }

    if (availableOnly) {
      params.set('available', 'true');
    } else {
      params.delete('available');
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    setIsOpen(false); 
  }, [selectedCats, selectedUiSizes, availableOnly, router, pathname, searchParams]);

  // Efecto para sincronizar con los parámetros iniciales cuando cambian
  useEffect(() => {
    if (initialCategory !== undefined) {
      setSelectedCats(getInitialArrayFromParams('category', initialCategory));
    }
  }, [initialCategory]);

  useEffect(() => {
    if (initialSize !== undefined) {
      setSelectedUiSizes(getInitialArrayFromParams('size', initialSize));
    }
  }, [initialSize]);

  // Efecto para sincronizar con los cambios en la URL
  useEffect(() => {
    // Solo actualizar desde los parámetros de la URL si no hay valores iniciales
    if (initialCategory === undefined) {
      setSelectedCats(getInitialArrayFromParams('category'));
    }
    if (initialSize === undefined) {
      setSelectedUiSizes(getInitialArrayFromParams('size'));
    }
    setAvailableOnly(searchParams.get('available') === 'true');
  }, [searchParams, initialCategory, initialSize]);

  const handleCategoryToggle = (categoryName: string) => {
    setSelectedCats(prev => {
      if (categoryName === "Todas") return [];
      const isSelected = prev.includes(categoryName);
      const newSelection = isSelected ? prev.filter(c => c !== categoryName) : [...prev, categoryName];
      return newSelection;
    });
  };

  const handleSizeToggle = (tallaName: string) => {
    setSelectedUiSizes(prev => {
      if (tallaName === "Todas") return [];
      const isSelected = prev.includes(tallaName);
      const newSelection = isSelected ? prev.filter(t => t !== tallaName) : [...prev, tallaName];
      return newSelection;
    });
  };

  const handleClearFilters = () => {
    setSelectedCats([]);
    setSelectedUiSizes([]);
    setAvailableOnly(false);
  };
  
  const handleApplyFilters = () => {
      updateUrlParams();
  }

  const isCategoryTodas = selectedCats.length === 0;
  const isSizeTodas = selectedUiSizes.length === 0;

  // Sort sizes based on 'orden_talla' before rendering
  const sortedSizes = [...availableSizes].sort((a, b) => a.orden_talla - b.orden_talla);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="default" size="default" className="w-full sm:w-auto">
          <SlidersHorizontal className="mr-2 h-4 w-4" />
          Filtrar productos
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[calc(100vw-2rem)] max-w-md p-4 sm:p-6" align="start" sideOffset={16}>
        <div className="space-y-4 max-h-[80vh] overflow-y-auto">
          <div>
            <h4 className="font-medium text-sm mb-2 text-foreground">Talla</h4>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={isSizeTodas ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleSizeToggle("Todas")}
                className={cn("text-xs h-7 px-2.5 py-1", isSizeTodas ? "bg-primary text-primary-foreground hover:bg-primary/90" : "hover:bg-accent")}
              >
                Todas
              </Button>
              {sortedSizes.map(talla => (
                <Button
                  key={talla.id}
                  variant={selectedUiSizes.includes(talla.nom_talla) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleSizeToggle(talla.nom_talla)}
                  className={cn("text-xs h-7 px-2.5 py-1", selectedUiSizes.includes(talla.nom_talla) ? "bg-primary text-primary-foreground hover:bg-primary/90" : "hover:bg-accent")}
                >
                  {talla.nom_talla}
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="font-medium text-sm mb-2 text-foreground">Categoría</h4>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={isCategoryTodas ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleCategoryToggle("Todas")}
                className={cn("text-xs h-7 px-2.5 py-1", isCategoryTodas ? "bg-primary text-primary-foreground hover:bg-primary/90" : "hover:bg-accent")}
              >
                Todas
              </Button>
              {availableCategories.map(cat => (
                <Button
                  key={cat.id}
                  variant={selectedCats.includes(cat.nom_categoria) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleCategoryToggle(cat.nom_categoria)}
                  className={cn("text-xs h-7 px-2.5 py-1", selectedCats.includes(cat.nom_categoria) ? "bg-primary text-primary-foreground hover:bg-primary/90" : "hover:bg-accent")}
                >
                  {cat.nom_categoria}
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="font-medium text-sm mb-2 text-foreground">Disponibilidad</h4>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="available-only"
                checked={availableOnly}
                onChange={(e) => setAvailableOnly(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label htmlFor="available-only" className="text-sm text-foreground cursor-pointer">
                Solo disponibles
              </label>
            </div>
          </div>
          
          <div className="sticky bottom-0 left-0 right-0 bg-background border-t pt-4 -mx-4 px-4 pb-2 -mb-4">
            <div className="flex justify-between items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleClearFilters} 
                className="text-xs h-10 flex-1 sm:flex-none sm:px-4 text-muted-foreground hover:text-destructive"
              >
                <XIcon className="mr-1 h-4 w-4" />
                Limpiar
              </Button>
              <Button 
                size="sm" 
                onClick={handleApplyFilters} 
                className="text-xs h-10 flex-1 sm:flex-none sm:px-6 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Aplicar filtros
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

