const Order = require('../domain/entities/Order');

class OrderService {
  constructor(orderRepository, orderNotificationService = null) {
    this.orderRepository = orderRepository;
    this.orderNotificationService = orderNotificationService;
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
    const orderToValidate = new Order({ usuario_id: usuarioId, items });
    orderToValidate.validar();
    const createdOrder = await this.orderRepository.createTransaction(usuarioId, items);
    const order = await this.orderRepository.findById(createdOrder.id) || createdOrder;

    // El pedido ya fue confirmado en la transacción. Un fallo SMTP no lo revierte.
    if (!this.orderNotificationService) return order;
    try {
      const deliveries = await this.orderNotificationService.notifyOrderCreated(order);
      return { ...order, notification: { status: 'SENT', deliveries } };
    } catch (error) {
      return { ...order, notification: { status: 'FAILED', message: error.message } };
    }
  }

  async updateOrderStatus(id, estado) {
    return await this.orderRepository.updateStatus(id, estado);
  }
}

module.exports = OrderService;
