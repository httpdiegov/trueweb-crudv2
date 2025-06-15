'server';

import { fetchProducts } from './product-actions';
import type { Prenda } from '@/types';

export async function getDropValue(): Promise<string> {
  return process.env.DROP || '';
}

export async function getProductsByDrop(dropValue: string): Promise<Prenda[]> {
  const products = await fetchProducts();
  return products.filter(p => p.drop_name === dropValue);
}

export async function getProductsNotInDrop(dropValue: string): Promise<Prenda[]> {
  const products = await fetchProducts();
  return products.filter(p => p.drop_name !== dropValue);
}
