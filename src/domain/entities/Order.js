class Order {
  constructor({ id = null, usuario_id, total = 0, estado = 'PENDIENTE', items = [], creado_en = null }) {
    this.id = id;
    this.usuario_id = usuario_id;
    this.total = parseFloat(total);
    this.estado = estado;
    this.items = items;
    this.creado_en = creado_en;
  }

  validar() {
    if (!this.usuario_id) {
      throw new Error('El pedido requiere un usuario_id válido.');
    }
    if (!Array.isArray(this.items) || this.items.length === 0) {
      throw new Error('El pedido debe tener al menos un producto.');
    }
  }

  calcularTotal() {
    this.total = this.items.reduce((acc, item) => {
      item.subtotal = parseFloat((item.cantidad * item.precio_unitario).toFixed(2));
      return acc + item.subtotal;
    }, 0);
    this.total = parseFloat(this.total.toFixed(2));
    return this.total;
  }
}

module.exports = Order;