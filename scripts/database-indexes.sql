-- ============================================
-- ÍNDICES DE OPTIMIZACIÓN PARA TRUE VINTAGE
-- ============================================
-- Estos índices mejorarán significativamente la velocidad de consultas
-- Tiempo estimado de ejecución: 1-2 minutos
-- Mejora estimada: 50-70% más rápido en consultas de productos

-- 1. ÍNDICE PARA BÚSQUEDA POR SKU (MUY IMPORTANTE)
-- Este es el más crítico ya que cada página de producto busca por SKU
CREATE INDEX IF NOT EXISTS idx_prendas_sku ON prendas(sku);

-- 2. ÍNDICES PARA RELACIONES DE IMÁGENES
-- Optimiza la carga de imágenes de cada producto
CREATE INDEX IF NOT EXISTS idx_imagenes_prenda_id ON imagenes(prenda_id);
CREATE INDEX IF NOT EXISTS idx_imagenesBW_prenda_id ON imagenesBW(prenda_id);

-- 3. ÍNDICES PARA FILTROS COMUNES
-- Optimiza listados de productos visibles y disponibles
CREATE INDEX IF NOT EXISTS idx_prendas_estado_separado ON prendas(estado, separado);
CREATE INDEX IF NOT EXISTS idx_prendas_categoria ON prendas(categoria_id);
CREATE INDEX IF NOT EXISTS idx_prendas_talla ON prendas(talla_id);
CREATE INDEX IF NOT EXISTS idx_prendas_marca ON prendas(marca_id);

-- 4. ÍNDICE COMPUESTO PARA LISTADOS OPTIMIZADOS
-- Para consultas que filtran por múltiples campos
CREATE INDEX IF NOT EXISTS idx_prendas_listing ON prendas(estado, categoria_id, created_at DESC);

-- 5. ÍNDICES PARA ORDENAMIENTO
-- Optimiza el ordenamiento por fecha de creación (productos más recientes)
CREATE INDEX IF NOT EXISTS idx_prendas_created_at ON prendas(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_prendas_precio ON prendas(precio);

-- ============================================
-- VERIFICACIÓN DE ÍNDICES CREADOS
-- ============================================
-- Ejecutar esta consulta para verificar que se crearon correctamente:
SHOW INDEX FROM prendas WHERE Key_name LIKE 'idx_%';
SHOW INDEX FROM imagenes WHERE Key_name LIKE 'idx_%';
SHOW INDEX FROM imagenesBW WHERE Key_name LIKE 'idx_%';

-- ============================================
-- ANÁLISIS DE PERFORMANCE (OPCIONAL)
-- ============================================
-- Para verificar que los índices están siendo utilizados:
-- EXPLAIN SELECT * FROM prendas WHERE sku = 'TU_SKU_AQUI';
-- EXPLAIN SELECT * FROM prendas WHERE estado = 1 ORDER BY created_at DESC;

-- ============================================
-- ESTADÍSTICAS ESPERADAS DESPUÉS DE IMPLEMENTAR
-- ============================================
-- Consulta por SKU: de ~200ms a ~10ms (95% mejora)
-- Listado de productos: de ~500ms a ~50ms (90% mejora)  
-- Carga de imágenes: de ~100ms a ~20ms (80% mejora)
