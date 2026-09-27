import { useState, useEffect } from 'react';
import * as userService from '../services/userService';

export function useUsers() {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });
  const [usuarioEditando, setUsuarioEditando] = useState(null);

  const notificar = (texto, tipo) => {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje({ texto: '', tipo: '' }), 4000);
  };

  const cargarUsuarios = async () => {
    setCargando(true);
    try {
      const data = await userService.getUsers();
      setUsuarios(data);
    } catch (error) {
      notificar(error.message, 'error');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const registrar = async (datos) => {
    try {
      await userService.createUser(datos);
      notificar('Usuario registrado con éxito en PostgreSQL', 'exito');
      cargarUsuarios();
      return true;
    } catch (error) {
      notificar(error.message, 'error');
      return false;
    }
  };

  const modificar = async (id, datos) => {
    try {
      await userService.updateUser(id, datos);
      notificar('Usuario actualizado correctamente', 'exito');
      setUsuarioEditando(null);
      cargarUsuarios();
      return true;
    } catch (error) {
      notificar(error.message, 'error');
      return false;
    }
  };

  const eliminar = async (id) => {
    if (!window.confirm(`¿Seguro que deseas eliminar al usuario #${id}?`)) return;
    try {
      await userService.deleteUser(id);
      notificar('Usuario eliminado', 'exito');
      cargarUsuarios();
    } catch (error) {
      notificar(error.message, 'error');
    }
  };

  return {
    usuarios,
    cargando,
    mensaje,
    usuarioEditando,
    setUsuarioEditando,
    registrar,
    modificar,
    eliminar,
    recargar: cargarUsuarios
  };
}
