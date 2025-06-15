'use server';

import { updateProduct } from './product-actions';

export async function handleUpdateProduct(id: string | number, formData: FormData) {
  // If ID is a string, try to convert it to a number
  const productId = typeof id === 'string' ? parseInt(id, 10) : id;
  
  if (isNaN(productId)) {
    throw new Error('ID de producto no válido');
  }
  
  console.log('Updating product with ID:', productId);
  return updateProduct(productId, formData);
}
