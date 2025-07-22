const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

module.exports = class Email {
  constructor(user, resetURL) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.resetURL = resetURL;
    this.from = `Soporte DoblaWeb <${process.env.EMAIL_FROM}>`;
  }

  // Configuración del transporte
  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      // Configuración para producción (SendGrid)
      return nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASSWORD
        }
      });
    }

    // Configuración para desarrollo (Mailtrap)
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }

  // Renderizar plantilla Pug
  async renderTemplate(template, data) {
    return pug.renderFile(
      `${__dirname}/../views/emails/${template}.pug`,
      data
    );
  }

  // Enviar email real
  async send(template, subject) {
    // 1. Renderizar HTML basado en plantilla Pug
    const html = await this.renderTemplate(template, {
      firstName: this.firstName,
      resetURL: this.resetURL,
      subject
    });

    // 2. Definir opciones del email
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.convert(html)
    };

    // 3. Crear transporte y enviar email
    await this.newTransport().sendMail(mailOptions);
  }

  // Método específico para enviar email de reset de contraseña
  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Tu enlace para restablecer la contraseña (válido por 10 minutos)'
    );
  }
};