'use client'
import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('Iniciando callback de autenticação...')
        
        // Verifica se há erro na URL
        const error = searchParams.get('error')
        const errorDescription = searchParams.get('error_description')
        
        if (error) {
          throw new Error(errorDescription || error)
        }

        // Obtém o código da URL
        const code = searchParams.get('code')
        const type = searchParams.get('type')

        console.log('Parâmetros da URL:', { code, type })

        if (!code) {
          throw new Error('Código de autenticação não encontrado na URL')
        }

        console.log('Código de autenticação encontrado, trocando por sessão...')
        
        // Troca o código por uma sessão
        const { data, error: sessionError } = await supabase.auth.exchangeCodeForSession(code)

        if (sessionError) {
          console.error('Erro ao trocar código por sessão:', sessionError)
          throw sessionError
        }

        if (!data?.session) {
          throw new Error('Sessão não retornada após troca de código')
        }

        console.log('Autenticação bem-sucedida, redirecionando...')
        router.push('/dashboard')
      } catch (error) {
        console.error('Erro detalhado no callback de autenticação:', {
          message: error.message,
          name: error.name,
          stack: error.stack
        })
        router.push('/?error=auth&message=' + encodeURIComponent(error.message))
      }
    }

    handleAuthCallback()
  }, [router, searchParams])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-purple-900 to-indigo-800">
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 max-w-md w-full">
        <div className="text-yellow-200 text-center">
          <svg className="animate-spin h-12 w-12 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-lg mb-2">Finalizando seu login...</p>
          <p className="text-sm text-yellow-200/60">
            Por favor, aguarde enquanto configuramos sua sessão.
          </p>
        </div>
      </div>
    </div>
  )
} 