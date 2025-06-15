'use server';

import { revalidatePath } from 'next/cache';
import { query } from '@/lib/db';
import { z } from 'zod';

// Esquema para validar la creación/actualización de una marca
const brandSchema = z.object({
  nombre_marca: z.string().min(2, { message: 'El nombre de la marca debe tener al menos 2 caracteres.' })
});

export async function fetchBrands() {
  try {
    const result = await query('SELECT * FROM marcas ORDER BY nombre_marca');
    return Array.isArray(result) ? result : [];
  } catch (error) {
    console.error('Error fetching brands:', error);
    return [];
  }
}

export async function fetchBrandById(id: number) {
  try {
    const result = await query('SELECT * FROM marcas WHERE id = ?', [id]);
    return Array.isArray(result) && result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error('Error fetching brand:', error);
    return null;
  }
}

export async function createBrand(formData: FormData) {
  try {
    const rawData = {
      nombre_marca: formData.get('nombre_marca')
    };

    // Validar los datos del formulario
    const validatedData = brandSchema.parse({
      nombre_marca: rawData.nombre_marca
    });

    // Verificar si la marca ya existe
    const existingBrand = await query(
      'SELECT id FROM marcas WHERE nombre_marca = ?',
      [validatedData.nombre_marca]
    );

    if (Array.isArray(existingBrand) && existingBrand.length > 0) {
      return { 
        success: false, 
        message: 'Ya existe una marca con este nombre.' 
      };
    }

    // Insertar la nueva marca
    const result = await query(
      'INSERT INTO marcas (nombre_marca) VALUES (?)',
      [validatedData.nombre_marca]
    );

    if ('insertId' in result) {
      revalidatePath('/admin/brands');
      return { 
        success: true, 
        message: 'Marca creada exitosamente.',
        id: result.insertId
      };
    } else {
      throw new Error('No se pudo crear la marca.');
    }
  } catch (error) {
    console.error('Error creating brand:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Error al crear la marca',
    };
  }
}

export async function updateBrand(id: number, formData: FormData) {
  try {
    const rawData = {
      nombre_marca: formData.get('nombre_marca')
    };

    // Validar los datos del formulario
    const validatedData = brandSchema.parse({
      nombre_marca: rawData.nombre_marca
    });

    // Verificar si la marca ya existe (excluyendo la actual)
    const existingBrand = await query(
      'SELECT id FROM marcas WHERE nombre_marca = ? AND id != ?',
      [validatedData.nombre_marca, id]
    );

    if (Array.isArray(existingBrand) && existingBrand.length > 0) {
      return {
        success: false,
        message: 'Ya existe una marca con este nombre.',
      };
    }

    // Actualizar la marca
    const result = await query(
      'UPDATE marcas SET nombre_marca = ? WHERE id = ?',
      [validatedData.nombre_marca, id]
    );

    if ('affectedRows' in result && result.affectedRows > 0) {
      revalidatePath('/admin/brands');
      revalidatePath(`/admin/brands/${id}`);
      return { 
        success: true, 
        message: 'Marca actualizada exitosamente.' 
      };
    } else {
      throw new Error('No se pudo actualizar la marca.');
    }
  } catch (error) {
    console.error('Error updating brand:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Error al actualizar la marca',
    };
  }
}

export async function deleteBrand(id: number) {
  try {
    // Verificar si hay productos asociados a esta marca
    const products = await query('SELECT id FROM productos WHERE marca_id = ?', [id]);
    
    if (Array.isArray(products) && products.length > 0) {
      return { 
        success: false, 
        message: 'No se puede eliminar la marca porque tiene productos asociados.' 
      };
    }

    // Eliminar la marca
    const result = await query('DELETE FROM marcas WHERE id = ?', [id]);

    if ('affectedRows' in result && result.affectedRows > 0) {
      revalidatePath('/admin/brands');
      revalidatePath(`/admin/brands/${id}`);
      return { 
        success: true, 
        message: 'Marca eliminada exitosamente.' 
      };
    } else {
      throw new Error('No se pudo eliminar la marca.');
    }
  } catch (error) {
    console.error('Error deleting brand:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Error al eliminar la marca',
    };
  }
}
