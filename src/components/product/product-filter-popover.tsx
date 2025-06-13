
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
}

export function ProductFilterPopover({ availableCategories, availableSizes }: ProductFilterPopoverProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);

  const getInitialArrayFromParams = (paramName: string): string[] => {
    const paramValue = searchParams.get(paramName);
    return paramValue ? paramValue.split(',').filter(Boolean) : [];
  };

  const [selectedCats, setSelectedCats] = useState<string[]>(() => getInitialArrayFromParams('category'));
  const [selectedUiSizes, setSelectedUiSizes] = useState<string[]>(() => getInitialArrayFromParams('size')); // Renamed to avoid conflict

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
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    setIsOpen(false); 
  }, [selectedCats, selectedUiSizes, router, pathname, searchParams]);

  useEffect(() => {
    setSelectedCats(getInitialArrayFromParams('category'));
    setSelectedUiSizes(getInitialArrayFromParams('size'));
  }, [searchParams]);

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
      <PopoverContent className="w-80 p-4" align="start">
        <div className="space-y-4">
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
          
          <div className="flex justify-between items-center pt-2 mt-2 border-t">
            <Button variant="ghost" size="sm" onClick={handleClearFilters} className="text-xs h-8 px-3 text-muted-foreground hover:text-destructive">
              <XIcon className="mr-1 h-3 w-3" />
              Limpiar filtros
            </Button>
            <Button size="sm" onClick={handleApplyFilters} className="text-xs h-8 px-4 bg-primary text-primary-foreground hover:bg-primary/90">
              Aplicar filtros
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

