import { query } from "@/lib/db";
import { productCache } from "@/lib/cache";
import type { Prenda, Imagen } from "@/types";

// Función optimizada para obtener producto por ID/SKU con caché
export async function fetchProductByIdOptimized(id: string | number): Promise<Prenda | undefined> {
  const cacheKey = `product:${id}`;
  
  // Intentar obtener del caché primero
  const cachedProduct = productCache.get<Prenda>(cacheKey);
  if (cachedProduct) {
    console.log(`Producto ${id} obtenido del caché`);
    return cachedProduct;
  }

  console.log(`Producto ${id} no está en caché, consultando base de datos...`);
  
  try {
    const isNumericId = !isNaN(Number(id));
    
    // Consulta única optimizada que obtiene todo de una vez
    const productSql = `
      SELECT DISTINCT
        p.id, p.drop_name, p.sku, p.nombre_prenda, p.precio,
        p.caracteristicas, p.medidas, p.stock, p.estado, p.separado,
        p.categoria_id, c.nom_categoria AS categoria_nombre, c.prefijo AS categoria_prefijo,
        p.marca_id, m.nombre_marca AS marca_nombre,
        p.talla_id, t.nom_talla AS talla_nombre,
        p.created_at, p.updated_at,
        -- Subconsulta para imágenes color
        (SELECT JSON_ARRAYAGG(JSON_OBJECT('id', i.id, 'prenda_id', i.prenda_id, 'url', i.url)) 
         FROM imagenes i WHERE i.prenda_id = p.id ORDER BY i.id) AS imagenes_color,
        -- Subconsulta para imágenes BW
        (SELECT JSON_ARRAYAGG(JSON_OBJECT('id', ib.id, 'prenda_id', ib.prenda_id, 'url', ib.url)) 
         FROM imagenesBW ib WHERE ib.prenda_id = p.id ORDER BY ib.id) AS imagenes_bw
      FROM prendas p
      LEFT JOIN categorias c ON p.categoria_id = c.id
      LEFT JOIN marcas m ON p.marca_id = m.id
      LEFT JOIN tallas t ON p.talla_id = t.id
      WHERE ${isNumericId ? 'p.id = ?' : 'p.sku = ?'}
    `;
    
    const rows = await query(productSql, [isNumericId ? Number(id) : id]) as any[];
    
    if (rows.length === 0) {
      console.log(`No se encontró producto con ${isNumericId ? 'ID' : 'SKU'}: ${id}`);
      return undefined;
    }
    
    const row = rows[0];
    
    // Procesar imágenes
    let imagenes: Imagen[] = [];
    let imagenesBW: Imagen[] = [];
    
    if (row.imagenes_color) {
      imagenes = typeof row.imagenes_color === 'string' 
        ? JSON.parse(row.imagenes_color) 
        : row.imagenes_color;
    }
    
    if (row.imagenes_bw) {
      imagenesBW = typeof row.imagenes_bw === 'string' 
        ? JSON.parse(row.imagenes_bw) 
        : row.imagenes_bw;
    }
    
    // Construir el objeto Prenda
    const prenda: Prenda = {
      id: row.id,
      drop_name: row.drop_name,
      sku: row.sku,
      nombre_prenda: row.nombre_prenda,
      precio: Number(row.precio),
      caracteristicas: row.caracteristicas,
      medidas: row.medidas,
      stock: Number(row.stock),
      categoria_id: row.categoria_id,
      categoria_nombre: row.categoria_nombre,
      categoria_prefijo: row.categoria_prefijo,
      marca_id: row.marca_id,
      marca_nombre: row.marca_nombre,
      talla_id: row.talla_id,
      talla_nombre: row.talla_nombre,
      imagenes: imagenes || [],
      imagenes_bw: imagenesBW || [],
      created_at: row.created_at,
      updated_at: row.updated_at,
      estado: Number(row.estado),
      separado: Number(row.separado)
    };
    
    // Guardar en caché por 5 minutos
    productCache.set(cacheKey, prenda, 5 * 60 * 1000);
    
    console.log(`Producto ${id} guardado en caché`);
    return prenda;
    
  } catch (error) {
    console.error(`Error al obtener producto ${id}:`, error);
    throw error;
  }
}

// Función optimizada para obtener productos con caché
export async function fetchProductsOptimized(): Promise<Prenda[]> {
  const cacheKey = 'products:all';
  
  // Intentar obtener del caché primero (caché más corto para listado)
  const cachedProducts = productCache.get<Prenda[]>(cacheKey);
  if (cachedProducts) {
    console.log('Productos obtenidos del caché');
    return cachedProducts;
  }

  console.log('Productos no están en caché, consultando base de datos...');
  
  try {
    const sql = `
      SELECT DISTINCT
        p.id, p.drop_name, p.sku, p.nombre_prenda, p.precio,
        p.caracteristicas, p.medidas, p.stock, p.estado, p.separado,
        p.categoria_id, c.nom_categoria AS categoria_nombre, c.prefijo AS categoria_prefijo,
        p.marca_id, m.nombre_marca AS marca_nombre,
        p.talla_id, t.nom_talla AS talla_nombre,
        p.created_at, p.updated_at,
        -- Solo obtener la primera imagen para el listado (optimización)
        (SELECT JSON_OBJECT('id', i.id, 'prenda_id', i.prenda_id, 'url', i.url) 
         FROM imagenes i WHERE i.prenda_id = p.id ORDER BY i.id LIMIT 1) AS primera_imagen
      FROM prendas p
      LEFT JOIN categorias c ON p.categoria_id = c.id
      LEFT JOIN marcas m ON p.marca_id = m.id
      LEFT JOIN tallas t ON p.talla_id = t.id
      WHERE p.estado = 1
      ORDER BY p.created_at DESC
    `;
    
    const rows = await query(sql) as any[];
    
    const products = rows.map(row => {
      let imagenes: Imagen[] = [];
      
      if (row.primera_imagen) {
        const primeraImagen = typeof row.primera_imagen === 'string' 
          ? JSON.parse(row.primera_imagen) 
          : row.primera_imagen;
        if (primeraImagen) {
          imagenes = [primeraImagen];
        }
      }
      
      return {
        id: row.id,
        drop_name: row.drop_name,
        sku: row.sku,
        nombre_prenda: row.nombre_prenda,
        precio: Number(row.precio),
        caracteristicas: row.caracteristicas,
        medidas: row.medidas,
        stock: Number(row.stock),
        categoria_id: row.categoria_id,
        categoria_nombre: row.categoria_nombre,
        categoria_prefijo: row.categoria_prefijo,
        marca_id: row.marca_id,
        marca_nombre: row.marca_nombre,
        talla_id: row.talla_id,
        talla_nombre: row.talla_nombre,
        imagenes,
        imagenes_bw: [], // No cargar imágenes BW en el listado
        created_at: row.created_at,
        updated_at: row.updated_at,
        estado: Number(row.estado),
        separado: Number(row.separado)
      };
    });
    
    // Guardar en caché por 2 minutos (menos tiempo para que se actualice más frecuentemente)
    productCache.set(cacheKey, products, 2 * 60 * 1000);
    
    console.log(`${products.length} productos guardados en caché`);
    return products;
    
  } catch (error) {
    console.error("Error obteniendo productos:", error);
    return [];
  }
}

// Función para limpiar caché cuando se actualiza un producto
export function clearProductCache(productId?: string | number): void {
  if (productId) {
    productCache.get(`product:${productId}`);
  }
  // Siempre limpiar el caché de listado cuando se actualiza algo
  productCache.get('products:all');
  console.log('Caché de productos limpiado');
}
