import { useState } from 'react';

export function ProductForm({ onRegistrar }) {
  const [form, setForm] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    stock: '',
    imagen_url: ''
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const exito = await onRegistrar(form);
    if (exito) setForm({ nombre: '', descripcion: '', precio: '', stock: '', imagen_url: '' });
  };

  return (
    <section className="form-card">
      <h2>Registrar Nuevo Producto</h2>
      <form onSubmit={handleSubmit} className="user-form">
        <div className="form-group">
          <label>Nombre del Producto:</label>
          <input
            type="text"
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            placeholder="Ej. Laptop Gaming Asus"
            required
          />
        </div>
        <div className="form-group">
          <label>Descripción:</label>
          <input
            type="text"
            name="descripcion"
            value={form.descripcion}
            onChange={handleChange}
            placeholder="Ej. Intel i9, 32GB RAM, RTX 4070"
          />
        </div>
        <div className="form-group">
          <label>Precio ($ MXN):</label>
          <input
            type="number"
            step="0.01"
            name="precio"
            value={form.precio}
            onChange={handleChange}
            placeholder="Ej. 24999.00"
            required
          />
        </div>
        <div className="form-group">
          <label>Stock (Existencias):</label>
          <input
            type="number"
            name="stock"
            value={form.stock}
            onChange={handleChange}
            placeholder="Ej. 15"
            required
          />
        </div>
        <div className="form-group">
          <label>URL de Imagen del Producto:</label>
          <input
            type="url"
            name="imagen_url"
            value={form.imagen_url}
            onChange={handleChange}
            placeholder="https://images.unsplash.com/..."
          />
        </div>

        {form.imagen_url && (
          <div className="image-preview">
            <p className="form-text">Vista previa de la imagen:</p>
            <img src={form.imagen_url} alt="Preview" onError={(e) => (e.target.style.display = 'none')} />
          </div>
        )}

        <button type="submit" className="btn btn-primary">Registrar Producto</button>
      </form>
    </section>
  );
}