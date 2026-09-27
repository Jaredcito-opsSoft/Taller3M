const API_URL = 'http://localhost:3000/api/usuarios';

export const getUsers = async () => {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error('Error al obtener los usuarios');
  return res.json();
};

export const createUser = async (userData) => {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || err.mensaje || 'Error al registrar usuario');
  }
  return res.json();
};

export const updateUser = async (id, userData) => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || err.mensaje || 'Error al actualizar usuario');
  }
  return res.json();
};

export const deleteUser = async (id) => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || err.mensaje || 'Error al eliminar usuario');
  }
  return res.json();
};
