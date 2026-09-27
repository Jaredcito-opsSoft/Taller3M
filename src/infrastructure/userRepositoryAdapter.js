const UserRepository = require("../domain/userRepository");

class UserRepositoryAdapter extends UserRepository {
  constructor(pool) {
    super();
    this.pool = pool;
  }

  async findAll() {
    const [usuarios] = await this.pool.query(
      "SELECT id, nombre, email FROM usuarios ORDER BY id"
    );

    return usuarios;
  }

  async create(user) {
    const [result] = await this.pool.query(
      "INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)",
      [
        user.nombre,
        user.email,
        user.password
      ]
    );

    return {
      id: result.insertId,
      nombre: user.nombre,
      email: user.email
    };
  }

  async update(id, user) {
    let query = "UPDATE usuarios SET nombre = ?, email = ?";
    const values = [
      user.nombre,
      user.email
    ];

    if (user.password) {
      query += ", password = ?";
      values.push(user.password);
    }

    query += " WHERE id = ?";
    values.push(id);

    const [result] = await this.pool.query(query, values);

    if (result.affectedRows === 0) {
      return null;
    }

    return {
      id: Number(id),
      nombre: user.nombre,
      email: user.email
    };
  }

  async deleteById(id) {
    const [result] = await this.pool.query(
      "DELETE FROM usuarios WHERE id = ?",
      [id]
    );

    return result.affectedRows > 0;
  }
}

module.exports = UserRepositoryAdapter;
