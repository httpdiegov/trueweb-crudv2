'use client';

import { useEffect, useState } from 'react';
import { fetchAvailableCategories, fetchAvailableSizes } from '@/app/actions/product-actions';
import { getDropValue } from '@/app/actions/drop-actions';
import { CatalogClient } from '@/components/catalog/catalog-client';
import type { Categoria, Talla } from '@/types';

interface CatalogContentProps {
  category?: string;
  size?: string;
}

export default function CatalogContent({ 
  category: initialCategory, 
  size: initialSize 
}: CatalogContentProps) {
  const [categories, setCategories] = useState<Categoria[]>([]);
  const [sizes, setSizes] = useState<Talla[]>([]);
  const [dropValue, setDropValue] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [category, setCategory] = useState(initialCategory);
  const [size, setSize] = useState(initialSize);

  // Update internal state when props change
  useEffect(() => {
    setCategory(initialCategory);
    setSize(initialSize);
  }, [initialCategory, initialSize]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesData, sizesData, dropValueData] = await Promise.all([
          fetchAvailableCategories(),
          fetchAvailableSizes(),
          getDropValue(),
        ]);
        
        setCategories(categoriesData);
        setSizes(sizesData);
        setDropValue(dropValueData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return <div>Cargando prendas...</div>; // Or your preferred loading state
  }

  // Pasar los parámetros de búsqueda al componente CatalogClient
  // Only render the client component when we have data
  if (isLoading) {
    return <div>Cargando catálogo...</div>;
  }

  return (
    <CatalogClient
      initialCategories={categories}
      initialSizes={sizes}
      initialDropValue={dropValue}
      category={category}
      size={size}
      onCategoryChange={setCategory}
      onSizeChange={setSize}
    />
  );
}
