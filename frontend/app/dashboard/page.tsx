'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { raceAPI } from '../../lib/api';
import { User as UserIcon, Trophy, Coins, Flag, MessageSquare, Zap, Bot } from 'lucide-react';

export default function DashboardPage() {
  const [races, setRaces] = useState<any[]>([]);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    raceAPI.getAll().catch(() => []).then(setRaces);
  }, []);

  return (
    <div className="relative h-[calc(100vh-64px)] w-full bg-[#0a0a0a] p-4 lg:p-8 overflow-hidden">
      
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#e8002d] rounded-full opacity-[0.03] blur-[100px] pointer-events-none" />

      {/* Main 4-Quadrant Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 grid-rows-2 gap-4 lg:gap-8 h-full relative z-10 w-full max-w-[1600px] mx-auto">
        
        {/* TOP LEFT: USER PROFILE */}
        <div className="border border-[#2a2a2a] bg-[#111111]/80 backdrop-blur-md p-6 flex flex-col text-left group hover:border-[#e8002d]/50 transition-colors overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#e8002d]/5 rounded-bl-full pointer-events-none" />
          <div className="flex items-center gap-3 mb-6">
            <UserIcon className="text-[#e8002d] w-6 h-6" />
            <h2 className="font-display font-bold text-xl tracking-widest text-white">PILOT PROFILE</h2>
          </div>
          
          {user ? (
            <div className="flex-1 flex flex-col justify-center space-y-6">
              <div>
                <p className="text-[#a0a0a0] text-sm font-display tracking-widest mb-1">CALLSIGN</p>
                <p className="font-f1-black text-4xl uppercase text-white">{user.username}</p>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="border-l-2 border-[#e8002d] pl-4">
                  <p className="text-[#a0a0a0] text-xs font-display tracking-wider mb-1">RANK</p>
                  <p className="font-bold text-lg text-white flex items-center justify-start gap-2">
                    <Trophy className="w-4 h-4 text-[#ffd700]" /> {user.rankName}
                  </p>
                </div>
                <div className="border-l-2 border-[#e8002d] pl-4">
                  <p className="text-[#a0a0a0] text-xs font-display tracking-wider mb-1">POINTS</p>
                  <p className="font-bold text-lg text-white">{user.totalPoints}</p>
                </div>
                <div className="border-l-2 border-[#e8002d] pl-4">
                  <p className="text-[#a0a0a0] text-xs font-display tracking-wider mb-1">BUDGET</p>
                  <p className="font-bold text-lg text-[#00d4aa] flex items-center justify-start gap-2">
                    <Coins className="w-4 h-4" /> {(user.gameCoins / 1_000_000).toFixed(1)}M
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-[#555]">
              Loading telemetry...
            </div>
          )}
        </div>

        {/* TOP RIGHT: RACE UPDATES */}
        <div className="border border-[#2a2a2a] bg-[#111111]/80 backdrop-blur-md p-6 flex flex-col text-left group hover:border-[#e8002d]/50 transition-colors overflow-hidden relative">
          <div className="flex items-center gap-3 mb-6 pb-2 border-b border-[#2a2a2a]">
            <Flag className="text-[#e8002d] w-6 h-6" />
            <h2 className="font-display font-bold text-xl tracking-widest text-white">RACE CONTROL</h2>
          </div>
          <div className="flex-1 overflow-y-auto pr-2 space-y-4 scrollbar-thin">
            {races && races.length > 0 ? (
              races.map(race => (
                <div key={race._id} className="bg-[#1a1a1a] p-4 border-l-4 border-[#e8002d] hover:bg-[#222] transition cursor-pointer" onClick={() => router.push(`/predict/${race._id}`)}>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-white uppercase">{race.name}</h3>
                    <span className="text-xs text-[#a0a0a0] font-display">{new Date(race.date).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-[#a0a0a0] uppercase">{race.circuit}</p>
                </div>
              ))
            ) : (
              // Mock upcoming races for visual premium feel when DB is empty
              <>
                <div className="bg-[#1a1a1a] p-4 border-l-4 border-[#e8002d] hover:bg-[#222] transition cursor-pointer relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-16 h-full bg-gradient-to-l from-[#e8002d]/10 to-transparent pointer-events-none" />
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-lg text-white font-f1-black tracking-wide">BAHRAIN GRAND PRIX</h3>
                    <span className="text-[10px] bg-[#e8002d] text-white px-2 py-0.5 font-display animate-pulse uppercase">NEXT RACE</span>
                  </div>
                  <p className="text-sm text-[#a0a0a0] font-display">Bahrain International Circuit</p>
                </div>
                <div className="bg-[#1a1a1a] p-4 border-l-4 border-[#2a2a2a] opacity-50 hover:opacity-100 transition cursor-not-allowed">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-lg text-white font-f1-black tracking-wide">SAUDI ARABIAN GRAND PRIX</h3>
                    <span className="text-[10px] border border-[#2a2a2a] text-[#a0a0a0] px-2 py-0.5 font-display uppercase">MAR 18</span>
                  </div>
                  <p className="text-sm text-[#a0a0a0] font-display">Jeddah Corniche Circuit</p>
                </div>
                 <div className="bg-[#1a1a1a] p-4 border-l-4 border-[#2a2a2a] opacity-50 hover:opacity-100 transition cursor-not-allowed">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-lg text-white font-f1-black tracking-wide">AUSTRALIAN GRAND PRIX</h3>
                    <span className="text-[10px] border border-[#2a2a2a] text-[#a0a0a0] px-2 py-0.5 font-display uppercase">MAR 24</span>
                  </div>
                  <p className="text-sm text-[#a0a0a0] font-display">Albert Park Circuit</p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* BOTTOM LEFT: COMMUNITY CHAT */}
        <div className="border border-[#2a2a2a] bg-[#111111]/80 backdrop-blur-md p-6 flex flex-col text-left group hover:border-[#e8002d]/50 transition-colors overflow-hidden relative">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#2a2a2a]">
            <MessageSquare className="text-[#00d4aa] w-6 h-6" />
            <h2 className="font-display font-bold text-xl tracking-widest text-white">THE PADDOCK</h2>
            <div className="ml-auto flex items-center gap-2">
              <span className="text-[10px] text-[#a0a0a0] font-display">1.2K ONLINE</span>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00d4aa] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00d4aa]"></span>
              </span>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
            <div className="flex flex-col gap-1 w-4/5">
              <span className="text-[#e8002d] font-body font-bold text-xs uppercase">VortexRacer_99</span>
              <p className="text-sm text-[#d0d0d0] bg-[#1a1a1a] border border-[#2a2a2a] p-3 rounded-r-lg rounded-bl-lg">Verstappen is a lock for this weekend, anyone betting against?</p>
            </div>
            <div className="flex flex-col gap-1 w-4/5">
              <span className="text-[#00d4aa] font-body font-bold text-xs uppercase">AeroDynamics</span>
              <p className="text-sm text-[#d0d0d0] bg-[#1a1a1a] border border-[#2a2a2a] p-3 rounded-r-lg rounded-bl-lg">Budget cap is tight. Had to drop Perez for a midfield pick.</p>
            </div>
            <div className="flex flex-col gap-1 items-end w-4/5 ml-auto">
              <span className="text-[#a0a0a0] font-body font-bold text-xs uppercase">You</span>
              <p className="text-sm text-white bg-[#e8002d]/20 border border-[#e8002d]/30 p-3 rounded-l-lg rounded-br-lg">Watch out for Piastri, heavy upgrades coming.</p>
            </div>
          </div>
          
          <div className="relative mt-auto">
            <input 
              type="text" 
              placeholder="Send message to Paddock..." 
              className="w-full bg-[#1a1a1a] border border-[#2a2a2a] p-3 pr-10 text-sm text-white focus:outline-none focus:border-[#e8002d] transition-colors rounded-none placeholder:font-display placeholder:text-xs"
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 text-[#a0a0a0] hover:text-[#e8002d] transition-colors p-2">
              <Zap className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* BOTTOM RIGHT: AI CHATBOT */}
        <div className="border border-[#2a2a2a] bg-[#111111]/80 backdrop-blur-md p-6 flex flex-col text-left group hover:border-[#e8002d]/50 transition-colors overflow-hidden relative">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#2a2a2a]">
            <Bot className="text-[#e8002d] w-6 h-6" />
            <h2 className="font-display font-bold text-xl tracking-widest text-white">RACE ENGINEER AI</h2>
            <div className="ml-auto flex items-center justify-center bg-[#e8002d]/10 border border-[#e8002d]/30 px-2 py-1">
              <span className="text-[10px] text-[#e8002d] font-display uppercase tracking-widest blink">ONLINE</span>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
             <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded bg-[#e8002d]/20 border border-[#e8002d]/50 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-[#e8002d]" />
              </div>
              <div className="bg-[#1a1a1a] p-4 border border-[#2a2a2a] rounded-bl-none text-sm text-[#d0d0d0] leading-relaxed">
                Welcome back{user ? `, ${user.username}` : ''}. Weather forecast for Bahrain shows a 0% chance of rain. Tire deg will be the primary factor. Need strategy advice?
              </div>
             </div>
          </div>

          <div className="relative mt-auto">
            <input 
              type="text" 
              placeholder="Ask for stats, weather, or strategy..." 
              className="w-full bg-[#1a1a1a] border border-[#2a2a2a] p-3 text-sm text-white focus:outline-none focus:border-[#e8002d] transition-colors rounded-none placeholder:font-display placeholder:text-xs"
            />
          </div>
        </div>

      </div>

      {/* ABSOLUTE CENTER BUTTON */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center">
        <button 
          onClick={() => router.push('https://lap-logic-v1-2-n7ll.vercel.app/')}
          className="relative group block"
        >
          {/* Intense Outer Glow */}
          <div className="absolute -inset-2 bg-[#e8002d] opacity-50 blur-xl group-hover:opacity-100 group-hover:blur-2xl transition duration-500 rounded-full" />
          {/* Button core */}
          <div className="relative flex items-center justify-center w-72 h-20 bg-[#0a0a0a] border-2 border-[#e8002d] overflow-hidden group-active:scale-95 transition-transform">
            {/* Glossy sweeping effect */}
            <div className="absolute top-0 bottom-0 left-[-100%] w-[50%] bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:left-[200%] transition-all duration-[1.5s] ease-in-out skew-x-12" />
            <span className="font-f1-black text-2xl tracking-[0.2em] text-white whitespace-nowrap">JOIN ARENA</span>
          </div>
        </button>
      </div>

    </div>
  );
}