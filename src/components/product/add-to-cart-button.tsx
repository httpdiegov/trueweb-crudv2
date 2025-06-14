'use client';

import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/cart-context';

interface AddToCartButtonProps {
  product: {
    id: number;
    sku: string;
    nombre_prenda: string;
    precio: number;
    imagenes: Array<{ id: number; url: string }>;
    imagenes_bw?: Array<{ id: number; url: string }>;
  };
  className?: string;
}

export function AddToCartButton({ product, className }: AddToCartButtonProps) {
  const { addItem, items } = useCart();

  const handleAddToCart = () => {
    console.log('Producto actual:', product);
    console.log('SKU del producto:', product.sku);
    console.log('Items en el carrito:', items.map(i => ({ sku: i.sku, nombre: i.nombre_prenda })));
    
    // Verificar si el producto ya está en el carrito (comparación insensible a mayúsculas)
    const isAlreadyInCart = items.some(item => 
      item.sku.trim().toLowerCase() === product.sku.trim().toLowerCase()
    );
    
    if (isAlreadyInCart) {
      console.log('El producto ya está en el carrito');
      alert('Esta prenda ya está en tu carrito');
      return;
    }
    
    console.log('Botón de añadir al carrito clickeado');
    console.log('Producto a añadir:', product);
    
    const productToAdd = {
      ...product,
      // Asegurarse de que todos los campos requeridos estén presentes
      id: product.id,
      sku: product.sku,
      nombre_prenda: product.nombre_prenda,
      precio: product.precio,
      imagenes: (product.imagenes || []).map(img => ({
        ...img,
        prenda_id: product.id,
        url: img.url || ''
      })),
      // Añadir campos opcionales con valores por defecto
      caracteristicas: '',
      medidas: '',
      desc_completa: '',
      stock: 0,
      categoria_id: 0,
      categoria_nombre: '',
      talla_id: 0,
      talla_nombre: '',
      imagenes_bw: (product.imagenes_bw || []).map(img => ({
        ...img,
        prenda_id: product.id,
        url: img.url || ''
      })),
      marca_id: 0,
      marca_nombre: '',
      drop_name: ''
    };
    
    console.log('Producto procesado para el carrito:', productToAdd);
    addItem(productToAdd);
  };

  return (
    <Button 
      onClick={handleAddToCart}
      className={`w-full ${className}`}
    >
      Añadir al carrito
    </Button>
  );
}
