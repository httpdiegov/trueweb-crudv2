import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // 🚀 OPTIMIZACIÓN: Configuración experimental
  experimental: {
    serverActions: {
      bodySizeLimit: '100mb',
    },
    // Optimización de CSS (más conservadora)
    optimizeCss: process.env.NODE_ENV === 'production',
    // Pre-renderizado optimizado
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
  
  // 🚀 OPTIMIZACIÓN: Compresión mejorada
  compress: true,
  
  // 🚀 OPTIMIZACIÓN: Power by header removal
  poweredByHeader: false,
  
  // 🚀 OPTIMIZACIÓN: Generación de mapas de source optimizada
  productionBrowserSourceMaps: false,
  
  // 🚀 OPTIMIZACIÓN: Configuración de compilación
  compiler: {
    // Remover console.log en producción
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn']
    } : false,
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
    // 🚀 OPTIMIZACIÓN: Formatos modernos con fallback
    formats: ['image/avif', 'image/webp'],
    
    // 🚀 OPTIMIZACIÓN: Tamaños más específicos para mejor rendimiento
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384, 512, 768],
    
    // 🚀 OPTIMIZACIÓN: Caché más largo para imágenes estáticas
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 días cache
    
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    
    // 🚀 OPTIMIZACIÓN: Configuración para optimización automática
    unoptimized: false, // Siempre optimizar en producción
    
    // 🚀 OPTIMIZACIÓN: Carga adaptativa basada en conexión
    loader: 'default',
  },
/*   async redirects() {
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
      {
        source: '/tienda/:path*',
        destination: '/', // o manejar dinámicamente
        permanent: true,
      }
    ]
  }, */
  // 🚀 OPTIMIZACIÓN: Headers de rendimiento y seguridad
  async headers() {
    return [
      {
        // Headers para imágenes optimizadas
        source: '/_next/image',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
      {
        // Headers para archivos estáticos (_next/static)
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Headers para favicon y manifest
        source: '/(favicon.ico|manifest.json|robots.txt)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400', // 1 día
          },
        ],
      },
      {
        // Headers de seguridad para todas las páginas
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          // Performance headers
          {
            key: 'X-Robots-Tag',
            value: 'index, follow'
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
  
  // 🚀 OPTIMIZACIÓN: Configuración de Webpack (solo en build sin Turbopack)
  ...(process.env.NODE_ENV === 'production' ? {
    webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
      // Solo aplicar en producción sin Turbopack
      if (!dev && !isServer) {
        config.optimization = {
          ...config.optimization,
          splitChunks: {
            chunks: 'all',
            cacheGroups: {
              // Vendor chunk separado
              vendor: {
                test: /[\\/]node_modules[\\/]/,
                name: 'vendors',
                chunks: 'all',
                enforce: true,
              },
              // UI components chunk
              ui: {
                test: /[\\/]src[\\/]components[\\/]ui[\\/]/,
                name: 'ui-components',
                chunks: 'all',
                enforce: true,
              },
              // Common chunk para código compartido
              common: {
                minChunks: 2,
                chunks: 'all',
                name: 'common',
                enforce: true,
              },
            },
          },
        };
      }

      // Optimización de alias para imports más rápidos
      config.resolve.alias = {
        ...config.resolve.alias,
        '@': require('path').resolve(__dirname, 'src'),
      };

      // Comprimir comentarios y espacios en producción
      if (!dev) {
        config.optimization.minimize = true;
      }

      return config;
    }
  } : {}),

  // 🚀 OPTIMIZACIÓN: Variables de entorno optimizadas
  env: {
    NEXT_TELEMETRY_DISABLED: '1', // Deshabilitar telemetría para mejor performance
  },
};

export default nextConfig;
