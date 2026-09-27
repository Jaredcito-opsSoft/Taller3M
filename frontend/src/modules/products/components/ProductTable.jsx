import { useState } from 'react';

export function ProductTable({ productos, cargando, onEliminar, onSeleccionarParaPedir, esAdmin = false }) {
  const [vistaGrid, setVistaGrid] = useState(true);
  const mostrarAccionesAdmin = Boolean(onEliminar) && esAdmin;
  const mostrarAccionesCliente = Boolean(onSeleccionarParaPedir) && !esAdmin;
  const placeholderImagen = 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=500&auto=format&fit=crop&q=60';

  return (
    <section className="table-card">
      <div className="catalog-header">
        <div>
          <h2>Catálogo de Productos ({productos.length})</h2>
          <p className="catalog-subtitle">
            {esAdmin
              ? 'Panel de administración y control de inventario de productos.'
              : 'Explora nuestros productos tecnológicos y agrégalos a tu orden.'}
          </p>
        </div>
        <div className="view-toggle-buttons">
          <button
            type="button"
            className={`btn-view-toggle ${vistaGrid ? 'active' : ''}`}
            onClick={() => setVistaGrid(true)}
            title="Vista de Cuadrícula"
          >
            🔲 Tarjetas
          </button>
          <button
            type="button"
            className={`btn-view-toggle ${!vistaGrid ? 'active' : ''}`}
            onClick={() => setVistaGrid(false)}
            title="Vista de Tabla"
          >
            ☰ Tabla
          </button>
        </div>
      </div>

      {cargando && <p className="empty-text">Cargando catálogo de productos...</p>}

      {!cargando && productos.length === 0 && (
        <p className="empty-text">No hay productos disponibles en inventario.</p>
      )}

      {!cargando && productos.length > 0 && vistaGrid && (
        <div className="products-grid">
          {productos.map((p) => (
            <div className="product-card" key={p.id}>
              <div className="product-image-container">
                <img
                  src={p.imagen_url || placeholderImagen}
                  alt={p.nombre}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = placeholderImagen;
                  }}
                />
                <span className={`stock-badge ${p.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                  {p.stock > 0 ? `${p.stock} disponibles` : 'Agotado'}
                </span>
              </div>
              <div className="product-card-body">
                <span className="product-id">ID #{p.id}</span>
                <h3 className="product-title">{p.nombre}</h3>
                <p className="product-description">{p.descripcion || 'Sin descripción detallada'}</p>
                <div className="product-card-footer">
                  <div className="product-price">${parseFloat(p.precio).toFixed(2)}</div>
                  {mostrarAccionesAdmin && (
                    <button
                      onClick={() => onEliminar(p.id)}
                      className="btn btn-delete btn-sm"
                    >
                      Eliminar
                    </button>
                  )}
                  {mostrarAccionesCliente && (
                    <button
                      onClick={() => onSeleccionarParaPedir(p)}
                      className="btn btn-primary btn-sm"
                      disabled={p.stock <= 0}
                    >
                      {p.stock > 0 ? '🛒 Pedir' : 'Agotado'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!cargando && productos.length > 0 && !vistaGrid && (
        <div className="table-wrapper">
          <table className="user-table">
            <thead>
              <tr>
                <th>Imagen</th>
                <th>ID</th>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Precio</th>
                <th>Stock</th>
                {(mostrarAccionesAdmin || mostrarAccionesCliente) && <th>Acción</th>}
              </tr>
            </thead>
            <tbody>
              {productos.map((p) => (
                <tr key={p.id}>
                  <td>
                    <img
                      src={p.imagen_url || placeholderImagen}
                      alt={p.nombre}
                      className="table-thumb"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = placeholderImagen;
                      }}
                    />
                  </td>
                  <td>#{p.id}</td>
                  <td><strong>{p.nombre}</strong></td>
                  <td>{p.descripcion || '-'}</td>
                  <td className="amount-cell">${parseFloat(p.precio).toFixed(2)}</td>
                  <td>
                    <span className={p.stock > 0 ? 'stock-ok' : 'stock-agotado'}>
                      {p.stock} unidades
                    </span>
                  </td>
                  {mostrarAccionesAdmin && (
                    <td>
                      <button onClick={() => onEliminar(p.id)} className="btn btn-delete">
                        Eliminar
                      </button>
                    </td>
                  )}
                  {mostrarAccionesCliente && (
                    <td>
                      <button
                        onClick={() => onSeleccionarParaPedir(p)}
                        className="btn btn-primary btn-sm"
                        disabled={p.stock <= 0}
                      >
                        {p.stock > 0 ? '🛒 Pedir' : 'Agotado'}
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}