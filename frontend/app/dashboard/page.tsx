'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

// Hardcoded Miami GP data crafted to emulate an API response payload
const upcomingRace = {
  event: "Formula 1 Crypto.com Miami Grand Prix 2026",
  date: "Sunday, May 3, 2026",
  location: {
    venue: "Miami International Autodrome",
    campus: "Hard Rock Stadium",
    city: "Miami Gardens, FL",
    timezone: "EDT (UTC-4)"
  },
  race_details: {
    round: 4,
    start_time: "16:00 Local / 01:30 IST",
    laps: 57,
    track_length: "5.41 km",
    total_distance: "308.326 km",
    corners: 19,
    drs_zones: 3
  },
  fan_experience: {
    highlights: [
      "First US race of the 2026 season",
      "Features new 2026 technical regulations",
      "Most Dominant Driver: Max Verstappen",
      "Most Dominant Team: McLaren"
    ]
  }
};

export default function DashboardPage() {
  const [isSpinning, setIsSpinning] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  const handleJoinArena = () => {
    setIsSpinning(true);
    setTimeout(() => {
      router.push('/arena');
    }, 1200); // 1.2s delay to show off the high-speed tire spin animation
  };

  return (
    <div className="relative min-h-[calc(100vh-80px)] p-4 max-w-[1800px] mx-auto overflow-hidden text-gray-100">
      
      {/* 2x2 Tight Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 lg:grid-rows-2 gap-2 h-full min-h-[88vh] relative">
        
        {/* Top-Left: User Profile */}
        <div className="border border-[#2a2a2a] bg-black/80 backdrop-blur-md rounded-tl-2xl rounded-tr-sm rounded-br-sm rounded-bl-sm p-8 flex flex-col justify-center relative overflow-hidden group hover:border-[#4a4a4a] transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#e8002d] opacity-[0.05] blur-3xl rounded-full"></div>
          <h3 className="font-display font-bold text-xl text-[#a0a0a0] mb-6 tracking-widest uppercase">Driver Profile</h3>
          {user ? (
            <div className="space-y-6 flex-grow flex flex-col justify-center">
              <div>
                <p className="text-[#707070] text-sm uppercase tracking-wider mb-1">Pilot</p>
                <p className="font-display font-bold text-4xl">{user.username}</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-[#111111] p-4 border border-[#222]">
                  <p className="text-[#707070] text-xs uppercase tracking-wider mb-1">Rank</p>
                  <p className="font-display font-bold text-[#e8002d] text-2xl uppercase">{user.rankName}</p>
                </div>
                <div className="bg-[#111111] p-4 border border-[#222]">
                  <p className="text-[#707070] text-xs uppercase tracking-wider mb-1">Points</p>
                  <p className="font-display font-bold text-2xl">{user.totalPoints}</p>
                </div>
              </div>
              <div className="bg-[#111111] p-4 border border-[#222] flex justify-between items-center">
                <p className="text-[#707070] text-sm uppercase tracking-wider">GameCoins</p>
                <p className="font-display font-bold text-[#ffd700] text-2xl">
                  {(user.gameCoins / 1_000_000).toFixed(1)}M
                </p>
              </div>
            </div>
          ) : (
            <div className="flex-grow flex items-center justify-center">
              <p className="text-[#707070] animate-pulse">Loading Telemetry...</p>
            </div>
          )}
        </div>

        {/* Top-Right: Premium Race Updates */}
        <div className="border border-[#2a2a2a] bg-black/80 backdrop-blur-md rounded-tr-2xl rounded-tl-sm rounded-br-sm rounded-bl-sm p-8 flex flex-col relative overflow-hidden group hover:border-[#4a4a4a] transition-all">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 opacity-[0.03] blur-3xl rounded-full pointer-events-none"></div>
          
          <div className="flex justify-between items-end mb-6 border-b border-[#222] pb-4">
            <h3 className="font-display font-bold text-xl text-[#a0a0a0] tracking-widest uppercase flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
              Next Grand Prix
            </h3>
            <span className="text-[#e8002d] font-bold text-sm tracking-widest uppercase">Round {upcomingRace.race_details.round}</span>
          </div>

          <div className="flex-grow overflow-y-auto pr-2 space-y-4 scrollbar-thin scrollbar-thumb-[#2a2a2a] scrollbar-track-transparent">
            {/* Main Event Card */}
            <div className="relative p-5 border border-[#333] bg-gradient-to-br from-[#111] to-[#050505] overflow-hidden group-hover:border-[#555] transition-colors">
              <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-blue-900/10 to-transparent pointer-events-none"></div>
              <h4 className="font-display font-bold text-2xl text-white mb-2 uppercase tracking-wide leading-tight shadow-sm">
                {upcomingRace.event}
              </h4>
              <p className="text-[#00e5ff] font-medium text-xs tracking-widest uppercase mb-4">
                {upcomingRace.date} • {upcomingRace.race_details.start_time}
              </p>
              
              <div className="flex items-start gap-4">
                 <div className="w-10 h-10 rounded border border-[#444] flex items-center justify-center bg-[#1a1a1a] shrink-0 text-gray-400 shadow-inner">
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                 </div>
                 <div>
                   <p className="text-sm font-bold text-gray-200">{upcomingRace.location.venue}</p>
                   <p className="text-xs text-gray-500 mt-1">{upcomingRace.location.city} • {upcomingRace.location.campus}</p>
                 </div>
              </div>
            </div>

            {/* Telemetry Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-[#0a0a0a] border border-[#222] p-3 text-center flex flex-col justify-center shadow-inner">
                <p className="text-[9px] text-[#707070] uppercase tracking-widest mb-1">Laps</p>
                <p className="font-display font-bold text-xl text-white">{upcomingRace.race_details.laps}</p>
              </div>
              <div className="bg-[#0a0a0a] border border-[#222] p-3 text-center flex flex-col justify-center shadow-inner">
                <p className="text-[9px] text-[#707070] uppercase tracking-widest mb-1">Circuit</p>
                <p className="font-display font-bold tracking-wide text-md text-white">{upcomingRace.race_details.track_length}</p>
              </div>
              <div className="bg-[#0a0a0a] border border-[#222] p-3 text-center flex flex-col justify-center shadow-inner">
                <p className="text-[9px] text-[#707070] uppercase tracking-widest mb-1">DRS</p>
                <p className="font-display font-bold text-xl text-white">{upcomingRace.race_details.drs_zones} Zones</p>
              </div>
            </div>

            {/* Highlights */}
            <div className="p-4 border border-[#222] bg-[#0a0a0a]">
              <p className="text-[10px] text-[#e8002d] uppercase tracking-widest font-bold mb-3">Fan Experience</p>
              <ul className="space-y-2">
                {upcomingRace.fan_experience.highlights.map((hl, i) => (
                  <li key={i} className="text-xs text-gray-400 flex items-start gap-2 leading-relaxed">
                    <span className="text-[#e8002d] mt-[3px] text-[8px]">▶</span>
                    <span>{hl}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom-Left: Community Chat (Discord-like) */}
        <div className="border border-[#2a2a2a] bg-[#0a0a0a]/90 backdrop-blur-md rounded-bl-2xl rounded-tl-sm rounded-tr-sm rounded-br-sm p-6 flex flex-col relative overflow-hidden group hover:border-[#4a4a4a] transition-all">
          <div className="flex justify-between items-center mb-4 border-b border-[#222] pb-4">
            <h3 className="font-display font-bold text-lg text-[#a0a0a0] uppercase flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Paddock Club
            </h3>
            <span className="text-xs text-[#707070]">142 Online</span>
          </div>
          <div className="flex-grow overflow-y-auto mb-4 space-y-4 pr-2 scrollbar-thin scrollbar-thumb-[#2a2a2a] scrollbar-track-transparent">
            {/* Mock Chat Messages */}
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-[#1a1a1a] flex items-center justify-center font-bold text-xs border border-[#333]">V</div>
              <div>
                <p className="text-sm font-bold text-[#ccc]">VerstappenFan <span className="text-[10px] text-[#555] font-normal ml-2">10:42 AM</span></p>
                <p className="text-sm text-[#999]">Did anyone check the new aero upgrades for Ferrari?</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-[#1a1a1a] flex items-center justify-center font-bold text-xs border border-[#333] text-[#e8002d]">S</div>
              <div>
                <p className="text-sm font-bold text-[#e8002d]">ScuderiaTifosi <span className="text-[10px] text-[#555] font-normal ml-2">10:43 AM</span></p>
                <p className="text-sm text-[#999]">Yeah, looking solid for Q3 today.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-[#1a1a1a] flex items-center justify-center font-bold text-xs border border-[#333]">L</div>
              <div>
                <p className="text-sm font-bold text-[#ccc]">Lewis4Life <span className="text-[10px] text-[#555] font-normal ml-2">10:45 AM</span></p>
                <p className="text-sm text-[#999]">Wait until the race pace settles.</p>
              </div>
            </div>
          </div>
          <div className="mt-auto">
            <input 
              type="text" 
              placeholder="Message #paddock-club..." 
              className="w-full bg-[#111] border border-[#222] rounded py-3 px-4 text-sm text-[#ccc] focus:outline-none focus:border-[#e8002d] transition-colors"
            />
          </div>
        </div>

        {/* Bottom-Right: AI Chatbot */}
        <div className="border border-[#2a2a2a] bg-[#0a0a0a]/90 backdrop-blur-md rounded-br-2xl rounded-tr-sm rounded-tl-sm rounded-bl-sm p-6 flex flex-col relative overflow-hidden group hover:border-[#4a4a4a] transition-all">
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-purple-600 opacity-[0.05] blur-3xl rounded-full"></div>
          <div className="flex justify-between items-center mb-4 border-b border-[#222] pb-4">
            <h3 className="font-display font-bold text-lg text-[#a0a0a0] uppercase flex items-center gap-2">
              <span className="text-purple-500">❖</span> Race Engineer AI
            </h3>
            <span className="text-xs text-purple-500 border border-purple-500/30 px-2 py-1 bg-purple-500/10">Active</span>
          </div>
          <div className="flex-grow overflow-y-auto mb-4 space-y-4 pr-2 scrollbar-thin scrollbar-thumb-[#2a2a2a] scrollbar-track-transparent">
             <div className="bg-[#111] border border-[#222] p-4 rounded-xl rounded-tl-sm w-[85%]">
              <p className="text-sm text-[#ccc]">Welcome to the pit wall. I've analyzed the historical data for the upcoming Grand Prix. Weather models suggest a 40% chance of rain. How can I assist your prediction strategy today?</p>
             </div>
          </div>
          <div className="mt-auto relative">
            <input 
              type="text" 
              placeholder="Ask for strategy inputs..." 
              className="w-full bg-[#111] border border-[#222] rounded-full py-3 px-4 pr-12 text-sm text-[#ccc] focus:outline-none focus:border-purple-500 transition-colors"
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-purple-600 text-white rounded-full hover:bg-purple-500 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
            </button>
          </div>
        </div>

        {/* Absolute Center: F1 Pirelli Tire JOIN ARENA Button */}
        <div className="hidden lg:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 items-center justify-center p-3 bg-[#050505] rounded-full border border-[#222] pointer-events-auto shadow-[0_0_50px_rgba(0,0,0,0.8)]">
          <button 
            onClick={handleJoinArena}
            className={`relative w-36 h-36 rounded-full flex flex-col items-center justify-center text-white font-display font-bold uppercase tracking-widest transition-all duration-700 ease-in-out group overflow-hidden ${
              isSpinning ? 'scale-90' : 'scale-100 hover:scale-105'
            }`}
          >
            {/* The Tire Base (Rubber) */}
            <div className={`absolute inset-0 w-full h-full rounded-full bg-[#111] shadow-[inset_0_0_20px_#000,0_0_15px_rgba(0,0,0,0.9)] border-[4px] border-[#0a0a0a] transition-all duration-300 overflow-hidden ${isSpinning ? 'animate-[spin_0.15s_linear_infinite]' : 'group-hover:animate-[spin_3s_linear_infinite]'}`}>
              
              {/* Pirelli Red Sidewall Stripe (Soft Compound) */}
              <div className="absolute inset-2 rounded-full border-4 border-[#e8002d] border-dashed opacity-80 border-spacing-4 mix-blend-screen shadow-[0_0_10px_rgba(232,0,45,0.7)]"></div>
              <div className="absolute inset-[10px] rounded-full border-2 border-[#e8002d] opacity-70"></div>
              
              {/* Inner Metallic Wheel Rim */}
              <div className="absolute inset-[24px] rounded-full bg-gradient-to-br from-[#222] to-[#0a0a0a] shadow-[inset_0_0_25px_#000] border-2 border-[#1a1a1a] flex items-center justify-center">
                {/* 3-Spoke Design */}
                {[0, 60, 120].map((deg) => (
                  <div key={deg} className="absolute w-[110%] h-[6px] bg-gradient-to-r from-[#111] via-[#333] to-[#111] shadow-black shadow-sm" style={{ transform: `rotate(${deg}deg)` }}></div>
                ))}
                
                {/* Center Titanium Nut locking the wheel */}
                <div className="absolute w-8 h-8 bg-gradient-to-br from-[#333] to-black rounded-full border-2 border-[#444] z-10 shadow-[0_0_15px_rgba(0,0,0,1)] flex items-center justify-center">
                   <div className="w-3 h-3 bg-[#e8002d] rounded-full shadow-[0_0_10px_#e8002d]"></div>
                </div>
              </div>
            </div>

            {/* Overlay Text Plate (Remains Upright) */}
            <div className={`absolute z-20 flex flex-col items-center justify-center px-4 py-2 bg-gradient-to-b from-black/80 to-black/60 backdrop-blur-[4px] rounded border border-white/20 shadow-2xl ${isSpinning ? 'opacity-0 scale-50' : 'opacity-100 scale-100'} transition-all duration-300 pointer-events-none`}>
              <span className="text-[10px] text-[#e8002d] font-bold uppercase tracking-widest leading-none mb-1 shadow-black drop-shadow-md">Join</span>
              <span className="text-[14px] text-white font-display font-bold uppercase tracking-wider leading-none shadow-black drop-shadow-md">Arena</span>
            </div>
            
            {/* Spinning Motion Blur/Burnout Effect Overlay */}
            {isSpinning && (
               <div className="absolute inset-0 rounded-full border-[10px] border-transparent border-t-[#e8002d]/80 opacity-70 animate-[spin_0.08s_linear_infinite] z-30 pointer-events-none mix-blend-screen shadow-[0_0_20px_#e8002d]"></div>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}