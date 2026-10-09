const test = require('node:test');
const assert = require('node:assert/strict');
const JwtTokenAdapter = require('../src/infrastructure/auth/JwtTokenAdapter');

test('firma y verifica la identidad y rol del administrador', () => {
  const adapter = new JwtTokenAdapter('test-secret-that-is-not-used-in-production');
  const token = adapter.sign({ id: 7, nombre: 'Admin', email: 'admin@example.test', rol: 'ADMIN' });
  const payload = adapter.verify(token);

  assert.equal(payload.sub, '7');
  assert.equal(payload.rol, 'ADMIN');
});

test('el middleware deniega a un cliente autenticado', () => {
  const adapter = new JwtTokenAdapter('test-secret-that-is-not-used-in-production');
  const token = adapter.sign({ id: 8, nombre: 'Cliente', email: 'client@example.test', rol: 'CLIENTE' });
  const req = { headers: { authorization: `Bearer ${token}` } };
  let statusCode;
  let body;
  const res = {
    status(code) { statusCode = code; return this; },
    json(value) { body = value; return this; }
  };

  adapter.requireAdmin()(req, res, () => assert.fail('No debe ejecutar next para un cliente.'));

  assert.equal(statusCode, 403);
  assert.match(body.error, /administradores/);
});
