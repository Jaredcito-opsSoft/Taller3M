-- Ejecutar una sola vez en la base PostgreSQL correspondiente al entorno.
-- No contiene host, usuario, contraseña ni configuración de AWS.
ALTER TABLE pedidos DROP CONSTRAINT IF EXISTS pedidos_estado_check;
ALTER TABLE pedidos
  ADD CONSTRAINT pedidos_estado_check
  CHECK (estado IN ('PENDIENTE_DE_PAGO', 'PAGADO', 'CANCELADO'));

UPDATE pedidos SET estado = 'PENDIENTE_DE_PAGO' WHERE estado = 'PENDIENTE';
