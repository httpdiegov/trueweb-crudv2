import { fetchPublicProducts } from '@/app/actions/product-actions';
import { ProductList } from '@/components/product/product-list';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, Phone, Mail } from 'lucide-react';
import type { Metadata } from 'next';
import Script from 'next/script';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Ropa Vintage en Lima | True Vintage Perú - Tienda Online',
  description: 'Compra ropa vintage americana en Lima, Perú. Entrega en toda Lima Metropolitana. Prendas únicas de los 80s, 90s y 2000s. ¡Envío gratis en pedidos mayores a S/150!',
  keywords: 'ropa vintage Lima, tienda vintage Lima, ropa americana Lima, segunda mano Lima, thrift shop Lima, vintage fashion Lima Peru, ropa retro Lima',
  openGraph: {
    title: 'Ropa Vintage en Lima | True Vintage Perú',
    description: 'La mejor tienda de ropa vintage en Lima. Entrega en toda Lima Metropolitana. Prendas americanas únicas y auténticas.',
    url: 'https://truevintage.pe/lima',
    type: 'website',
    locale: 'es_PE',
    siteName: 'True Vintage Perú',
    images: [
      {
        url: 'https://truevintageperu.com/vtg/logo_grande.jpg',
        width: 1200,
        height: 630,
        alt: 'True Vintage Perú - Ropa Vintage en Lima',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ropa Vintage en Lima | True Vintage Perú',
    description: 'La mejor tienda de ropa vintage en Lima. Entrega en toda Lima Metropolitana.',
    images: ['https://truevintageperu.com/vtg/logo_grande.jpg'],
  },
  alternates: {
    canonical: 'https://truevintage.pe/lima',
  },
};

export default async function LimaPage() {
  const products = await fetchPublicProducts();
  const featuredProducts = products.slice(0, 12); // Mostrar productos destacados

  // Datos estructurados para negocio local
  const localBusinessData = {
    "@context": "https://schema.org",
    "@type": "ClothingStore",
    "name": "True Vintage Perú",
    "description": "Tienda online de ropa vintage americana en Lima, Perú. Prendas únicas de calidad de los 80s, 90s y 2000s.",
    "url": "https://truevintage.pe",
    "logo": "https://truevintageperu.com/vtg/logo_grande.jpg",
    "image": "https://truevintageperu.com/vtg/logo_grande.jpg",
    "telephone": "+51-XXX-XXX-XXX",
    "email": "contacto@truevintage.pe",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Lima",
      "addressRegion": "Lima",
      "addressCountry": "PE",
      "postalCode": "15001"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": -12.0464,
      "longitude": -77.0428
    },
    "areaServed": [
      {
        "@type": "City",
        "name": "Lima",
        "addressCountry": "PE"
      },
      {
        "@type": "State",
        "name": "Lima",
        "addressCountry": "PE"
      }
    ],
    "serviceArea": {
      "@type": "GeoCircle",
      "geoMidpoint": {
        "@type": "GeoCoordinates",
        "latitude": -12.0464,
        "longitude": -77.0428
      },
      "geoRadius": "50000"
    },
    "openingHours": "Mo-Su 09:00-21:00",
    "paymentAccepted": ["Cash", "Credit Card", "Debit Card", "Bank Transfer"],
    "currenciesAccepted": "PEN",
    "priceRange": "S/20 - S/200",
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Catálogo de Ropa Vintage",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Product",
            "name": "Vestidos Vintage",
            "category": "Ropa Vintage"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Product",
            "name": "Blusas Vintage",
            "category": "Ropa Vintage"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Product",
            "name": "Pantalones Vintage",
            "category": "Ropa Vintage"
          }
        }
      ]
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "150",
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
        id="local-business-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(localBusinessData)
        }}
      />
      <div className="container mx-auto max-w-screen-xl px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Ropa Vintage en <span className="text-primary">Lima</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-6">
            Descubre la mejor colección de ropa vintage americana en Lima. 
            Prendas únicas de los 80s, 90s y 2000s con entrega en toda Lima Metropolitana.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>Entrega en toda Lima</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Envío en 24-48 horas</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Envío gratis desde S/150</Badge>
            </div>
          </div>
        </div>

        {/* Información de servicio en Lima */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <div className="bg-card p-6 rounded-lg border">
            <h3 className="font-semibold text-lg mb-3">Zonas de Entrega</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Miraflores, San Isidro, Barranco</li>
              <li>• Surco, La Molina, San Borja</li>
              <li>• Jesús María, Magdalena, Pueblo Libre</li>
              <li>• Lima Centro, Breña, Lince</li>
              <li>• Y toda Lima Metropolitana</li>
            </ul>
          </div>
          
          <div className="bg-card p-6 rounded-lg border">
            <h3 className="font-semibold text-lg mb-3">Horarios de Atención</h3>
            <div className="text-sm text-muted-foreground space-y-1">
              <p><strong>Lunes a Domingo:</strong> 9:00 AM - 9:00 PM</p>
              <p><strong>Respuesta WhatsApp:</strong> Inmediata</p>
              <p><strong>Procesamiento:</strong> 24 horas</p>
            </div>
          </div>
          
          <div className="bg-card p-6 rounded-lg border">
            <h3 className="font-semibold text-lg mb-3">Métodos de Pago</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Transferencia bancaria</li>
              <li>• Yape / Plin</li>
              <li>• Tarjetas de crédito/débito</li>
              <li>• Contra entrega (Lima)</li>
            </ul>
          </div>
        </div>

        {/* Por qué elegir True Vintage en Lima */}
        <div className="bg-muted/50 p-8 rounded-lg mb-12">
          <h2 className="text-2xl font-bold text-center mb-6">¿Por qué True Vintage en Lima?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Entrega Rápida</h3>
              <p className="text-sm text-muted-foreground">Entrega en 24-48 horas en toda Lima Metropolitana</p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <Badge className="w-6 h-6" />
              </div>
              <h3 className="font-semibold mb-2">Calidad Garantizada</h3>
              <p className="text-sm text-muted-foreground">Prendas cuidadosamente seleccionadas y verificadas</p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <Phone className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Atención Personal</h3>
              <p className="text-sm text-muted-foreground">Asesoría personalizada vía WhatsApp</p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Precios Justos</h3>
              <p className="text-sm text-muted-foreground">Los mejores precios en ropa vintage de Lima</p>
            </div>
          </div>
        </div>

        {/* Productos destacados */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Productos Destacados en Lima</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Descubre nuestras prendas vintage más populares, disponibles para entrega inmediata en Lima.
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
              Ver Todo el Catálogo
            </Link>
          </div>
        </div>

        {/* FAQ Lima */}
        <div className="bg-card p-8 rounded-lg">
          <h2 className="text-2xl font-bold mb-6">Preguntas Frecuentes - Lima</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">¿Hacen entregas en toda Lima?</h3>
              <p className="text-muted-foreground text-sm">Sí, realizamos entregas en toda Lima Metropolitana. El tiempo de entrega es de 24-48 horas hábiles.</p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">¿Cuál es el costo de envío en Lima?</h3>
              <p className="text-muted-foreground text-sm">El envío tiene un costo de S/10 en Lima. ¡Envío gratis en compras mayores a S/150!</p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">¿Puedo ver las prendas antes de comprar?</h3>
              <p className="text-muted-foreground text-sm">Todas nuestras prendas tienen fotos detalladas y medidas exactas. También ofrecemos asesoría personalizada vía WhatsApp.</p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">¿Qué métodos de pago aceptan en Lima?</h3>
              <p className="text-muted-foreground text-sm">Aceptamos transferencias bancarias, Yape, Plin, tarjetas de crédito/débito y pago contra entrega en Lima.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}