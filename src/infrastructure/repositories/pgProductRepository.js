const pool = require('../db');

class PgProductRepository {
  async findAll() {
    const query = 'SELECT id, nombre, descripcion, precio, stock, imagen_url, creado_en FROM productos ORDER BY id ASC';
    const { rows } = await pool.query(query);
    return rows;
  }

  async findById(id) {
    const query = 'SELECT id, nombre, descripcion, precio, stock, imagen_url, creado_en FROM productos WHERE id = $1';
    const { rows } = await pool.query(query, [id]);
    return rows[0] || null;
  }

  async create(product) {
    const query = `
      INSERT INTO productos (nombre, descripcion, precio, stock, imagen_url)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, nombre, descripcion, precio, stock, imagen_url, creado_en
    `;
    const values = [product.nombre, product.descripcion, product.precio, product.stock, product.imagen_url];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  async update(id, product) {
    const query = `
      UPDATE productos
      SET nombre = COALESCE($1, nombre),
          descripcion = COALESCE($2, descripcion),
          precio = COALESCE($3, precio),
          stock = COALESCE($4, stock),
          imagen_url = COALESCE($5, imagen_url)
      WHERE id = $6
      RETURNING id, nombre, descripcion, precio, stock, imagen_url, creado_en
    `;
    const values = [product.nombre, product.descripcion, product.precio, product.stock, product.imagen_url, id];
    const { rows } = await pool.query(query, values);
    return rows[0] || null;
  }

  async delete(id) {
    const query = 'DELETE FROM productos WHERE id = $1 RETURNING id';
    const { rows } = await pool.query(query, [id]);
    return rows[0] || null;
  }
}

module.exports = PgProductRepository;