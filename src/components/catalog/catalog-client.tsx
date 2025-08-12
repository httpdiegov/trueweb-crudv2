'use client';

import { useState, useEffect, useMemo } from 'react';
import { fetchPublicProducts } from '@/app/actions/product-actions';
import { ProductList } from '@/components/product/product-list';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ProductFilterPopover } from '@/components/product/product-filter-popover';
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronDown, Sparkles, Filter, X } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Categoria, Talla, Prenda } from '@/types';

interface CatalogClientProps {
  initialCategories: Categoria[];
  initialSizes: Talla[];
  initialDropValue: string;
  category?: string;
  size?: string;
  onCategoryChange?: (category: string | undefined) => void;
  onSizeChange?: (size: string | undefined) => void;
}

export function CatalogClient({
  initialCategories,
  initialSizes,
  initialDropValue,
  category,
  size
}: CatalogClientProps) {
  const [showNewArrivals, setShowNewArrivals] = useState(false);
  const [categories] = useState(initialCategories);
  const [sizes] = useState(initialSizes);
  const [dropValue] = useState(initialDropValue);
  const [products, setProducts] = useState<Prenda[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortOption, setSortOption] = useState<string>('');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);

  // Cargar productos al montar el componente
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setIsLoading(true);
        const data = await fetchPublicProducts();
        setProducts(data);
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, []);

  // Función auxiliar para convertir parámetros de URL en arrays
  const getArrayFromParam = (param: string | string[] | undefined): string[] => {
    if (!param) return [];
    if (Array.isArray(param)) return param.filter(Boolean);
    return param.split(',').filter(Boolean);
  };

  // Procesar parámetros de búsqueda
  const categoriesParams = useMemo(() => {
    return selectedCategories.length > 0 ? selectedCategories : getArrayFromParam(category);
  }, [category, selectedCategories]);
  
  const sizesParams = useMemo(() => {
    return selectedSizes.length > 0 ? selectedSizes : getArrayFromParam(size);
  }, [size, selectedSizes]);

  // Aplicar filtros y ordenación
  const filteredAndSortedProducts = useMemo(() => {
    console.log('Aplicando filtros con:', { 
      categoriesParams, 
      sizesParams, 
      showNewArrivals, 
      dropValue,
      sortOption,
      totalProducts: products.length
    });
    
    // 1. Aplicar filtro de categoría si existe
    let filtered = [...products];
    
    if (categoriesParams.length > 0) {
      filtered = filtered.filter(p => 
        p.categoria_nombre && categoriesParams.includes(p.categoria_nombre)
      );
      console.log(`Después de filtrar por categoría (${categoriesParams.join(', ')}):`, filtered.length, 'productos');
    }
    
    // 2. Aplicar filtro de talla si existe
    if (sizesParams.length > 0) {
      filtered = filtered.filter(p => 
        p.talla_nombre && sizesParams.includes(p.talla_nombre)
      );
      console.log(`Después de filtrar por talla (${sizesParams.join(', ')}):`, filtered.length, 'productos');
    }
    
    // 3. Aplicar filtro de nuevos ingresos si está activado
    if (showNewArrivals && dropValue) {
      const dropProducts = filtered.filter(p => p.drop_name === dropValue);
      const nonDropProducts = filtered.filter(p => p.drop_name !== dropValue);
      filtered = [...dropProducts, ...nonDropProducts];
      console.log('Después de filtrar por nuevos ingresos:', filtered.length, 'productos');
    }

    // 4. Aplicar ordenación
    const sorted = [...filtered].sort((a, b) => {
      switch (sortOption) {
        case 'price-asc':
          return a.precio - b.precio;
        case 'price-desc':
          return b.precio - a.precio;
        case 'size-asc':
          return (a.talla_nombre || '').localeCompare(b.talla_nombre || '');
        case 'size-desc':
          return (b.talla_nombre || '').localeCompare(a.talla_nombre || '');
        default:
          return 0;
      }
    });
    
    console.log('Productos después de aplicar todos los filtros y ordenación:', sorted.length);
    return sorted;
  }, [products, categoriesParams, sizesParams, showNewArrivals, dropValue, sortOption]);
  
  // Handle category toggle
  const toggleCategory = (categoryName: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryName)
        ? prev.filter(c => c !== categoryName)
        : [...prev, categoryName]
    );
  };

  // Handle size toggle
  const toggleSize = (sizeName: string) => {
    setSelectedSizes(prev => 
      prev.includes(sizeName)
        ? prev.filter(s => s !== sizeName)
        : [...prev, sizeName]
    );
  };

  // Toggle new arrivals
  const toggleNewArrivals = () => {
    setShowNewArrivals(!showNewArrivals);
  };

  return (
    <div className="container mx-auto max-w-screen-2xl px-2 py-4 sm:px-4 sm:py-6 md:px-6 md:py-8">
      <div className="flex flex-col md:flex-row justify-end items-start md:items-center mb-6 gap-4">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
            >
              <Filter className="h-4 w-4" />
              Filtrar Prendas
              {(selectedCategories.length > 0 || selectedSizes.length > 0) && (
                <span className="ml-1 h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">
                  {selectedCategories.length + selectedSizes.length}
                </span>
              )}
            </Button>
            
            {isFilterOpen && (
              <div className="fixed inset-0 z-50 overflow-y-auto">
                <div className="flex min-h-screen items-end justify-center text-center sm:block sm:p-0">
                  {/* Fondo oscuro */}
                  <div 
                    className="fixed inset-0 bg-black/50 transition-opacity" 
                    onClick={() => setIsFilterOpen(false)}
                  />
                  
                  {/* Panel de filtros */}
                  <div className="fixed inset-x-0 bottom-0 transform bg-white dark:bg-gray-900 rounded-t-2xl shadow-xl transition-all sm:my-8 sm:mx-auto sm:max-w-lg sm:rounded-lg sm:max-h-[90vh] flex flex-col">
                    {/* Encabezado */}
                    <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 px-4 pt-4 pb-3 border-b">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Filtros</h3>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedCategories([]);
                              setSelectedSizes([]);
                            }}
                            className="text-sm text-primary hover:bg-transparent hover:text-primary/80 px-2 h-8"
                          >
                            Limpiar
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsFilterOpen(false)}
                            className="h-9 w-9 p-0 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                          >
                            <X className="h-5 w-5" />
                            <span className="sr-only">Cerrar</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Contenido desplazable */}
                    <ScrollArea className="flex-1 px-4 py-2">
                      <div className="space-y-6 py-2">
                        {/* Sección de Categorías */}
                        <div className="space-y-3">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white px-1">Tipo de Prenda</h4>
                          <div className="space-y-2">
                            {categories.map((cat) => (
                              <div key={cat.id} className="flex items-center space-x-3 py-1.5 px-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                <Checkbox 
                                  id={`cat-${cat.id}`}
                                  checked={selectedCategories.includes(cat.nom_categoria)}
                                  onCheckedChange={(checked) => toggleCategory(cat.nom_categoria)}
                                  className="h-5 w-5 rounded-md border-gray-300 text-primary focus:ring-primary"
                                />
                                <Label 
                                  htmlFor={`cat-${cat.id}`} 
                                  className="text-sm font-normal text-gray-900 dark:text-gray-100 cursor-pointer flex-1"
                                >
                                  {cat.nom_categoria}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        {/* Sección de Tallas */}
                        <div className="space-y-3 pb-4">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white px-1">Tallas</h4>
                          <div className="grid grid-cols-6 gap-2">
                            {sizes.map((size) => (
                              <div key={size.id} className="flex items-center justify-center">
                                <Checkbox 
                                  id={`size-${size.id}`}
                                  className="sr-only"
                                  checked={selectedSizes.includes(size.nom_talla)}
                                  onCheckedChange={(checked) => toggleSize(size.nom_talla)}
                                />
                                <Label 
                                  htmlFor={`size-${size.id}`}
                                  className={`flex items-center justify-center h-12 w-full rounded-lg border-2 text-sm font-medium cursor-pointer transition-colors ${
                                    selectedSizes.includes(size.nom_talla)
                                      ? 'bg-primary text-white border-primary'
                                      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 hover:border-gray-300 dark:hover:border-gray-600'
                                  }`}
                                >
                                  {size.nom_talla}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </ScrollArea>
                    

                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="relative">
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2"
              onClick={() => setIsSortOpen(!isSortOpen)}
            >
              <ArrowUpDown className="h-4 w-4" />
              Ordenar
              <ChevronDown className={`h-4 w-4 transition-transform ${isSortOpen ? 'rotate-180' : ''}`} />
            </Button>
            {isSortOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-50">
                <div className="py-1" role="menu" aria-orientation="vertical">
                  <button
                    onClick={() => {
                      setSortOption('price-asc');
                      setIsSortOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 ${sortOption === 'price-asc' ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
                    role="menuitem"
                  >
                    <ArrowUp className="h-4 w-4" />
                    Precio: Menor a mayor
                  </button>
                  <button
                    onClick={() => {
                      setSortOption('price-desc');
                      setIsSortOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 ${sortOption === 'price-desc' ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
                    role="menuitem"
                  >
                    <ArrowDown className="h-4 w-4" />
                    Precio: Mayor a menor
                  </button>
                  <button
                    onClick={() => {
                      setSortOption('size-asc');
                      setIsSortOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 ${sortOption === 'size-asc' ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
                    role="menuitem"
                  >
                    <ArrowUp className="h-4 w-4" />
                    Talla: A-Z
                  </button>
                  <button
                    onClick={() => {
                      setSortOption('size-desc');
                      setIsSortOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 ${sortOption === 'size-desc' ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
                    role="menuitem"
                  >
                    <ArrowDown className="h-4 w-4" />
                    Talla: Z-A
                  </button>
                </div>
              </div>
            )}
          </div>
          {sortOption && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs text-muted-foreground"
              onClick={() => setSortOption('')}
            >
              Limpiar
            </Button>
          )}
        </div>
      </div>
      
      <section>
        {isLoading ? (
          <ProductListLoadingSkeleton />
        ) : (
          <ProductList 
            prendas={filteredAndSortedProducts} 
            showNewArrivals={showNewArrivals}
            dropValue={dropValue}
          />
        )}
      </section>
    </div>
  );
}

function ProductListLoadingSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="flex flex-col space-y-2">
          <Skeleton className="h-[280px] w-full sm:h-[320px] md:h-[350px]" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  );
}

// This needs to be a separate component to use Suspense
async function FilteredProductList({ 
  searchParams, 
  showNewArrivals = false, 
  dropValue = '' 
}: { 
  searchParams: { [key: string]: string | string[] | undefined };
  showNewArrivals: boolean;
  dropValue: string;
}) {
  // First, fetch all products
  const products = await fetchPublicProducts();
  let filteredProducts = [...products];

  // Apply drop filtering if needed
  if (showNewArrivals && dropValue) {
    // Split products into drop and non-drop
    const dropProducts = filteredProducts.filter(p => p.drop_name === dropValue);
    const nonDropProducts = filteredProducts.filter(p => p.drop_name !== dropValue);
    // Combine with drop products first
    filteredProducts = [...dropProducts, ...nonDropProducts];
  }

  // Helper to parse comma-separated strings from URL params into arrays
  const getArrayFromParam = (paramValue: string | string[] | undefined): string[] => {
    if (!paramValue) return [];
    if (Array.isArray(paramValue)) return paramValue.filter(Boolean);
    return paramValue.split(',').filter(Boolean);
  };

  // Apply category and size filters from URL
  const { category, size } = searchParams;
  const categoriesParams = getArrayFromParam(category);
  const sizesParams = getArrayFromParam(size);
  
  // Debug logs
  console.log('Categories from URL:', categoriesParams);
  console.log('Sizes from URL:', sizesParams);
  console.log('Products before filtering:', filteredProducts.length);
  
  if (categoriesParams.length > 0) {
    filteredProducts = filteredProducts.filter(p => {
      const matches = p.categoria_nombre && categoriesParams.includes(p.categoria_nombre);
      return matches;
    });
    console.log('After category filter:', filteredProducts.length);
  }
  
  if (sizesParams.length > 0) {
    filteredProducts = filteredProducts.filter(p => {
      const matches = p.talla_nombre && sizesParams.includes(p.talla_nombre);
      return matches;
    });
    console.log('After size filter:', filteredProducts.length);
  }
  
  return <ProductList 
    prendas={filteredProducts} 
    showNewArrivals={showNewArrivals} 
    dropValue={dropValue} 
  />;
}
