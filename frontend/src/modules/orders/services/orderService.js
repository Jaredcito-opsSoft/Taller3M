const API_URL = 'http://localhost:3000/api/pedidos';

export async function getOrders() {
  const res = await fetch(API_URL);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Error al obtener la lista de pedidos');
  }
  return await res.json();
}

export async function getOrdersByUser(usuarioId) {
  const res = await fetch(`${API_URL}/usuario/${usuarioId}`);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Error al obtener pedidos del usuario');
  }
  return await res.json();
}

export async function createOrder(payload) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || data.mensaje || 'Error al crear la orden');
  }
  return data;
}

export async function updateOrderStatus(id, estado) {
  const res = await fetch(`${API_URL}/${id}/estado`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ estado })
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || data.mensaje || 'Error al actualizar el estado del pedido');
  }
  return data;
}