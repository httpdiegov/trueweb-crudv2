-- SCRIPT DE ÍNDICES RÁPIDO - EJECUTAR TODO DE UNA VEZ
-- Copiar y pegar este bloque completo en tu cliente MySQL

-- Índice más crítico (SKU lookup)
CREATE INDEX IF NOT EXISTS idx_prendas_sku ON prendas(sku);

-- Índices para imágenes (segunda prioridad)
CREATE INDEX IF NOT EXISTS idx_imagenes_prenda_id ON imagenes(prenda_id);
CREATE INDEX IF NOT EXISTS idx_imagenesBW_prenda_id ON imagenesBW(prenda_id);

-- Índices para filtros comunes
CREATE INDEX IF NOT EXISTS idx_prendas_estado_separado ON prendas(estado, separado);
CREATE INDEX IF NOT EXISTS idx_prendas_listing ON prendas(estado, created_at DESC);

-- Mostrar índices creados para verificación
SHOW INDEX FROM prendas WHERE Key_name LIKE 'idx_%';
