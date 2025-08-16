
export interface Categoria {
  id: number;
  nom_categoria: string;
  prefijo?: string; // Added prefix
}

export interface Talla {
  id: number;
  nom_talla: string;
  orden_talla: number;
}

export interface Marca {
  id: number;
  nombre_marca: string;
  // Otros campos relevantes para la marca podrían ir aquí, ej: logo_url, origen, etc.
}

export interface Imagen {
  id: number;
  prenda_id: number;
  url: string;

}

export interface Prenda {
  id: number;
  drop_name?: string | null;
  sku: string;
  nombre_prenda: string;
  precio: number;
  caracteristicas?: string | null;
  medidas?: string | null;
  desc_completa: string;
  stock: number;
  estado: number; // 0 = oculto, 1 = visible
  separado: number; // 0 = no separado, 1 = separado
  categoria_id: number;
  talla_id: number;
  marca_id?: number | null; // Nuevo campo para el ID de la marca
  categoria_nombre?: string;
  categoria_prefijo?: string; // Added this line
  talla_nombre?: string;
  marca_nombre?: string | null; // Nuevo campo para el nombre de la marca (para facilitar la visualización)
  imagenes?: Imagen[]; // Para imágenes a color
  imagenes_bw?: Imagen[]; // Para imágenes en blanco y negro (máximo 2)
  created_at?: string;
  updated_at?: string;
}
