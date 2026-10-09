/**
 * Puerto de salida para notificaciones por correo.
 * La capa de aplicación depende de este contrato, no de Nodemailer.
 */
class EmailServicePort {
  async send(_message) {
    throw new Error('EmailServicePort.send debe ser implementado por un adaptador de infraestructura.');
  }
}

module.exports = EmailServicePort;
