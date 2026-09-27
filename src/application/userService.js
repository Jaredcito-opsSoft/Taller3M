const bcrypt = require('bcryptjs');
const User = require('../domain/user');

class UserService {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async getAllUsers() {
    return await this.userRepository.findAll();
  }

  async getUserById(id) {
    return await this.userRepository.findById(id);
  }

  async login(email, password) {
    if (!email || !password) {
      throw new Error('El correo electronico y la contrasena son requeridos.');
    }
    const user = await this.userRepository.findByEmail(email.toLowerCase().trim());
    if (!user) {
      throw new Error('Credenciales invalidas.');
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Credenciales invalidas.');
    }
    return {
      id: user.id,
      nombre: user.nombre,
      email: user.email,
      rol: user.rol || 'CLIENTE'
    };
  }

  async register(userData) {
    const user = new User(userData);
    user.validar();

    const existente = await this.userRepository.findByEmail(user.email);
    if (existente) {
      throw new Error('El correo electronico ya esta registrado.');
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);

    return await this.userRepository.create(user);
  }

  async updateUser(id, data) {
    return await this.userRepository.update(id, data);
  }

  async deleteUser(id) {
    return await this.userRepository.delete(id);
  }
}

module.exports = UserService;
