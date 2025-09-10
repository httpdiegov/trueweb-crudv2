import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Optimizaciones de compilación
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Configuraciones experimentales para mejor rendimiento
  experimental: {
    serverActions: {
      bodySizeLimit: '100mb',
    },
    // Optimización de Bundle
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
    // Lazy loading de componentes
    esmExternals: true,
  },

  // Optimización de imágenes
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
    formats: ['image/avif', 'image/webp'], // AVIF primero para mejor compresión
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // Cache por 30 días
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;"
  },

  // Headers para caché optimizado
  async headers() {
    return [
      {
        source: '/_next/image',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=300, stale-while-revalidate=600',
          },
        ],
      },
    ];
  },

  // Configuración de compilación para producción
  swcMinify: true,
  
  // Optimización de Webpack
  webpack: (config, { dev, isServer }) => {
    // Optimizaciones solo para producción
    if (!dev) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
            },
            common: {
              name: 'common',
              minChunks: 2,
              priority: 5,
              reuseExistingChunk: true,
            },
          },
        },
      };
    }
    
    return config;
  },

  // Configurar redirects para SEO
  async redirects() {
    return [
      // Mover redirects comentados aquí si los necesitas
    ];
  },

  typescript: {
    ignoreBuildErrors: false, // Cambiar a false para producción
  },
  
  eslint: {
    ignoreDuringBuilds: false, // Cambiar a false para producción
  },
};

export default nextConfig;
