const API_URL = 'http://localhost:3000/api/productos';

export const getProducts = async () => {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error('Error al obtener productos');
  return res.json();
};

export const createProduct = async (productData) => {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(productData)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Error al crear producto');
  }
  return res.json();
};

export const deleteProduct = async (id) => {
  const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Error al eliminar producto');
  }
  return res.json();
};
