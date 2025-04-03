import { generateDailyCard } from '@/lib/tarot'

export default async function DailyReading() {
  const card = await generateDailyCard()
  
  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl text-yellow-200 mb-8">
        Sua Carta do Dia:
      </h1>
      
      <div className="max-w-lg mx-auto bg-white/10 p-6 rounded-xl backdrop-blur-md">
        <h2 className="text-2xl text-white mb-4">
          {card.name}
        </h2>
        <p className="text-gray-200 italic">
          {card.interpretation}
        </p>
      </div>
    </div>
  )
}