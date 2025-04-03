import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')

  try {
    // Verifica token e expiração
    const { data: user, error } = await supabase
      .from('subscribers')
      .select('*')
      .eq('verification_token', token)
      .gt('token_expires_at', new Date().toISOString()) // Checa expiração
      .single()

    if (error || !user) {
      throw new Error('Token inválido ou expirado')
    }

    // Atualiza usuário
    await supabase
      .from('subscribers')
      .update({ 
        is_verified: true,
        verification_token: null,
        token_expires_at: null 
      })
      .eq('id', user.id)

    return Response.redirect(new URL('/dashboard?verified=1', request.url))

  } catch (error) {
    return Response.redirect(
      new URL(`/error?code=token_expired&message=${error.message}`, request.url)
    )
  }
}