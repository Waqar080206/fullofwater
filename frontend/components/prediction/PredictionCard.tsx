'use client';
import { useState } from 'react';

interface Prediction {
  _id: string;
  question: string;
  optionA: string;
  optionB: string;
  multiplierWin: number;
  isSettled: boolean;
  correctOption: 'A' | 'B' | null;
}

interface Props {
  prediction: Prediction;
  userCoins: number;
  onBet: (predictionId: string, option: 'A' | 'B', amount: number) => Promise<void>;
}

export default function PredictionCard({ prediction, userCoins, onBet }: Props) {
  const [chosen, setChosen] = useState<'A' | 'B' | null>(null);
  const [stake, setStake] = useState(1000);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [placed, setPlaced] = useState(false);

  const handleBet = async () => {
    if (!chosen || placed) return;
    setIsSubmitting(true);
    await onBet(prediction._id, chosen, stake);
    setPlaced(true);
    setIsSubmitting(false);
  };

  return (
    <div className="border border-[#2a2a2a] hover:border-[#e8002d33] transition-colors p-6">
      {/* Multiplier badge */}
      <div className="flex justify-between items-start mb-4">
        <p className="text-white font-bold text-base leading-snug max-w-[75%]">
          {prediction.question}
        </p>
        <span className="font-display font-black text-[#ffd700] text-xl ml-4">
          {prediction.multiplierWin}×
        </span>
      </div>

      {prediction.isSettled ? (
        <div className="text-sm font-display">
          <span className="text-[#a0a0a0]">Result: </span>
          <span className="text-[#00d4aa]">
            {prediction.correctOption === 'A' ? prediction.optionA : prediction.optionB}
          </span>
        </div>
      ) : placed ? (
        <div className="text-[#00d4aa] font-display text-sm">BET PLACED ✓</div>
      ) : (
        <>
          {/* Option buttons */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {(['A', 'B'] as const).map(opt => (
              <button
                key={opt}
                onClick={() => setChosen(opt)}
                className={`py-3 px-4 text-sm font-bold border transition-all ${
                  chosen === opt
                    ? 'border-[#e8002d] bg-[#e8002d] text-white'
                    : 'border-[#2a2a2a] text-[#a0a0a0] hover:border-[#e8002d55]'
                }`}
              >
                {opt === 'A' ? prediction.optionA : prediction.optionB}
              </button>
            ))}
          </div>

          {/* Stake slider */}
          {chosen && (
            <div className="mb-4">
              <div className="flex justify-between text-xs text-[#a0a0a0] mb-2">
                <span>STAKE</span>
                <span className="font-display text-[#ffd700]">{stake.toLocaleString()} GC</span>
              </div>
              <input
                type="range"
                min={100}
                max={Math.min(userCoins, 50_000)}
                step={100}
                value={stake}
                onChange={e => setStake(Number(e.target.value))}
                className="w-full accent-[#e8002d]"
              />
              <div className="flex justify-between text-xs text-[#555] mt-1">
                <span>100 GC</span>
                <span>Potential: <span className="text-[#00d4aa]">{(stake * prediction.multiplierWin).toLocaleString()} GC</span></span>
              </div>
            </div>
          )}

          <button
            onClick={handleBet}
            disabled={!chosen || isSubmitting}
            className="w-full bg-[#e8002d] disabled:bg-[#2a2a2a] disabled:text-[#555] text-white font-display font-bold tracking-widest uppercase py-3 text-sm transition-all"
          >
            {isSubmitting ? 'PLACING...' : 'PLACE BET'}
          </button>
        </>
      )}
    </div>
  );
}