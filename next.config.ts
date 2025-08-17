import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '100mb',
    },
  },
  images: {
    domains: [
      'truevintageperu.com',
      'www.truevintageperu.com',
      'truevintage.pe',
      'placehold.co'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    formats: ['image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 7, // 1 week cache
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Configuración de calidad de imagen
    // La calidad se puede configurar en el componente Image de Next.js o aquí para todas las imágenes
    // con la propiedad 'quality' en el componente Image
    // Ejemplo: <Image src="..." quality={90} ... />
  },
  async redirects() {
    return [
      {
        source: '/nuevo-ingreso', // La URL antigua
        destination: '/',         // La nueva URL (la página de inicio en este caso)
        permanent: true,          // Esto establece el código de estado 301
      },
      {
        source: '/categoria-producto', // La URL antigua
        destination: '/',         // La nueva URL (la página de inicio en este caso)
        permanent: true,          // Esto establece el código de estado 301
      },
      {
        source: '/marcas-fila',    // La URL antigua
        destination: '/',   // O a tu página de categorías, si tienes una. Si no, a '/'
        permanent: true,
      },
      {
        source: '/categoria-producto/:path*',
        destination: '/', // o manejar dinámicamente
        permanent: true,
      },
      {
        source: '/tallas/:path*',
        destination: '/', // o manejar dinámicamente
        permanent: true,
      },


      // Puedes añadir más redirecciones aquí si encuentras otras URLs antiguas
    ]
  },
  async headers() {
    return [
      {
        source: '/_next/image',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, must-revalidate',
          },
        ],
      },
    ];
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
