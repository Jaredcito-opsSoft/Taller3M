import { useState, useEffect } from 'react';
import './App.css';
import { useAuth } from './modules/auth/hooks/useAuth';
import { AuthView } from './modules/auth/components/AuthView';

import { useUsers } from './modules/users/hooks/useUsers';
import { UserForm } from './modules/users/components/UserForm';
import { UserTable } from './modules/users/components/UserTable';

import { useProducts } from './modules/products/hooks/useProducts';
import { ProductForm } from './modules/products/components/ProductForm';
import { ProductTable } from './modules/products/components/ProductTable';

import { useOrders } from './modules/orders/hooks/useOrders';
import { OrderForm } from './modules/orders/components/OrderForm';
import { OrderTable } from './modules/orders/components/OrderTable';

function App() {
  const { usuario, mensaje: mensajeAuth, registrarse, iniciarSesion, cerrarSesion } = useAuth();

  const esAdmin = usuario?.rol === 'ADMIN';
  const [activeTab, setActiveTab] = useState(esAdmin ? 'usuarios' : 'catalogo');
  const [productoPreseleccionado, setProductoPreseleccionado] = useState(null);

  useEffect(() => {
    if (usuario) {
      if (esAdmin) {
        setActiveTab('usuarios');
      } else {
        setActiveTab('catalogo');
      }
    }
  }, [usuario?.id, usuario?.rol, esAdmin]);

  const {
    usuarios,
    cargando: cargandoUsers,
    mensaje: mensajeUsers,
    usuarioEditando,
    setUsuarioEditando,
    registrar: registrarUsuario,
    modificar: modificarUsuario,
    eliminar: eliminarUsuario
  } = useUsers();

  const {
    productos,
    cargando: cargandoProducts,
    mensaje: mensajeProducts,
    registrarProducto,
    eliminarProducto,
    recargar: recargarProductos
  } = useProducts();

  const {
    pedidos,
    cargando: cargandoOrders,
    mensaje: mensajeOrders,
    crearPedido,
    actualizarEstadoPedido,
    recargar: recargarPedidos
  } = useOrders(usuario);

  const mensajeActual =
    mensajeAuth?.texto ? mensajeAuth :
    mensajeUsers?.texto ? mensajeUsers :
    mensajeProducts?.texto ? mensajeProducts :
    mensajeOrders?.texto ? mensajeOrders : null;

  if (!usuario) {
    return (
      <div className="main-container auth-wrapper">
        {mensajeActual?.texto && (
          <div className={`alerta ${mensajeActual.tipo}`}>
            {mensajeActual.texto}
          </div>
        )}
        <AuthView onLogin={iniciarSesion} onRegister={registrarse} />
      </div>
    );
  }

  return (
    <div className="main-container">
      {/* Encabezado dinámico */}
      <header className="header-section">
        <div className="header-top">
          <div>
            <h1>Bienvenido, {usuario.nombre}</h1>
            <p className="role-tag">
              Rol: <strong>{usuario.rol}</strong>
            </p>
          </div>
          <button onClick={cerrarSesion} className="btn btn-logout">
            Cerrar Sesión
          </button>
        </div>
        <hr className="divider" />
      </header>

      {/* Alertas de éxito / error */}
      {mensajeActual?.texto && (
        <div className={`alerta ${mensajeActual.tipo}`}>
          {mensajeActual.texto}
        </div>
      )}

      {/* Navegación por Pestañas según Rol */}
      <nav className="nav-tabs">
        {esAdmin ? (
          <>
            <button
              className={`tab-btn ${activeTab === 'usuarios' ? 'active' : ''}`}
              onClick={() => setActiveTab('usuarios')}
            >
              👥 Usuarios
            </button>
            <button
              className={`tab-btn ${activeTab === 'productos' ? 'active' : ''}`}
              onClick={() => setActiveTab('productos')}
            >
              📦 Productos
            </button>
            <button
              className={`tab-btn ${activeTab === 'pedidos' ? 'active' : ''}`}
              onClick={() => setActiveTab('pedidos')}
            >
              🛒 Todos los Pedidos
            </button>
          </>
        ) : (
          <>
            <button
              className={`tab-btn ${activeTab === 'catalogo' ? 'active' : ''}`}
              onClick={() => setActiveTab('catalogo')}
            >
              📦 Catálogo
            </button>
            <button
              className={`tab-btn ${activeTab === 'crear-pedido' ? 'active' : ''}`}
              onClick={() => setActiveTab('crear-pedido')}
            >
              🛒 Realizar Pedido
            </button>
            <button
              className={`tab-btn ${activeTab === 'mis-pedidos' ? 'active' : ''}`}
              onClick={() => {
                recargarPedidos();
                setActiveTab('mis-pedidos');
              }}
            >
              📋 Mis Pedidos
            </button>
          </>
        )}
      </nav>

      {/* Tab Content */}
      <main className="tab-content">
        {/* ADMIN: Vista Usuarios */}
        {esAdmin && activeTab === 'usuarios' && (
          <div className="tab-pane">
            <UserForm
              usuarioEditando={usuarioEditando}
              onRegistrar={registrarUsuario}
              onModificar={modificarUsuario}
              onCancelar={() => setUsuarioEditando(null)}
            />
            <UserTable
              usuarios={usuarios}
              cargando={cargandoUsers}
              onEditar={(u) => setUsuarioEditando(u)}
              onEliminar={eliminarUsuario}
            />
          </div>
        )}

        {/* ADMIN: Vista Productos */}
        {esAdmin && activeTab === 'productos' && (
          <div className="tab-pane">
            <ProductForm onRegistrar={registrarProducto} />
            <ProductTable
              productos={productos}
              cargando={cargandoProducts}
              onEliminar={eliminarProducto}
              esAdmin={true}
            />
          </div>
        )}

        {/* ADMIN: Vista Todos los Pedidos */}
        {esAdmin && activeTab === 'pedidos' && (
          <div className="tab-pane">
            <OrderTable
              pedidos={pedidos}
              usuarioActual={usuario}
              onUpdateStatus={actualizarEstadoPedido}
              loading={cargandoOrders}
            />
          </div>
        )}

        {/* CLIENTE: Vista Catálogo (Solo lectura con opción rápida de pedir) */}
        {!esAdmin && activeTab === 'catalogo' && (
          <div className="tab-pane">
            <ProductTable
              productos={productos}
              cargando={cargandoProducts}
              esAdmin={false}
              onSeleccionarParaPedir={(prod) => {
                setProductoPreseleccionado(prod);
                setActiveTab('crear-pedido');
              }}
            />
          </div>
        )}

        {/* CLIENTE: Vista Realizar Pedido */}
        {!esAdmin && activeTab === 'crear-pedido' && (
          <div className="tab-pane">
            <OrderForm
              usuarioActual={usuario}
              productos={productos}
              productoInicial={productoPreseleccionado}
              onLimpiarSeleccion={() => setProductoPreseleccionado(null)}
              onCrearPedido={async (datos) => {
                const res = await crearPedido(datos);
                if (res) {
                  recargarProductos();
                  setProductoPreseleccionado(null);
                  setActiveTab('mis-pedidos');
                }
                return res;
              }}
            />
          </div>
        )}

        {/* CLIENTE: Vista Mis Pedidos */}
        {!esAdmin && activeTab === 'mis-pedidos' && (
          <div className="tab-pane">
            <OrderTable
              pedidos={pedidos}
              usuarioActual={usuario}
              loading={cargandoOrders}
              onIrACatalogo={() => setActiveTab('crear-pedido')}
            />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
