import nodemailer from 'nodemailer';

class EmailService {
  #transporter = null;

  #getTransporter() {
    if (this.#transporter) return this.#transporter;
    if (!process.env.SMTP_HOST) return null;

    this.#transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
    return this.#transporter;
  }

  async enviar({ para, assunto, html }) {
    const transporter = this.#getTransporter();
    if (!transporter) {
      console.log(`[EmailService] SMTP não configurado. Email que seria enviado:\nPara: ${para}\nAssunto: ${assunto}`);
      return;
    }
    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'CantinaGO <noreply@cantinago.com>',
      to: para,
      subject: assunto,
      html,
    });
  }

  async enviarVerificacao(email, token) {
    const url = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verificar-email?token=${token}`;
    await this.enviar({
      para: email,
      assunto: 'Confirme seu email — CantinaGO',
      html: `
        <h2>Bem-vindo ao CantinaGO!</h2>
        <p>Clique no botão abaixo para confirmar seu endereço de email:</p>
        <a href="${url}" style="display:inline-block;padding:12px 24px;background:#f97316;color:#fff;border-radius:8px;text-decoration:none;font-weight:bold;">
          Confirmar email
        </a>
        <p style="color:#64748b;font-size:0.9rem;margin-top:16px;">O link expira em 24 horas. Se você não criou uma conta, ignore este email.</p>
      `,
    });
  }

  async enviarResetSenha(email, token) {
    const url = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/resetar-senha?token=${token}`;
    await this.enviar({
      para: email,
      assunto: 'Redefinição de senha — CantinaGO',
      html: `
        <h2>Redefinir senha</h2>
        <p>Recebemos uma solicitação para redefinir a senha da sua conta.</p>
        <a href="${url}" style="display:inline-block;padding:12px 24px;background:#f97316;color:#fff;border-radius:8px;text-decoration:none;font-weight:bold;">
          Redefinir senha
        </a>
        <p style="color:#64748b;font-size:0.9rem;margin-top:16px;">O link expira em 1 hora. Se você não solicitou isso, ignore este email.</p>
      `,
    });
  }
}

export default new EmailService();
