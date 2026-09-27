import { useState, useEffect, useCallback } from 'react';
import * as orderService from '../services/orderService';

export function useOrders(usuarioActual) {
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });

  const notificar = (texto, tipo) => {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje({ texto: '', tipo: '' }), 4000);
  };

  const cargarPedidos = useCallback(async () => {
    setCargando(true);
    try {
      const data = await orderService.getOrders();
      setPedidos(Array.isArray(data) ? data : []);
    } catch (err) {
      notificar(err.message || 'Error al cargar pedidos', 'error');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarPedidos();
  }, [cargarPedidos]);

  useEffect(() => {
    if (usuarioActual?.id) {
      cargarPedidos();
    }
  }, [usuarioActual?.id, cargarPedidos]);

  // Soporta tanto crearPedido({ usuario_id, items }) como crearPedido(usuarioId, items)
  const crearPedido = async (param1, param2) => {
    setCargando(true);
    try {
      let payload;
      if (typeof param1 === 'object' && param1 !== null && param1.items) {
        payload = param1;
      } else {
        payload = { usuario_id: param1, items: param2 };
      }

      if (!payload.usuario_id) {
        throw new Error('El ID de usuario es obligatorio');
      }
      if (!payload.items || payload.items.length === 0) {
        throw new Error('Debes incluir al menos un producto en la orden');
      }

      const nuevoPedido = await orderService.createOrder(payload);
      notificar(`¡Pedido #${nuevoPedido.id} registrado con éxito!`, 'exito');
      await cargarPedidos();
      return true;
    } catch (err) {
      notificar(err.message || 'Error al procesar el pedido', 'error');
      return false;
    } finally {
      setCargando(false);
    }
  };

  const cambiarEstado = async (id, estado) => {
    try {
      await orderService.updateOrderStatus(id, estado);
      notificar(`Estado del pedido #${id} actualizado a ${estado}`, 'exito');
      await cargarPedidos();
      return true;
    } catch (err) {
      notificar(err.message || 'Error al actualizar estado', 'error');
      return false;
    }
  };

  return {
    pedidos,
    cargando,
    mensaje,
    crearPedido,
    cambiarEstado,
    actualizarEstadoPedido: cambiarEstado,
    recargar: cargarPedidos
  };
}