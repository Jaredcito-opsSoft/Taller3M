class UserRepository {
  async findAll() {
    throw new Error("Método findAll no implementado");
  }

  async create(user) {
    throw new Error("Método create no implementado");
  }

  async update(id, user) {
    throw new Error("Método update no implementado");
  }

  async deleteById(id) {
    throw new Error("Método deleteById no implementado");
  }
}

module.exports = UserRepository;
