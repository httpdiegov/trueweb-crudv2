
'use client';

import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { PRECIO_RANGES } from '@/lib/constants';
import { XIcon, FilterIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Categoria, Talla } from '@/types';

interface ProductFiltersProps {
  availableCategories: Categoria[];
  availableSizes: Talla[];
}

// Memoized CategoryFilter component
interface CategoryFilterProps {
  categoria: Categoria;
  isChecked: boolean;
  onChange: (name: string, checked: boolean) => void;
}

const CategoryFilter = memo(({ categoria, isChecked, onChange }: CategoryFilterProps) => {
  const handleChange = useCallback((checked: boolean | 'indeterminate') => {
    onChange(categoria.nom_categoria, !!checked);
  }, [categoria.nom_categoria, onChange]);

  return (
    <div className="flex items-center space-x-2">
      <Checkbox
        id={`cat-${categoria.id}`}
        checked={isChecked}
        onCheckedChange={handleChange}
      />
      <Label htmlFor={`cat-${categoria.id}`} className="font-normal cursor-pointer">
        {categoria.nom_categoria}
      </Label>
    </div>
  );
});
CategoryFilter.displayName = 'CategoryFilter';

// Memoized SizeFilter component
interface SizeFilterProps {
  talla: Talla;
  isChecked: boolean;
  onChange: (name: string, checked: boolean) => void;
}

const SizeFilter = memo(({ talla, isChecked, onChange }: SizeFilterProps) => {
  const handleChange = useCallback((checked: boolean | 'indeterminate') => {
    onChange(talla.nom_talla, !!checked);
  }, [talla.nom_talla, onChange]);

  return (
    <div className="flex items-center space-x-2">
      <Checkbox
        id={`talla-${talla.id}`}
        checked={isChecked}
        onCheckedChange={handleChange}
      />
      <Label htmlFor={`talla-${talla.id}`} className="font-normal cursor-pointer">
        {talla.nom_talla}
      </Label>
    </div>
  );
});
SizeFilter.displayName = 'SizeFilter';

// Memoized PriceFilter component
interface PriceFilterProps {
  range: { label: string; min: number; max: number };
  isSelected: boolean;
  onValueChange: (priceLabel: string) => void;
}

const PriceFilter = memo(({ range, isSelected, onValueChange }: PriceFilterProps) => {
  const handleChange = useCallback(() => {
    onValueChange(range.label);
  }, [range.label, onValueChange]);

  return (
    <div className="flex items-center space-x-2">
      <RadioGroupItem 
        value={range.label} 
        id={`price-${range.label}`}
        onClick={handleChange}
      />
      <Label htmlFor={`price-${range.label}`} className="font-normal cursor-pointer">
        {range.label}
      </Label>
    </div>
  );
});
PriceFilter.displayName = 'PriceFilter';

export const ProductFilters = memo(({ availableCategories, availableSizes }: ProductFiltersProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const getInitialArrayFromParams = (paramName: string): string[] => {
    const paramValue = searchParams.get(paramName);
    return paramValue ? paramValue.split(',') : [];
  };

  const [selectedCategoryNames, setSelectedCategoryNames] = useState<string[]>(() => getInitialArrayFromParams('category'));
  const [selectedTallaNames, setSelectedTallaNames] = useState<string[]>(() => getInitialArrayFromParams('size'));
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>(() => searchParams.get('price') || PRECIO_RANGES[0].label);

  const updateUrlParams = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString()); // Preserve existing params

    if (selectedCategoryNames.length > 0) {
      params.set('category', selectedCategoryNames.join(','));
    } else {
      params.delete('category');
    }

    if (selectedTallaNames.length > 0) {
      params.set('size', selectedTallaNames.join(','));
    } else {
      params.delete('size');
    }
    
    if (selectedPriceRange !== PRECIO_RANGES[0].label) {
      params.set('price', selectedPriceRange);
    } else {
      params.delete('price');
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [selectedCategoryNames, selectedTallaNames, selectedPriceRange, router, pathname, searchParams]);

  useEffect(() => {
    updateUrlParams();
  }, [updateUrlParams]);
  
  // Update state if URL changes externally (e.g. browser back/forward)
  useEffect(() => {
    setSelectedCategoryNames(getInitialArrayFromParams('category'));
    setSelectedTallaNames(getInitialArrayFromParams('size'));
    setSelectedPriceRange(searchParams.get('price') || PRECIO_RANGES[0].label);
  }, [searchParams]);


  const handleCategoryChange = useCallback((categoryName: string, checked: boolean) => {
    setSelectedCategoryNames(prev =>
      checked ? [...prev, categoryName] : prev.filter(name => name !== categoryName)
    );
  }, []);

  const handleSizeChange = useCallback((tallaName: string, checked: boolean) => {
    setSelectedTallaNames(prev =>
      checked ? [...prev, tallaName] : prev.filter(name => name !== tallaName)
    );
  }, []);

  const handlePriceChange = useCallback((priceLabel: string) => {
    setSelectedPriceRange(priceLabel);
  }, []);

  const clearFilters = useCallback(() => {
    setSelectedCategoryNames([]);
    setSelectedTallaNames([]);
    setSelectedPriceRange(PRECIO_RANGES[0].label);
    // updateUrlParams will be called by the useEffect dependency change
  }, []);

  const hasActiveFilters = useMemo(() => 
    selectedCategoryNames.length > 0 || 
    selectedTallaNames.length > 0 || 
    selectedPriceRange !== PRECIO_RANGES[0].label
  , [selectedCategoryNames.length, selectedTallaNames.length, selectedPriceRange]);

  // Memoized category filters to prevent unnecessary re-renders
  const categoryFilters = useMemo(() => 
    availableCategories.map(categoria => (
      <CategoryFilter
        key={categoria.id}
        categoria={categoria}
        isChecked={selectedCategoryNames.includes(categoria.nom_categoria)}
        onChange={handleCategoryChange}
      />
    ))
  , [availableCategories, selectedCategoryNames, handleCategoryChange]);

  // Memoized size filters to prevent unnecessary re-renders
  const sizeFilters = useMemo(() => 
    availableSizes.map(talla => (
      <SizeFilter
        key={talla.id}
        talla={talla}
        isChecked={selectedTallaNames.includes(talla.nom_talla)}
        onChange={handleSizeChange}
      />
    ))
  , [availableSizes, selectedTallaNames, handleSizeChange]);

  // Memoized price filters to prevent unnecessary re-renders
  const priceFilters = useMemo(() => 
    PRECIO_RANGES.map(range => (
      <PriceFilter
        key={range.label}
        range={range}
        isSelected={selectedPriceRange === range.label}
        onValueChange={handlePriceChange}
      />
    ))
  , [selectedPriceRange, handlePriceChange]);

  return (
    <div className="lg:sticky lg:top-20 lg:h-[calc(100vh-5rem)]">
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="font-headline text-2xl flex items-center gap-2"><FilterIcon className="h-5 w-5" /> Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" defaultValue={['categorias', 'tallas', 'precio']} className="w-full">
            <AccordionItem value="categorias">
              <AccordionTrigger className="font-headline text-lg">Categoría</AccordionTrigger>
              <AccordionContent className="space-y-2">
                {categoryFilters}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="tallas">
              <AccordionTrigger className="font-headline text-lg">Talla</AccordionTrigger>
              <AccordionContent className="space-y-2">
                {sizeFilters}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="precio">
              <AccordionTrigger className="font-headline text-lg">Rango de Precio</AccordionTrigger>
              <AccordionContent>
                <RadioGroup value={selectedPriceRange} onValueChange={handlePriceChange} className="space-y-2">
                  {priceFilters}
                </RadioGroup>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          {hasActiveFilters && (
            <Button variant="ghost" onClick={clearFilters} className="w-full mt-6 text-primary hover:text-primary">
              <XIcon className="mr-2 h-4 w-4" />
              Limpiar Filtros
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
});
ProductFilters.displayName = 'ProductFilters';
