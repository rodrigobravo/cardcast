'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getDailyCard, getReadingHistory, supabase } from '@/lib/supabase'

export default function Dashboard() {
  const router = useRouter()
  const [userData, setUserData] = useState({
    cartaDoDia: null,
    ultimasLeituras: []
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Obtém a sessão atual
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          router.push('/')
          return
        }

        // Obtém a data atual no formato YYYY-MM-DD
        const today = new Date().toISOString().split('T')[0]

        // Carrega carta do dia e histórico em paralelo
        const [cartaDoDia, historico] = await Promise.all([
          getDailyCard(session.user.id, today),
          getReadingHistory(session.user.id, 5)
        ])

        setUserData({
          cartaDoDia: cartaDoDia,
          ultimasLeituras: historico || []
        })
      } catch (error) {
        console.error('Erro ao carregar dashboard:', error)
        setError('Não foi possível carregar seus dados.')
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboardData()
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 to-indigo-800">
        <div className="text-yellow-200">
          <svg className="animate-spin h-12 w-12 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p>Carregando seu portal místico...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 to-indigo-800">
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 max-w-md w-full mx-4">
          <div className="text-red-300 text-center">
            <p>{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-yellow-400 text-purple-900 rounded-lg hover:bg-yellow-300 transition"
            >
              Tentar Novamente
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-800 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-yellow-200">Portal Místico</h1>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/perfil')}
              className="p-2 text-yellow-200 hover:bg-white/10 rounded-lg transition"
            >
              <span className="sr-only">Perfil</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button>
          </div>
        </header>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Carta do Dia */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 col-span-full md:col-span-2">
            <h2 className="text-xl font-semibold text-yellow-200 mb-4">Sua Carta do Dia</h2>
            {userData.cartaDoDia ? (
              <div className="flex items-center space-x-4">
                <div className="w-24 h-36 bg-yellow-200/20 rounded-lg flex items-center justify-center">
                  {userData.cartaDoDia.cards.imagem_url ? (
                    <img 
                      src={userData.cartaDoDia.cards.imagem_url} 
                      alt={userData.cartaDoDia.cards.nome}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <span className="text-4xl">{userData.cartaDoDia.cards.simbolo || '🎴'}</span>
                  )}
                </div>
                <div>
                  <h3 className="text-yellow-100 text-lg font-medium">{userData.cartaDoDia.cards.nome}</h3>
                  <p className="text-yellow-100/80">{userData.cartaDoDia.cards.significado}</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-yellow-100/80">Você ainda não recebeu sua carta do dia.</p>
                <button
                  onClick={() => router.push('/daily-reading')}
                  className="mt-4 px-6 py-2 bg-yellow-400 text-purple-900 rounded-lg hover:bg-yellow-300 transition"
                >
                  Revelar Carta
                </button>
              </div>
            )}
          </div>

          {/* Estatísticas */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
            <h2 className="text-xl font-semibold text-yellow-200 mb-4">Suas Estatísticas</h2>
            <div className="space-y-4">
              <div>
                <p className="text-yellow-100/80">Leituras Realizadas</p>
                <p className="text-2xl font-bold text-yellow-200">{userData.ultimasLeituras.length}</p>
              </div>
              <div>
                <p className="text-yellow-100/80">Próxima Leitura</p>
                <p className="text-yellow-200">
                  {userData.cartaDoDia ? 'Amanhã' : 'Disponível Agora'}
                </p>
              </div>
            </div>
          </div>

          {/* Últimas Leituras */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
            <h2 className="text-xl font-semibold text-yellow-200 mb-4">Últimas Leituras</h2>
            {userData.ultimasLeituras.length > 0 ? (
              <div className="space-y-3">
                {userData.ultimasLeituras.map((leitura) => (
                  <div key={leitura.id} className="p-3 bg-white/5 rounded-lg">
                    <p className="text-yellow-100">{leitura.cards.nome}</p>
                    <p className="text-xs text-yellow-100/60">
                      {new Date(leitura.date).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-yellow-100/80 text-center py-4">
                Nenhuma leitura realizada ainda
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}