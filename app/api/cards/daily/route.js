import { NextResponse } from 'next/server'

// Simulação de baralho de tarô (em produção, usar um banco de dados)
const tarotDeck = [
  {
    nome: 'O Mago',
    arcano: 'Arcano Maior I',
    significado: 'Poder, habilidade, concentração, ação',
    mensagem: 'É hora de usar seus talentos e recursos para manifestar seus objetivos.',
    conselho: 'Confie em suas habilidades e tome ação decisiva.',
    simbolo: '🎭'
  },
  {
    nome: 'A Sacerdotisa',
    arcano: 'Arcano Maior II',
    significado: 'Intuição, mistério, conhecimento interior',
    mensagem: 'Confie em sua intuição e busque respostas dentro de si.',
    conselho: 'Medite e escute sua voz interior.',
    simbolo: '🌙'
  },
  {
    nome: 'A Imperatriz',
    arcano: 'Arcano Maior III',
    significado: 'Abundância, criatividade, fertilidade',
    mensagem: 'É um momento de crescimento e manifestação criativa.',
    conselho: 'Nutra seus projetos e ideias com dedicação.',
    simbolo: '👑'
  }
]

export async function GET() {
  try {
    // Em produção, implementar lógica para garantir que o usuário
    // receba uma carta diferente a cada dia e salvar no histórico

    // Simulação: seleciona uma carta aleatória
    const cartaDoDia = tarotDeck[Math.floor(Math.random() * tarotDeck.length)]

    return NextResponse.json(cartaDoDia)
  } catch (error) {
    console.error('Erro ao gerar carta do dia:', error)
    return NextResponse.json(
      { error: 'Erro ao gerar sua carta do dia' },
      { status: 500 }
    )
  }
} 