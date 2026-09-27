class Product {
  constructor({ id = null, nombre, descripcion = '', precio, stock, imagen_url = '', creado_en = null }) {
    this.id = id;
    this.nombre = nombre;
    this.descripcion = descripcion;
    this.precio = parseFloat(precio);
    this.stock = parseInt(stock, 10);
    this.imagen_url = imagen_url || '';
    this.creado_en = creado_en;
  }

  validar() {
    if (!this.nombre || this.nombre.trim() === '') {
      throw new Error('El nombre del producto es obligatorio.');
    }
    if (isNaN(this.precio) || this.precio < 0) {
      throw new Error('El precio debe ser un número mayor o igual a 0.');
    }
    if (isNaN(this.stock) || this.stock < 0) {
      throw new Error('El stock no puede ser negativo.');
    }
  }

  hayStock(cantidad) {
    return this.stock >= cantidad;
  }
}

module.exports = Product;