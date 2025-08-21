import { notFound } from 'next/navigation';
import { fetchPublicProducts, fetchAvailableCategories } from '@/app/actions/product-actions';
import { ProductList } from '@/components/product/product-list';
import { Badge } from '@/components/ui/badge';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import type { Metadata } from 'next';
import Script from 'next/script';
import Link from 'next/link';

interface CategoryPageProps {
  params: {
    categoria: string;
  };
}

// Generar metadata dinámica para categorías
export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const categoryName = decodeURIComponent(params.categoria);
  
  const categoryDescriptions: Record<string, string> = {
    'Vestidos': 'Vestidos vintage únicos de los 80s, 90s y 2000s. Encuentra tu vestido vintage perfecto en True Vintage Perú.',
    'Blusas': 'Blusas vintage americanas de calidad. Estilos únicos de diferentes décadas en True Vintage Perú.',
    'Pantalones': 'Pantalones vintage y jeans retro. Encuentra tu talla perfecta en nuestra colección vintage.',
    'Faldas': 'Faldas vintage de todos los estilos. Desde mini hasta midi, encuentra tu falda vintage ideal.',
    'Chaquetas': 'Chaquetas vintage americanas. Cazadoras, blazers y abrigos únicos de épocas pasadas.',
    'Accesorios': 'Accesorios vintage únicos. Bolsos, cinturones y complementos para completar tu look vintage.',
    'Calzado': 'Zapatos vintage de calidad. Encuentra calzado único de diferentes décadas.',
    'Ofertas': 'Ofertas especiales en ropa vintage. Los mejores precios en prendas vintage seleccionadas.'
  };

  const description = categoryDescriptions[categoryName] || 
    `Ropa vintage ${categoryName.toLowerCase()} en True Vintage Perú. Encuentra prendas únicas de calidad a los mejores precios.`;

  return {
    title: `${categoryName} Vintage | True Vintage Perú - Ropa Americana`,
    description,
    keywords: `${categoryName.toLowerCase()}, ${categoryName.toLowerCase()} vintage, ropa vintage ${categoryName.toLowerCase()}, ${categoryName.toLowerCase()} americana, ${categoryName.toLowerCase()} segunda mano, vintage fashion Peru`,
    openGraph: {
      title: `${categoryName} Vintage | True Vintage Perú`,
      description,
      url: `https://truevintage.pe/categoria/${encodeURIComponent(categoryName)}`,
      type: 'website',
      locale: 'es_PE',
      siteName: 'True Vintage Perú',
      images: [
        {
          url: 'https://truevintageperu.com/vtg/logo_grande.jpg',
          width: 1200,
          height: 630,
          alt: `${categoryName} Vintage - True Vintage Perú`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${categoryName} Vintage | True Vintage Perú`,
      description,
      images: ['https://truevintageperu.com/vtg/logo_grande.jpg'],
    },
    alternates: {
      canonical: `https://truevintage.pe/categoria/${encodeURIComponent(categoryName)}`,
    },
  };
}

// Generar rutas estáticas para las categorías
export async function generateStaticParams() {
  try {
    const categories = await fetchAvailableCategories();
    return categories.map((category) => ({
      categoria: encodeURIComponent(category.nom_categoria),
    }));
  } catch (error) {
    console.error('Error generando parámetros estáticos para categorías:', error);
    return [];
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const categoryName = decodeURIComponent(params.categoria);
  
  try {
    // Obtener todos los productos y filtrar por categoría
    const allProducts = await fetchPublicProducts();
    const categoryProducts = allProducts.filter(
      product => product.categoria_nombre === categoryName
    );

    // Verificar si la categoría existe
    if (categoryProducts.length === 0) {
      const categories = await fetchAvailableCategories();
      const categoryExists = categories.some(cat => cat.nom_categoria === categoryName);
      
      if (!categoryExists) {
        notFound();
      }
    }

    // Datos estructurados para la página de categoría
    const structuredData = {
      "@context": "https://schema.org/",
      "@type": "CollectionPage",
      "name": `${categoryName} Vintage`,
      "description": `Colección de ${categoryName.toLowerCase()} vintage en True Vintage Perú`,
      "url": `https://truevintage.pe/categoria/${encodeURIComponent(categoryName)}`,
      "mainEntity": {
        "@type": "ItemList",
        "numberOfItems": categoryProducts.length,
        "itemListElement": categoryProducts.slice(0, 10).map((product, index) => ({
          "@type": "Product",
          "position": index + 1,
          "name": product.nombre_prenda,
          "url": `https://truevintage.pe/products/${product.sku}`,
          "image": product.imagenes?.[0]?.url || '',
          "offers": {
            "@type": "Offer",
            "price": product.precio.toFixed(2),
            "priceCurrency": "PEN",
            "availability": product.stock > 0 && product.separado !== 1 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
          }
        }))
      },
      "breadcrumb": {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Inicio",
            "item": "https://truevintage.pe"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Catálogo",
            "item": "https://truevintage.pe/catalog"
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": categoryName,
            "item": `https://truevintage.pe/categoria/${encodeURIComponent(categoryName)}`
          }
        ]
      }
    };

    return (
      <>
        <Script
          id="category-structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData)
          }}
        />
        <div className="container mx-auto max-w-screen-xl px-4 py-8">
          {/* Breadcrumbs */}
          <Breadcrumb className="mb-6">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/">Inicio</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/catalog">Catálogo</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{categoryName}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Header de la categoría */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <h1 className="text-3xl font-bold text-foreground">{categoryName} Vintage</h1>
              <Badge variant="secondary" className="text-sm">
                {categoryProducts.length} productos
              </Badge>
            </div>
            <p className="text-muted-foreground text-lg max-w-2xl">
              Descubre nuestra colección de {categoryName.toLowerCase()} vintage únicos. 
              Prendas americanas auténticas de diferentes décadas, cuidadosamente seleccionadas 
              para ofrecerte estilo y calidad excepcional.
            </p>
          </div>

          {/* Lista de productos */}
          {categoryProducts.length > 0 ? (
            <ProductList prendas={categoryProducts} />
          ) : (
            <div className="text-center py-12">
              <h2 className="text-xl font-semibold mb-2">No hay productos disponibles</h2>
              <p className="text-muted-foreground mb-6">
                Actualmente no tenemos productos en la categoría {categoryName}.
              </p>
              <Link 
                href="/catalog" 
                className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                Ver todo el catálogo
              </Link>
            </div>
          )}
        </div>
      </>
    );
  } catch (error) {
    console.error('Error cargando página de categoría:', error);
    notFound();
  }
}