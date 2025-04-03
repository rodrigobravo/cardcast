import './globals.css'

export const metadata = {
  title: 'CardCast - Seu Tarô Diário',
  description: 'Descubra sua carta do dia com insights místicos',
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body className="bg-gradient-to-br from-purple-900 to-indigo-800">
        {children}
      </body>
    </html>
  )
}