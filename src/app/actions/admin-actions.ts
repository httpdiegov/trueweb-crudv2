'use server';

import { revalidatePath } from 'next/cache';
import { query } from '@/lib/db';
import { z } from 'zod';

// Esquema para validar la creación de una marca
const createBrandSchema = z.object({
  nombre_marca: z.string().min(2, { message: 'El nombre de la marca debe tener al menos 2 caracteres.' }),
  descripcion: z.string().optional().nullable(),
});

// Esquema para validar la creación de una categoría
const createCategorySchema = z.object({
  nombre_categoria: z.string().min(2, { message: 'El nombre de la categoría debe tener al menos 2 caracteres.' }),
  descripcion: z.string().optional().nullable(),
});

/**
 * Crea una nueva marca en la base de datos
 */
export async function createBrand(formData: FormData) {
  try {
    const rawData = {
      nombre_marca: formData.get('nombre_marca'),
      descripcion: formData.get('descripcion'),
    };

    // Validar los datos del formulario
    const validatedData = createBrandSchema.parse({
      nombre_marca: rawData.nombre_marca,
      descripcion: rawData.descripcion || null,
    });

    // Verificar si la marca ya existe
    const existingBrand = await query('SELECT id FROM marcas WHERE nombre_marca = ?', [
      validatedData.nombre_marca,
    ]);

    if (Array.isArray(existingBrand) && existingBrand.length > 0) {
      return { success: false, message: 'Ya existe una marca con este nombre.' };
    }

    // Insertar la nueva marca
    const result = await query(
      'INSERT INTO marcas (nombre_marca, descripcion) VALUES (?, ?)',
      [validatedData.nombre_marca, validatedData.descripcion]
    );

    if ('affectedRows' in result && result.affectedRows > 0) {
      // Invalidar la caché para forzar la actualización de la lista de marcas
      revalidatePath('/admin');
      return { success: true, message: 'Marca creada exitosamente.' };
    } else {
      throw new Error('No se pudo crear la marca.');
    }
  } catch (error) {
    console.error('Error al crear la marca:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Error al crear la marca',
    };
  }
}

/**
 * Crea una nueva categoría en la base de datos
 */
export async function createCategory(formData: FormData) {
  try {
    const rawData = {
      nombre_categoria: formData.get('nombre_categoria'),
      descripcion: formData.get('descripcion'),
    };

    // Validar los datos del formulario
    const validatedData = createCategorySchema.parse({
      nombre_categoria: rawData.nombre_categoria,
      descripcion: rawData.descripcion || null,
    });

    // Verificar si la categoría ya existe
    const existingCategory = await query('SELECT id FROM categorias WHERE nombre_categoria = ?', [
      validatedData.nombre_categoria,
    ]);

    if (Array.isArray(existingCategory) && existingCategory.length > 0) {
      return { success: false, message: 'Ya existe una categoría con este nombre.' };
    }

    // Insertar la nueva categoría
    const result = await query(
      'INSERT INTO categorias (nombre_categoria, descripcion) VALUES (?, ?)',
      [validatedData.nombre_categoria, validatedData.descripcion]
    );

    if ('affectedRows' in result && result.affectedRows > 0) {
      // Invalidar la caché para forzar la actualización de la lista de categorías
      revalidatePath('/admin');
      return { success: true, message: 'Categoría creada exitosamente.' };
    } else {
      throw new Error('No se pudo crear la categoría.');
    }
  } catch (error) {
    console.error('Error al crear la categoría:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Error al crear la categoría',
    };
  }
}
