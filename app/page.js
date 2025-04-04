'use client'
import { useState, useRef, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import HCaptcha from '@hcaptcha/react-hcaptcha'
import { signIn } from '@/lib/supabase'

export default function Home() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [captchaToken, setCaptchaToken] = useState(null)
  const captchaRef = useRef(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Verifica se há erro na URL
    const errorType = searchParams.get('error')
    const errorMessage = searchParams.get('message')
    
    if (errorType === 'auth') {
      setError(errorMessage || 'Houve um erro durante a autenticação. Por favor, tente novamente.')
    }
  }, [searchParams])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    // Validação básica do cliente
    if (!email) {
      setError('Por favor, insira seu email')
      setIsSubmitting(false)
      return
    }

    if (!email.includes('@')) {
      setError('Email inválido')
      setIsSubmitting(false)
      return
    }

    try {
      // Verifica o captcha
      if (process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY && !captchaToken) {
        setError('Por favor, complete o captcha')
        setIsSubmitting(false)
        return
      }

      // Envia link mágico de login
      await signIn(email)

      // Redireciona para página de confirmação
      router.push('/confirmacao')
    } catch (error) {
      console.error('Erro no cadastro:', error)
      setError(error.message)
      
      // Resetar captcha
      if (captchaRef.current) {
        captchaRef.current.resetCaptcha()
        setCaptchaToken(null)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-purple-900 to-indigo-800">
      <div className="w-full max-w-md">
        {/* Cabeçalho */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-yellow-200 mb-2">CardCast</h1>
          <p className="text-xl text-yellow-100">Seu Oráculo Digital</p>
        </div>

        {/* Card do Formulário */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 shadow-lg">
          {/* Mensagem de Erro */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 text-red-100 rounded-lg">
              {error}
            </div>
          )}

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label 
                htmlFor="email" 
                className="block text-yellow-100 mb-2 text-sm font-medium"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value.trim())}
                className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
                placeholder="seu@email.com"
                disabled={isSubmitting}
                autoComplete="email"
              />
            </div>

            {/* Captcha (condicional) */}
            {process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY && (
              <div className="flex justify-center">
                <HCaptcha
                  sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY}
                  onVerify={setCaptchaToken}
                  ref={captchaRef}
                />
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || (process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY && !captchaToken)}
              className={`w-full flex items-center justify-center py-3 px-4 rounded-lg font-bold transition
                ${isSubmitting 
                  ? 'bg-yellow-400/80 text-purple-900' 
                  : 'bg-yellow-400 hover:bg-yellow-300 text-purple-900'}
              `}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-purple-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processando...
                </>
              ) : (
                'Obter Minha Carta do Dia'
              )}
            </button>
          </form>

          {/* Rodapé do Card */}
          <div className="mt-4 text-center text-xs text-white/50">
            Ao continuar, você concorda com nossos{' '}
            <a href="/termos" className="underline hover:text-yellow-200">Termos</a> e{' '}
            <a href="/privacidade" className="underline hover:text-yellow-200">Política de Privacidade</a>.
          </div>
        </div>

        {/* Rodapé da Página */}
        <div className="mt-8 text-center text-sm text-white/40">
          <p>Não compartilhamos seus dados sem sua permissão.</p>
        </div>
      </div>
    </main>
  )
}