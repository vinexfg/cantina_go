class EmailService {
  async enviar({ para, assunto, html }) {
    if (!process.env.BREVO_API_KEY) {
      console.log(`[EmailService] BREVO_API_KEY não configurado. Email que seria enviado:\nPara: ${para}\nAssunto: ${assunto}`);
      return;
    }
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': process.env.BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: { name: 'CantinaGO', email: process.env.BREVO_FROM || 'vinysilvaa22v@gmail.com' },
        to: [{ email: para }],
        subject: assunto,
        htmlContent: html,
      }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || `Brevo erro ${res.status}`);
    }
  }

  async enviarVerificacao(email, codigo) {
    await this.enviar({
      para: email,
      assunto: 'Código de verificação — CantinaGO',
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
          <h2 style="color:#f97316">Bem-vindo ao CantinaGO!</h2>
          <p>Use o código abaixo para verificar seu e-mail e ativar sua conta:</p>
          <div style="font-size:2.5rem;font-weight:bold;letter-spacing:12px;text-align:center;
                      background:#f1f5f9;border-radius:12px;padding:24px 0;margin:24px 0;
                      color:#0f172a">${codigo}</div>
          <p style="color:#64748b;font-size:0.9rem">O código expira em 24 horas.<br>Se você não criou uma conta, ignore este e-mail.</p>
        </div>
      `,
    });
  }

  async enviarResetSenha(email, token) {
    const url = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/resetar-senha?token=${token}`;
    await this.enviar({
      para: email,
      assunto: 'Redefinição de senha — CantinaGO',
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
          <h2 style="color:#f97316">Redefinir senha</h2>
          <p>Recebemos uma solicitação para redefinir a senha da sua conta.</p>
          <a href="${url}" style="display:inline-block;padding:12px 24px;background:#f97316;color:#fff;border-radius:8px;text-decoration:none;font-weight:bold;">
            Redefinir senha
          </a>
          <p style="color:#64748b;font-size:0.9rem;margin-top:16px;">O link expira em 1 hora. Se você não solicitou isso, ignore este email.</p>
        </div>
      `,
    });
  }
}

export default new EmailService();
