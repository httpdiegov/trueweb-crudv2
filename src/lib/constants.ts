
// These constants might be used as fallbacks if DB fetch fails, or for UI elements
// not directly tied to dynamic DB data. Evaluate if they are still needed after dynamic fetching.
export const CATEGORIAS_PRENDA_FALLBACK = [
  "Vestidos",
  "Blusas",
  "Pantalones",
  "Faldas",
  "Chaquetas",
  "Accesorios",
  "Calzado",
  "Ofertas",
];

export const TALLAS_PRENDA_FALLBACK = [
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "XXL",
  "Talla Única",
];

export const PRECIO_RANGES = [
  { label: "Todos", min: 0, max: Infinity },
  { label: "$0 - $50", min: 0, max: 50 },
  { label: "$51 - $100", min: 51, max: 100 },
  { label: "$101 - $200", min: 101, max: 200 },
  { label: "Más de $200", min: 201, max: Infinity },
];
