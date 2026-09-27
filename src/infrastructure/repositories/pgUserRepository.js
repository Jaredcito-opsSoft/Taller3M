const pool = require('../db');

class PgUserRepository {
  async findAll() {
    const query = 'SELECT id, nombre, email, rol, creado_en FROM usuarios ORDER BY id ASC';
    const { rows } = await pool.query(query);
    return rows;
  }

  async findById(id) {
    const query = 'SELECT id, nombre, email, rol, creado_en FROM usuarios WHERE id = $1';
    const { rows } = await pool.query(query, [id]);
    return rows[0] || null;
  }

  async findByEmail(email) {
    const query = 'SELECT id, nombre, email, password, rol, creado_en FROM usuarios WHERE email = $1';
    const { rows } = await pool.query(query, [email]);
    return rows[0] || null;
  }

  async create(user) {
    const query = `
      INSERT INTO usuarios (nombre, email, password, rol)
      VALUES ($1, $2, $3, $4)
      RETURNING id, nombre, email, rol, creado_en
    `;
    const values = [user.nombre, user.email, user.password, user.rol];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  async update(id, { nombre, email, rol }) {
    const query = `
      UPDATE usuarios
      SET nombre = COALESCE($1, nombre),
          email = COALESCE($2, email),
          rol = COALESCE($3, rol)
      WHERE id = $4
      RETURNING id, nombre, email, rol, creado_en
    `;
    const { rows } = await pool.query(query, [nombre, email, rol, id]);
    return rows[0] || null;
  }

  async delete(id) {
    const query = 'DELETE FROM usuarios WHERE id = $1 RETURNING id';
    const { rows } = await pool.query(query, [id]);
    return rows[0] || null;
  }
}

module.exports = PgUserRepository;