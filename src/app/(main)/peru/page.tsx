import { fetchPublicProducts } from '@/app/actions/product-actions';
import { ProductList } from '@/components/product/product-list';
import { Badge } from '@/components/ui/badge';
import { MapPin, Truck, Shield, Heart } from 'lucide-react';
import type { Metadata } from 'next';
import Script from 'next/script';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Ropa Vintage en Perú | True Vintage - Envíos a Todo el País',
  description: 'La mejor tienda de ropa vintage americana en Perú. Envíos a Lima, Arequipa, Trujillo, Cusco y todo el país. Prendas únicas de los 80s, 90s y 2000s con garantía de calidad.',
  keywords: 'ropa vintage Peru, tienda vintage Peru, ropa americana Peru, segunda mano Peru, thrift shop Peru, vintage fashion Peru, ropa retro Peru, envios todo Peru',
  openGraph: {
    title: 'Ropa Vintage en Perú | True Vintage',
    description: 'La mejor tienda de ropa vintage americana en Perú. Envíos a todo el país. Prendas únicas y auténticas.',
    url: 'https://truevintage.pe/peru',
    type: 'website',
    locale: 'es_PE',
    siteName: 'True Vintage Perú',
    images: [
      {
        url: 'https://truevintageperu.com/vtg/logo_grande.jpg',
        width: 1200,
        height: 630,
        alt: 'True Vintage Perú - Ropa Vintage en Todo el Perú',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ropa Vintage en Perú | True Vintage',
    description: 'La mejor tienda de ropa vintage en Perú. Envíos a todo el país.',
    images: ['https://truevintageperu.com/vtg/logo_grande.jpg'],
  },
  alternates: {
    canonical: 'https://truevintage.pe/peru',
  },
};

export default async function PeruPage() {
  const products = await fetchPublicProducts();
  const featuredProducts = products.slice(0, 16); // Mostrar más productos para página nacional

  // Datos estructurados para cobertura nacional
  const nationalBusinessData = {
    "@context": "https://schema.org",
    "@type": "OnlineStore",
    "name": "True Vintage Perú",
    "description": "Tienda online líder de ropa vintage americana en Perú. Envíos a todo el país con prendas únicas de calidad.",
    "url": "https://truevintage.pe",
    "logo": "https://truevintageperu.com/vtg/logo_grande.jpg",
    "image": "https://truevintageperu.com/vtg/logo_grande.jpg",
    "telephone": "+51-XXX-XXX-XXX",
    "email": "contacto@truevintage.pe",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Lima",
      "addressRegion": "Lima",
      "addressCountry": "PE"
    },
    "areaServed": {
      "@type": "Country",
      "name": "Perú",
      "addressCountry": "PE"
    },
    "serviceArea": [
      {
        "@type": "State",
        "name": "Lima",
        "addressCountry": "PE"
      },
      {
        "@type": "State",
        "name": "Arequipa",
        "addressCountry": "PE"
      },
      {
        "@type": "State",
        "name": "La Libertad",
        "addressCountry": "PE"
      },
      {
        "@type": "State",
        "name": "Cusco",
        "addressCountry": "PE"
      },
      {
        "@type": "State",
        "name": "Piura",
        "addressCountry": "PE"
      }
    ],
    "openingHours": "Mo-Su 09:00-21:00",
    "paymentAccepted": ["Cash", "Credit Card", "Debit Card", "Bank Transfer", "Mobile Payment"],
    "currenciesAccepted": "PEN",
    "priceRange": "S/20 - S/200",
    "deliveryLeadTime": {
      "@type": "QuantitativeValue",
      "minValue": 2,
      "maxValue": 7,
      "unitCode": "DAY"
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Catálogo Nacional de Ropa Vintage",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Product",
            "name": "Vestidos Vintage Americanos",
            "category": "Ropa Vintage Femenina"
          },
          "availability": "https://schema.org/InStock",
          "deliveryLeadTime": {
            "@type": "QuantitativeValue",
            "minValue": 2,
            "maxValue": 7,
            "unitCode": "DAY"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Product",
            "name": "Camisas y Blusas Vintage",
            "category": "Ropa Vintage Unisex"
          },
          "availability": "https://schema.org/InStock"
        }
      ]
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "300",
      "bestRating": "5",
      "worstRating": "1"
    },
    "sameAs": [
      "https://www.facebook.com/truevintageperu",
      "https://www.instagram.com/truevintageperu",
      "https://www.tiktok.com/@truevintageperu"
    ]
  };

  return (
    <>
      <Script
        id="national-business-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(nationalBusinessData)
        }}
      />
      <div className="container mx-auto max-w-screen-xl px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Ropa Vintage en <span className="text-primary">Todo el Perú</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-6">
            La tienda online líder de ropa vintage americana en Perú. 
            Enviamos a Lima, Arequipa, Trujillo, Cusco y todo el país con prendas únicas de los 80s, 90s y 2000s.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>Envíos a todo el Perú</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4" />
              <span>2-7 días hábiles</span>
            </div>
          </div>
        </div>

        {/* Cobertura Nacional */}
        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-8 rounded-lg mb-12">
          <h2 className="text-2xl font-bold text-center mb-6">Llegamos a Todo el Perú</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <h3 className="font-semibold text-lg mb-2">Lima y Callao</h3>
              <p className="text-sm text-muted-foreground">Entrega en 24-48 horas</p>
              <p className="text-xs text-muted-foreground mt-1">Envío desde S/10</p>
            </div>
            
            <div className="text-center">
              <h3 className="font-semibold text-lg mb-2">Principales Ciudades</h3>
              <p className="text-sm text-muted-foreground">Arequipa, Trujillo, Cusco</p>
              <p className="text-xs text-muted-foreground mt-1">3-5 días hábiles</p>
            </div>
            
            <div className="text-center">
              <h3 className="font-semibold text-lg mb-2">Costa y Sierra</h3>
              <p className="text-sm text-muted-foreground">Piura, Chiclayo, Huancayo</p>
              <p className="text-xs text-muted-foreground mt-1">4-6 días hábiles</p>
            </div>
            
            <div className="text-center">
              <h3 className="font-semibold text-lg mb-2">Selva y Provincias</h3>
              <p className="text-sm text-muted-foreground">Iquitos, Pucallpa, Tarapoto</p>
              <p className="text-xs text-muted-foreground mt-1">5-7 días hábiles</p>
            </div>
          </div>
        </div>

        {/* Ventajas de True Vintage Perú */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-card p-6 rounded-lg border text-center">
            <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Calidad Garantizada</h3>
            <p className="text-sm text-muted-foreground">Cada prenda es cuidadosamente seleccionada y verificada antes del envío</p>
          </div>
          
          <div className="bg-card p-6 rounded-lg border text-center">
            <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <Truck className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Envíos Seguros</h3>
            <p className="text-sm text-muted-foreground">Trabajamos con las mejores empresas de courier del país</p>
          </div>
          
          <div className="bg-card p-6 rounded-lg border text-center">
            <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Moda Sostenible</h3>
            <p className="text-sm text-muted-foreground">Contribuye al cuidado del medio ambiente con moda circular</p>
          </div>
          
          <div className="bg-card p-6 rounded-lg border text-center">
            <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Cobertura Nacional</h3>
            <p className="text-sm text-muted-foreground">Llegamos a los 24 departamentos del Perú</p>
          </div>
        </div>

        {/* Productos destacados */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Lo Más Buscado en Perú</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Descubre las prendas vintage más populares entre nuestros clientes de todo el país.
            </p>
          </div>
          
          {featuredProducts.length > 0 ? (
            <ProductList prendas={featuredProducts} />
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Cargando productos...</p>
            </div>
          )}
          
          <div className="text-center mt-8">
            <Link 
              href="/catalog" 
              className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium"
            >
              Explorar Todo el Catálogo
            </Link>
          </div>
        </div>

        {/* Información de envíos */}
        <div className="bg-muted/50 p-8 rounded-lg mb-12">
          <div className="grid md:grid-cols-3 gap-6">
            
            <div>
              <h3 className="font-semibold text-lg mb-3">Tiempos de Entrega</h3>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Lima: 24-48 horas</li>
                <li>• Ciudades principales: 3-5 días</li>
                <li>• Provincias: 4-7 días</li>
                <li>• Zonas remotas: 5-10 días</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-3">Métodos de Pago</h3>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Transferencia bancaria</li>
                <li>• Yape / Plin</li>
                <li>• Tarjetas Visa/Mastercard</li>
                <li>• Contra entrega (Lima)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Testimonios por regiones */}
        <div className="bg-card p-8 rounded-lg">
          <h2 className="text-2xl font-bold text-center mb-6">Lo Que Dicen Nuestros Clientes</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-3 italic">
                "Excelente calidad y llegó súper rápido a Arequipa. ¡Definitivamente volveré a comprar!"
              </p>
              <p className="font-semibold text-sm">- María, Arequipa</p>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-3 italic">
                "Me encanta que lleguen hasta Cusco. Las prendas son tal como se ven en las fotos."
              </p>
              <p className="font-semibold text-sm">- Carlos, Cusco</p>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-3 italic">
                "Desde Trujillo es difícil encontrar ropa vintage de calidad. True Vintage es la solución perfecta."
              </p>
              <p className="font-semibold text-sm">- Ana, Trujillo</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}