import React from 'react';

export function OrderTable({ pedidos, usuarioActual, onUpdateStatus, loading, onIrACatalogo }) {
  const esAdmin = usuarioActual?.rol === 'ADMIN';
  const placeholderImagen = 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=500&auto=format&fit=crop&q=60';

  // Filtrado seguro convirtiendo ambos a numeros
  const pedidosVisibles = esAdmin
    ? pedidos
    : pedidos.filter(
        (p) => Number(p.usuario_id || p.usuarioId) === Number(usuarioActual?.id)
      );

  if (loading) {
    return (
      <div className="orders-table-container">
        <div className="loading-spinner">Cargando pedidos desde PostgreSQL...</div>
      </div>
    );
  }

  if (!pedidosVisibles || pedidosVisibles.length === 0) {
    return (
      <div className="orders-table-container">
        <div className="empty-orders-card">
          <div className="empty-orders-icon">📋</div>
          <h3>{esAdmin ? 'No hay pedidos en el sistema' : 'No tienes pedidos registrados'}</h3>
          <p>
            {esAdmin
              ? 'Los clientes aún no han generado pedidos.'
              : 'Aún no has realizado ningún pedido. Explora el catálogo para agregar productos.'}
          </p>
          {!esAdmin && onIrACatalogo && (
            <button
              type="button"
              onClick={onIrACatalogo}
              className="btn btn-primary"
              style={{ marginTop: '1rem' }}
            >
              🛒 Ir a Realizar Pedido
            </button>
          )}
        </div>
      </div>
    );
  }

  const getStatusBadge = (estado) => {
    const est = (estado || 'PENDIENTE').toUpperCase();
    switch (est) {
      case 'PAGADO':
        return <span className="status-badge status-pagado">PAGADO</span>;
      case 'CANCELADO':
        return <span className="status-badge status-cancelado">CANCELADO</span>;
      default:
        return <span className="status-badge status-pendiente">PENDIENTE</span>;
    }
  };

  const formatearFecha = (fechaStr) => {
    if (!fechaStr) return 'Fecha no disponible';
    try {
      const fecha = new Date(fechaStr);
      return fecha.toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return fechaStr;
    }
  };

  return (
    <div className="orders-table-container">
      <div className="orders-header-row">
        <div>
          <h2>{esAdmin ? 'Gestión Global de Pedidos' : 'Mis Pedidos'}</h2>
          <p className="orders-subtitle">
            {esAdmin
              ? `Visualizando ${pedidosVisibles.length} pedidos de todos los usuarios registrados.`
              : `Historial de compras registradas para ${usuarioActual?.nombre || 'tu cuenta'} (${pedidosVisibles.length} pedidos).`}
          </p>
        </div>
        {!esAdmin && onIrACatalogo && (
          <button type="button" onClick={onIrACatalogo} className="btn btn-secondary">
            + Nuevo Pedido
          </button>
        )}
      </div>

      <div className="orders-list">
        {pedidosVisibles.map((pedido) => {
          const itemsPedido = Array.isArray(pedido.items) ? pedido.items : [];
          const totalArticulos = itemsPedido.reduce((acc, it) => acc + (Number(it.cantidad) || 1), 0);

          return (
            <div className="order-card-detailed" key={pedido.id}>
              {/* Cabecera de la tarjeta del pedido */}
              <div className="order-card-header">
                <div className="order-id-meta">
                  <div className="order-number-title">
                    <span className="order-hash">Pedido</span>
                    <strong>#{pedido.id}</strong>
                  </div>
                  <span className="order-date-text">{formatearFecha(pedido.creado_en)}</span>
                </div>

                <div className="order-user-info">
                  <span className="order-user-label">Cliente:</span>
                  <strong>{pedido.usuario_nombre || `Usuario #${pedido.usuario_id}`}</strong>
                  {pedido.usuario_email && <small className="order-user-email">({pedido.usuario_email})</small>}
                </div>

                <div className="order-status-actions">
                  <div className="status-container">{getStatusBadge(pedido.estado)}</div>
                  {esAdmin && onUpdateStatus && (
                    <div className="admin-status-control">
                      <label htmlFor={`status-${pedido.id}`}>Cambiar:</label>
                      <select
                        id={`status-${pedido.id}`}
                        className="status-select"
                        value={pedido.estado || 'PENDIENTE'}
                        onChange={(e) => onUpdateStatus(pedido.id, e.target.value)}
                      >
                        <option value="PENDIENTE">PENDIENTE</option>
                        <option value="PAGADO">PAGADO</option>
                        <option value="CANCELADO">CANCELADO</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {/* Detalle visual de productos en el pedido */}
              <div className="order-items-wrapper">
                <h4>Productos Comprados ({itemsPedido.length} tipos de producto):</h4>
                {itemsPedido.length > 0 ? (
                  <div className="table-responsive">
                    <table className="order-detail-table">
                      <thead>
                        <tr>
                          <th style={{ width: '60px' }}>Imagen</th>
                          <th>Producto</th>
                          <th style={{ textAlign: 'center' }}>Cantidad</th>
                          <th style={{ textAlign: 'right' }}>Precio Unit.</th>
                          <th style={{ textAlign: 'right' }}>Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {itemsPedido.map((it, idx) => (
                          <tr key={idx}>
                            <td>
                              <img
                                src={it.imagen_url || placeholderImagen}
                                alt={it.producto_nombre || 'Producto'}
                                className="order-product-thumb"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = placeholderImagen;
                                }}
                              />
                            </td>
                            <td>
                              <div className="order-item-name">
                                <strong>{it.producto_nombre || `Producto #${it.producto_id}`}</strong>
                                <span className="order-item-id">Ref. #{it.producto_id}</span>
                              </div>
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <span className="order-item-qty">{it.cantidad}</span>
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              ${parseFloat(it.precio_unitario || 0).toFixed(2)}
                            </td>
                            <td style={{ textAlign: 'right' }} className="amount-cell">
                              ${parseFloat(it.subtotal || (Number(it.precio_unitario || 0) * Number(it.cantidad || 1))).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="no-items-text">Sin desglose de items disponible para este pedido.</p>
                )}
              </div>

              {/* Pie de pedido con total */}
              <div className="order-card-footer">
                <div className="footer-summary">
                  <span>Total productos: <strong>{totalArticulos} unidades</strong></span>
                </div>
                <div className="order-final-total">
                  <span>Monto Total:</span>
                  <strong className="order-total-amount">
                    ${parseFloat(pedido.total || 0).toFixed(2)}
                  </strong>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}