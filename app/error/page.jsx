'use client'
import { useSearchParams } from 'next/navigation'

export default function ErrorPage() {
  const params = useSearchParams()
  const code = params.get('code')

  const errorMessages = {
    token_expired: 'Link de confirmação expirado. Solicite um novo.',
    invalid_token: 'Token de confirmação inválido'
  }

  return (
    <div className="text-center p-8">
      <h1 className="text-2xl text-red-500 mb-4">
        {errorMessages[code] || 'Erro desconhecido'}
      </h1>
      <a 
        href="/signup" 
        className="text-blue-500 hover:underline"
      >
        Tentar novamente
      </a>
    </div>
  )
}