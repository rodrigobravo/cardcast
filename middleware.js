import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'

export async function middleware(req) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Refresh session if expired
  const { data: { session } } = await supabase.auth.getSession()

  // Rotas protegidas que requerem autenticação
  const protectedRoutes = ['/dashboard', '/perfil', '/daily-reading']
  const isProtectedRoute = protectedRoutes.some(route => 
    req.nextUrl.pathname.startsWith(route)
  )

  if (isProtectedRoute && !session) {
    // Redireciona para login se não estiver autenticado
    return NextResponse.redirect(new URL('/', req.url))
  }

  // Redireciona usuários autenticados da página inicial para o dashboard
  if (session && req.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return res
}

export const config = {
  matcher: ['/', '/dashboard/:path*', '/perfil', '/daily-reading']
}

// Pré-carregar imagens das cartas
function preloadCardImages(cards) {
  cards.forEach(card => {
    if (card.imagem_url) {
      const img = new Image()
      img.src = card.imagem_url
    }
  })
}

// Sistema de notificações
async function setupNotifications(userId) {
  const permission = await Notification.requestPermission()
  if (permission === 'granted') {
    // Registrar service worker para push notifications
    const registration = await navigator.serviceWorker.register('/sw.js')
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
    })
    
    // Salvar subscription no Supabase
    await supabase
      .from('push_subscriptions')
      .upsert({ user_id: userId, subscription: subscription })
  }
}

// Tracking de eventos
async function trackEvent(userId, eventType, data) {
  await supabase
    .from('analytics')
    .insert([{
      user_id: userId,
      event_type: eventType,
      data: data,
      timestamp: new Date()
    }])
} 