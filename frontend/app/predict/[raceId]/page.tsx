'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { predictionAPI, teamAPI } from '../../../lib/api';
import PredictionCard from '../../../components/prediction/PredictionCard';
import { useAuth } from '../../../context/AuthContext';

export default function PredictPage({ params }: { params: { raceId: string } }) {
  const [predictions, setPredictions] = useState<any[]>([]);
  const { token, user } = useAuth();
  const router = useRouter();
  
  // Initialize total available GC internally based on user's database team leftover budget
  const [localGameCoins, setLocalGameCoins] = useState<number>(0);
  const [leftoverBudget, setLeftoverBudget] = useState<number>(0);
  const bonusGC = leftoverBudget;

  useEffect(() => {
    if (token) {
      // Fetch user's team for this race to calculate exact leftover budget for predictions
      teamAPI.get(params.raceId, token)
        .then((team) => {
          if (team && team.totalCost) {
             const budgetRemaining = 60_000_000 - team.totalCost;
             setLeftoverBudget(budgetRemaining);
             // GameCoins derived from 1:1 equivalent of leftover cost cap budget:
             setLocalGameCoins(budgetRemaining + (user?.gameCoins || 0));
          } else {
             setLocalGameCoins(user?.gameCoins || 0);
          }
        })
        .catch(() => setLocalGameCoins(user?.gameCoins || 0));
        
      predictionAPI.getByRace(params.raceId, token).catch(() => []).then(setPredictions);
    }
  }, [params.raceId, token, user?.gameCoins]);

  const handleBet = async (predictionId: string, chosenOption: 'A' | 'B', amountStaked: number) => {
    if (!token) return;
    try {
      await predictionAPI.placeBet({
        predictionId,
        raceId: params.raceId,
        chosenOption,
        amountStaked,
      }, token);
      
      // Deduct coins locally for immediate feedback
      setLocalGameCoins(prev => Math.max(0, prev - amountStaked));

      // Refresh predictions to fetch updated pools
      const updatedPredictions = await predictionAPI.getByRace(params.raceId, token);
      setPredictions(updatedPredictions);
    } catch (err) {
      console.error('Failed to place bet', err);
      // Let the PredictionCard handle its internal error state (or expand an alert here in the future)
      throw err; 
    }
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
          {bonusGC > 0 ? (
            <>
              You saved <span className="text-[#00d4aa] font-bold">${(leftoverBudget / 1_000_000).toFixed(1)}M</span> of your cost cap! 
              This grants you a bonus pool of <span className="text-[#ffd700] font-bold">{localGameCoins.toLocaleString()} GameCoins</span> to stake on live race multipliers.
            </>
          ) : (
            <>
               Use your available <span className="text-[#ffd700] font-bold">{localGameCoins.toLocaleString()} GameCoins</span> to wager on live dynamic-odds race events.
            </>
          )}
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {predictions?.map(prediction => (
          <PredictionCard
            key={prediction._id}
            prediction={prediction}
            userCoins={localGameCoins}
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