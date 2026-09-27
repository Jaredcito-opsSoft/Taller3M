import { useState, useEffect } from 'react';

export function OrderForm({ usuarioActual, productos, onCrearPedido, productoInicial, onLimpiarSeleccion }) {
  const [items, setItems] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [enviando, setEnviando] = useState(false);
  const [errorLocal, setErrorLocal] = useState('');

  const placeholderImagen = 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=500&auto=format&fit=crop&q=60';

  // Si viene un producto preseleccionado desde el catalogo
  useEffect(() => {
    if (productoInicial?.id) {
      setProductoSeleccionado(String(productoInicial.id));
      setCantidad(1);
    }
  }, [productoInicial]);

  const productoActualObj = productos.find((p) => Number(p.id) === Number(productoSeleccionado));

  const handleAgregarProducto = () => {
    setErrorLocal('');
    if (!productoSeleccionado) {
      setErrorLocal('Selecciona un producto del catálogo.');
      return;
    }

    const prodId = Number(productoSeleccionado);
    const prod = productos.find((p) => Number(p.id) === prodId);
    if (!prod) {
      setErrorLocal('Producto no encontrado.');
      return;
    }

    const cantNum = Number(cantidad);
    if (cantNum <= 0) {
      setErrorLocal('La cantidad debe ser mayor a 0.');
      return;
    }

    const itemExistente = items.find((i) => Number(i.producto_id) === prodId);
    const cantidadEnCarrito = itemExistente ? itemExistente.cantidad : 0;
    const totalSolicitado = cantidadEnCarrito + cantNum;

    if (totalSolicitado > prod.stock) {
      setErrorLocal(`Stock insuficiente para "${prod.nombre}". Disponible: ${prod.stock} (Ya tienes ${cantidadEnCarrito} en la orden).`);
      return;
    }

    if (itemExistente) {
      setItems(
        items.map((i) =>
          Number(i.producto_id) === prodId
            ? { ...i, cantidad: i.cantidad + cantNum, subtotal: (i.cantidad + cantNum) * parseFloat(prod.precio) }
            : i
        )
      );
    } else {
      setItems([
        ...items,
        {
          producto_id: prod.id,
          nombre: prod.nombre,
          precio: parseFloat(prod.precio),
          cantidad: cantNum,
          imagen_url: prod.imagen_url || placeholderImagen,
          subtotal: cantNum * parseFloat(prod.precio)
        }
      ]);
    }

    setProductoSeleccionado('');
    setCantidad(1);
    if (onLimpiarSeleccion) onLimpiarSeleccion();
  };

  const handleEliminarItem = (producto_id) => {
    setItems(items.filter((i) => Number(i.producto_id) !== Number(producto_id)));
  };

  const calcularTotal = () => {
    return items.reduce((acc, item) => acc + item.subtotal, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorLocal('');
    if (items.length === 0) {
      setErrorLocal('Debes agregar al menos un producto a la orden antes de confirmar.');
      return;
    }

    if (!usuarioActual?.id) {
      setErrorLocal('Sesión de usuario no válida.');
      return;
    }

    setEnviando(true);
    try {
      const payload = {
        usuario_id: Number(usuarioActual.id),
        items: items.map((i) => ({
          producto_id: Number(i.producto_id),
          cantidad: Number(i.cantidad),
          precio_unitario: Number(i.precio)
        }))
      };
      const exito = await onCrearPedido(payload);
      if (exito) {
        setItems([]);
        setProductoSeleccionado('');
        setCantidad(1);
      }
    } catch (err) {
      setErrorLocal(err.message || 'Error al procesar el pedido');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="form-card">
      <div className="card-header-row">
        <h2>Realizar Nuevo Pedido</h2>
        <span className="client-badge">
          Cliente: <strong>{usuarioActual?.nombre}</strong> (ID #{usuarioActual?.id})
        </span>
      </div>

      {errorLocal && <div className="alerta error">{errorLocal}</div>}

      <div className="order-builder-box">
        <div className="add-product-row">
          <div className="form-group" style={{ flex: 2 }}>
            <label>Seleccionar Producto del Catálogo:</label>
            <select
              value={productoSeleccionado}
              onChange={(e) => setProductoSeleccionado(e.target.value)}
              className="form-select"
            >
              <option value="">-- Elige un producto --</option>
              {productos.map((p) => (
                <option key={p.id} value={p.id} disabled={p.stock <= 0}>
                  {p.nombre} - ${parseFloat(p.precio).toFixed(2)} ({p.stock > 0 ? `Stock: ${p.stock}` : 'Agotado'})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ flex: 1 }}>
            <label>Cantidad:</label>
            <input
              type="number"
              min="1"
              max={productoActualObj ? productoActualObj.stock : 99}
              value={cantidad}
              onChange={(e) => setCantidad(Math.max(1, parseInt(e.target.value) || 1))}
            />
          </div>

          <button
            type="button"
            onClick={handleAgregarProducto}
            className="btn btn-secondary"
            disabled={!productoSeleccionado || (productoActualObj && productoActualObj.stock <= 0)}
          >
            + Agregar a Orden
          </button>
        </div>

        {productoActualObj && (
          <div className="selected-product-preview">
            <img
              src={productoActualObj.imagen_url || placeholderImagen}
              alt={productoActualObj.nombre}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = placeholderImagen;
              }}
            />
            <div className="preview-details">
              <strong>{productoActualObj.nombre}</strong>
              <p>{productoActualObj.descripcion}</p>
              <div className="preview-meta">
                <span className="price-tag">${parseFloat(productoActualObj.precio).toFixed(2)}</span>
                <span className={`stock-tag ${productoActualObj.stock > 0 ? 'in' : 'out'}`}>
                  {productoActualObj.stock > 0 ? `${productoActualObj.stock} disponibles` : 'Sin stock'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {items.length > 0 ? (
        <div className="cart-summary-section">
          <div className="cart-summary-header">
            <h3>Productos en esta Orden ({items.length})</h3>
            <span className="cart-item-count">
              {items.reduce((acc, i) => acc + i.cantidad, 0)} unidades en total
            </span>
          </div>

          <div className="table-responsive">
            <table className="order-items-table">
              <thead>
                <tr>
                  <th>Imagen</th>
                  <th>Producto</th>
                  <th>Precio Unit.</th>
                  <th>Cantidad</th>
                  <th>Subtotal</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.producto_id}>
                    <td>
                      <img
                        src={item.imagen_url || placeholderImagen}
                        alt={item.nombre}
                        className="table-thumb"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = placeholderImagen;
                        }}
                      />
                    </td>
                    <td>
                      <strong>{item.nombre}</strong>
                      <span className="sub-id">ID #{item.producto_id}</span>
                    </td>
                    <td>${item.precio.toFixed(2)}</td>
                    <td>
                      <span className="qty-badge">{item.cantidad}</span>
                    </td>
                    <td className="amount-cell">${item.subtotal.toFixed(2)}</td>
                    <td>
                      <button
                        type="button"
                        onClick={() => handleEliminarItem(item.producto_id)}
                        className="btn btn-delete btn-sm"
                        title="Quitar de la orden"
                      >
                        Quitar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="order-summary-box">
            <div className="order-total-info">
              <span>Total del Pedido:</span>
              <strong className="total-number">${calcularTotal().toFixed(2)}</strong>
            </div>
            <button
              type="button"
              onClick={handleSubmit}
              className="btn btn-primary btn-lg"
              disabled={enviando}
            >
              {enviando ? 'Procesando en PostgreSQL...' : '🛒 Confirmar y Realizar Pedido'}
            </button>
          </div>
        </div>
      ) : (
        <div className="empty-cart-hint">
          <p>Selecciona un producto arriba y haz clic en <strong>"+ Agregar a Orden"</strong> para armar tu pedido.</p>
        </div>
      )}
    </div>
  );
}