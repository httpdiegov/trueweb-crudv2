'use client';

import { X, Plus, Minus, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/cart-context';
import Image from 'next/image';
import Link from 'next/link';

export function Cart() {
  const { 
    items, 
    isOpen, 
    toggleCart, 
    removeItem, 
    updateQuantity, 
    totalItems, 
    totalPrice 
  } = useCart();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="absolute inset-0 bg-black/50 transition-opacity"
          onClick={toggleCart}
        />
        <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
          <div className="w-screen max-w-md">
            <div className="flex h-full flex-col bg-white shadow-xl">
              <div className="flex-1 overflow-y-auto py-6 px-4 sm:px-6">
                <div className="flex items-start justify-between">
                  <h2 className="text-lg font-medium text-gray-900">Carrito de compras</h2>
                  <button
                    type="button"
                    className="-mr-2 flex h-10 w-10 items-center justify-center rounded-md p-2 text-gray-400 hover:text-gray-500"
                    onClick={toggleCart}
                  >
                    <X className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                <div className="mt-8">
                  {items.length === 0 ? (
                    <div className="text-center">
                      <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">Tu carrito está vacío</h3>
                      <p className="mt-1 text-sm text-gray-500">Comienza a agregar productos a tu carrito</p>
                    </div>
                  ) : (
                    <div className="flow-root">
                      <ul className="-my-6 divide-y divide-gray-200">
                        {items.map((item) => {
                          console.log("=== INICIO DATOS DEL ITEM ===");
                          console.log("Item SKU:", item.sku);
                          console.log("Tiene imagenes_bw?", !!item.imagenes_bw);
                          console.log("Número de imágenes BW:", item.imagenes_bw?.length || 0);
                          console.log("URLs de imágenes BW:", item.imagenes_bw?.map(img => img.url) || []);
                          console.log("URLs de imágenes normales:", item.imagenes?.map(img => img.url) || []);
                          console.log("=== FIN DATOS DEL ITEM ===");
                          
                          // Obtener la primera imagen BW
                          const bwImage = item.imagenes_bw?.[0];
                          
                          // Si no hay imagen BW, mostrar un mensaje de depuración
                          if (!bwImage) {
                            console.warn(`No se encontró imagen BW para el producto ${item.sku}`);
                          }
                          
                          return (
                            <li key={item.sku} className="flex py-6">
                              <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                                {bwImage ? (
                                  <Image
                                    src={bwImage.url}
                                    alt={item.nombre_prenda}
                                    width={96}
                                    height={96}
                                    className="h-full w-full object-cover object-center"
                                  />
                                ) : (
                                  <div className="h-full w-full bg-gray-100 flex items-center justify-center">
                                    <span className="text-gray-400 text-xs">Sin imagen</span>
                                  </div>
                                )}
                              </div>

                            <div className="ml-4 flex flex-1 flex-col">
                              <div>
                                <div className="flex justify-between text-base font-medium text-gray-900">
                                  <h3>{item.nombre_prenda}</h3>
                                  <p className="ml-4">S/{item.precio.toFixed(2)}</p>
                                </div>
                                <p className="mt-1 text-sm text-gray-500">SKU: {item.sku}</p>
                              </div>
                              <div className="flex flex-1 items-end justify-between text-sm">
                                <div className="text-gray-500">
                                  Cantidad: 1
                                </div>

                                <button
                                  type="button"
                                  onClick={() => removeItem(item.sku)}
                                  className="font-medium text-red-600 hover:text-red-500"
                                >
                                  Eliminar
                                </button>
                              </div>
                            </div>
                          </li>
                        )})}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {items.length > 0 && (
                <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
                  <div className="flex justify-between text-base font-medium text-gray-900">
                    <p>Total</p>
                    <p>S/{totalPrice.toFixed(2)}</p>
                  </div>
                  
                  <div className="mt-6">
                    <a
                      href={`https://wa.me/51940866278?text=${encodeURIComponent(
                        '¡Hola! Estoy interesado en los siguientes productos:\n\n' +
                        items.map(item => 
                          `- ${item.nombre_prenda} (SKU: ${item.sku}) - S/${item.precio.toFixed(2)}\n` +
                          `  https://www.truevintage.pe/products/${item.sku}\n`
                        ).join('\n') +
                        '\n' +
                        `Total: S/${totalPrice.toFixed(2)}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 rounded-md border border-transparent bg-green-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-green-700"
                      onClick={toggleCart}
                    >
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.966-.273-.099-.471-.148-.67.15-.197.297-.767.963-.94 1.16-.174.196-.347.223-.644.075-.297-.15-1.264-.465-2.402-1.485-.888-.795-1.484-1.76-1.66-2.06-.173-.297-.018-.458.13-.606.136-.133.296-.345.445-.523.146-.181.194-.297.297-.495.1-.21.049-.372-.025-.52-.075-.149-.669-1.612-.916-2.207s-.505-.51-.669-.521a10.94 10.94 0 00-.561-.015c-.194.013-.5.06-.76.298-.26.24-.99.967-.99 2.359 0 1.29.99 2.735 1.125 2.922.14.192 1.61 2.434 3.904 3.418.54.231.96.367 1.29.478.54.18 1.036.156 1.425.094.46-.07 1.41-.58 1.61-1.13.2-.56.2-1.05.14-1.15-.054-.12-.198-.18-.436-.308z"/>
                        <path d="M18 2.01L6 2c-1.105 0-2 .89-2 2v16c0 1.1.895 2 2 2h12c1.105 0 2-.9 2-2V4c0-1.11-.895-1.99-2-1.99zM18 20H6v-16h12v16z"/>
                      </svg>
                      Comprar por WhatsApp
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
