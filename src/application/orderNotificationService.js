const { customerOrderEmail, adminOrderEmail } = require('./notifications/orderEmailTemplates');

class OrderNotificationService {
  constructor(emailService, { adminEmail, paymentInstructions }) {
    this.emailService = emailService;
    this.adminEmail = adminEmail;
    this.paymentInstructions = paymentInstructions;
  }

  async notifyOrderCreated(order) {
    const deliveries = [];
    if (order.usuario_email) {
      const customer = customerOrderEmail(order, this.paymentInstructions);
      deliveries.push(this.emailService.send({ to: order.usuario_email, ...customer }));
    }
    if (this.adminEmail) {
      const admin = adminOrderEmail(order);
      deliveries.push(this.emailService.send({ to: this.adminEmail, ...admin }));
    }
    return Promise.all(deliveries);
  }
}

module.exports = OrderNotificationService;
