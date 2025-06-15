'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { fetchProducts } from '@/app/actions/product-actions';
import type { Prenda } from '@/types';

interface SearchDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchDialog({ isOpen, onOpenChange }: SearchDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Prenda[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const products = await fetchProducts();
      const results = products.filter(
        (product) =>
          product.nombre_prenda.toLowerCase().includes(query.toLowerCase()) ||
          product.sku.toLowerCase().includes(query.toLowerCase()) ||
          product.categoria_nombre?.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching products:', error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProductClick = (sku: string) => {
    router.push(`/products/${sku}`);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden">
        <DialogTitle className="sr-only">Buscar productos</DialogTitle>
        <div className="relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <Input
            ref={inputRef}
            type="text"
            placeholder="Buscar productos..."
            className="w-full pl-10 pr-10 py-6 text-base border-0 border-b rounded-none focus-visible:ring-0 focus-visible:ring-offset-0"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 h-8 w-8"
              onClick={() => setSearchQuery('')}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="max-h-[400px] overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-muted-foreground">Buscando...</div>
          ) : searchResults.length > 0 ? (
            <ul className="divide-y">
              {searchResults.map((product) => (
                <li key={product.sku}>
                  <button
                    onClick={() => handleProductClick(product.sku)}
                    className="w-full text-left p-4 hover:bg-accent transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border">
                        {product.imagenes_bw?.[0]?.url ? (
                          <img
                            src={product.imagenes_bw[0].url}
                            alt={product.nombre_prenda}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full bg-muted flex items-center justify-center">
                            <span className="text-xs text-muted-foreground">Sin imagen</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-foreground truncate">
                          {product.nombre_prenda}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          SKU: {product.sku} • S/{product.precio.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          ) : searchQuery.length >= 2 ? (
            <div className="p-4 text-center text-muted-foreground">
              No se encontraron productos que coincidan con "{searchQuery}"
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
