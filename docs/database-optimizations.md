# Optimizaciones de Base de Datos

## 1. Consulta Única Optimizada
Reemplazar múltiples consultas por una sola consulta JOIN:

```sql
-- En lugar de 3 consultas separadas, usar 1 consulta optimizada
SELECT DISTINCT
  p.id, p.drop_name, p.sku, p.nombre_prenda, p.precio,
  p.caracteristicas, p.medidas, p.desc_completa, p.stock, p.estado, p.separado,
  p.categoria_id, c.nom_categoria AS categoria_nombre, c.prefijo AS categoria_prefijo,
  p.marca_id, m.nombre_marca AS marca_nombre,
  p.talla_id, t.nom_talla AS talla_nombre,
  p.created_at, p.updated_at,
  -- Subconsultas optimizadas para imágenes
  (SELECT JSON_ARRAYAGG(JSON_OBJECT('id', i.id, 'url', i.url)) 
   FROM imagenes i WHERE i.prenda_id = p.id) AS imagenes_color,
  (SELECT JSON_ARRAYAGG(JSON_OBJECT('id', ib.id, 'url', ib.url)) 
   FROM imagenesBW ib WHERE ib.prenda_id = p.id) AS imagenes_bw
FROM prendas p
LEFT JOIN categorias c ON p.categoria_id = c.id
LEFT JOIN marcas m ON p.marca_id = m.id
LEFT JOIN tallas t ON p.talla_id = t.id
WHERE p.sku = ?
```

## 2. Índices de Base de Datos
```sql
-- Crear índices para mejorar velocidad de consultas
CREATE INDEX idx_prendas_sku ON prendas(sku);
CREATE INDEX idx_imagenes_prenda_id ON imagenes(prenda_id);
CREATE INDEX idx_imagenesBW_prenda_id ON imagenesBW(prenda_id);
CREATE INDEX idx_prendas_estado_separado ON prendas(estado, separado);
```

## 3. Pool de Conexiones Optimizado
```typescript
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 20, // Aumentar de 10 a 20
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true,
  ssl: process.env.MYSQL_SSL_CA ? { ca: process.env.MYSQL_SSL_CA } : undefined,
});
```
