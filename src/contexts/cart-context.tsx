'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { Prenda } from '@/types';

type CartItem = Prenda & {
  quantity: number;
};

type CartContextType = {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: Prenda) => void;
  removeItem: (sku: string) => void;
  updateQuantity: (sku: string, quantity: number) => void;
  toggleCart: () => void;
  totalItems: number;
  totalPrice: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    console.log('Inicializando carrito...');
    return [];
  });
  const [isOpen, setIsOpen] = useState(false);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + (item.precio * item.quantity), 0);
  
  console.log('Estado actual del carrito:', { items, totalItems, totalPrice });

  const addItem = (item: Prenda) => {
    console.log('=== AÑADIENDO AL CARRITO ===');
    console.log('Item recibido:', JSON.stringify(item, null, 2));
    
    // Asegurarse de que las imágenes BW se mantengan y el SKU esté limpio
    const itemWithImages = {
      ...item,
      sku: item.sku.trim(), // Limpiar espacios en blanco
      imagenes_bw: item.imagenes_bw || [],
      imagenes: item.imagenes || []
    };
    
    console.log('Item con imágenes procesadas:', JSON.stringify(itemWithImages, null, 2));
    
    setItems(prevItems => {
      // Verificar si el producto ya está en el carrito (insensible a mayúsculas)
      const existingItem = prevItems.find(i => 
        i.sku.trim().toLowerCase() === itemWithImages.sku.toLowerCase()
      );
      
      if (existingItem) {
        console.log('El producto ya está en el carrito, no se puede agregar de nuevo');
        return prevItems; // No hacer nada si ya está en el carrito
      }
      
      // Agregar el nuevo ítem con cantidad 1
      const newItems = [...prevItems, { ...itemWithImages, quantity: 1 }];
      
      console.log('Nuevo estado del carrito:', JSON.stringify(newItems, null, 2));
      return newItems;
    });
  };

  const removeItem = (sku: string) => {
    setItems(prevItems => prevItems.filter(item => item.sku !== sku));
  };

  const updateQuantity = (sku: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(sku);
      return;
    }
    // No permitir modificar la cantidad, siempre será 1
    console.log('No se puede modificar la cantidad, las prendas son únicas');
  };

  const toggleCart = () => setIsOpen(!isOpen);

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        addItem,
        removeItem,
        updateQuantity,
        toggleCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
