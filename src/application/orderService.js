const Order = require('../domain/entities/Order');

class OrderService {
  constructor(orderRepository) {
    this.orderRepository = orderRepository;
  }

  async getAllOrders() {
    return await this.orderRepository.findAll();
  }

  async getOrderById(id) {
    return await this.orderRepository.findById(id);
  }

  async getOrdersByUserId(usuarioId) {
    return await this.orderRepository.findByUserId(usuarioId);
  }

  async createOrder(usuarioId, items) {
    const order = new Order({ usuario_id: usuarioId, items });
    order.validar();
    return await this.orderRepository.createTransaction(usuarioId, items);
  }

  async updateOrderStatus(id, estado) {
    return await this.orderRepository.updateStatus(id, estado);
  }
}

module.exports = OrderService;