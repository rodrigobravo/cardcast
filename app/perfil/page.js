'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getUserProfile, updateUserProfile, signOut, supabase } from '@/lib/supabase'

export default function Perfil() {
  const router = useRouter()
  const [userData, setUserData] = useState({
    nome: '',
    email: '',
    notificacoesEmail: true,
    temaPreferido: 'padrao'
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState(null)

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        // Obtém a sessão atual
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          router.push('/')
          return
        }

        // Carrega o perfil do usuário
        const profile = await getUserProfile(session.user.id)
        
        setUserData({
          nome: profile.nome || '',
          email: session.user.email,
          notificacoesEmail: profile.notificacoes_email ?? true,
          temaPreferido: profile.tema_preferido || 'padrao'
        })
      } catch (error) {
        console.error('Erro ao carregar perfil:', error)
        setError('Não foi possível carregar seus dados.')
      } finally {
        setIsLoading(false)
      }
    }

    loadUserProfile()
  }, [router])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSaving(true)
    setSaveMessage(null)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Sessão expirada')

      await updateUserProfile(session.user.id, {
        nome: userData.nome,
        notificacoes_email: userData.notificacoesEmail,
        tema_preferido: userData.temaPreferido
      })

      setSaveMessage({ type: 'success', text: 'Dados salvos com sucesso!' })
    } catch (error) {
      console.error('Erro ao salvar:', error)
      setSaveMessage({ type: 'error', text: 'Erro ao salvar dados. Tente novamente.' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleLogout = async () => {
    try {
      await signOut()
      router.push('/')
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
      setError('Erro ao fazer logout. Tente novamente.')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 to-indigo-800">
        <div className="text-yellow-200">Carregando...</div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-800 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <header className="mb-8 flex items-center justify-between">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-yellow-200 hover:bg-white/10 p-2 rounded-lg transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-3xl font-bold text-yellow-200">Seu Perfil</h1>
          <div className="w-8"></div>
        </header>

        {/* Formulário */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nome */}
            <div>
              <label htmlFor="nome" className="block text-sm font-medium text-yellow-200 mb-2">
                Nome
              </label>
              <input
                type="text"
                id="nome"
                value={userData.nome}
                onChange={(e) => setUserData({ ...userData, nome: e.target.value })}
                className="w-full px-4 py-2 rounded-lg bg-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                placeholder="Seu nome"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-yellow-200 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={userData.email}
                disabled
                className="w-full px-4 py-2 rounded-lg bg-white/10 text-white/70 cursor-not-allowed"
              />
              <p className="mt-1 text-xs text-yellow-100/60">
                O email não pode ser alterado
              </p>
            </div>

            {/* Notificações */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="notificacoes"
                checked={userData.notificacoesEmail}
                onChange={(e) => setUserData({ ...userData, notificacoesEmail: e.target.checked })}
                className="h-4 w-4 text-yellow-400 focus:ring-yellow-400 border-white/20 rounded"
              />
              <label htmlFor="notificacoes" className="ml-2 block text-sm text-yellow-200">
                Receber notificações por email
              </label>
            </div>

            {/* Tema */}
            <div>
              <label htmlFor="tema" className="block text-sm font-medium text-yellow-200 mb-2">
                Tema
              </label>
              <select
                id="tema"
                value={userData.temaPreferido}
                onChange={(e) => setUserData({ ...userData, temaPreferido: e.target.value })}
                className="w-full px-4 py-2 rounded-lg bg-white/20 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
              >
                <option value="padrao">Padrão</option>
                <option value="escuro">Escuro</option>
                <option value="claro">Claro</option>
              </select>
            </div>

            {/* Mensagem de Feedback */}
            {saveMessage && (
              <div className={`p-3 rounded-lg ${
                saveMessage.type === 'success' ? 'bg-green-500/20 text-green-100' : 'bg-red-500/20 text-red-100'
              }`}>
                {saveMessage.text}
              </div>
            )}

            {/* Botões */}
            <div className="flex flex-col space-y-4">
              <button
                type="submit"
                disabled={isSaving}
                className={`w-full py-3 px-4 rounded-lg font-bold transition ${
                  isSaving
                    ? 'bg-yellow-400/80 text-purple-900'
                    : 'bg-yellow-400 hover:bg-yellow-300 text-purple-900'
                }`}
              >
                {isSaving ? 'Salvando...' : 'Salvar Alterações'}
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="w-full py-3 px-4 rounded-lg font-bold bg-white/10 hover:bg-white/20 text-yellow-200 transition"
              >
                Sair
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  )
} 