'use client';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { predictionAPI } from '../../../lib/api';
import PredictionCard from '../../../components/prediction/PredictionCard';
import { useAuth } from '../../../context/AuthContext';

export default function PredictPage({ params }: { params: { raceId: string } }) {
  const [predictions, setPredictions] = useState<any[]>([]);
  const { token, user } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Convert unused budget into temporary/bonus GameCoins
  const leftoverBudget = Number(searchParams.get('leftover')) || 0;
  const bonusGC = Math.floor(leftoverBudget / 1_000); // Ex: $1.5M leftover = 1,500 bonus GC
  const totalAvailableGC = (user?.gameCoins || 0) + bonusGC;

  useEffect(() => {
    if (token) {
      predictionAPI.getByRace(params.raceId, token).catch(() => []).then(setPredictions);
    }
  }, [params.raceId, token]);

  const handleBet = async (predictionId: string, chosenOption: 'A' | 'B', amountStaked: number) => {
    if (!token) return;
    await predictionAPI.placeBet({
      predictionId,
      raceId: params.raceId,
      chosenOption,
      amountStaked,
    }, token);
    
    // Refresh predictions
    predictionAPI.getByRace(params.raceId, token).catch(() => []).then(setPredictions);
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#0a0a0a] text-white p-4 max-w-[1200px] mx-auto">
      
      <div className="mb-10 text-center relative p-8 border border-[#e8002d]/20 bg-gradient-to-b from-[#111] to-[#0a0a0a] overflow-hidden rounded-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#ffd700] opacity-5 blur-[100px] rounded-full"></div>
        <h3 className="text-[#ffd700] font-bold tracking-[0.2em] uppercase text-sm mb-4">Bonus Unlocked</h3>
        <h1 className="font-display font-black text-3xl md:text-4xl uppercase tracking-wider text-white mb-2">
           RACE <span className="text-[#e8002d]">PREDICTIONS</span>
        </h1>
        <p className="text-[#a0a0a0] max-w-2xl mx-auto text-sm">
          You saved <span className="text-[#00d4aa] font-bold">${(leftoverBudget / 1_000_000).toFixed(1)}M</span> of your cost cap! 
          This has granted you a bonus <span className="text-[#ffd700] font-bold">{bonusGC.toLocaleString()} GameCoins</span> to stake on live race multipliers.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {predictions?.map(prediction => (
          <PredictionCard
            key={prediction._id}
            prediction={prediction}
            userCoins={totalAvailableGC}
            onBet={handleBet}
          />
        ))}
        {(!predictions || predictions.length === 0) && (
          <div className="text-center py-12 border border-[#2a2a2a] bg-[#111] rounded-xl flex flex-col items-center">
            <p className="text-[#707070] mb-4 uppercase tracking-widest text-xs font-bold">No High-Stakes Predictions Available Yet</p>
            <p className="text-[#555] max-w-sm text-sm">Our bookmakers are analyzing the grid. Check back closer to Quali for specific event multipliers.</p>
          </div>
        )}
      </div>

      {/* Skip Context */}
      <div className="fixed bottom-0 left-0 w-full p-4 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/90 to-transparent flex justify-center z-50 pointer-events-none">
         <button 
           onClick={() => router.push(`/race/${params.raceId}`)}
           className="bg-white/10 hover:bg-[#e8002d] text-white border border-white/20 hover:border-[#e8002d] transition-all pointer-events-auto px-8 py-4 rounded-full font-display uppercase tracking-[0.2rem] text-sm font-bold shadow-2xl backdrop-blur-sm"
         >
            {predictions?.length ? 'Proceed to Pit Wall ' : 'Skip to Pit Wall '} →
         </button>
      </div>
      <div className="h-24"></div> {/* Bottom spacer */}
    </div>
  );
}