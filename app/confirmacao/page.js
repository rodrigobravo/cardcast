'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function Confirmacao() {
  const router = useRouter()

  useEffect(() => {
    // Monitora mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        router.push('/dashboard')
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-purple-900 to-indigo-800">
      <div className="w-full max-w-md text-center">
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 shadow-lg">
          <div className="mb-6">
            <span className="text-6xl">✉️</span>
          </div>
          
          <h1 className="text-2xl font-bold text-yellow-200 mb-4">
            Verifique seu Email
          </h1>
          
          <p className="text-yellow-100 mb-6">
            Enviamos um link mágico para seu email. 
            Clique nele para acessar sua conta e revelar sua carta do dia.
          </p>

          <div className="text-yellow-100/60 text-sm">
            <p>Não recebeu o email?</p>
            <p>Verifique sua caixa de spam ou</p>
            <button
              onClick={() => router.push('/')}
              className="text-yellow-200 underline hover:text-yellow-300"
            >
              tente novamente
            </button>
          </div>
        </div>
      </div>
    </main>
  )
} 