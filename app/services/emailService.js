'use server'

import { Resend } from 'resend'
import { ConfirmationEmail } from './emails/templates/ConfirmationEmail'

const resend = new Resend(process.env.RESEND_API_KEY)

export const sendConfirmationEmail = async (toEmail, data) => {
  try {
    const htmlContent = await ConfirmationEmail(data)

    const { data: result, error } = await resend.emails.send({
      from: 'CardCast <onboarding@resend.dev>',
      to: toEmail,
      subject: 'Confirme seu cadastro no CardCast',
      html: htmlContent,
      text: `Confirme seu email: ${data.verificationLink}`
    })

    return { success: !error, data: result, error }
  } catch (error) {
    return { success: false, error }
  }
}