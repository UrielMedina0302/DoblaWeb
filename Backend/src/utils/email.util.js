const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');
const path = require('path');
require('dotenv').config();

module.exports = class Email {
  constructor(user, url, templateData = {}) {
    // Validación básica del destinatario
    if (!user || !user.email) {
      throw new Error('Se requiere un usuario con email válido');
    }

    this.to = user.email;
    this.firstName = user.name ? user.name.split(' ')[0] : 'Usuario';
    this.url = url || '';
    this.from = `DoblaWeb <${process.env.EMAIL_FROM || 'no-reply@doblaweb.com'}>`;
    this.templateData = { ...templateData, firstName: this.firstName };
  }

  // Configuración mejorada para desarrollo/producción
  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      // Configuración para producción (SendGrid, Mailgun, etc.)
      return nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASSWORD
        }
      });
    }

    // Configuración para Mailtrap (desarrollo)
    if (!process.env.MAILTRAP_HOST || !process.env.MAILTRAP_USER || !process.env.MAILTRAP_PASS) {
      throw new Error('Configuración de Mailtrap incompleta en variables de entorno');
    }

    return nodemailer.createTransport({
      host: process.env.MAILTRAP_HOST,
      port: process.env.MAILTRAP_PORT || 2525,
      auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASS
      },
      logger: true,
      debug: true,
      connectionTimeout: 10000 // 10 segundos timeout
    });
  }

  // Renderizado de plantillas con caché
  async renderTemplate(template, data = {}) {
    try {
      const templatePath = path.join(__dirname, `../views/emails/${template}.pug`);
      
      // Datos base que estarán disponibles en todas las plantillas
      const templateContext = {
        ...this.templateData,
        ...data,
        url: this.url,
        appName: 'DoblaWeb',
        currentYear: new Date().getFullYear(),
        supportEmail: 'soporte@doblaweb.com'
      };

      return pug.renderFile(templatePath, templateContext);
    } catch (err) {
      console.error(`Error renderizando plantilla ${template}:`, err);
      throw new Error('Error al procesar la plantilla del email');
    }
  }

  // Método principal para enviar emails
 async send(template, subject, extraData = {}) {
  try {
    if (!this.to || !this.to.includes('@')) {
      throw new Error(`Destinatario inválido: ${this.to}`);
    }

    // Unir datos globales con datos específicos del email
    this.templateData = {
      ...this.templateData,
      ...extraData
    };

    const html = await this.renderTemplate(template);
    const text = htmlToText.convert(html);

    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text,
      headers: {
        'X-App': 'DoblaWeb'
      }
    };

    console.log('📤 Enviando email a:', mailOptions.to);

    const transport = this.newTransport();
    await transport.verify();
    const info = await transport.sendMail(mailOptions);

    console.log(`✅ Email enviado a ${this.to} [${info.messageId}]`);
    return info;

  } catch (error) {
    console.error('❌ Error en Email.send:', {
      to: this.to,
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
}


  // Email específico para restablecimiento de contraseña
  async sendPasswordReset() {
    return this.send(
      'passwordReset',
      'Restablecimiento de contraseña - DoblaWeb',
      {
        // Datos adicionales específicos para este email
        resetInstructions: 'Haz clic en el siguiente enlace para restablecer tu contraseña:'
      }
    );
  }

  // Nuevo método para confirmación de cambio de contraseña
  async sendPasswordChanged() {
    return this.send(
      'passwordChanged',
      'Tu contraseña ha sido actualizada - DoblaWeb',
      {
        confirmationMessage: 'Tu contraseña ha sido cambiada exitosamente.',
        loginInstructions: 'Ahora puedes iniciar sesión con tu nueva contraseña:'
      }
    );
  }

async sendEmployeeCodeRequest(employeeEmail, code, approvalUrl) {
  console.log("✉️ Enviando solicitud de aprobación:", {
    email: employeeEmail,
    code,
    approvalUrl
  });

  return this.send(
    'employeeCodeRequest', 
    'Solicitud de Código de Empleado - Aprobación Requerida',
    {
      email: employeeEmail,
      code,
      approvalUrl
    }
  );
}

async sendEmployeeCodeConfirmation(code) {
  return this.send(
    'employeeCodeConfirmation',
    'Tu Código de Registro - DoblaWeb',
    {
      code
    }
  );
}

}
module.exports.sendEmail = (user, url) => new module.exports(user, url).sendPasswordReset();