export function UserTable({ usuarios, cargando, onEditar, onEliminar }) {
  return (
    <section className="table-card">
      <h2>Usuarios Registrados ({usuarios.length})</h2>
      {cargando && <p className="empty-text">Cargando usuarios desde PostgreSQL...</p>}
      {!cargando && usuarios.length === 0 ? (
        <p className="empty-text">No hay usuarios registrados.</p>
      ) : (
        <div className="table-wrapper">
          <table className="user-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u) => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.nombre}</td>
                  <td>{u.email}</td>
                  <td><span className="badge">{u.rol || 'CLIENTE'}</span></td>
                  <td className="action-buttons">
                    <button onClick={() => onEditar(u)} className="btn btn-edit">
                      Editar
                    </button>
                    <button onClick={() => onEliminar(u.id)} className="btn btn-delete">
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
