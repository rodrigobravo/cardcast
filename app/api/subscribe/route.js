import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'
import { sendConfirmationEmail } from '../../services/emailService'

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

function isValidEmail(email) {
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,63}$/
  const disposableDomains = ['mailinator.com', 'tempmail.com', 'yopmail.com']
  const domain = email.split('@')[1]?.toLowerCase()
  
  return regex.test(email) && 
         !disposableDomains.includes(domain) &&
         !email.endsWith('.ru')
}

export async function POST(request) {
  const forwardedFor = request.headers.get('x-forwarded-for')
  const IP = forwardedFor?.split(',')[0]?.trim() || request.ip || 'unknown'
  const HOUR_IN_MS = 60 * 60 * 1000

  try {
    const { email, captcha } = await request.json()
    
    // Validações básicas
    if (!email) {
      return Response.json(
        { error: 'Email é obrigatório', code: 'MISSING_EMAIL' },
        { status: 400 }
      )
    }

    if (!isValidEmail(email)) {
      return Response.json(
        { error: 'Por favor, use um email válido permanente', code: 'INVALID_EMAIL' },
        { status: 400 }
      )
    }

    // Validação do Captcha (se configurado)
    if (process.env.HCAPTCHA_SECRET) {
      if (!captcha) {
        return Response.json(
          { error: 'Validação de segurança é obrigatória', code: 'MISSING_CAPTCHA' },
          { status: 400 }
        )
      }

      const captchaData = new URLSearchParams()
      captchaData.append('secret', process.env.HCAPTCHA_SECRET)
      captchaData.append('response', captcha)

      const captchaResponse = await fetch(
        'https://hcaptcha.com/siteverify',
        {
          method: 'POST',
          body: captchaData,
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }
      )

      const { success } = await captchaResponse.json()
      if (!success) {
        return Response.json(
          { error: 'Validação anti-bot falhou', code: 'CAPTCHA_FAILED' },
          { status: 403 }
        )
      }
    }

    // Rate limiting por IP
    const { count: recentSubmissions } = await supabase
      .from('subscriber_logs')
      .select('*', { count: 'exact', head: true })
      .eq('ip_address', IP)
      .eq('action', 'signup_attempt')
      .gt('created_at', new Date(Date.now() - HOUR_IN_MS).toISOString())

    if (recentSubmissions >= (process.env.RATE_LIMIT || 5)) {
      return Response.json(
        { error: 'Muitas tentativas recentes. Tente novamente mais tarde.', code: 'RATE_LIMIT_EXCEEDED' },
        { status: 429 }
      )
    }

    // Verificar email existente
    const { data: existing } = await supabase
      .from('subscribers')
      .select('id, status, is_verified')
      .eq('email', email)
      .maybeSingle()

    if (existing) {
      return Response.json(
        { 
          error: existing.is_verified 
            ? 'Email já cadastrado' 
            : 'Confirmação pendente (verifique seu email)',
          code: existing.is_verified 
            ? 'EMAIL_EXISTS' 
            : 'PENDING_CONFIRMATION'
        },
        { status: 409 }
      )
    }

    // Gera token com expiração (24h)
    const verificationToken = crypto.randomBytes(32).toString('hex')
    const tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)

    // Insere no banco
    const { data: newUser, error: insertError } = await supabase
      .from('subscribers')
      .insert([{
        email,
        ip_address: IP,
        verification_token: verificationToken,
        token_expires_at: tokenExpiresAt.toISOString(),
        status: 'pending'
      }])
      .select()
      .single()

    if (insertError) throw insertError

    // Registrar log
    await supabase
      .from('subscriber_logs')
      .insert({
        subscriber_id: newUser.id,
        ip_address: IP,
        action: 'signup_attempt',
        metadata: {
          user_agent: request.headers.get('user-agent'),
          with_captcha: !!captcha
        }
      })

    // Envio de email de confirmação (se Resend configurado)
    if (process.env.RESEND_API_KEY) {
      const verificationLink = `${process.env.NEXTAUTH_URL}/confirm?token=${verificationToken}`
      
      const emailResult = await sendConfirmationEmail(email, {
        username: email.split('@')[0],
        verificationLink
      })

      if (!emailResult.success) {
        console.error('Falha no envio do email:', emailResult.error)
        await supabase
          .from('subscriber_logs')
          .insert({
            subscriber_id: newUser.id,
            action: 'email_failed',
            metadata: { error: emailResult.error.message }
          })
      }
    }

    return Response.json(
      { 
        success: true,
        data: { 
          id: newUser.id,
          requires_confirmation: !!process.env.RESEND_API_KEY
        }
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Erro no cadastro:', error)
    
    return Response.json(
      { 
        error: 'Erro interno no servidor',
        code: 'INTERNAL_ERROR',
        details: process.env.NODE_ENV === 'development' 
          ? { message: error.message, stack: error.stack } 
          : null
      },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const runtime = 'nodejs'