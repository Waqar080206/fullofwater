'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { raceAPI, teamAPI } from '../../../lib/api';

// Add Countdown Hook
function useCountdown(targetDateStr: string) {
  const [timeLeft, setTimeLeft] = useState<{ d: number, h: number, m: number, s: number } | null>(null);

  useEffect(() => {
    const target = new Date(targetDateStr).getTime();
    const tick = () => {
      const diff = target - new Date().getTime();
      if (diff <= 0) return setTimeLeft({ d: 0, h: 0, m: 0, s: 0 }); // Race started!
      setTimeLeft({
        d: Math.floor(diff / (1000 * 60 * 60 * 24)),
        h: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        m: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        s: Math.floor((diff % (1000 * 60)) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetDateStr]);

  return timeLeft;
}

export default function RaceDashboardPage({ params }: { params: { raceId: string } }) {
  const router = useRouter();
  const { token } = useAuth();
  const [race, setRace] = useState<any>(null);
  const [team, setTeam] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [pollVoted, setPollVoted] = useState(false);
  const [pollResults, setPollResults] = useState<{ id: string, label: string, percent: number }[]>([
    { id: '1', label: 'Max Verstappen', percent: 45 },
    { id: '2', label: 'Lando Norris', percent: 35 },
    { id: '3', label: 'Charles Leclerc', percent: 15 },
    { id: '4', label: 'Other', percent: 5 },
  ]);

  // Handle Poll Voting 
  const handleVote = (id: string) => {
    setPollVoted(true);
    // Artificially boost the clicked option
    setPollResults(prev => prev.map(p => p.id === id ? { ...p, percent: Math.min(100, p.percent + 6) } : { ...p, percent: Math.max(0, p.percent - 2) }));
  };

  // Mock Live Leaderboard Data (if race is active)
  const isRaceActive = race?.status === 'active' || race?.status === 'completed'; // Change to match your states

  useEffect(() => {
    if (token) {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          const raceData = await raceAPI.getById(params.raceId);
          setRace(raceData);
          
          try {
            const teamData = await teamAPI.get(params.raceId, token);
            setTeam(teamData);
          } catch (e) {
            // User might not have a team yet
          }
        } catch (err) {
          console.error('Failed to fetch race details', err);
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchData();
    }
  }, [params.raceId, token]);

  const raceCountdown = useCountdown(race?.raceDate || new Date().toISOString());

  if (isLoading) {
    return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-[#707070] animate-pulse">LOADING TELEMETRY...</div>;
  }

  if (!race) {
    return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">Race Not Found</div>;
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#0a0a0a] text-white p-4 max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="mb-10 text-center relative p-10 border border-[#2a2a2a] bg-[#111] overflow-hidden rounded-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#e8002d] opacity-10 blur-3xl rounded-full"></div>
        <h3 className="text-[#e8002d] font-bold tracking-[0.2em] uppercase text-sm mb-2">Round {race.round} • {race.season}</h3>
        <h1 className="font-display font-black text-4xl md:text-5xl uppercase tracking-wider text-white mb-4">{race.name}</h1>
        <p className="text-[#a0a0a0] max-w-2xl mx-auto uppercase tracking-wider text-xs font-semibold">
          {race.circuit} | {race.country}
        </p>
      </div>

      {/* Grid Layout taking full width */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Team Status */}
        <div className="lg:col-span-2 border border-[#2a2a2a] bg-[#111]/80 backdrop-blur p-8 rounded-xl relative hover:border-[#444] transition-colors">
          <h2 className="font-display font-bold text-2xl text-white uppercase tracking-widest mb-6">Race Roster</h2>
          
          {team ? (
            <div className="space-y-6">
              <div className="flex justify-between items-center bg-[#1a1a1a] border border-[#333] p-4 rounded-lg">
                <span className="text-[#707070] uppercase tracking-widest text-xs font-bold">Game Mode</span>
                <span className={`uppercase font-display font-bold tracking-wider px-3 py-1 rounded text-xs ${
                  team.mode === 'pro' ? 'bg-[#ffd700]/20 text-[#ffd700] border border-[#ffd700]' : 'bg-[#e8002d]/20 text-[#e8002d] border border-[#e8002d]'
                }`}>
                  {team.mode} Grid
                </span>
              </div>

              <div>
                <p className="text-[#707070] uppercase tracking-widest text-xs font-bold mb-3">Locked Drivers</p>
                <div className="grid grid-cols-3 gap-3">
                  {team.drivers.map((driverId: string) => (
                    <div key={driverId} className="bg-[#050505] border border-[#222] p-4 flex flex-col items-center justify-center text-center rounded">
                      <span className="font-display font-bold text-lg text-white mb-1">
                        {{ 'NOR': 'Norris', 'PIA': 'Piastri', 'RUS': 'Russell', 'ANT': 'Antonelli', 'LEC': 'Leclerc', 'HAM': 'Hamilton', 'VER': 'Verstappen', 'HAD': 'Hadjar', 'ALO': 'Alonso', 'STR': 'Stroll', 'ALB': 'Albon', 'SAI': 'Sainz', 'HUL': 'Hülkenberg', 'BOR': 'Bortoleto', 'GAS': 'Gasly', 'COL': 'Colapinto', 'OCO': 'Ocon', 'BEA': 'Bearman', 'LAW': 'Lawson', 'LIN': 'Lindblad', 'PER': 'Pérez', 'BOT': 'Bottas' }[driverId] || driverId}
                      </span>
                      <span className="text-[#555] text-[10px] tracking-widest uppercase">ID: {driverId}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[#707070] uppercase tracking-widest text-xs font-bold mb-3">Locked Constructor</p>
                <div className="bg-[#050505] border border-[#222] p-4 flex items-center justify-between rounded">
                  <span className="font-display font-bold text-lg text-white uppercase">
                    {typeof team.constructorId === 'string' ? team.constructorId.replace('_', ' ') : typeof team.constructor === 'string' ? team.constructor.replace('_', ' ') : 'N/A'}
                  </span>
                  <span className="text-[#ffd700] text-sm font-bold tracking-wider">${((team.totalCost || 0) / 1_000_000).toFixed(1)}M Cost</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-[#707070] mb-6">No squad locked in for this Grand Prix.</p>
              <button 
                onClick={() => router.push(`/team?raceId=${race._id}`)}
                className="bg-[#e8002d] text-white px-8 py-3 rounded uppercase font-bold tracking-widest text-sm hover:scale-105 transition-transform"
              >
                Create Team
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Actions & Predictions */}
        <div className="flex flex-col gap-6">
          
          {/* Race Status & Countdown */}
          <div className="border border-[#2a2a2a] bg-[#111] p-6 rounded-xl relative overflow-hidden group hover:border-[#444] transition-all">
            <h3 className="font-display font-bold text-sm text-[#707070] uppercase tracking-widest mb-4">Live Telemetry</h3>
            
            <div className="flex items-center justify-between mb-4 border border-[#333] bg-black/50 p-4 rounded">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full shadow-[0_0_10px_currentColor] ${race.status === 'upcoming' ? 'bg-[#ffd700] text-[#ffd700]' : race.status === 'active' ? 'bg-[#00d4aa] text-[#00d4aa]' : 'bg-[#e8002d] text-[#e8002d]'}`}></div>
                <span className="font-bold text-base text-white uppercase tracking-wider">{race.status}</span>
              </div>
            </div>

            {/* COUNTDOWN TIMER */}
            {race.status === 'upcoming' && raceCountdown && (
              <div className="mt-2 bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-[#333] rounded-lg p-5">
                <p className="text-[10px] text-[#e8002d] uppercase tracking-widest font-bold mb-3">T-Minus / Race Start</p>
                <div className="grid grid-cols-4 gap-2 text-center items-end">
                   <div className="flex flex-col">
                     <span className="font-display font-black text-3xl text-white">{String(raceCountdown.d).padStart(2, '0')}</span>
                     <span className="text-[#a0a0a0] text-[9px] uppercase tracking-widest">Days</span>
                   </div>
                   <div className="flex flex-col border-l border-[#333]">
                     <span className="font-display font-black text-3xl text-white">{String(raceCountdown.h).padStart(2, '0')}</span>
                     <span className="text-[#a0a0a0] text-[9px] uppercase tracking-widest">Hrs</span>
                   </div>
                   <div className="flex flex-col border-l border-[#333]">
                     <span className="font-display font-black text-3xl text-white">{String(raceCountdown.m).padStart(2, '0')}</span>
                     <span className="text-[#a0a0a0] text-[9px] uppercase tracking-widest">Mins</span>
                   </div>
                   <div className="flex flex-col border-l border-[#333]">
                     <span className="font-display font-black text-3xl text-[#e8002d]">{String(raceCountdown.s).padStart(2, '0')}</span>
                     <span className="text-[#a0a0a0] text-[9px] uppercase tracking-widest">Secs</span>
                   </div>
                </div>
              </div>
            )}

            <div className="mt-6 border-t border-[#333] pt-4">
               <div className="flex justify-between items-center text-xs text-[#a0a0a0] mb-2 uppercase tracking-widest">
                  <span>Qualifying</span>
                  <span className="text-white">{new Date(race.qualifyingDate).toLocaleDateString()}</span>
               </div>
               <div className="flex justify-between items-center text-xs text-[#a0a0a0] uppercase tracking-widest">
                  <span>Race Day</span>
                  <span className="text-[#e8002d] font-bold">{new Date(race.raceDate).toLocaleDateString()}</span>
               </div>
            </div>
          </div>

          {/* POLL SECTION (Only shown if race is upcoming/qualifying) */}
          {!isRaceActive && (
            <div className="border border-[#2a2a2a] bg-[#1a1a1a] p-6 rounded-xl flex flex-col justify-center items-start relative shadow-lg group hover:border-[#e8002d]/50 transition-colors">
              <div className="flex items-center gap-2 mb-4 w-full justify-between">
                <h3 className="font-display font-bold text-sm text-white uppercase tracking-widest">Fan Poll</h3>
                <span className="bg-[#e8002d] text-white text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider animate-pulse">Live</span>
              </div>
              <p className="text-[#a0a0a0] text-xs font-semibold mb-4 tracking-wide leading-relaxed">
                Who will cross the finish line first on Sunday?
              </p>

              <div className="w-full space-y-2">
                {pollResults.map(option => (
                  <div key={option.id} className="relative w-full">
                     <button 
                       onClick={() => !pollVoted && handleVote(option.id)}
                       disabled={pollVoted}
                       className="w-full relative z-10 flex justify-between items-center px-4 py-3 bg-transparent border border-[#333] rounded text-xs font-bold text-white uppercase tracking-wider hover:bg-white/5 transition-colors focus:outline-none"
                     >
                        <span>{option.label}</span>
                        {pollVoted && <span className="text-[#00d4aa]">{option.percent}%</span>}
                     </button>
                     {pollVoted && (
                       <div 
                         className="absolute top-0 left-0 h-full bg-[#00d4aa]/20 border border-[#00d4aa]/50 rounded z-0 transition-all duration-1000 ease-out"
                         style={{ width: `${option.percent}%` }}
                       />
                     )}
                  </div>
                ))}
              </div>
              {!pollVoted ? (
                 <p className="w-full text-center mt-4 text-[10px] text-[#707070] uppercase tracking-widest">Select an option to cast your vote</p>
              ) : (
                 <p className="w-full text-center mt-4 text-[10px] text-[#00d4aa] uppercase tracking-widest font-bold">Vote Recorded ✓</p>
              )}
            </div>
          )}

          {/* Predictions C2A (Only shown if upcoming) */}
          {!isRaceActive && (
            <>
              <div className="border border-[#2a2a2a] bg-gradient-to-br from-[#111] to-[#050505] p-6 rounded-xl flex flex-col justify-center items-center text-center shadow-lg relative overflow-hidden group">
              <div className="absolute inset-0 transition-opacity opacity-0 group-hover:opacity-100 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#e8002d]/10 via-transparent to-transparent pointer-events-none"></div>
              <h3 className="font-display font-bold text-xl text-white uppercase tracking-widest mb-2 relative z-10">Match Predictions</h3>
              <p className="text-[#707070] text-xs mb-6 max-w-[200px] leading-relaxed relative z-10">
                Boost your overall score by spending GameCoins on live race events.
              </p>
              <button 
                onClick={() => router.push(`/predict/${race._id}`)}
                className="w-full py-4 border border-[#e8002d] text-[#e8002d] font-bold uppercase tracking-[0.2em] text-xs rounded hover:bg-[#e8002d] hover:text-white transition-all relative z-10"
              >
                Predict Now
              </button>
            </div>

            <div className="border border-[#2a2a2a] bg-[#111] p-6 rounded-xl flex-grow">
              <h3 className="font-display font-bold text-sm text-[#707070] uppercase tracking-widest mb-4">Race Status</h3>
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${race.status === 'upcoming' ? 'bg-[#00d4aa] animate-pulse' : 'bg-gray-500'}`}></div>
                <span className="font-bold text-lg text-white uppercase tracking-wider">{race.status}</span>
              </div>
              
              <div className="mt-8 border-t border-[#333] pt-6">
                 <div className="flex justify-between items-center text-xs text-[#a0a0a0] mb-2 uppercase tracking-widest">
                    <span>Qualifying</span>
                    <span className="text-white">{new Date(race.qualifyingDate).toLocaleDateString()}</span>
                 </div>
                 <div className="flex justify-between items-center text-xs text-[#a0a0a0] uppercase tracking-widest">
                    <span>Race Day</span>
                    <span className="text-[#e8002d] font-bold">{new Date(race.raceDate).toLocaleDateString()}</span>
                 </div>
              </div>
            </div>
          </>
          )}
          
        </div>
      </div>

      {/* LIVE RACE LEADERBOARD ROW */}
      {isRaceActive && (
        <div className="my-10 border border-[#2a2a2a] bg-[#111]/80 backdrop-blur rounded-xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-[#e8002d]/10 to-transparent pointer-events-none"></div>
          <div className="flex items-center justify-between border-b border-[#333] pb-6 mb-6">
            <h2 className="font-display font-black text-2xl text-white uppercase tracking-widest flex items-center gap-4">
              <span className="w-4 h-4 rounded-full bg-[#e8002d] animate-pulse"></span>
              Live Grid Updates
            </h2>
            <span className="text-[#a0a0a0] text-xs font-bold tracking-widest uppercase">Lap 24/57</span>
          </div>

          <div className="grid grid-cols-12 text-[#707070] text-[10px] font-bold uppercase tracking-widest mb-4 px-4">
            <div className="col-span-1">POS</div>
            <div className="col-span-5">Driver</div>
            <div className="col-span-3 text-right">Interval</div>
            <div className="col-span-3 text-right">Overtakes</div>
          </div>

          <div className="space-y-2">
            {/* Mock Live Data - In production, this would map over race.results or a Websocket stream */}
            {[
              { pos: 1, name: 'Max Verstappen', team: 'red_bull', int: 'LEADER', ot: 0, trend: 'same' },
              { pos: 2, name: 'Charles Leclerc', team: 'ferrari', int: '+ 4.23s', ot: 1, trend: 'up' },
              { pos: 3, name: 'Lando Norris', team: 'mclaren', int: '+ 6.11s', ot: 2, trend: 'up' },
              { pos: 4, name: 'Lewis Hamilton', team: 'ferrari', int: '+ 12.0s', ot: -1, trend: 'down' },
              { pos: 5, name: 'George Russell', team: 'mercedes', int: '+ 15.4s', ot: 0, trend: 'same' },
            ].map((d, i) => (
              <div key={i} className="grid grid-cols-12 items-center bg-[#1a1a1a] border border-[#333] hover:bg-[#222] transition-colors p-4 rounded-lg">
                <div className="col-span-1 flex items-center gap-2">
                  <span className="font-display font-black text-white text-lg">{d.pos}</span>
                  {d.trend === 'up' && <span className="text-[#00d4aa] text-[9px] font-bold">▲</span>}
                  {d.trend === 'down' && <span className="text-[#e8002d] text-[9px] font-bold">▼</span>}
                  {d.trend === 'same' && <span className="text-gray-500 text-[9px] font-bold">-</span>}
                </div>
                <div className="col-span-5 flex items-center gap-4 border-l-4 pl-3" style={{ borderColor: d.team === 'red_bull' ? '#3671C6' : d.team === 'ferrari' ? '#E8002D' : d.team === 'mclaren' ? '#FF8000' : '#27F4D2' }}>
                  <span className="text-white font-bold tracking-wider text-sm uppercase">{d.name}</span>
                </div>
                <div className="col-span-3 text-right">
                  <span className={`font-display font-bold tracking-widest text-[#a0a0a0] ${d.pos === 1 ? 'text-[#ffd700]' : ''}`}>{d.int}</span>
                </div>
                <div className="col-span-3 flex justify-end items-center">
                  <span className={`px-3 py-1 rounded text-xs font-bold ${d.ot > 0 ? 'bg-[#00d4aa]/20 text-[#00d4aa]' : d.ot < 0 ? 'bg-[#e8002d]/20 text-[#e8002d]' : 'text-gray-500'}`}>
                    {d.ot > 0 ? `+${d.ot}` : d.ot}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}