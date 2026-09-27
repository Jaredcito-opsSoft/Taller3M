class User {
  constructor({ id = null, nombre, email, password, rol = 'CLIENTE', creado_en = null }) {
    this.id = id;
    this.nombre = nombre;
    this.email = email ? email.toLowerCase().trim() : '';
    this.password = password;
    this.rol = rol;
    this.creado_en = creado_en;
  }

  validar() {
    if (!this.nombre || this.nombre.trim().length < 2) {
      throw new Error('El nombre es obligatorio y debe tener al menos 2 caracteres.');
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!this.email || !emailRegex.test(this.email)) {
      throw new Error('Formato de correo electrónico inválido.');
    }
    if (!this.password || this.password.length < 6) {
      throw new Error('La contraseña debe tener al menos 6 caracteres.');
    }
  }

  sinPassword() {
    const { password, ...datosPublicos } = this;
    return datosPublicos;
  }
}

module.exports = User;