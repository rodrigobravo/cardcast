import { createClient } from '@supabase/supabase-js'

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

// Configuração do serviço de geolocalização
const GEO_API_URL = process.env.GEO_API_URL || 'http://ip-api.com/json/'

async function getGeoLocation(ip) {
  // Não consultar para IPs locais/reservados
  if (ip === 'unknown' || ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.')) {
    return {
      country: 'Local',
      country_code: 'LH',
      region: 'Development',
      ip_version: ip.includes(':') ? 6 : 4
    }
  }

  try {
    // Extrai IPv4 de um possível IPv6 mapeado (ex: ::ffff:203.0.113.1)
    const ipv4 = ip.includes('::ffff:') ? ip.split('::ffff:')[1] : ip
    
    const response = await fetch(`${GEO_API_URL}${ipv4}?fields=status,country,countryCode,region,query`)
    const data = await response.json()
    
    if (data.status === 'success') {
      return {
        ip: data.query || ip,
        country: data.country,
        country_code: data.countryCode,
        region: data.region,
        ip_version: ipv4 === ip ? 4 : 6
      }
    }
  } catch (error) {
    console.error('Erro na geolocalização:', error)
  }

  return {
    ip,
    country: 'Unknown',
    country_code: 'XX',
    region: 'Unknown',
    ip_version: ip.includes(':') ? 6 : 4
  }
}

function isValidEmail(email) {
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,63}$/
  const disposableDomains = ['mailinator.com', 'tempmail.com', 'yopmail.com']
  const domain = email.split('@')[1]?.toLowerCase()
  
  return regex.test(email) && 
         !disposableDomains.includes(domain) &&
         !email.endsWith('.ru')
}

export async function POST(request) {
  // Extração robusta do IP considerando múltiplos proxies
  const forwardedFor = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const remoteAddress = request.ip
  
  let IP = 'unknown'
  if (forwardedFor) {
    IP = forwardedFor.split(',')[0].trim()
  } else if (realIp) {
    IP = realIp
  } else if (remoteAddress) {
    IP = remoteAddress
  }

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
        { error: 'Por favor, use um email válido', code: 'INVALID_EMAIL' },
        { status: 400 }
      )
    }

    // Obter dados geográficos (só consulta se for IPv4 público)
    const geoData = await getGeoLocation(IP)

    // Inserção no banco com metadados completos
    const verificationToken = crypto.randomUUID()
    const { data, error } = await supabase
      .from('subscribers')
      .insert([{
        email,
        ip_address: geoData.ip || IP,
        ip_version: geoData.ip_version,
        country: geoData.country,
        country_code: geoData.country_code,
        region: geoData.region,
        status: 'pending',
        verification_token: verificationToken,
        signup_metadata: {
          user_agent: request.headers.get('user-agent'),
          ip_type: geoData.ip_version === 6 ? 'IPv6' : 'IPv4',
          is_public: !['Local', 'Unknown'].includes(geoData.country)
        }
      }])
      .select()
      .single()

    if (error) throw error

    // Registrar log técnico
    await supabase
      .from('subscriber_logs')
      .insert({
        subscriber_id: data.id,
        ip_address: geoData.ip || IP,
        ip_version: geoData.ip_version,
        country_code: geoData.country_code,
        action: 'signup_attempt',
        metadata: {
          geo: geoData,
          headers: {
            'x-forwarded-for': forwardedFor,
            'x-real-ip': realIp
          }
        }
      })

    return Response.json(
      { 
        success: true,
        data: { 
          id: data.id,
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
          ? error.message 
          : undefined
      },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const runtime = 'nodejs'