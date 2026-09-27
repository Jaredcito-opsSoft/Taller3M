import { useState, useEffect } from 'react';

export function UserForm({ usuarioEditando, onRegistrar, onModificar, onCancelar }) {
  const [form, setForm] = useState({ nombre: '', email: '', password: '' });

  useEffect(() => {
    if (usuarioEditando) {
      setForm({
        nombre: usuarioEditando.nombre,
        email: usuarioEditando.email,
        password: ''
      });
    } else {
      setForm({ nombre: '', email: '', password: '' });
    }
  }, [usuarioEditando]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (usuarioEditando) {
      await onModificar(usuarioEditando.id, form);
    } else {
      const exito = await onRegistrar(form);
      if (exito) setForm({ nombre: '', email: '', password: '' });
    }
  };

  return (
    <section className="form-card">
      <h2>{usuarioEditando ? `Modificar Usuario (ID: ${usuarioEditando.id})` : 'Registrar Nuevo Usuario'}</h2>
      <form onSubmit={handleSubmit} className="user-form">
        <div className="form-group">
          <label>Nombre:</label>
          <input
            type="text"
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            placeholder="Ej. Roberth Gil"
            required
          />
        </div>
        <div className="form-group">
          <label>Correo Electrónico:</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="correo@ejemplo.com"
            required
          />
        </div>
        <div className="form-group">
          <label>Contraseña {usuarioEditando && '(nueva contraseña)'}:</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Mínimo 6 caracteres"
            required
          />
        </div>
        <div className="form-buttons">
          <button type="submit" className="btn btn-primary">
            {usuarioEditando ? 'Guardar Cambios' : 'Registrar'}
          </button>
          {usuarioEditando && (
            <button type="button" onClick={onCancelar} className="btn btn-secondary">
              Cancelar
            </button>
          )}
        </div>
      </form>
    </section>
  );
}
