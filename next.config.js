/** @type {import('next').NextConfig} */
const nextConfig = {
  // A partir do Next.js 13.4+, appDir já está estável
  // Remova a configuração experimental
  reactStrictMode: true,
  swcMinify: true,
  // Configurações opcionais:
  images: {
    domains: [], // Adicione domínios de imagens se necessário
  },
  // Para static exports (se for usar):
  output: 'standalone',
}

module.exports = nextConfig