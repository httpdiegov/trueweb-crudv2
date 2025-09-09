import type { Metadata } from 'next';
import './globals.css';

import { ToastProvider } from '@/components/providers/toast-provider';
import { ThemeProvider } from '@/components/theme/theme-provider';
import { FacebookTrackingInit } from '@/components/tracking/facebook-tracking-init';
import SessionInit from '@/components/tracking/session-init';
import GlobalErrorScreen from '@/components/ui/GlobalErrorScreen';

export const metadata: Metadata = {
  title: 'True Vintage Perú | Ropa Vintage Americana y Segunda Mano en Lima',
  description: 'Tienda online de ropa vintage americana, segunda mano y thrift en Perú. Encuentra prendas únicas de los 80s, 90s y 2000s. Envíos a todo el país desde Lima.',
  keywords: 'ropa vintage, ropa americana, segunda mano, thrift shop, ropa vintage Lima, ropa vintage Perú, ropa 90s, ropa 80s, ropa 2000s, vintage fashion, sustainable fashion, moda sostenible',
  authors: [{ name: 'True Vintage Perú' }],
  creator: 'True Vintage Perú',
  publisher: 'True Vintage Perú',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'es_PE',
    url: 'https://truevintage.pe',
    siteName: 'True Vintage Perú',
    title: 'True Vintage Perú | Ropa Vintage Americana y Segunda Mano',
    description: 'Tienda online de ropa vintage americana, segunda mano y thrift en Perú. Encuentra prendas únicas de los 80s, 90s y 2000s.',
    images: [
      {
        url: 'https://truevintageperu.com/vtg/logo_grande.jpg',
        width: 1200,
        height: 630,
        alt: 'True Vintage Perú - Ropa Vintage Americana',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'True Vintage Perú | Ropa Vintage Americana',
    description: 'Tienda online de ropa vintage americana y segunda mano en Perú',
    images: ['https://truevintageperu.com/vtg/logo_grande.jpg'],
  },
  icons: {
    icon: [
      { url: 'https://truevintageperu.com/vtg/logo_grande.jpg', type: 'image/jpg' },
    ],
  },
  alternates: {
    canonical: 'https://truevintage.pe',
  },
};

// Force dynamic rendering to prevent caching issues
// This ensures the theme is always up-to-date
export const dynamic = 'force-dynamic';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        {/* Google tag (gtag.js) */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-K5GXG36BQC"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-K5GXG36BQC');
            `,
          }}
        />
        
        <link rel="icon" type="image/jpg" href="https://truevintageperu.com/vtg/logo_grande.jpg" sizes="any" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Belleza&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Alegreya:ital,wght@0,400..900;1,400..900&display=swap" rel="stylesheet" />
        
        {/* Add initial theme script to prevent flash of incorrect theme */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  // Always use light theme by default
                  const theme = localStorage.getItem('theme-preference') || 'light';
                  document.documentElement.classList.add(theme);
                  document.body.classList.add('theme-loaded');
                } catch (e) {}
              })();
            `,
          }}
        />

        {/* Meta Pixel (Facebook) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              
              // Inicializar Meta Pixel con Advanced Matching
              fbq('init', '${process.env.META_PIXEL_ID}', {
                em: 'automatic', // Automatic Advanced Matching para email
                ph: 'automatic', // Automatic Advanced Matching para teléfono
                fn: 'automatic', // Automatic Advanced Matching para nombre
                external_id: 'automatic' // Automatic Advanced Matching para external_id
              });
              
              // Configurar deduplicación automática
              fbq('set', 'autoConfig', false, '${process.env.META_PIXEL_ID}');
              
              // Track PageView con eventID para deduplicación
              const pageViewEventId = 'PageView_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
              fbq('track', 'PageView', {}, { eventID: pageViewEventId });
            `,
          }}
        />
      </head>
      <body className="font-body antialiased min-h-screen flex flex-col bg-background text-foreground transition-colors duration-200">
        {/* Meta Pixel (noscript) */}
        <noscript>
          <img height="1" width="1" style={{ display: 'none' }} src={`https://www.facebook.com/tr?id=${process.env.META_PIXEL_ID}&ev=PageView&noscript=1`} alt="" />
        </noscript>
        {/* Pantalla de error global siempre visible (para pruebas, poner condicional según estado de error real) */}
        <GlobalErrorScreen />
        {/*
        <ThemeProvider>
          <ToastProvider>
            <SessionInit />
            <FacebookTrackingInit />
            {children}
          </ToastProvider>
        </ThemeProvider>
        */}
      </body>
    </html>
  );
}