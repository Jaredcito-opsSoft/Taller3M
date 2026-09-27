import { useState } from 'react';
import * as authService from '../services/authService';

export function useAuth() {
  const [usuario, setUsuario] = useState(() => {
    try {
      const guardado = localStorage.getItem('usuario');
      return guardado ? JSON.parse(guardado) : null;
    } catch {
      return null;
    }
  });

  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });

  const notificar = (texto, tipo) => {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje({ texto: '', tipo: '' }), 4000);
  };

  const iniciarSesion = async (credenciales) => {
    setCargando(true);
    try {
      const data = await authService.login(credenciales);
      setUsuario(data);
      localStorage.setItem('usuario', JSON.stringify(data));
      notificar('Bienvenido de nuevo, ' + data.nombre + '!', 'exito');
      return true;
    } catch (error) {
      notificar(error.message, 'error');
      return false;
    } finally {
      setCargando(false);
    }
  };

  const registrarse = async (datosUsuario) => {
    setCargando(true);
    try {
      await authService.register(datosUsuario);
      notificar('Cuenta creada exitosamente. Ahora puedes iniciar sesion.', 'exito');
      return true;
    } catch (error) {
      notificar(error.message, 'error');
      return false;
    } finally {
      setCargando(false);
    }
  };

  const cerrarSesion = () => {
    setUsuario(null);
    localStorage.removeItem('usuario');
  };

  return {
    usuario,
    cargando,
    mensaje,
    iniciarSesion,
    registrarse,
    cerrarSesion
  };
}
