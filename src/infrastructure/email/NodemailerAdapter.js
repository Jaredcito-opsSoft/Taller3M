const nodemailer = require('nodemailer');
const EmailServicePort = require('../../application/ports/EmailServicePort');

/** Adaptador SMTP compatible con Mailtrap y Ethereal. */
class NodemailerAdapter extends EmailServicePort {
  constructor({ provider, host, port, secure, user, pass, from }) {
    super();
    this.provider = provider;
    this.config = { host, port, secure, user, pass, from };
    this.transporter = null;
  }

  static fromEnvironment(env = process.env) {
    return new NodemailerAdapter({
      provider: env.EMAIL_PROVIDER || 'mailtrap',
      host: env.SMTP_HOST,
      port: Number(env.SMTP_PORT || 587),
      secure: env.SMTP_SECURE === 'true',
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
      from: env.EMAIL_FROM || 'no-reply@taller3m.local'
    });
  }

  async getTransporter() {
    if (this.transporter) return this.transporter;
    if (this.provider === 'ethereal') {
      const account = await nodemailer.createTestAccount();
      this.config.from = this.config.from === 'no-reply@taller3m.local' ? account.user : this.config.from;
      this.transporter = nodemailer.createTransport({ host: account.smtp.host, port: account.smtp.port, secure: account.smtp.secure, auth: { user: account.user, pass: account.pass } });
      return this.transporter;
    }
    if (!this.config.host || !this.config.user || !this.config.pass) {
      throw new Error('Configuración SMTP incompleta. Define SMTP_HOST, SMTP_USER y SMTP_PASS o usa EMAIL_PROVIDER=ethereal.');
    }
    this.transporter = nodemailer.createTransport({ host: this.config.host, port: this.config.port, secure: this.config.secure, auth: { user: this.config.user, pass: this.config.pass } });
    return this.transporter;
  }

  async send(message) {
    const transporter = await this.getTransporter();
    const info = await transporter.sendMail({ from: this.config.from, ...message });
    return { messageId: info.messageId, previewUrl: nodemailer.getTestMessageUrl(info) || null };
  }
}

module.exports = NodemailerAdapter;
