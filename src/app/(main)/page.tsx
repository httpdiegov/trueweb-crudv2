import { Suspense } from 'react';
import CatalogContent from './catalog-content';

// This tells Next.js that this page can be statically generated
export const dynamic = 'force-static';

export default function HomePage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  // Safely extract parameters with null checks
  const category = Array.isArray(searchParams?.category) 
    ? searchParams.category[0] 
    : searchParams?.category;
    
  const size = Array.isArray(searchParams?.size) 
    ? searchParams.size[0] 
    : searchParams?.size;

  return (
    <Suspense>
      <CatalogContent 
        category={category}
        size={size}
      />
    </Suspense>
  );
}

// This function tells Next.js which paths to pre-render
export async function generateStaticParams() {
  return []; // We're not pre-rendering any paths at build time
}
