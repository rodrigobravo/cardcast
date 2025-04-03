// app/services/emails/templates/ConfirmationEmail.jsx
'use server'

export const ConfirmationEmail = async ({ username, verificationLink }) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .button {
          display: inline-block;
          padding: 12px 24px;
          background-color: #6C5CE7;
          color: white;
          text-decoration: none;
          border-radius: 8px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1 style="color: #6C5CE7;">Confirme seu email</h1>
        <p>Olá ${username},</p>
        <p>Clique no botão abaixo para confirmar seu cadastro:</p>
        <a href="${verificationLink}" class="button">
          Confirmar Email
        </a>
      </div>
    </body>
    </html>
  `
}