'use client';

import { X, Plus, Minus, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/cart-context';
import { getFacebookTrackingData } from '@/utils/facebook-tracking';
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
                                  <div className="h-full w-full flex items-center justify-center bg-gray-100 text-gray-400 text-sm">
                                    Sin imagen
                                  </div>
                                )}
                              </div>

                              <div className="ml-4 flex flex-1 flex-col">
                                <div>
                                  <div className="flex justify-between text-base font-medium text-gray-900">
                                    <h3>
                                      {item.nombre_prenda}
                                    </h3>
                                    <p className="ml-4">S/{item.precio.toFixed(2)}</p>
                                  </div>
                                  <p className="mt-1 text-sm text-gray-500">SKU: {item.sku}</p>
                                </div>
                                <div className="flex flex-1 items-end justify-between text-sm">
                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      className="rounded-md border px-2 py-1"
                                      onClick={() => updateQuantity(item.sku, Math.max(1, (item.quantity || 1) - 1))}
                                    >
                                      <Minus className="h-4 w-4" />
                                    </button>
                                    <span className="text-gray-700">{item.quantity || 1}</span>
                                    <button
                                      type="button"
                                      className="rounded-md border px-2 py-1"
                                      onClick={() => updateQuantity(item.sku, (item.quantity || 1) + 1)}
                                    >
                                      <Plus className="h-4 w-4" />
                                    </button>
                                  </div>

                                  <div className="flex">
                                    <button
                                      type="button"
                                      className="font-medium text-indigo-600 hover:text-indigo-500"
                                      onClick={() => removeItem(item.sku)}
                                    >
                                      Eliminar
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </li>
                          );
                        })}
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
                  <p className="mt-0.5 text-sm text-gray-500">{items.length} {items.length === 1 ? 'producto' : 'productos'} en el carrito</p>
                  <div className="mt-6">
                    <a
                    href={`https://wa.me/51940866278?text=${encodeURIComponent(
`Hola, quisiera adquirir las siguientes prendas:

` +
items.map(item => 
`*${item.nombre_prenda}* (SKU: ${item.sku})
Precio: S/${item.precio.toFixed(2)}
Enlace directo: https://truevintage.pe/products/${item.sku}
`
).join('\n') +
`
*Total a pagar: S/${totalPrice.toFixed(2)}*`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 rounded-md border border-transparent bg-green-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-green-700"
                    onClick={async (e) => {
                      try {
                        // Obtener datos de tracking de Facebook
                        const trackingData = getFacebookTrackingData();
                        
                        // Enviar evento InitiateCheckout a Meta Conversions API
                        await fetch('/api/conversions/initiate-checkout', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({
                            productId: items.map(item => item.sku).join(','),
                            productName: items.map(item => item.nombre_prenda).join(', '),
                            category: 'Ropa Vintage',
                            value: totalPrice,
                            currency: 'PEN',
                            quantity: items.reduce((sum, item) => sum + (item.quantity || 1), 0),
                            ...trackingData,
                          }),
                        });
                        
                        // Meta Pixel: InitiateCheckout
                        if (typeof window !== 'undefined' && window.fbq) {
                          window.fbq('track', 'InitiateCheckout', {
                            num_items: items.length,
                            value: totalPrice,
                            currency: 'PEN',
                            contents: items.map(it => ({
                              id: it.sku,
                              quantity: it.quantity || 1,
                              item_price: it.precio,
                            })),
                            content_type: 'product'
                          });
                        }
                      } catch (err) {
                        console.error('Error al enviar InitiateCheckout:', err);
                      }
                      
                      toggleCart();
                    }}
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.966-.273-.099-.471-.148-.67.15-.197.297-.767.963-.94 1.16-.173.199-.347.221-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.795-1.484-1.78-1.66-2.08-.173-.297-.018-.458.132-.606.136-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.915-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.078 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.718 2.005-1.413.248-.694.248-1.289.173-1.413-.074-.124-.273-.198-.57-.347m-5.446 7.444h-.016a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.549 4.142 1.595 5.945L0 24l6.335-1.652a11.882 11.882 0 005.723 1.467h.005c6.554 0 11.89-5.335 11.89-11.893 0-3.18-1.26-6.165-3.53-8.411z"/>
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
