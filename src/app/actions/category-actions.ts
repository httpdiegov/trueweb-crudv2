'use server';

import { revalidatePath } from 'next/cache';
import { query } from '@/lib/db';
import { z } from 'zod';

// Esquema para validar la creación/actualización de una categoría
const categorySchema = z.object({
  nom_categoria: z.string().min(2, { message: 'El nombre de la categoría debe tener al menos 2 caracteres.' }),
  prefijo: z.string().optional()
});

export async function fetchCategories() {
  try {
    const result = await query('SELECT * FROM categorias ORDER BY nom_categoria');
    return Array.isArray(result) ? result : [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

export async function fetchCategoryById(id: number) {
  try {
    const result = await query('SELECT * FROM categorias WHERE id = ?', [id]);
    return Array.isArray(result) && result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error('Error fetching category:', error);
    return null;
  }
}

export async function createCategory(formData: FormData) {
  try {
    const rawData = {
      nom_categoria: formData.get('nom_categoria'),
      prefijo: formData.get('prefijo')
    };

    // Validar los datos del formulario
    const validatedData = categorySchema.parse({
      nom_categoria: rawData.nom_categoria,
      prefijo: rawData.prefijo || null
    });

    // Verificar si la categoría ya existe
    const existingCategory = await query(
      'SELECT id FROM categorias WHERE nom_categoria = ?',
      [validatedData.nom_categoria]
    );

    if (Array.isArray(existingCategory) && existingCategory.length > 0) {
      return { 
        success: false, 
        message: 'Ya existe una categoría con este nombre.' 
      };
    }

    // Insertar la nueva categoría
    const result = await query(
      'INSERT INTO categorias (nom_categoria, prefijo) VALUES (?, ?)',
      [validatedData.nom_categoria, validatedData.prefijo]
    );

    if ('insertId' in result) {
      revalidatePath('/admin/categories');
      return { 
        success: true, 
        message: 'Categoría creada exitosamente.',
        id: result.insertId
      };
    } else {
      throw new Error('No se pudo crear la categoría.');
    }
  } catch (error) {
    console.error('Error creating category:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Error al crear la categoría',
    };
  }
}

export async function updateCategory(id: number, formData: FormData) {
  try {
    const rawData = {
      nom_categoria: formData.get('nom_categoria'),
      prefijo: formData.get('prefijo')
    };

    // Validar los datos del formulario
    const validatedData = categorySchema.parse({
      nom_categoria: rawData.nom_categoria,
      prefijo: rawData.prefijo || null
    });

    // Verificar si ya existe otra categoría con el mismo nombre
    const existingCategory = await query(
      'SELECT id FROM categorias WHERE nom_categoria = ? AND id != ?',
      [validatedData.nom_categoria, id]
    );

    if (Array.isArray(existingCategory) && existingCategory.length > 0) {
      return { 
        success: false, 
        message: 'Ya existe otra categoría con este nombre.' 
      };
    }

    // Actualizar la categoría
    const result = await query(
      'UPDATE categorias SET nom_categoria = ?, prefijo = ? WHERE id = ?',
      [validatedData.nom_categoria, validatedData.prefijo, id]
    );

    if ('affectedRows' in result && result.affectedRows > 0) {
      revalidatePath('/admin/categories');
      revalidatePath(`/admin/categories/${id}`);
      return { 
        success: true, 
        message: 'Categoría actualizada exitosamente.' 
      };
    } else {
      throw new Error('No se pudo actualizar la categoría.');
    }
  } catch (error) {
    console.error('Error updating category:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Error al actualizar la categoría',
    };
  }
}

export async function deleteCategory(id: number) {
  try {
    // Verificar si hay productos asociados a esta categoría
    const products = await query('SELECT id FROM productos WHERE categoria_id = ?', [id]);
    
    if (Array.isArray(products) && products.length > 0) {
      return { 
        success: false, 
        message: 'No se puede eliminar la categoría porque tiene productos asociados.' 
      };
    }

    // Eliminar la categoría
    const result = await query('DELETE FROM categorias WHERE id = ?', [id]);

    if ('affectedRows' in result && result.affectedRows > 0) {
      revalidatePath('/admin/categories');
      revalidatePath(`/admin/categories/${id}`);
      return { 
        success: true, 
        message: 'Categoría eliminada exitosamente.' 
      };
    } else {
      throw new Error('No se pudo eliminar la categoría.');
    }
  } catch (error) {
    console.error('Error deleting category:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Error al eliminar la categoría',
    };
  }
}
