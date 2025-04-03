import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import crypto from 'crypto'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY,
  {
    db: {
      schema: 'public',
      timeout: 5000
    }
  }
)

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request) {
  const IP = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.ip || 'unknown'
  
  try {
    const { email } = await request.json()

    // Gera token com expiração (24 horas)
    const verificationToken = crypto.randomBytes(32).toString('hex')
    const tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24h

    // Insere no banco com expiração
    const { data, error } = await supabase
      .from('subscribers')
      .insert([{
        email,
        verification_token: verificationToken,
        token_expires_at: tokenExpiresAt.toISOString(), // Campo de expiração
        status: 'pending'
      }])
      .select()
      .single()

    if (error) throw error

    // Envia email com link expirável
    const verificationLink = `${process.env.NEXTAUTH_URL}/confirm?token=${verificationToken}`
    await resend.emails.send({
      from: 'CardCast <noreply@cardcast.app>',
      to: email,
      subject: 'Confirme seu email (expira em 24h)',
      html: `Seu link expira em: ${tokenExpiresAt.toLocaleString()}...`
    })

    return Response.json({ success: true })

  } catch (error) {
    console.error('Erro no cadastro:', error)
    return Response.json(
      { error: 'Erro ao processar cadastro' },
      { status: 500 }
    )
  }
}