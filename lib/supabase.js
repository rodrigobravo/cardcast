import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Faltam variáveis de ambiente do Supabase')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
})

// Funções auxiliares para autenticação
export const signIn = async (email) => {
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
      shouldCreateUser: true
    }
  })
  
  if (error) throw error
  return data
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

// Funções auxiliares para perfil do usuário
export const getUserProfile = async (userId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) throw error
  return data
}

export const updateUserProfile = async (userId, updates) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  if (error) throw error
  return data
}

// Funções para cartas do tarô
export const getDailyCard = async (userId, date) => {
  const { data, error } = await supabase
    .from('daily_readings')
    .select('*, cards(*)')
    .eq('user_id', userId)
    .eq('date', date)
    .single()

  if (error && error.code !== 'PGRST116') throw error // Ignora erro de não encontrado
  return data
}

export const createDailyReading = async (userId, cardId, date) => {
  const { data, error } = await supabase
    .from('daily_readings')
    .insert([
      { user_id: userId, card_id: cardId, date }
    ])
    .select('*, cards(*)')
    .single()

  if (error) throw error
  return data
}

// Funções para histórico de leituras
export const getReadingHistory = async (userId, limit = 10) => {
  const { data, error } = await supabase
    .from('daily_readings')
    .select('*, cards(*)')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data
}

// Implementar cache de cartas
const CACHE_KEY = 'tarot_cards'
const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 horas

async function getCachedCards() {
  const cached = localStorage.getItem(CACHE_KEY)
  if (cached) {
    const { data, timestamp } = JSON.parse(cached)
    if (Date.now() - timestamp < CACHE_DURATION) {
      return data
    }
  }
  return null
} 