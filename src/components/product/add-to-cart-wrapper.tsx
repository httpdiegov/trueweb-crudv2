'use client';

import dynamic from 'next/dynamic';

const AddToCartClient = dynamic(
  () => import('@/components/product/add-to-cart-client').then((mod) => mod.AddToCartClient),
  { ssr: false }
);

interface AddToCartWrapperProps {
  product: any;
  className?: string;
}

export function AddToCartWrapper({ product, className }: AddToCartWrapperProps) {
  return <AddToCartClient product={product} className={className} />;
}
