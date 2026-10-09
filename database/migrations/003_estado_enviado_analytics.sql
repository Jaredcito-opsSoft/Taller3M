-- Actividad 2.6: habilita el estado ENVIADO usado por reportes y panel administrativo.
ALTER TABLE pedidos DROP CONSTRAINT IF EXISTS pedidos_estado_check;
ALTER TABLE pedidos
  ADD CONSTRAINT pedidos_estado_check
  CHECK (estado IN ('PENDIENTE_DE_PAGO', 'PAGADO', 'ENVIADO', 'CANCELADO'));

-- Indices para filtros temporales y agregaciones frecuentes del dashboard.
CREATE INDEX IF NOT EXISTS idx_pedidos_creado_en_estado
  ON pedidos (creado_en, estado);

CREATE INDEX IF NOT EXISTS idx_pedido_items_producto_id
  ON pedido_items (producto_id);
