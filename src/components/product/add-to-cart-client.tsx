'use client';

import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/cart-context';

import type { Prenda } from '@/types';

interface AddToCartClientProps {
  product: Prenda;
  className?: string;
}

export function AddToCartClient({ product, className }: AddToCartClientProps) {
  const { addItem } = useCart();

  const handleAddToCart = () => {
    console.log('=== INICIO AÑADIR AL CARRITO ===');
    console.log('Producto completo:', JSON.stringify(product, null, 2));
    
    // Verificar las imágenes BW
    console.log('Tiene imagenes_bw?', !!product.imagenes_bw);
    console.log('imagenes_bw:', product.imagenes_bw);
    console.log('Tiene imagenes normales?', !!product.imagenes);
    console.log('imagenes:', product.imagenes);
    
    // Procesar solo imágenes BW
    const imagenes_bw = (product.imagenes_bw || []).map(img => {
      const imgObj = {
        ...img,
        prenda_id: product.id,
        url: img.url || ''
      };
      console.log('Imagen BW procesada:', imgObj);
      return imgObj;
    });

    // Procesar imágenes normales
    const imagenes = (product.imagenes || []).map(img => {
      const imgObj = {
        ...img,
        prenda_id: product.id,
        url: img.url || ''
      };
      console.log('Imagen normal procesada:', imgObj);
      return imgObj;
    });
    
    console.log('Total imágenes BW procesadas:', imagenes_bw.length);
    console.log('Total imágenes normales procesadas:', imagenes.length);
    console.log('=== FIN AÑADIR AL CARRITO ===');
    
    // Crear el objeto del producto para el carrito
    const productToAdd = {
      // Campos principales
      id: product.id,
      sku: product.sku,
      nombre_prenda: product.nombre_prenda,
      precio: product.precio,
      // Solo incluir las imágenes BW si existen, de lo contrario array vacío
      imagenes_bw: imagenes_bw,
      
      // Incluir también las imágenes normales por si acaso
      imagenes: imagenes,
      
      // Campos requeridos
      desc_completa: product.desc_completa || '',
      stock: product.stock || 0,
      estado: product.estado || 1,
      categoria_id: product.categoria_id || 0,
      talla_id: product.talla_id || 0,
      
      // Campos opcionales
      caracteristicas: product.caracteristicas || undefined,
      medidas: product.medidas || undefined,
      categoria_nombre: product.categoria_nombre || undefined,
      talla_nombre: product.talla_nombre || undefined,
      marca_id: product.marca_id || undefined,
      marca_nombre: product.marca_nombre || undefined,
      drop_name: product.drop_name || undefined
    };
    
    console.log('Producto que se agregará al carrito:', JSON.stringify(productToAdd, null, 2));
    
    console.log('Producto procesado para el carrito:', productToAdd);
    addItem(productToAdd);

    // Meta Pixel: AddToCart
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'AddToCart', {
        content_type: 'product',
        content_ids: [product.sku],
        content_name: product.nombre_prenda,
        value: product.precio,
        currency: 'PEN'
      });
    }
  };

  return (
    <Button
      onClick={handleAddToCart}
      className={`w-full md:w-auto ${className || ''}`}
    >
      Añadir al carrito
    </Button>
  );
}
