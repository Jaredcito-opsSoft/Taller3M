const API_URL = 'http://localhost:3000/api/usuarios';

export const login = async ({ email, password }) => {
  const res = await fetch(API_URL + '/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || err.mensaje || 'Error al iniciar sesion');
  }
  return res.json();
};

export const register = async (userData) => {
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
