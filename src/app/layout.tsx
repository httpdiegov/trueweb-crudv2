import type { Metadata } from 'next';
import './globals.css';
import { ToastProvider } from '@/components/providers/toast-provider';

export const metadata: Metadata = {
  title: 'TrueVintage Boutique',
  description: 'Gestion de prendas de TrueVintage Boutique',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Belleza&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Alegreya:ital,wght@0,400..900;1,400..900&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased min-h-screen flex flex-col">
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
