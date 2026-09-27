class OrderController {
  constructor(orderService) {
    this.orderService = orderService;
  }

  async getAll(req, res) {
    try {
      const orders = await this.orderService.getAllOrders();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getById(req, res) {
    try {
      const order = await this.orderService.getOrderById(req.params.id);
      if (!order) return res.status(404).json({ error: 'Pedido no encontrado' });
      res.json(order);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getByUserId(req, res) {
    try {
      const orders = await this.orderService.getOrdersByUserId(req.params.usuarioId);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async create(req, res) {
    try {
      const { usuario_id, items } = req.body;
      const order = await this.orderService.createOrder(usuario_id, items);
      res.status(201).json(order);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateStatus(req, res) {
    try {
      const { estado } = req.body;
      const updated = await this.orderService.updateOrderStatus(req.params.id, estado);
      if (!updated) return res.status(404).json({ error: 'Pedido no encontrado' });
      res.json(updated);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = OrderController;