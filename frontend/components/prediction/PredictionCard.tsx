'use client';
import { useState } from 'react';

export interface Prediction {
  _id: string;
  question: string;
  optionA: string;
  optionB: string;
  poolA: number;
  poolB: number;
  status: 'open' | 'locked' | 'settled';
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

  const poolA = prediction.poolA || 0;
  const poolB = prediction.poolB || 0;
  const totalPool = poolA + poolB;
  const allocatablePool = totalPool * 0.95; // 5% house edge

  const getEstimatedReturn = (option: 'A' | 'B') => {
    const pool = option === 'A' ? poolA : poolB;
    if (pool === 0) return '1.0x'; // default fallback before bets
    const est = allocatablePool / pool;
    return `${est.toFixed(2)}x`;
  };

  const status = prediction.status || 'open';
  const isOpen = status === 'open';

  const handleBet = async () => {
    if (!chosen || placed || !isOpen) return;
    setIsSubmitting(true);
    try {
      await onBet(prediction._id, chosen, stake);
      setPlaced(true);
    } catch (e) {
      // Allow re-attempt if it failed
    }
    setIsSubmitting(false);
  };

  return (
    <div className="border border-[#2a2a2a] hover:border-[#e8002d33] transition-colors p-6">
      {/* Pool Header/Live Odds */}
      <div className="flex justify-between items-start mb-4">
        <p className="text-white font-bold text-base leading-snug max-w-[70%]">
          {prediction.question}
        </p>
        <div className="flex flex-col items-end">
          <span className="font-display font-black text-[#00d4aa] text-xl ml-4">
            {totalPool.toLocaleString()} <span className="text-xs">GC POOL</span>
          </span>
          {!isOpen && !prediction.isSettled && (
             <span className="text-[#e8002d] text-[10px] font-bold tracking-widest mt-1">MARKET LOCKED</span>
          )}
        </div>
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
                disabled={!isOpen}
                onClick={() => setChosen(opt)}
                className={`py-3 px-4 flex flex-col justify-center items-center text-sm font-bold border transition-all ${
                  chosen === opt
                    ? 'border-[#e8002d] bg-[#e8002d] text-white'
                    : isOpen
                      ? 'border-[#2a2a2a] text-[#a0a0a0] hover:border-[#e8002d55]'
                      : 'border-[#2a2a2a] bg-[#1a1a1a] text-[#555] cursor-not-allowed'
                }`}
              >
                <span>{opt === 'A' ? prediction.optionA : prediction.optionB}</span>
                <span className={`text-[10px] mt-1 font-display tracking-wider ${chosen === opt ? 'text-white' : 'text-[#ffd700]'}`}>
                  Est Pay: {getEstimatedReturn(opt)}
                </span>
              </button>
            ))}
          </div>

          {/* Stake slider */}
          {chosen && isOpen && (
            <div className="mb-4">
              <div className="flex justify-between text-xs text-[#a0a0a0] mb-2">
                <span>STAKE</span>
                <span className="font-display text-[#ffd700]">{stake.toLocaleString()} GC</span>
              </div>
              <input
                type="range"
                min={100}
                max={Math.max(100, Math.min(userCoins, 50_000))}
                step={100}
                value={stake}
                onChange={e => setStake(Number(e.target.value))}
                className="w-full accent-[#e8002d]"
              />
              <div className="flex justify-between text-xs text-[#555] mt-1">
                <span>100 GC</span>
                <span>Est Pay: <span className="text-[#00d4aa]">{(stake * parseFloat(getEstimatedReturn(chosen).replace('x', ''))).toLocaleString()} GC</span></span>
              </div>
            </div>
          )}

          <button
            onClick={handleBet}
            disabled={!chosen || isSubmitting || !isOpen || stake > userCoins}
            className="w-full bg-[#e8002d] disabled:bg-[#2a2a2a] disabled:text-[#555] text-white font-display font-bold tracking-widest uppercase py-3 text-sm transition-all"
          >
            {isSubmitting ? 'PLACING...' : stake > userCoins ? 'NOT ENOUGH COINS' : 'PLACE BET'}
          </button>
        </>
      )}
    </div>
  );
}