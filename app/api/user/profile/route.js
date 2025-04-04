import { NextResponse } from 'next/server'

// Simulação de banco de dados (em produção, usar um banco de dados real)
let mockUser = {
  nome: 'Usuário Teste',
  email: 'teste@email.com',
  notificacoesEmail: true,
  temaPreferido: 'padrao',
  cartaDoDia: {
    nome: 'O Mago',
    arcano: 'Arcano Maior I',
    significado: 'Poder, habilidade, concentração, ação',
    mensagem: 'É hora de usar seus talentos e recursos para manifestar seus objetivos.',
    conselho: 'Confie em suas habilidades e tome ação decisiva.',
    simbolo: '🎭'
  },
  ultimasLeituras: [
    {
      carta: 'A Imperatriz',
      data: '2024-04-02'
    },
    {
      carta: 'O Eremita',
      data: '2024-04-01'
    }
  ]
}

export async function GET() {
  try {
    // Em produção, buscar dados do usuário autenticado
    return NextResponse.json(mockUser)
  } catch (error) {
    console.error('Erro ao buscar perfil:', error)
    return NextResponse.json(
      { error: 'Erro ao carregar dados do perfil' },
      { status: 500 }
    )
  }
}

export async function PUT(request) {
  try {
    const data = await request.json()

    // Validação básica
    if (!data.email || !data.nome) {
      return NextResponse.json(
        { error: 'Nome e email são obrigatórios' },
        { status: 400 }
      )
    }

    // Em produção, atualizar no banco de dados
    mockUser = {
      ...mockUser,
      ...data
    }

    return NextResponse.json(mockUser)
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar dados do perfil' },
      { status: 500 }
    )
  }
} 