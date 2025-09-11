
"use server";

import { revalidatePath } from "next/cache";
import { query } from "@/lib/db";
import { productCache } from "@/lib/cache";
import type { Prenda, Imagen, Categoria, Talla, Marca } from "@/types";
import { z } from "zod";

const productBaseSchema = z.object({
  nombre_prenda: z.string().min(3, { message: 'El nombre debe tener al menos 3 caracteres.' }),
  sku: z.string().min(1, { message: 'SKU es requerido.' }),
  precio: z.coerce.number().positive({ message: 'El precio debe ser un número positivo.' }),
  stock: z.coerce.number().int().min(0, { message: 'El stock no puede ser negativo.' }),
  categoria_id: z.coerce.number().int().positive({ message: 'Debe seleccionar una categoría.' }),
  talla_id: z.coerce.number().int().positive({ message: 'Debe seleccionar una talla.' }),
  marca_id: z.coerce.number().int().positive({ message: 'Debe seleccionar una marca.' }).optional().nullable(),
  caracteristicas: z.string().min(5, { message: 'Características son requeridas (mínimo 5 caracteres).' }).optional().nullable(),
  medidas: z.string().min(1, {message: 'Medidas son requeridas (mínimo 1 caracter)'}).optional().nullable(),
  drop_name: z.string().optional().nullable().transform(val => val === '' ? null : val),
  estado: z.coerce.number().int().optional().default(1), // Añadido para permitir el campo estado
  separado: z.coerce.number().int().min(0).max(1).optional().default(0), // 0 = no separado, 1 = separado
});

const productCreateSchema = productBaseSchema;
const productUpdateSchema = productBaseSchema;

interface ProcessedFileMetadata {
  file: File;
  imageType: 'color' | 'bw';
  imageIndex: string; // Made mandatory as imageUploadServer.js now expects it for both
}

async function handleFileUploadsToExternalServer(
  processedFiles: ProcessedFileMetadata[],
  sku: string,
  dropName?: string | null,
  prefijo?: string | null
): Promise<{ successfulUploads: { url: string; imageType: 'color' | 'bw' }[]; error?: string; errorFile?: string }> {
  if (!processedFiles || processedFiles.length === 0) {
    return { successfulUploads: [] };
  }

  const externalUploadUrl = process.env.EXTERNAL_UPLOAD_URL;
  if (!externalUploadUrl) {
    const errorMessage = "Configuración del servidor de subida incompleta (EXTERNAL_UPLOAD_URL no definida).";
    console.error(errorMessage);
    return { successfulUploads: [], error: errorMessage };
  }

  const successfulUploads: { url: string; imageType: 'color' | 'bw' }[] = [];

  for (const item of processedFiles) {
    const { file, imageType, imageIndex } = item;

    if (file.size === 0) continue;

    const singleFileFormData = new FormData();
    singleFileFormData.append('file', file, file.name);
    singleFileFormData.append('sku', sku);
    singleFileFormData.append('imageType', imageType);
    singleFileFormData.append('imageIndex', imageIndex); // imageIndex is now always sent

    if (dropName) {
      singleFileFormData.append('dropName', dropName);
    }
    if (prefijo) {
      singleFileFormData.append('prefijo', prefijo);
    }

    try {
      console.log(`Subiendo archivo ${file.name} (SKU: ${sku}, Tipo: ${imageType}, Drop: ${dropName || 'N/A'}, Prefijo: ${prefijo || 'N/A'}, Index: ${imageIndex}) a ${externalUploadUrl}`);
      const response = await fetch(externalUploadUrl, {
        method: 'POST',
        body: singleFileFormData,
      });

      if (!response.ok) {
        const errorBody = await response.text();
        let detailMessage = errorBody;
        try {
            const jsonError = JSON.parse(errorBody);
            detailMessage = jsonError.details || jsonError.error || errorBody;
        } catch (e) {
            // errorBody is not JSON or doesn't have expected fields
        }
        console.error(`Error subiendo archivo ${file.name} al servidor externo: ${response.status} ${response.statusText}`, detailMessage);
        return { successfulUploads, error: `Error del servidor de subida (${response.status}) para ${file.name}: ${detailMessage}`, errorFile: file.name };
      }

      const result = await response.json();
      if (result.url) {
        successfulUploads.push({ url: result.url, imageType: imageType });
        console.log(`Archivo ${file.name} subido exitosamente: ${result.url}`);
      } else {
        console.warn(`Servidor externo no devolvió una URL para el archivo ${file.name}`, result);
        return { successfulUploads, error: `Servidor externo no devolvió una URL para el archivo ${file.name}.`, errorFile: file.name };
      }
    } catch (uploadError) {
      console.error(`Error de red o conexión subiendo archivo ${file.name}:`, uploadError);
      return { successfulUploads, error: `Error de red al contactar el servidor de subida para ${file.name}: ${(uploadError as Error).message}`, errorFile: file.name };
    }
  }
  return { successfulUploads };
}

// Helper function to sort COLOR images: img01 first, then by ID.
function sortProductImages(images: Imagen[]): Imagen[] {
  if (!images || images.length === 0) {
    return [];
  }
  // Sort by URL to ensure -img01 comes before -img02, etc.
  // And -bw01 before -bw02
  return images.sort((a, b) => {
    const aNumMatch = a.url.match(/-(?:img|bw)(\d+)\./);
    const bNumMatch = b.url.match(/-(?:img|bw)(\d+)\./);
    const aNum = aNumMatch ? parseInt(aNumMatch[1], 10) : Infinity;
    const bNum = bNumMatch ? parseInt(bNumMatch[1], 10) : Infinity;

    if (aNum !== bNum) {
        return aNum - bNum;
    }
    return a.id - b.id; // Fallback to ID if numbers are the same or not present
  });
}


export async function fetchProducts(): Promise<Prenda[]> {
  // 🚀 CACHÉ: Intentar obtener listado del caché primero
  const cacheKey = 'products:all';
  const cachedProducts = productCache.get<Prenda[]>(cacheKey);
  if (cachedProducts) {
    console.log(`✅ Listado de productos obtenido del caché - ¡SÚPER RÁPIDO!`);
    return cachedProducts;
  }
  
  console.log(`📀 Listado de productos no está en caché, consultando base de datos...`);
  
  try {
    const productsSql = `
      SELECT DISTINCT
        p.id, p.drop_name, p.sku, p.nombre_prenda, p.precio,
        p.caracteristicas, p.medidas, p.stock, p.estado, p.separado,
        p.categoria_id, c.nom_categoria AS categoria_nombre, c.prefijo AS categoria_prefijo,
        p.marca_id, m.nombre_marca AS marca_nombre,
        p.talla_id, t.nom_talla AS talla_nombre,
        p.created_at, p.updated_at
      FROM prendas p
      LEFT JOIN categorias c ON p.categoria_id = c.id
      LEFT JOIN marcas m ON p.marca_id = m.id
      LEFT JOIN tallas t ON p.talla_id = t.id
      ORDER BY p.id DESC
    `;
    const productRows = await query(productsSql) as any[];

    if (productRows.length === 0) {
      return [];
    }

    const productIds = productRows.map(p => p.id).filter(id => id != null);

    const placeholders = productIds.map(() => '?').join(',');
    const imagesSqlDynamic = `
      SELECT id, prenda_id, url
        FROM imagenes
        WHERE prenda_id IN (${placeholders})
        ORDER BY prenda_id, id
      `;
    let allImageRows: Imagen[] = await query(imagesSqlDynamic, productIds) as Imagen[];
    
    const imagesBwSqlDynamic = `
        SELECT id, prenda_id, url
        FROM imagenesBW
        WHERE prenda_id IN (${placeholders})
        ORDER BY prenda_id, id
      `;
      const allImageBwRows = await query(imagesBwSqlDynamic, productIds) as Imagen[];

    // Procesar imágenes BW
    const bwImageRegex = /(bw|blanco|blanco-negro|bn|bw-?\d*)\.(jpg|jpeg|png|webp|gif)$/i;
    
    // Filtrar imágenes BW de la tabla principal de imágenes
    const bwImagesFromMain = allImageRows.filter(img => bwImageRegex.test(img.url.toLowerCase()));
    // Filtrar imágenes a color (no BW)
    const colorImages = allImageRows.filter(img => !bwImageRegex.test(img.url.toLowerCase()));
    
    // Combinar imágenes BW de ambas fuentes
    const allBwImages = [...bwImagesFromMain, ...allImageBwRows];
    
    // Agrupar imágenes por prenda_id
    const imagesByPrendaId = colorImages.reduce((acc: Record<number, Imagen[]>, image) => {
      if (!acc[image.prenda_id]) {
        acc[image.prenda_id] = [];
      }
      
      const product = productRows.find(p => p.id === image.prenda_id);
      
      if (product?.sku && product?.drop_name) {
        const productBase = product.sku.split('-')[0];
        const bwImageNumber = image.url.match(/(\d+)\.(jpg|jpeg|png|webp|gif)$/i)?.[1] || '01';
        
        // Crear la nueva URL en el formato correcto solo para imágenes BW
        if (bwImageNumber) {
          const imageUrl = `https://truevintageperu.com/vtg/${product.drop_name}/${productBase}/BW/${product.sku}/${product.sku}-bw${bwImageNumber}.png`;
          image.url = normalizeImageUrl(imageUrl);
        }
      }
      
      acc[image.prenda_id].push(image);
      return acc;
    }, {} as Record<number, Imagen[]>);
    
    // Si no hay imágenes BW para una prenda, crear una ruta por defecto
    productRows.forEach(product => {
      if (!allBwImages.find(img => img.prenda_id === product.id)) {
        const productCode = product.sku; // Ej: TRK-203
        const productBase = productCode.split('-')[0]; // Ej: TRK
        
        const defaultBwImage = {
          id: 1000000 + product.id, // ID alto para evitar colisiones
          prenda_id: product.id,
          url: normalizeImageUrl(`https://truevintageperu.com/vtg/${product.drop_name}/${productBase}/BW/${productCode}/${productCode}-bw1.png`)
        };
        
        allBwImages.push(defaultBwImage);
      }
    });

    // Agrupar imágenes BW por prenda_id
    const bwImagesByPrendaId = allBwImages.reduce((acc: Record<number, Imagen[]>, image) => {
      if (!acc[image.prenda_id]) {
        acc[image.prenda_id] = [];
      }
      acc[image.prenda_id].push(image);
      return acc;
    }, {} as Record<number, Imagen[]>);

    return productRows.map((row: any) => {
      const rawImagesForPrenda = imagesByPrendaId[Number(row.id)] || [];
      const bwImageRegex = /-bw\d{2,}\.(jpg|jpeg|png|webp|gif)$/i;
      
      const bwImages = rawImagesForPrenda.filter((img: Imagen) => bwImageRegex.test(img.url));
      const colorImages = rawImagesForPrenda.filter((img: Imagen) => !bwImageRegex.test(img.url));
      
      const sortedColorImages = sortProductImages(colorImages);
      const sortedBwImages = sortProductImages(bwImages);

      return {
        id: Number(row.id),
        drop_name: row.drop_name,
        sku: row.sku,
        nombre_prenda: row.nombre_prenda,
        precio: parseFloat(row.precio),
        caracteristicas: row.caracteristicas,
        medidas: row.medidas,
        stock: parseInt(row.stock, 10),
        categoria_id: Number(row.categoria_id),
        talla_id: Number(row.talla_id),
        marca_id: row.marca_id ? Number(row.marca_id) : null,
        marca_nombre: row.marca_nombre || null,
        categoria_nombre: row.categoria_nombre,
        categoria_prefijo: row.categoria_prefijo,
        talla_nombre: row.talla_nombre,
        imagenes: sortedColorImages,
        imagenes_bw: sortedBwImages.map(img => ({ ...img, url: img.url.startsWith('bw_') ? img.url.substring(3) : img.url })),
        created_at: row.created_at,
        updated_at: row.updated_at,
        estado: Number(row.estado),
        separado: Number(row.separado)
      };
    });
    
    // 🚀 CACHÉ: Guardar listado en caché por 2 minutos (menos tiempo para que se actualice más frecuentemente)
    const products = productRows.map((row: any) => {
      const rawImagesForPrenda = imagesByPrendaId[Number(row.id)] || [];
      const bwImageRegex = /-bw\d{2,}\.(jpg|jpeg|png|webp|gif)$/i;
      
      const bwImages = rawImagesForPrenda.filter((img: Imagen) => bwImageRegex.test(img.url));
      const colorImages = rawImagesForPrenda.filter((img: Imagen) => !bwImageRegex.test(img.url));
      
      const sortedColorImages = sortProductImages(colorImages);
      const sortedBwImages = sortProductImages(bwImages);

      return {
        id: Number(row.id),
        drop_name: row.drop_name,
        sku: row.sku,
        nombre_prenda: row.nombre_prenda,
        precio: parseFloat(row.precio),
        caracteristicas: row.caracteristicas,
        medidas: row.medidas,
        stock: parseInt(row.stock, 10),
        categoria_id: Number(row.categoria_id),
        talla_id: Number(row.talla_id),
        marca_id: row.marca_id ? Number(row.marca_id) : null,
        marca_nombre: row.marca_nombre || null,
        categoria_nombre: row.categoria_nombre,
        categoria_prefijo: row.categoria_prefijo,
        talla_nombre: row.talla_nombre,
        imagenes: sortedColorImages,
        imagenes_bw: sortedBwImages.map(img => ({ ...img, url: img.url.startsWith('bw_') ? img.url.substring(3) : img.url })),
        created_at: row.created_at,
        updated_at: row.updated_at,
        estado: Number(row.estado),
        separado: Number(row.separado)
      };
    });
    
    // 🚀 CACHÉ: Guardar listado en caché por 2 minutos
    productCache.set(cacheKey, products, 2 * 60 * 1000);
    console.log(`💾 Listado de ${products.length} productos guardado en caché por 2 minutos`);
    
    return products;
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

export async function fetchPublicProducts(): Promise<Prenda[]> {
  try {
    const productsSql = `
      SELECT DISTINCT
        p.id, p.drop_name, p.sku, p.nombre_prenda, p.precio,
        p.caracteristicas, p.medidas, p.stock, p.estado, p.separado,
        p.categoria_id, c.nom_categoria AS categoria_nombre, c.prefijo AS categoria_prefijo,
        p.marca_id, m.nombre_marca AS marca_nombre,
        p.talla_id, t.nom_talla AS talla_nombre,
        p.created_at, p.updated_at
      FROM prendas p
      LEFT JOIN categorias c ON p.categoria_id = c.id
      LEFT JOIN marcas m ON p.marca_id = m.id
      LEFT JOIN tallas t ON p.talla_id = t.id
      WHERE p.estado = 1
      ORDER BY p.id DESC
    `;
    const productRows = await query(productsSql) as any[];

    if (productRows.length === 0) {
      return [];
    }

    const productIds = productRows.map(p => p.id).filter(id => id != null);

    const placeholders = productIds.map(() => '?').join(',');
    const imagesSqlDynamic = `
      SELECT id, prenda_id, url
        FROM imagenes
        WHERE prenda_id IN (${placeholders})
        ORDER BY prenda_id, id
      `;
    let allImageRows: Imagen[] = await query(imagesSqlDynamic, productIds) as Imagen[];
    
    const imagesBwSqlDynamic = `
        SELECT id, prenda_id, url
        FROM imagenesBW
        WHERE prenda_id IN (${placeholders})
        ORDER BY prenda_id, id
      `;
      const allImageBwRows = await query(imagesBwSqlDynamic, productIds) as Imagen[];

    // Procesar imágenes BW
    const bwImageRegex = /(bw|blanco|blanco-negro|bn|bw-?\d*)\.(jpg|jpeg|png|webp|gif)$/i;
    
    // Filtrar imágenes BW de la tabla principal de imágenes
    const bwImagesFromMain = allImageRows.filter(img => bwImageRegex.test(img.url.toLowerCase()));
    // Filtrar imágenes a color (no BW)
    const colorImages = allImageRows.filter(img => !bwImageRegex.test(img.url.toLowerCase()));
    
    // Combinar imágenes BW de ambas fuentes
    const allBwImages = [...bwImagesFromMain, ...allImageBwRows];
    
    // Agrupar imágenes por prenda_id
    const imagesByPrendaId = colorImages.reduce((acc: Record<number, Imagen[]>, image) => {
      if (!acc[image.prenda_id]) {
        acc[image.prenda_id] = [];
      }
      
      const product = productRows.find(p => p.id === image.prenda_id);
      
      if (product?.sku && product?.drop_name) {
        const productBase = product.sku.split('-')[0];
        const bwImageNumber = image.url.match(/(\d+)\.(jpg|jpeg|png|webp|gif)$/i)?.[1] || '01';
        
        // Crear la nueva URL en el formato correcto solo para imágenes BW
        if (bwImageNumber) {
          const imageUrl = `https://truevintageperu.com/vtg/${product.drop_name}/${productBase}/BW/${product.sku}/${product.sku}-bw${bwImageNumber}.png`;
          image.url = normalizeImageUrl(imageUrl);
        }
      }
      
      acc[image.prenda_id].push(image);
      return acc;
    }, {} as Record<number, Imagen[]>);
    
    // Si no hay imágenes BW para una prenda, crear una ruta por defecto
    productRows.forEach(product => {
      if (!allBwImages.find(img => img.prenda_id === product.id)) {
        const productCode = product.sku; // Ej: TRK-203
        const productBase = productCode.split('-')[0]; // Ej: TRK
        
        const defaultBwImage = {
          id: 1000000 + product.id, // ID alto para evitar colisiones
          prenda_id: product.id,
          url: normalizeImageUrl(`https://truevintageperu.com/vtg/${product.drop_name}/${productBase}/BW/${productCode}/${productCode}-bw1.png`)
        };
        
        allBwImages.push(defaultBwImage);
      }
    });

    // Agrupar imágenes BW por prenda_id
    const bwImagesByPrendaId = allBwImages.reduce((acc: Record<number, Imagen[]>, image) => {
      if (!acc[image.prenda_id]) {
        acc[image.prenda_id] = [];
      }
      acc[image.prenda_id].push(image);
      return acc;
    }, {} as Record<number, Imagen[]>);

    return productRows.map((row: any) => {
      const rawImagesForPrenda = imagesByPrendaId[Number(row.id)] || [];
      const bwImageRegex = /-bw\d{2,}\.(jpg|jpeg|png|webp|gif)$/i;
      
      const bwImages = rawImagesForPrenda.filter((img: Imagen) => bwImageRegex.test(img.url));
      const colorImages = rawImagesForPrenda.filter((img: Imagen) => !bwImageRegex.test(img.url));
      
      const sortedColorImages = sortProductImages(colorImages);
      const sortedBwImages = sortProductImages(bwImages);

      return {
        id: Number(row.id),
        drop_name: row.drop_name,
        sku: row.sku,
        nombre_prenda: row.nombre_prenda,
        precio: parseFloat(row.precio),
        caracteristicas: row.caracteristicas,
        medidas: row.medidas,
        stock: parseInt(row.stock, 10),
        categoria_id: Number(row.categoria_id),
        talla_id: Number(row.talla_id),
        marca_id: row.marca_id ? Number(row.marca_id) : null,
        marca_nombre: row.marca_nombre || null,
        categoria_nombre: row.categoria_nombre,
        categoria_prefijo: row.categoria_prefijo,
        talla_nombre: row.talla_nombre,
        imagenes: sortedColorImages,
        imagenes_bw: sortedBwImages.map(img => ({ ...img, url: img.url.startsWith('bw_') ? img.url.substring(3) : img.url })),
        created_at: row.created_at,
        updated_at: row.updated_at,
        estado: Number(row.estado),
        separado: Number(row.separado)
      };
    });
  } catch (error) {
    console.error("Error fetching public products:", error);
    return [];
  }
}

export async function fetchProductById(id: string | number): Promise<Prenda | undefined> {
  console.log('fetchProductById called with ID/SKU:', id); // Debug log
  
  // 🚀 CACHÉ: Intentar obtener del caché primero
  const cacheKey = `product:${id}`;
  const cachedProduct = productCache.get<Prenda>(cacheKey);
  if (cachedProduct) {
    console.log(`✅ Producto ${id} obtenido del caché - ¡SÚPER RÁPIDO!`);
    return cachedProduct;
  }
  
  console.log(`📀 Producto ${id} no está en caché, consultando base de datos...`);
  
  try {
    // Determinar si el parámetro es un ID numérico o un SKU
    const isNumericId = !isNaN(Number(id));
    
    let productSql = `
      SELECT DISTINCT
        p.id, p.drop_name, p.sku, p.nombre_prenda, p.precio,
        p.caracteristicas, p.medidas, p.stock, p.estado, p.separado,
        p.categoria_id, c.nom_categoria AS categoria_nombre, c.prefijo AS categoria_prefijo,
        p.marca_id, m.nombre_marca AS marca_nombre,
        p.talla_id, t.nom_talla AS talla_nombre,
        p.created_at, p.updated_at
      FROM prendas p
      LEFT JOIN categorias c ON p.categoria_id = c.id
      LEFT JOIN marcas m ON p.marca_id = m.id
      LEFT JOIN tallas t ON p.talla_id = t.id
      WHERE `;
      
    // Añadir condición WHERE apropiada según si es ID numérico o SKU
    if (isNumericId) {
      productSql += 'p.id = ?';
    } else {
      productSql += 'p.sku = ?';
    }
  console.log('SQL Query:', productSql.replace(/\s+/g, ' ').trim()); // Debug log
    const rows = await query(productSql, [isNumericId ? Number(id) : id]) as any[];
    console.log('Query result rows:', rows); // Debug log
    
    if (rows.length === 0) {
      console.log(`No se encontró ningún producto con el ${isNumericId ? 'ID' : 'SKU'}:`, id); // Debug log
      return undefined;
    }
    
    const row = rows[0];
    console.log('Product row found:', row); // Debug log

    const imagesSql = `
      SELECT id, prenda_id, url
      FROM imagenes
      WHERE prenda_id = ?
      ORDER BY id 
    `;
    
    const imagesBwSql = `
      SELECT id, prenda_id, url
      FROM imagenesBW
      WHERE prenda_id = ?
      ORDER BY id 
    `;
    
    const prendaId = rows[0].id;
    console.log(`Consultando imágenes para prenda ID: ${prendaId}`);
    
    // Consultar ambas tablas en paralelo
    const [allImageRowsForPrenda, allBwImageRowsForPrenda] = await Promise.all([
      query(imagesSql, [prendaId]) as Promise<Imagen[]>,
      query(imagesBwSql, [prendaId]) as Promise<Imagen[]>
    ]);
    
    console.log(`Imágenes encontradas en tabla imagenes:`, allImageRowsForPrenda);
    console.log(`Imágenes encontradas en tabla imagenesBW:`, allBwImageRowsForPrenda);

    // Expresión regular para detectar imágenes BW en la tabla principal
    const bwImageRegex = /(bw|blanco|blanco-negro|bn|bw-?\d*)\.(jpg|jpeg|png|webp|gif)$/i;
    
    // Filtrar imágenes BW de la tabla principal
    const bwImagesFromMain = allImageRowsForPrenda.filter(img => {
      const isBw = bwImageRegex.test(img.url.toLowerCase());
      console.log(`Imagen en tabla principal: ${img.url}, ¿es BW? ${isBw}`);
      return isBw;
    });
    
    // Combinar imágenes BW de ambas fuentes
    const bwImages = [...bwImagesFromMain, ...allBwImageRowsForPrenda];
    console.log(`Total imágenes BW combinadas:`, bwImages);
    
    // El resto son imágenes a color (solo de la tabla principal)
    const colorImages = allImageRowsForPrenda.filter(img => !bwImageRegex.test(img.url.toLowerCase()));
    
    // Si no hay imágenes BW, usar las imágenes BW de la carpeta /BW/
    let finalBwImages = [...bwImages];
    if (finalBwImages.length === 0 && colorImages.length > 0) {
      console.log('No se encontraron imágenes BW explícitas, usando imágenes de la carpeta /BW/...');
      
      // Obtener el código del producto (ej: TRK-203)
      const productCode = row.sku;
      const productBase = productCode.split('-')[0]; // Ej: TRK
      
      // Crear la ruta base para las imágenes BW
      const basePath = `https://truevintageperu.com/vtg/${row.drop_name}/${productBase}/BW/${productCode}`;
      
      // Crear las URLs de las imágenes BW con formato normalizado (solo hasta bw02)
      finalBwImages = Array.from({ length: 2 }, (_, i) => {
        const imageUrl = `${basePath}/${productCode}-bw${i + 1}.png`;
        return {
          id: 1000 + i, // ID temporal alto para evitar colisiones
          prenda_id: row.id,
          url: normalizeImageUrl(imageUrl)
        };
      });
      
      console.log('URLs de imágenes BW generadas:', finalBwImages);
    }
    
    console.log(`Imágenes BW finales:`, finalBwImages);
    console.log(`Imágenes a color:`, colorImages);

    const sortedColorImages = sortProductImages(colorImages);
    const sortedBwImages = sortProductImages(finalBwImages);

    const prenda: Prenda = {
      id: Number(row.id),
      drop_name: row.drop_name,
      sku: row.sku,
      nombre_prenda: row.nombre_prenda,
      precio: parseFloat(row.precio),
      caracteristicas: row.caracteristicas,
      medidas: row.medidas,
      stock: parseInt(row.stock, 10),
      categoria_id: Number(row.categoria_id),
      talla_id: Number(row.talla_id),
      marca_id: row.marca_id ? Number(row.marca_id) : null,
      marca_nombre: row.marca_nombre || null,
      categoria_nombre: row.categoria_nombre,
      categoria_prefijo: row.categoria_prefijo,
      talla_nombre: row.talla_nombre,
      imagenes: sortedColorImages,
      imagenes_bw: sortedBwImages.map(img => ({ ...img, url: img.url.startsWith('bw_') ? img.url.substring(3) : img.url })),
      created_at: row.created_at,
      updated_at: row.updated_at,
      estado: Number(row.estado),
      separado: Number(row.separado)
    };
    
    //  Cache: Guardar producto en caché por 5 minutos
    productCache.set(cacheKey, prenda, 5 * 60 * 1000);
    console.log(`💾 Producto ${id} guardado en caché por 5 minutos`);
    
    return prenda;

  } catch (error) {
    console.error(`Error fetching product with ID ${id}:`, error);
    return undefined;
  }
}

async function fetchCategoryById(categoryId: number): Promise<Categoria | null> {
  try {
    const sql = 'SELECT id, nom_categoria, prefijo FROM categorias WHERE id = ?';
    const rows = await query(sql, [categoryId]) as any[];
    if (rows.length > 0) {
      return {
        id: Number(rows[0].id),
        nom_categoria: rows[0].nom_categoria,
        prefijo: rows[0].prefijo
      };
    }
    return null;
  } catch (error) {
    console.error(`Error fetching category for id ${categoryId}:`, error);
    return null;
  }
}

export async function createProduct(formData: FormData) {
  try {
    const rawData: { [key: string]: any } = {};
    Object.keys(productCreateSchema.shape).forEach((key) => {
      const value = formData.get(key);
      if (value !== null || key === 'drop_name' || key === 'caracteristicas' || key === 'medidas') {
          rawData[key] = value === '' && (key === 'drop_name' || key === 'caracteristicas' || key === 'medidas') ? null : value;
      }
    });

    const validationResult = productCreateSchema.safeParse(rawData);
    if (!validationResult.success) {
      console.error("Validation errors (createProduct):", validationResult.error.flatten());
      return { success: false, message: `Error de validación: ${JSON.stringify(validationResult.error.flatten().fieldErrors)}` };
    }
    const productData = validationResult.data;

    const categoria = await fetchCategoryById(productData.categoria_id);
    const categoriaPrefijo = categoria?.prefijo;

    const sqlPrenda = `
      INSERT INTO prendas (
        drop_name, sku, nombre_prenda, precio, caracteristicas, medidas, stock, categoria_id, talla_id, marca_id, separado)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const paramsPrenda = [
      productData.drop_name,
      productData.sku,
      productData.nombre_prenda,
      productData.precio,
      productData.caracteristicas,
      productData.medidas,
      productData.stock,
      productData.categoria_id,
      productData.talla_id,
      productData.marca_id || null, // Use null if marca_id is not provided
      productData.separado || 0, // Use 0 if separado is not provided
    ];

    const resultPrenda = await query(sqlPrenda, paramsPrenda) as any;
    const newPrendaId = resultPrenda.insertId;

    if (!newPrendaId) {
      return { success: false, message: "Error al crear el producto en la base de datos (no se obtuvo ID)." };
    }

    // Prepare files for upload
    const filesToProcess: ProcessedFileMetadata[] = [];
    
    // Color Images
    const colorImageFiles = formData.getAll('imageFilesColor').filter(f => f instanceof File && f.size > 0) as File[];
    const colorImageIndexes = formData.getAll('imageIndexesColor') as string[];
    colorImageFiles.forEach((file, i) => {
      if (colorImageIndexes[i] !== undefined) {
        filesToProcess.push({ file, imageType: 'color', imageIndex: colorImageIndexes[i] });
      } else {
        console.warn(`Missing index for color image file ${file.name}`);
      }
    });

    // BW Images
    const bwImageFiles = formData.getAll('imageFilesBw').filter(f => f instanceof File && f.size > 0) as File[];
    const bwImageIndexes = formData.getAll('imageIndexesBw') as string[];
    bwImageFiles.forEach((file, i) => {
      if (bwImageIndexes[i] !== undefined) {
        filesToProcess.push({ file, imageType: 'bw', imageIndex: bwImageIndexes[i] });
      } else {
        console.warn(`Missing index for BW image file ${file.name}`);
      }
    });

    let allUploadedUrls: { url: string; imageType: 'color' | 'bw' }[] = [];
    if (filesToProcess.length > 0) {
      const uploadResult = await handleFileUploadsToExternalServer(
        filesToProcess,
        productData.sku, // Pass SKU to external server
        productData.drop_name,
        categoriaPrefijo
      );
      if (uploadResult.error) {
        await query('DELETE FROM prendas WHERE id = ?', [newPrendaId]); // Attempt to delete product
        return { success: false, message: `Error subiendo imágenes (${uploadResult.errorFile || 'desconocido'}): ${uploadResult.error}` };
      }
      if (uploadResult.successfulUploads) {
        allUploadedUrls = uploadResult.successfulUploads;
      }
    }

    if (allUploadedUrls.length > 0) {
      const sqlImagenColor = 'INSERT INTO imagenes (prenda_id, url) VALUES (?, ?)';
      const sqlImagenBw = 'INSERT INTO imagenesBW (prenda_id, url) VALUES (?, ?)';
      for (const uploadedFile of allUploadedUrls) {
        if (uploadedFile.imageType === 'bw') {
          await query(sqlImagenBw, [newPrendaId, uploadedFile.url]);
        } else {
          await query(sqlImagenColor, [newPrendaId, uploadedFile.url]);
        }
      }
    }

    revalidatePath("/admin");
    revalidatePath("/");
    return { success: true, message: "Producto creado exitosamente." + (allUploadedUrls.length > 0 ? " Imágenes subidas y guardadas." : " No se subieron imágenes.") };

  } catch (error) {
    console.error("Error creating product:", error);
    let errorMessage = `Error al crear el producto: ${(error as Error).message}`;
    if (typeof error === 'object' && error !== null && 'sqlMessage' in error) {
        errorMessage = `Error de base de datos: ${(error as {sqlMessage: string}).sqlMessage}`;
    }
    return { success: false, message: errorMessage };
  }
}

export async function updateProduct(id: number, formData: FormData) {
  try {
    const rawData: { [key: string]: any } = {};
    Object.keys(productUpdateSchema.shape).forEach((key) => {
        const value = formData.get(key);
        if (value !== null || key === 'drop_name' || key === 'caracteristicas' || key === 'medidas') {
             rawData[key] = value === '' && (key === 'drop_name' || key === 'caracteristicas' || key === 'medidas') ? null : value;
        }
    });

    const validationResult = productUpdateSchema.safeParse(rawData);
    if (!validationResult.success) {
      console.error("Validation errors (updateProduct):", validationResult.error.flatten());
      return { success: false, message: `Error de validación: ${JSON.stringify(validationResult.error.flatten().fieldErrors)}` };
    }
    const productData = validationResult.data;

    const categoria = await fetchCategoryById(productData.categoria_id);
    const categoriaPrefijo = categoria?.prefijo;

    const sqlPrenda = `
      UPDATE prendas SET
      drop_name = ?, sku = ?, nombre_prenda = ?, precio = ?, caracteristicas = ?, medidas = ?,
      stock = ?, categoria_id = ?, marca_id = ?, talla_id = ?, estado = ?, separado = ?
      WHERE id = ?
    `;
    const paramsPrenda = [
      productData.drop_name,
      productData.sku,
      productData.nombre_prenda,
      productData.precio,
      productData.caracteristicas,
      productData.medidas,
      productData.stock,
      productData.categoria_id,
      productData.marca_id || null, // Use null if marca_id is not provided
      productData.talla_id,
      productData.estado,
      productData.separado || 0, // Use 0 if separado is not provided
      id
    ];
    await query(sqlPrenda, paramsPrenda);

    // Prepare files for upload
    const filesToProcess: ProcessedFileMetadata[] = [];
    const replaceExistingColorImages = formData.get('replaceExistingColorImages') === 'true';
    const replaceExistingBwImages = formData.get('replaceExistingBwImages') === 'true';

    // Color Images
    const colorImageFiles = formData.getAll('imageFilesColor').filter(f => f instanceof File && f.size > 0) as File[];
    const colorImageIndexes = formData.getAll('imageIndexesColor') as string[];
    colorImageFiles.forEach((file, i) => {
       if (colorImageIndexes[i] !== undefined) {
        filesToProcess.push({ file, imageType: 'color', imageIndex: colorImageIndexes[i] });
      } else {
        console.warn(`Missing index for color image file ${file.name} during update`);
      }
    });

    // BW Images
    const bwImageFiles = formData.getAll('imageFilesBw').filter(f => f instanceof File && f.size > 0) as File[];
    const bwImageIndexes = formData.getAll('imageIndexesBw') as string[];
    bwImageFiles.forEach((file, i) => {
       if (bwImageIndexes[i] !== undefined) {
        filesToProcess.push({ file, imageType: 'bw', imageIndex: bwImageIndexes[i] });
      } else {
        console.warn(`Missing index for BW image file ${file.name} during update`);
      }
    });
    
    let allUploadedUrls: { url: string; imageType: 'color' | 'bw' }[] = [];
    if (filesToProcess.length > 0) {
      const uploadResult = await handleFileUploadsToExternalServer(
        filesToProcess,
        productData.sku, // Pass SKU to external server
        productData.drop_name,
        categoriaPrefijo
      );
      if (uploadResult.error) {
        return { success: false, message: `Error subiendo nuevas imágenes (${uploadResult.errorFile || 'desconocido'}): ${uploadResult.error}` };
      }
      if (uploadResult.successfulUploads) {
        allUploadedUrls = uploadResult.successfulUploads;
      }

      if (allUploadedUrls.length > 0) {
        const newColorUrls = allUploadedUrls.filter(u => u.imageType === 'color').map(u => u.url);
        const newBwUrls = allUploadedUrls.filter(u => u.imageType === 'bw').map(u => u.url);

        if (replaceExistingColorImages && newColorUrls.length > 0) {
            // Delete old COLOR images (URLs NOT containing -bwXX.)
            const bwPattern = '%-bw[0-9][0-9].%'; // SQL LIKE pattern for -bwXX.
            await query("DELETE FROM imagenes WHERE prenda_id = ? AND url NOT LIKE ?", [id, bwPattern]);
        }
        if (replaceExistingBwImages && newBwUrls.length > 0) {
            // Delete ALL old BW images for this product (URLs containing -bwXX.)
            const bwPattern = '%-bw[0-9][0-9].%'; // SQL LIKE pattern for -bwXX.
            await query("DELETE FROM imagenes WHERE prenda_id = ? AND url LIKE ?", [id, bwPattern]);
        }
      
        const sqlImagenColor = 'INSERT INTO imagenes (prenda_id, url) VALUES (?, ?)';
        const sqlImagenBw = 'INSERT INTO imagenesBW (prenda_id, url) VALUES (?, ?)';
        for (const uploadedFile of allUploadedUrls) {
          if (uploadedFile.imageType === 'bw') {
            await query(sqlImagenBw, [id, uploadedFile.url]);
          } else {
            await query(sqlImagenColor, [id, uploadedFile.url]);
          }
        }
      }
    }

    revalidatePath("/admin");
    revalidatePath(`/admin/products/edit/${id}`);
    revalidatePath(`/products/${id}`);
    revalidatePath("/");
    return { success: true, message: "Producto actualizado exitosamente." + (allUploadedUrls.length > 0 ? " Imágenes procesadas y guardadas." : " No se procesaron nuevas imágenes.") };

  } catch (error) {
    console.error("Error updating product:", error);
    let errorMessage = `Error al actualizar el producto: ${(error as Error).message}`;
    if (typeof error === 'object' && error !== null && 'sqlMessage' in error) {
        errorMessage = `Error de base de datos: ${(error as {sqlMessage: string}).sqlMessage}`;
    }
    return { success: false, message: errorMessage };
  }
}

export async function deleteProduct(id: number) {
  try {
    // Note: This does not delete files from the FTP server.
    await query('DELETE FROM imagenes WHERE prenda_id = ?', [id]);
    const result = await query('DELETE FROM prendas WHERE id = ?', [id]) as any;

    if (result.affectedRows === 1) {
      revalidatePath("/admin");
      revalidatePath("/");
      return { success: true, message: "Producto eliminado exitosamente." };
    } else {
      return { success: false, message: `Error: No se encontró el producto con ID ${id} para eliminar.` };
    }
  } catch (error) {
    console.error("Error deleting product:", error);
    let errorMessage = `Error al eliminar el producto: ${(error as Error).message}`;
     if (typeof error === 'object' && error !== null && 'sqlMessage' in error) {
        errorMessage = `Error de base de datos: ${(error as {sqlMessage: string}).sqlMessage}`;
    }
    return { success: false, message: errorMessage };
  }
}

export async function fetchAvailableCategories(): Promise<Categoria[]> {
  try {
    const rows = await query('SELECT id, nom_categoria, prefijo FROM categorias ORDER BY nom_categoria') as any[];
    return rows.map(row => ({
      id: Number(row.id),
      nom_categoria: row.nom_categoria,
      prefijo: row.prefijo
    }));
  } catch (error) {
    console.error("Error fetching available categories:", error);
    return [];
  }
}

export async function fetchAvailableBrands(): Promise<Marca[]> {
  try {
    const rows = await query('SELECT id, nombre_marca FROM marcas ORDER BY nombre_marca') as any[];
    return rows.map(row => ({
      id: Number(row.id),
      nombre_marca: row.nombre_marca,
    }));
  } catch (error) {
    console.error("Error fetching available brands:", error);
    return [];
  }
}

export async function fetchAvailableSizes(): Promise<Talla[]> {
  try {
    const rows = await query('SELECT id, nom_talla, orden_talla FROM tallas ORDER BY orden_talla, id') as any[];
    return rows.map(row => ({
      id: Number(row.id),
      nom_talla: row.nom_talla,
      orden_talla: Number(row.orden_talla)
    }));
  } catch (error) {
    console.error("Error fetching available sizes:", error);
    return [];
  }
}

interface ZodShapeIterable extends z.ZodObject<any, any, any, any, any> {
  shape: Record<string, z.ZodTypeAny>;
}

/**
 * Normalizes image URLs to ensure consistent formatting
 * - Converts 'bw1.png' to 'bw01.png' and 'bw2.png' to 'bw02.png'
 * - Leaves other BW image numbers unchanged (e.g., 'bw03.png' stays as is)
 * - Handles both .png and .jpg extensions
 */
function normalizeImageUrl(url: string): string {
  if (!url) {
    return url;
  }
  
  const originalUrl = url;
  
  try {
    // First, handle the case where the URL might already be normalized
    if (url.includes('-bw01.') || url.includes('-bw02.')) {
      // Already in the correct format, no need to modify
      return url;
    }
    
    // Handle BW images with single-digit numbers (1 or 2 only)
    // This matches patterns like -bw1.png or -bw2.jpg
    const bwMatch = url.match(/(.*-bw)([12])(\.(?:png|jpg|jpeg|webp))$/i);
    if (bwMatch) {
      const [_, base, num, ext] = bwMatch;
      const normalized = `${base}0${num}${ext}`;
      return normalized;
    }
    
    // Handle color images (img1.jpg -> img01.jpg)
    const colorMatch = url.match(/(.*-img)(\d+)(\.(?:png|jpg|jpeg|webp))$/i);
    if (colorMatch) {
      const [_, base, num, ext] = colorMatch;
      const number = parseInt(num, 10);
      const normalized = `${base}${number < 10 ? '0' + number : number}${ext}`;
      return normalized;
    }
    
    // If we get here, the URL didn't match any of our patterns
    return url;
    
  } catch (error) {
    console.error('Error in normalizeImageUrl:', error);
    return originalUrl; // Return original on error
  }
}

export async function generateNextSku(categoria_id: number): Promise<string> {
  try {
    // 1. Obtener el prefijo de la categoría
    const categorySql = 'SELECT prefijo FROM categorias WHERE id = ?';
    const categoryRows = await query(categorySql, [categoria_id]) as any[];
    
    if (categoryRows.length === 0) {
      throw new Error(`No se encontró la categoría con ID: ${categoria_id}`);
    }
    
    const prefijo = categoryRows[0].prefijo;
    
    // 2. Buscar el último SKU de esa categoría
    const lastSkuSql = `
      SELECT sku 
      FROM prendas 
      WHERE categoria_id = ? AND sku LIKE ? 
      ORDER BY sku DESC 
      LIMIT 1
    `;
    
    const skuPattern = `${prefijo}-%`;
    const lastSkuRows = await query(lastSkuSql, [categoria_id, skuPattern]) as any[];
    
    let nextNumber = 1;
    
    if (lastSkuRows.length > 0) {
      const lastSku = lastSkuRows[0].sku;
      // 3. Extraer el número del último SKU (ej: TRK-005 -> 005)
      const numberMatch = lastSku.match(/-([0-9]+)$/);
      
      if (numberMatch) {
        const lastNumber = parseInt(numberMatch[1], 10);
        nextNumber = lastNumber + 1;
      }
    }
    
    // 4. Formatear con ceros a la izquierda (ej: 6 -> 006)
    const formattedNumber = nextNumber.toString().padStart(3, '0');
    
    // 5. Retornar el nuevo SKU (ej: TRK-006)
    const newSku = `${prefijo}-${formattedNumber}`;
    
    return newSku;
  } catch (error) {
    console.error('Error generando el siguiente SKU:', error);
    throw error;
  }
}

export async function fetchAllProducts(): Promise<Prenda[]> {
  try {
    // First, fetch all products with their basic information
    const productsSql = `
      SELECT DISTINCT
        p.id, p.drop_name, p.sku, p.nombre_prenda, p.precio,
        p.caracteristicas, p.medidas, p.stock, p.estado, p.separado,
        p.categoria_id, c.nom_categoria AS categoria_nombre, c.prefijo AS categoria_prefijo,
        p.marca_id, m.nombre_marca AS marca_nombre,
        p.talla_id, t.nom_talla AS talla_nombre,
        p.created_at, p.updated_at
      FROM prendas p
      LEFT JOIN categorias c ON p.categoria_id = c.id
      LEFT JOIN marcas m ON p.marca_id = m.id
      LEFT JOIN tallas t ON p.talla_id = t.id
      ORDER BY p.id DESC
    `;
    
    const productRows = await query(productsSql) as any[];

    if (productRows.length === 0) {
      return [];
    }


    // Get all product IDs for batch image fetching
    const productIds = productRows.map(p => p.id).filter((id): id is number => id != null);

    // Fetch all color images for these products
    const placeholders = productIds.map(() => '?').join(',');
    const imagesSql = `
      SELECT id, prenda_id, url, 'color' as tipo
      FROM imagenes
      WHERE prenda_id IN (${placeholders})
      ORDER BY prenda_id, id
    `;
    
    // Fetch all BW images for these products
    const imagesBwSql = `
      SELECT id, prenda_id, url, 'bw' as tipo
      FROM imagenesBW
      WHERE prenda_id IN (${placeholders})
      ORDER BY prenda_id, id
    `;

    // Execute queries in parallel
    const [colorImages, bwImages] = await Promise.all([
      query(imagesSql, productIds) as Promise<Imagen[]>,
      query(imagesBwSql, productIds) as Promise<Imagen[]>
    ]);

    // Group images by product_id for easier lookup
    const imagesByProductId = new Map<number, { imagenes: Imagen[], imagenes_bw: Imagen[] }>();
    
    // Process color images - use URLs directly from DB
    colorImages.forEach((img: Imagen) => {
      if (!imagesByProductId.has(img.prenda_id)) {
        imagesByProductId.set(img.prenda_id, { imagenes: [], imagenes_bw: [] });
      }
      // Use the URL directly from the database
      imagesByProductId.get(img.prenda_id)?.imagenes.push(img);
    });

    // Process BW images - use URLs directly from DB
    console.log('Total BW images to process:', bwImages.length);
    
    bwImages.forEach((img: Imagen) => {
      if (!imagesByProductId.has(img.prenda_id)) {
        imagesByProductId.set(img.prenda_id, { imagenes: [], imagenes_bw: [] });
      }
      // Use the BW URL directly from the database
      imagesByProductId.get(img.prenda_id)?.imagenes_bw.push(img);
    });
    
    // Log summary of BW images by product
    console.log('\nBW Images Summary by Product:');
    imagesByProductId.forEach((images: { imagenes: Imagen[], imagenes_bw: Imagen[] }, productId: number) => {
      if (images.imagenes_bw.length > 0) {
        const product = productRows.find((p: { id: number }) => p.id === productId);
        console.log(`- ${product?.codigo || `ID: ${productId}`}: ${images.imagenes_bw.length} BW images`);
        if (images.imagenes_bw.some((img: Imagen) => img.url.includes('TRK-132') || img.url.includes('TRK-164'))) {
          console.log('  Images:', images.imagenes_bw.map((img: Imagen) => img.url));
        }
      }
    });

    // Combine product data with images
    const productsWithImages = productRows.map(product => {
      const images = imagesByProductId.get(Number(product.id)) || { imagenes: [], imagenes_bw: [] };
      
      return {
        ...product,
        imagenes: images.imagenes,
        imagenes_bw: images.imagenes_bw
      };
    });
    
    // Log all product codes to verify TRK-164 is in the list
    console.log('All product codes:', productsWithImages.map(p => p.codigo).filter(Boolean));
    
    // Return the products with their associated images
    return productsWithImages.map(product => ({
      ...product,
      estado: Number(product.estado)
    }));
  } catch (error) {
    console.error('Error al obtener todos los productos:', error);
    return [];
  }
}

export async function setAllProductsVisible(): Promise<{ success: boolean; message: string; affectedRows?: number }> {
  try {
    // Actualizar el estado de todas las prendas a visible (estado = 1)
    const updateSql = 'UPDATE prendas SET estado = 1';
    const result = await query(updateSql) as any;
    
    // Revalidar la página de administración para reflejar los cambios
    revalidatePath('/admin');
    
    return {
      success: true,
      message: `Se han actualizado ${result.affectedRows || 0} productos a estado visible.`,
      affectedRows: result.affectedRows || 0
    };
  } catch (error) {
    console.error('Error al actualizar el estado de los productos:', error);
    return {
      success: false,
      message: 'Error al actualizar el estado de los productos.'
    };
  }
}

// Función para eliminar una imagen B&N específica
export async function deleteBwImage(imageId: number): Promise<{ success: boolean; message: string }> {
  try {
    console.log(`Intentando eliminar imagen B&N con ID: ${imageId}`);
    
    // Primero verificar si la imagen existe
    const checkResult = await query('SELECT id, prenda_id, url FROM imagenesBW WHERE id = ?', [imageId]) as any[];
    console.log(`Resultado de verificación:`, checkResult);
    
    if (checkResult.length === 0) {
      console.log(`No se encontró imagen B&N con ID ${imageId} en la tabla imagenesBW`);
      return {
        success: false,
        message: `No se encontró la imagen con ID ${imageId} para eliminar.`
      };
    }
    
    // Eliminar la imagen de la tabla imagenesBW
    const result = await query('DELETE FROM imagenesBW WHERE id = ?', [imageId]) as any;
    console.log(`Resultado de eliminación:`, result);
    
    if (result.affectedRows === 1) {
      console.log(`Imagen B&N con ID ${imageId} eliminada exitosamente`);
      // Revalidar las páginas para reflejar los cambios
      revalidatePath('/admin');
      revalidatePath('/');
      
      return {
        success: true,
        message: 'Imagen B&N eliminada exitosamente.'
      };
    } else {
      console.log(`No se pudo eliminar la imagen B&N con ID ${imageId}`);
      return {
        success: false,
        message: `No se encontró la imagen con ID ${imageId} para eliminar.`
      };
    }
  } catch (error) {
    console.error('Error al eliminar la imagen B&N:', error);
    return {
      success: false,
      message: `Error al eliminar la imagen B&N: ${error instanceof Error ? error.message : 'Error desconocido'}`
    };
  }
}

// Función para eliminar múltiples imágenes B&N
export async function deleteMultipleBwImages(imageIds: number[]): Promise<{ success: boolean; message: string; deletedCount?: number }> {
  try {
    if (imageIds.length === 0) {
      return {
        success: false,
        message: 'No se han especificado imágenes para eliminar.'
      };
    }

    // Crear placeholders para la consulta SQL
    const placeholders = imageIds.map(() => '?').join(',');
    const deleteSql = `DELETE FROM imagenesBW WHERE id IN (${placeholders})`;
    
    const result = await query(deleteSql, imageIds) as any;
    
    // Revalidar las páginas para reflejar los cambios
    revalidatePath('/admin');
    revalidatePath('/');
    
    return {
      success: true,
      message: `Se han eliminado ${result.affectedRows || 0} imágenes B&N.`,
      deletedCount: result.affectedRows || 0
    };
  } catch (error) {
    console.error('Error al eliminar las imágenes B&N:', error);
    return {
      success: false,
      message: 'Error al eliminar las imágenes B&N.'
    };
  }
}

// Función para actualizar el stock de múltiples productos
export async function updateMultipleProductsStock(productIds: number[], newStock: number): Promise<{ success: boolean; message: string; affectedRows?: number }> {
  try {
    if (productIds.length === 0) {
      return {
        success: false,
        message: 'No se han seleccionado productos para actualizar.'
      };
    }

    if (newStock < 0) {
      return {
        success: false,
        message: 'El stock no puede ser negativo.'
      };
    }

    // Crear placeholders para la consulta SQL
    const placeholders = productIds.map(() => '?').join(',');
    const updateSql = `UPDATE prendas SET stock = ? WHERE id IN (${placeholders})`;
    const params = [newStock, ...productIds];
    
    const result = await query(updateSql, params) as any;
    
    // Revalidar la página de administración para reflejar los cambios
    revalidatePath('/admin');
    
    return {
      success: true,
      message: `Se ha actualizado el stock de ${result.affectedRows || 0} productos a ${newStock}.`,
      affectedRows: result.affectedRows || 0
    };
  } catch (error) {
    console.error('Error al actualizar el stock de los productos:', error);
    return {
      success: false,
      message: 'Error al actualizar el stock de los productos.'
    };
  }
}

// Función para actualizar el estado de múltiples productos
export async function updateMultipleProductsStatus(productIds: number[], newStatus: number): Promise<{ success: boolean; message: string; affectedRows?: number }> {
  try {
    if (productIds.length === 0) {
      return {
        success: false,
        message: 'No se han seleccionado productos para actualizar.'
      };
    }

    if (newStatus !== 0 && newStatus !== 1) {
      return {
        success: false,
        message: 'El estado debe ser 0 (Oculto) o 1 (Visible).'
      };
    }

    // Crear placeholders para la consulta SQL
    const placeholders = productIds.map(() => '?').join(',');
    const updateSql = `UPDATE prendas SET estado = ? WHERE id IN (${placeholders})`;
    const params = [newStatus, ...productIds];
    
    const result = await query(updateSql, params) as any;
    
    // Revalidar la página de administración para reflejar los cambios
    revalidatePath('/admin');
    
    const statusText = newStatus === 1 ? 'Visible' : 'Oculto';
    
    return {
      success: true,
      message: `Se ha actualizado el estado de ${result.affectedRows || 0} productos a ${statusText}.`,
      affectedRows: result.affectedRows || 0
    };
  } catch (error) {
    console.error('Error al actualizar el estado de los productos:', error);
    return {
      success: false,
      message: 'Error al actualizar el estado de los productos.'
    };
  }
}
