'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ConfirmPage() {
  const router = useRouter()

  useEffect(() => {
    // Simula um processamento
    setTimeout(() => {
      router.push('/dashboard')
    }, 2000)
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 to-indigo-800">
      <div className="text-center p-8 bg-white/10 backdrop-blur-md rounded-xl max-w-md">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-yellow-400 mx-auto mb-4"></div>
        <h2 className="text-2xl font-bold text-yellow-200 mb-2">
          Verificando seu email...
        </h2>
        <p className="text-yellow-100">
          Estamos confirmando seu token de acesso.
        </p>
      </div>
    </div>
  )
}