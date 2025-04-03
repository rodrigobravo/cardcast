const tarotDeck = [
    {
      name: "O Mago",
      meaning: "Representa habilidade e potencial criativo"
    },
    // ... outras cartas
  ]
  
  export async function generateDailyCard() {
    const randomCard = tarotDeck[Math.floor(Math.random() * tarotDeck.length)]
    
    return {
      ...randomCard,
      interpretation: `Hoje o universo sugere: ${randomCard.meaning.toLowerCase()}`
    }
  }