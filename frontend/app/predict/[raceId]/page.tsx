'use client';
import { useEffect, useState } from 'react';
import { predictionAPI } from '../../../lib/api';
import PredictionCard from '../../../components/prediction/PredictionCard';
import { useAuth } from '../../../context/AuthContext';

export default function PredictPage({ params }: { params: { raceId: string } }) {
  const [predictions, setPredictions] = useState<any[]>([]);
  const { token, user } = useAuth();

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
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="font-display font-bold text-3xl mb-2">
        RACE <span className="text-[#e8002d]">PREDICTIONS</span>
      </h1>
      <p className="text-[#a0a0a0] mb-8 text-sm">
        Spend your remaining GameCoins. Win up to 4x.
      </p>

      <div className="space-y-6">
        {predictions?.map(prediction => (
          <PredictionCard
            key={prediction._id}
            prediction={prediction}
            userCoins={user?.gameCoins || 0}
            onBet={handleBet}
          />
        ))}
        {(!predictions || predictions.length === 0) && (
          <p className="text-[#555] text-center py-12 font-display">
            No predictions available for this race yet.
          </p>
        )}
      </div>
    </div>
  );
}