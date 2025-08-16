import { Suspense } from 'react';
import CatalogContent from './catalog-content';

// This tells Next.js to render this page on-demand, not at build time
export const dynamic = 'force-dynamic';

// Revalidate the cache every 60 seconds
export const revalidate = 60;

interface HomePageProps {
  searchParams?: { 
    [key: string]: string | string[] | undefined 
  };
}

export default async function HomePage({ searchParams }: { searchParams?: Promise<{ [key: string]: string | string[] | undefined }> }) {
  // Safely extract category and size from searchParams
  const searchParamsObj = (await searchParams) ?? {};
  
  const category = Array.isArray(searchParamsObj.category) 
    ? searchParamsObj.category[0] 
    : searchParamsObj.category;
    
  const size = Array.isArray(searchParamsObj.size) 
    ? searchParamsObj.size[0] 
    : searchParamsObj.size;

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
