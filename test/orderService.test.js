const test = require('node:test');
const assert = require('node:assert/strict');
const OrderService = require('../src/application/orderService');

test('crea un pedido pendiente de pago y solicita correos para cliente y administrador', async () => {
  const order = { id: 18, usuario_id: 7, total: 350, estado: 'PENDIENTE_DE_PAGO', usuario_nombre: 'Ana', usuario_email: 'ana@example.test', items: [{ producto_nombre: 'Teclado', cantidad: 1, precio_unitario: 350, subtotal: 350 }] };
  const repository = { createTransaction: async () => order, findById: async () => order };
  const messages = [];
  const notifier = { notifyOrderCreated: async (value) => { messages.push(value); return [{ messageId: 'client' }, { messageId: 'admin' }]; } };
  const service = new OrderService(repository, notifier);

  const result = await service.createOrder(7, [{ producto_id: 4, cantidad: 1 }]);

  assert.equal(result.estado, 'PENDIENTE_DE_PAGO');
  assert.equal(messages.length, 1);
  assert.equal(messages[0].id, 18);
  assert.equal(result.notification.status, 'SENT');
});

test('conserva el pedido cuando falla el proveedor de correo', async () => {
  const order = { id: 19, usuario_id: 7, total: 100, estado: 'PENDIENTE_DE_PAGO', usuario_nombre: 'Ana', usuario_email: 'ana@example.test', items: [] };
  const repository = { createTransaction: async () => order, findById: async () => order };
  const notifier = { notifyOrderCreated: async () => { throw new Error('SMTP no disponible'); } };
  const service = new OrderService(repository, notifier);

  const result = await service.createOrder(7, [{ producto_id: 4, cantidad: 1 }]);

  assert.equal(result.id, 19);
  assert.equal(result.notification.status, 'FAILED');
});
