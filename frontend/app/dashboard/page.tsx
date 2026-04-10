'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { raceAPI } from '../../lib/api';
import RaceCard from '../../components/race/RaceCard';
import { useAuth } from '../../context/AuthContext';

export default function DashboardPage() {
  const [races, setRaces] = useState<any[]>([]);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    raceAPI.getAll().catch(() => []).then(setRaces);
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* User overview strip */}
      {user && (
        <div className="flex items-center justify-between border border-[#2a2a2a] p-6 mb-12">
          <div>
            <p className="text-[#a0a0a0] text-sm">PILOT</p>
            <p className="font-display font-bold text-2xl">{user.username}</p>
          </div>
          <div className="text-center">
            <p className="text-[#a0a0a0] text-sm">RANK</p>
            <p className="font-display font-bold text-[#e8002d]">{user.rankName}</p>
          </div>
          <div className="text-center">
            <p className="text-[#a0a0a0] text-sm">POINTS</p>
            <p className="font-display font-bold text-2xl">{user.totalPoints}</p>
          </div>
          <div className="text-center">
            <p className="text-[#a0a0a0] text-sm">GAMECOINS</p>
            <p className="font-display font-bold text-[#ffd700] text-2xl">
              {(user.gameCoins / 1_000_000).toFixed(1)}M
            </p>
          </div>
        </div>
      )}

      <h2 className="font-display font-bold text-2xl mb-8">
        2025 <span className="text-[#e8002d]">RACE CALENDAR</span>
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {races?.map(race => (
          <RaceCard
            key={race._id}
            race={race}
            onClick={() => router.push(`/race/${race._id}`)}
          />
        ))}
      </div>
    </div>
  );
}