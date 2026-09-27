import { useState, useEffect } from 'react';
import * as productService from '../services/productService';

export function useProducts() {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });

  const notificar = (texto, tipo) => {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje({ texto: '', tipo: '' }), 4000);
  };

  const cargarProductos = async () => {
    setCargando(true);
    try {
      const data = await productService.getProducts();
      setProductos(data);
    } catch (err) {
      notificar(err.message, 'error');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  const registrarProducto = async (datos) => {
    try {
      await productService.createProduct(datos);
      notificar('Producto registrado correctamente en PostgreSQL', 'exito');
      cargarProductos();
      return true;
    } catch (err) {
      notificar(err.message, 'error');
      return false;
    }
  };

  const eliminarProducto = async (id) => {
    if (!window.confirm(`¿Eliminar producto #${id}?`)) return;
    try {
      await productService.deleteProduct(id);
      notificar('Producto eliminado', 'exito');
      cargarProductos();
    } catch (err) {
      notificar(err.message, 'error');
    }
  };

  return {
    productos,
    cargando,
    mensaje,
    registrarProducto,
    eliminarProducto,
    recargar: cargarProductos
  };
}
