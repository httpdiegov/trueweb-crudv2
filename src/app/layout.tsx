import type { Metadata } from 'next';
import './globals.css';
import { ToastProvider } from '@/components/providers/toast-provider';
import { ThemeProvider } from '@/components/theme/theme-provider';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'True Vintage',
  description: 'Tienda online de ropa vintage',
  icons: {
    icon: [
      { url: 'https://truevintageperu.com/vtg/logo_grande.jpg', type: 'image/jpg' },
    ],
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
  // Control: cargar Pixel solo en producción o cuando esté habilitado explícitamente
  const pixelId = process.env.NEXT_PUBLIC_FB_PIXEL_ID ?? '1311704343823236';
  const enablePixel = process.env.NODE_ENV === 'production' || process.env.NEXT_PUBLIC_ENABLE_FB_PIXEL === 'true';

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
        {enablePixel && (
          <Script id="fb-pixel" strategy="afterInteractive">
            {`!function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${pixelId}');
            fbq('track', 'PageView');`}
          </Script>
        )}
      </head>
      <body className="font-body antialiased min-h-screen flex flex-col bg-background text-foreground transition-colors duration-200">
        {/* Meta Pixel (noscript) */}
        {enablePixel && (
          <noscript
            dangerouslySetInnerHTML={{
              __html:
                `<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1" />`,
            }}
          />
        )}
        <ThemeProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}