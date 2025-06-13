import type { Prenda } from '@/types';

export const mockPrendas: Prenda[] = [
  {
    id: 1,
    drop_name: 'Colección Verano 2024',
    sku: 'TSB001',
    nombre_prenda: 'Vestido Floral Elegante',
    precio: 79.99,
    caracteristicas: 'Tela ligera, estampado floral, corte A.',
    medidas: 'Largo: 90cm, Busto: 85cm, Cintura: 70cm (Talla M)',
    desc_completa: 'Un vestido perfecto para ocasiones especiales o una salida casual. Su tela ligera y estampado floral te harán sentir fresca y elegante. Combínalo con tus sandalias favoritas.',
    stock: 15,
    categoria_id: 1, // Placeholder ID, replace with actual category ID from your DB
    talla_id: 1, // Placeholder ID, replace with actual talla ID from your DB
  },
  {
    id: 2,
    drop_name: 'Esenciales Oficina',
    sku: 'TSB002',
    nombre_prenda: 'Blusa de Seda Clásica',
    precio: 49.50,
    caracteristicas: '100% Seda, cuello V, manga larga.',
    medidas: 'Largo: 65cm, Busto: 90cm (Talla S)',
    desc_completa: 'Eleva tu look de oficina con esta blusa de seda. Suave al tacto y con un diseño atemporal, es una prenda indispensable en tu armario.',
    stock: 25,
    categoria_id: 2, // Placeholder ID, replace with actual category ID from your DB
    talla_id: 2, // Placeholder ID, replace with actual talla ID from your DB
  },
  {
    id: 3,
    drop_name: 'Denim Days',
    sku: 'TSB003',
    nombre_prenda: 'Jeans Ajustados de Tiro Alto',
    precio: 89.00,
    caracteristicas: 'Denim elástico, tiro alto, 5 bolsillos.',
    medidas: 'Cintura: 75cm, Cadera: 95cm, Largo: 100cm (Talla L)',
    desc_completa: 'Estos jeans de tiro alto realzan tu figura y ofrecen comodidad durante todo el día gracias a su tejido elástico.',
    stock: 30,
    categoria_id: 3, // Placeholder ID, replace with actual category ID from your DB
    talla_id: 3, // Placeholder ID, replace with actual talla ID from your DB
  },
  {
    id: 4,
    drop_name: 'Colección Verano 2024',
    sku: 'TSB004',
    nombre_prenda: 'Falda Plisada Midi',
    precio: 65.00,
    caracteristicas: 'Tejido ligero, plisado, cintura elástica.',
    medidas: 'Largo: 70cm, Cintura: 68-78cm (Talla Única)',
    desc_completa: 'Una falda midi versátil y chic. Su plisado añade movimiento y elegancia. Ideal con zapatillas o tacones.',
    stock: 18,
    categoria_id: 4, // Placeholder ID, replace with actual category ID from your DB
    talla_id: 4, // Placeholder ID, replace with actual talla ID from your DB
  },
  {
    id: 5,
    drop_name: 'Urban Style',
    sku: 'TSB005',
    nombre_prenda: 'Chaqueta Biker de Cuero PU',
    precio: 120.00,
    caracteristicas: 'Cuero PU, cremalleras metálicas, corte ajustado.',
    medidas: 'Largo: 55cm, Hombros: 40cm, Manga: 60cm (Talla M)',
    desc_completa: 'Añade un toque rebelde a tu outfit con esta chaqueta biker. Fabricada en cuero PU de alta calidad, es perfecta para un look moderno.',
    stock: 12,
    categoria_id: 5, // Placeholder ID, replace with actual category ID from your DB
    talla_id: 1, // Placeholder ID, replace with actual talla ID from your DB
  },
  {
    id: 6,
    drop_name: 'Basics Collection',
    sku: 'TSB006',
    nombre_prenda: 'Camiseta Básica de Algodón',
    precio: 25.00,
    caracteristicas: '100% algodón orgánico, cuello redondo, manga corta.',
    medidas: 'Largo: 60cm, Busto: 88cm (Talla S)',
    desc_completa: 'Una camiseta básica esencial, suave y cómoda. Perfecta para combinar con todo.',
    stock: 50,
    categoria_id: 2, // Placeholder ID, replace with actual category ID from your DB
    talla_id: 2, // Placeholder ID, replace with actual talla ID from your DB
  },
  {
    id: 7,
    drop_name: 'Winter Collection',
    sku: 'TSB007',
    nombre_prenda: 'Abrigo de Lana Oversize',
    precio: 199.99,
    caracteristicas: 'Mezcla de lana, corte oversize, bolsillos grandes.',
    medidas: 'Largo: 110cm, Hombros: 50cm (Talla M)',
    desc_completa: 'Mantente abrigada y con estilo con este abrigo de lana oversize. Su diseño moderno y cómodo es ideal para los días fríos.',
    stock: 10,
    categoria: 'Chaquetas',
    talla: 'M',
  },
].map(prenda => ({
  ...prenda,
  imagenes: mockImagenes.filter(img => img.prenda_id === prenda.id)
}));

let nextPrendaId = mockPrendas.length + 1;
let nextImagenId = mockImagenes.length + 1;

// Simulate database state
let currentPrendas: Prenda[] = JSON.parse(JSON.stringify(mockPrendas));
let currentImagenes: Imagen[] = JSON.parse(JSON.stringify(mockImagenes));


export const getMockPrendas = async (): Promise<Prenda[]> => {
  return JSON.parse(JSON.stringify(currentPrendas.map(p => ({
    ...p,
    imagenes: currentImagenes.filter(img => img.prenda_id === p.id)
  }))));
};

export const getMockPrendaById = async (id: number): Promise<Prenda | undefined> => {
  const prenda = currentPrendas.find(p => p.id === id);
  if (prenda) {
    return JSON.parse(JSON.stringify({
      ...prenda,
      imagenes: currentImagenes.filter(img => img.prenda_id === prenda.id)
    }));
  }
  return undefined;
};

export const createMockPrenda = async (data: Omit<Prenda, 'id' | 'imagenes'> & { imagenUrls?: string }): Promise<Prenda> => {
  const newPrenda: Prenda = {
    ...data,
    id: nextPrendaId++,
    imagenes: [],
  };
  currentPrendas.push(newPrenda);

  if (data.imagenUrls) {
    const urls = data.imagenUrls.split(',').map(url => url.trim()).filter(url => url);
    urls.forEach(url => {
      const newImagen: Imagen = {
        id: nextImagenId++,
        prenda_id: newPrenda.id,
        url: url,
        aiHint: `${newPrenda.categoria.toLowerCase()} ${newPrenda.nombre_prenda.split(" ")[0].toLowerCase()}`.substring(0,20), // Basic AI hint
      };
      currentImagenes.push(newImagen);
      newPrenda.imagenes?.push(newImagen);
    });
  }
  return JSON.parse(JSON.stringify(newPrenda));
};

export const updateMockPrenda = async (id: number, data: Partial<Omit<Prenda, 'id' | 'imagenes'>> & { imagenUrls?: string }): Promise<Prenda | undefined> => {
  const prendaIndex = currentPrendas.findIndex(p => p.id === id);
  if (prendaIndex === -1) return undefined;

  currentPrendas[prendaIndex] = { ...currentPrendas[prendaIndex], ...data };
  
  // Handle images
  if (data.imagenUrls !== undefined) { // Check if imagenUrls is part of the update
    // Remove old images for this prenda
    currentImagenes = currentImagenes.filter(img => img.prenda_id !== id);
    currentPrendas[prendaIndex].imagenes = [];

    // Add new images
    const urls = data.imagenUrls.split(',').map(url => url.trim()).filter(url => url);
    urls.forEach(url => {
      const newImagen: Imagen = {
        id: nextImagenId++,
        prenda_id: id,
        url: url,
        aiHint: `${currentPrendas[prendaIndex].categoria.toLowerCase()} ${currentPrendas[prendaIndex].nombre_prenda.split(" ")[0].toLowerCase()}`.substring(0,20),
      };
      currentImagenes.push(newImagen);
      currentPrendas[prendaIndex].imagenes?.push(newImagen);
    });
  } else {
    // If imagenUrls is not provided in data, keep existing images
     currentPrendas[prendaIndex].imagenes = currentImagenes.filter(img => img.prenda_id === id);
  }
  
  return JSON.parse(JSON.stringify(currentPrendas[prendaIndex]));
};

export const deleteMockPrenda = async (id: number): Promise<boolean> => {
  const initialLength = currentPrendas.length;
  currentPrendas = currentPrendas.filter(p => p.id !== id);
  currentImagenes = currentImagenes.filter(img => img.prenda_id !== id);
  return currentPrendas.length < initialLength;
};
