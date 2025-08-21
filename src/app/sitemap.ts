import { MetadataRoute } from 'next';
import { fetchPublicProducts, fetchAvailableCategories } from '@/app/actions/product-actions';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://truevintage.pe';
  
  // URLs estáticas principales
  const staticUrls: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/catalog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/lima`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/peru`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  try {
    // Obtener productos para URLs dinámicas
    const products = await fetchPublicProducts();
    const productUrls: MetadataRoute.Sitemap = products.map((product) => ({
      url: `${baseUrl}/products/${product.sku}`,
      lastModified: product.updated_at ? new Date(product.updated_at) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

    // Obtener categorías para URLs de categorías
    const categories = await fetchAvailableCategories();
    const categoryUrls: MetadataRoute.Sitemap = categories.map((category) => ({
      url: `${baseUrl}/catalog?category=${encodeURIComponent(category.nom_categoria)}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

    return [...staticUrls, ...productUrls, ...categoryUrls];
  } catch (error) {
    console.error('Error generando sitemap:', error);
    // Retornar solo URLs estáticas si hay error
    return staticUrls;
  }
}