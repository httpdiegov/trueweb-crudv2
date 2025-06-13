
'use client';

import { useState, useEffect, useCallback } from 'react';
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

export function ProductFilters({ availableCategories, availableSizes }: ProductFiltersProps) {
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


  const handleCategoryChange = (categoryName: string, checked: boolean) => {
    setSelectedCategoryNames(prev =>
      checked ? [...prev, categoryName] : prev.filter(name => name !== categoryName)
    );
  };

  const handleSizeChange = (tallaName: string, checked: boolean) => {
    setSelectedTallaNames(prev =>
      checked ? [...prev, tallaName] : prev.filter(name => name !== tallaName)
    );
  };

  const handlePriceChange = (priceLabel: string) => {
    setSelectedPriceRange(priceLabel);
  };

  const clearFilters = () => {
    setSelectedCategoryNames([]);
    setSelectedTallaNames([]);
    setSelectedPriceRange(PRECIO_RANGES[0].label);
    // updateUrlParams will be called by the useEffect dependency change
  };

  const hasActiveFilters = selectedCategoryNames.length > 0 || selectedTallaNames.length > 0 || selectedPriceRange !== PRECIO_RANGES[0].label;

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
                {availableCategories.map(categoria => (
                  <div key={categoria.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`cat-${categoria.id}`}
                      checked={selectedCategoryNames.includes(categoria.nom_categoria)}
                      onCheckedChange={(checked) => handleCategoryChange(categoria.nom_categoria, !!checked)}
                    />
                    <Label htmlFor={`cat-${categoria.id}`} className="font-normal cursor-pointer">{categoria.nom_categoria}</Label>
                  </div>
                ))}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="tallas">
              <AccordionTrigger className="font-headline text-lg">Talla</AccordionTrigger>
              <AccordionContent className="space-y-2">
                {availableSizes.map(talla => (
                  <div key={talla.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`talla-${talla.id}`}
                      checked={selectedTallaNames.includes(talla.nom_talla)}
                      onCheckedChange={(checked) => handleSizeChange(talla.nom_talla, !!checked)}
                    />
                    <Label htmlFor={`talla-${talla.id}`} className="font-normal cursor-pointer">{talla.nom_talla}</Label>
                  </div>
                ))}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="precio">
              <AccordionTrigger className="font-headline text-lg">Rango de Precio</AccordionTrigger>
              <AccordionContent>
                <RadioGroup value={selectedPriceRange} onValueChange={handlePriceChange} className="space-y-2">
                  {PRECIO_RANGES.map(range => (
                    <div key={range.label} className="flex items-center space-x-2">
                      <RadioGroupItem value={range.label} id={`price-${range.label}`} />
                      <Label htmlFor={`price-${range.label}`} className="font-normal cursor-pointer">{range.label}</Label>
                    </div>
                  ))}
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
}
