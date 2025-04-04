'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getDailyCard, createDailyReading, supabase } from '@/lib/supabase'

export default function DailyReading() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [carta, setCarta] = useState(null)
  const [isRevealing, setIsRevealing] = useState(false)
  const [isRevealed, setIsRevealed] = useState(false)
  const [userId, setUserId] = useState(null)

  useEffect(() => {
    const checkExistingCard = async () => {
      try {
        // Obtém a sessão atual
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          router.push('/')
          return
        }

        setUserId(session.user.id)

        // Verifica se já existe uma carta para hoje
        const today = new Date().toISOString().split('T')[0]
        const existingCard = await getDailyCard(session.user.id, today)

        if (existingCard) {
          setCarta(existingCard.cards)
          setIsRevealed(true)
        }
      } catch (error) {
        console.error('Erro ao verificar carta:', error)
        setError('Não foi possível verificar sua carta do dia.')
      } finally {
        setIsLoading(false)
      }
    }

    checkExistingCard()
  }, [router])

  const handleReveal = async () => {
    setIsRevealing(true)
    
    try {
      // Obtém todas as cartas disponíveis
      const { data: cards, error: cardsError } = await supabase
        .from('cards')
        .select('*')

      if (cardsError) throw cardsError

      // Seleciona uma carta aleatória
      const randomCard = cards[Math.floor(Math.random() * cards.length)]
      
      // Cria a leitura do dia
      const today = new Date().toISOString().split('T')[0]
      await createDailyReading(userId, randomCard.id, today)

      // Atualiza o estado
      setCarta(randomCard)
      
      // Simula animação de revelação
      setTimeout(() => {
        setIsRevealed(true)
        setIsRevealing(false)
      }, 2000)
    } catch (error) {
      console.error('Erro ao revelar carta:', error)
      setError('Não foi possível revelar sua carta. Tente novamente.')
      setIsRevealing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 to-indigo-800">
        <div className="text-yellow-200">Preparando sua leitura...</div>
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
      <div className="max-w-4xl mx-auto">
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
          <h1 className="text-3xl font-bold text-yellow-200">Carta do Dia</h1>
          <div className="w-8"></div>
        </header>

        {/* Conteúdo */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 md:p-8">
          {!isRevealed ? (
            <div className="text-center">
              <div className="mb-8">
                <div className="w-48 h-72 mx-auto bg-yellow-200/20 rounded-xl flex items-center justify-center">
                  <span className="text-6xl">🎴</span>
                </div>
              </div>
              <p className="text-yellow-100 mb-8">
                Sua carta do dia está pronta para ser revelada. 
                Respire fundo e concentre-se em suas questões antes de prosseguir.
              </p>
              <button
                onClick={handleReveal}
                disabled={isRevealing}
                className={`px-8 py-3 rounded-lg font-bold transition ${
                  isRevealing
                    ? 'bg-yellow-400/80 text-purple-900'
                    : 'bg-yellow-400 hover:bg-yellow-300 text-purple-900'
                }`}
              >
                {isRevealing ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Revelando...
                  </span>
                ) : (
                  'Revelar Carta'
                )}
              </button>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-yellow-200 mb-2">{carta.nome}</h2>
                <p className="text-yellow-100/80">{carta.arcano}</p>
              </div>
              
              <div className="mb-8">
                <div className="w-48 h-72 mx-auto bg-yellow-200/20 rounded-xl flex items-center justify-center">
                  {carta.imagem_url ? (
                    <img 
                      src={carta.imagem_url} 
                      alt={carta.nome}
                      className="w-full h-full object-cover rounded-xl"
                    />
                  ) : (
                    <span className="text-6xl">{carta.simbolo || '🎴'}</span>
                  )}
                </div>
              </div>

              <div className="space-y-6 text-yellow-100">
                <div>
                  <h3 className="text-lg font-semibold text-yellow-200 mb-2">Significado</h3>
                  <p>{carta.significado}</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-yellow-200 mb-2">Mensagem para Você</h3>
                  <p>{carta.mensagem}</p>
                </div>

                {carta.conselho && (
                  <div>
                    <h3 className="text-lg font-semibold text-yellow-200 mb-2">Conselho</h3>
                    <p>{carta.conselho}</p>
                  </div>
                )}
              </div>

              <div className="mt-8 text-center">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="px-6 py-2 bg-white/10 text-yellow-200 rounded-lg hover:bg-white/20 transition"
                >
                  Voltar ao Portal
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}