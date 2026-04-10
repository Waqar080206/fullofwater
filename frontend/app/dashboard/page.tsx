'use client';
import { useState, useRef, useEffect } from 'react';
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

export default function DashboardPage() 
{
  const [isSpinning, setIsSpinning] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [activeTeam, setActiveTeam] = useState<any>(null); // NEW: State to hold team
  const [teamLoading, setTeamLoading] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'model'; content: string }[]>([
    {
      role: 'model',
      content: "Welcome to LapLogic AI. How can I assist your prediction strategy today?",
    },
  ]);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  const { user, token } = useAuth();
  const router = useRouter();

  // Load team whenever token or user is available
  useEffect(() => {
    if (token) {
      setTeamLoading(true);
      // We don't have the race ID in context here easily without a raceAPI call!
      // So let's fetch upcoming race, then fetch team for that race
      const fetchTeamData = async () => {
        try {
          const res = await fetch('http://localhost:5000/api/race');
          const races = await res.json();
          const nextRace = races.find((r: any) => r.status === 'upcoming');
          
          if (nextRace) {
            const teamRes = await fetch(`http://localhost:5000/api/team/${nextRace._id}`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            if (teamRes.ok) {
              const teamData = await teamRes.json();
              setActiveTeam(teamData);
            }
          }
        } catch (err) {
          console.error("Failed fetching team data:", err);
        } finally {
          setTeamLoading(false);
        }
      };
      
      fetchTeamData();
    }
  }, [token]);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, isThinking]);

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;

    const userMessage = { role: 'user' as const, content: chatInput.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setChatInput('');
    setIsThinking(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [...prev, { role: 'model', content: data.reply }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: 'model', content: "Sorry, I'm experiencing radio interference on the pit wall right now. Could you repeat?" },
        ]);
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: 'model', content: "Box box. Communication system failure. Try again later." },
      ]);
    } finally {
      setIsThinking(false);
    }
  };

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

              {/* TEAM OVERVIEW - Show if team exists, otherwise show Arena join */}
              {teamLoading ? (
                <div className="bg-[#111] border border-[#222] p-4 text-center text-[#707070] animate-pulse">Loading Team Data...</div>
              ) : activeTeam ? (
                <div className="bg-[#111] border border-[#e8002d]/20 p-4 relative overflow-hidden transition-all hover:border-[#e8002d] cursor-pointer" onClick={() => router.push(`/predict/${activeTeam.raceId}`)}>
                   <div className="absolute right-0 top-0 h-full w-2 bg-[#e8002d]"></div>
                   <div className="flex justify-between items-center mb-2">
                     <p className="text-[#e8002d] text-xs uppercase tracking-widest font-bold">Active Team ({activeTeam.mode})</p>
                     <p className="text-[#707070] text-[10px] uppercase">Race 1</p>
                   </div>
                   <p className="font-display font-bold text-white text-lg truncate pr-3">
                     {activeTeam.drivers.map((dId: string) => {
                       // Find friendly name if possible, otherwise use ID
                       const friendly = { 'NOR': 'Norris', 'PIA': 'Piastri', 'RUS': 'Russell', 'ANT': 'Antonelli', 'LEC': 'Leclerc', 'HAM': 'Hamilton', 'VER': 'Verstappen', 'HAD': 'Hadjar', 'ALO': 'Alonso', 'STR': 'Stroll', 'ALB': 'Albon', 'SAI': 'Sainz', 'HUL': 'Hülkenberg', 'BOR': 'Bortoleto', 'GAS': 'Gasly', 'COL': 'Colapinto', 'OCO': 'Ocon', 'BEA': 'Bearman', 'LAW': 'Lawson', 'LIN': 'Lindblad', 'PER': 'Pérez', 'BOT': 'Bottas' }[dId];
                       return friendly || dId;
                     }).join(', ')}
                   </p>
                   <p className="text-[#a0a0a0] text-sm mb-3">Constructor: <span className="uppercase text-white">{activeTeam.constructor.replace('_', ' ')}</span></p>
                   <div className="flex justify-between">
                     <span className="font-display text-[#ffd700] text-sm shrink-0">Cost: ${(activeTeam.totalCost / 1_000_000).toFixed(1)}M</span>
                     <span className="text-[#00d4aa] text-xs uppercase tracking-widest font-bold cursor-pointer hover:underline">View Predictions →</span>
                   </div>
                </div>
              ) : (
                <div className="bg-gradient-to-r from-[#e8002d]/10 to-transparent border border-[#e8002d]/30 p-4 flex flex-col justify-center gap-3">
                   <p className="text-white text-sm">You haven't formed a team yet.</p>
                   <button onClick={handleJoinArena} className="bg-[#e8002d] w-full text-white py-2 font-display text-sm tracking-widest uppercase font-bold shadow-[0_0_15px_rgba(232,0,45,0.4)] hover:scale-105 transition-transform">
                      {isSpinning ? 'Ignition...' : 'Enter Arena'}
                   </button>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 mt-auto">
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

       {/* Bottom-Left: Join Community */}
<div className="border border-[#2a2a2a] bg-[#0a0a0a]/90 backdrop-blur-md rounded-bl-2xl rounded-tl-sm rounded-tr-sm rounded-br-sm p-6 flex flex-col relative overflow-hidden group hover:border-[#4a4a4a] transition-all">
  <div className="absolute top-0 left-0 w-48 h-48 bg-[#5865F2] opacity-[0.04] blur-3xl rounded-full pointer-events-none"></div>

  <div className="flex justify-between items-center mb-6 border-b border-[#222] pb-4">
    <h3 className="font-display font-bold text-lg text-[#a0a0a0] uppercase flex items-center gap-2">
      <span className="w-2 h-2 rounded-full bg-[#5865F2] animate-pulse"></span>
      Live Pit Wall Chat
    </h3>
  </div>

  <div className="flex-grow flex flex-col items-center justify-center gap-6 text-center mt-4">
    <p className="text-sm text-[#707070] max-w-xs">
      Connect with fellow F1 fans, share predictions, and get race-day updates in real time.
    </p>

    {/* Perspective wrapper for 3D tilt */}
    <div style={{ perspective: '600px' }}>
      <a
        href="https://discord.gg/sFMnVWYx"
        target="_blank"
        rel="noopener noreferrer"
        className="discord-3d-btn w-56 h-56 flex flex-col items-center justify-center gap-4 text-white font-bold text-sm uppercase tracking-widest rounded-2xl cursor-pointer border border-white/10 relative overflow-hidden transition-all duration-[120ms]"
        style={{
          background: 'linear-gradient(145deg, #6975f5, #5865F2 40%, #4752C4 80%, #3a41a8)',
          boxShadow: `
            0 1px 0 #8891f7 inset,
            0 -1px 0 #3a41a8 inset,
            0 4px 0 #3a41a8,
            0 8px 0 #2d3299,
            0 12px 0 #1e2266
          `,
          transform: 'translateY(0) rotateX(8deg)',
        }}
        onMouseEnter={e => {
          const el = e.currentTarget;
          el.style.transform = 'translateY(-6px) rotateX(4deg)';
          el.style.boxShadow = `
            0 1px 0 #8891f7 inset,
            0 -1px 0 #3a41a8 inset,
            0 6px 0 #3a41a8,
            0 12px 0 #2d3299,
            0 18px 0 #1e2266,
            0 20px 0 #141a55
          `;
        }}
        onMouseLeave={e => {
          const el = e.currentTarget;
          el.style.transform = 'translateY(0) rotateX(8deg)';
          el.style.boxShadow = `
            0 1px 0 #8891f7 inset,
            0 -1px 0 #3a41a8 inset,
            0 4px 0 #3a41a8,
            0 8px 0 #2d3299,
            0 12px 0 #1e2266
          `;
        }}
        onMouseDown={e => {
          const el = e.currentTarget;
          el.style.transform = 'translateY(8px) rotateX(10deg)';
          el.style.boxShadow = `
            0 1px 0 #8891f7 inset,
            0 -1px 0 #3a41a8 inset,
            0 2px 0 #3a41a8,
            0 4px 0 #2d3299
          `;
        }}
        onMouseUp={e => {
          const el = e.currentTarget;
          el.style.transform = 'translateY(-6px) rotateX(4deg)';
        }}
      >
        {/* Top-left sheen overlay */}
        <div className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 50%)' }}
        />
        <svg
          className="w-16 h-16 transition-all duration-200 group-hover:scale-110"
          style={{ filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.5)) drop-shadow(0 0 12px rgba(255,255,255,0.2))' }}
          viewBox="0 -28.5 256 256"
          fill="currentColor"
        >
          <path d="M216.856 16.597A208.502 208.502 0 0 0 164.042 0c-2.275 4.113-4.933 9.645-6.766 14.046-19.692-2.961-39.203-2.961-58.533 0-1.832-4.4-4.55-9.933-6.846-14.046a207.809 207.809 0 0 0-52.855 16.638C5.618 67.147-3.443 116.4 1.087 164.956c22.169 16.555 43.653 26.612 64.775 33.193A161.094 161.094 0 0 0 79.735 175.3a136.413 136.413 0 0 1-21.846-10.632 108.636 108.636 0 0 0 5.356-4.237c42.122 19.702 87.89 19.702 129.51 0a131.66 131.66 0 0 0 5.355 4.237 136.07 136.07 0 0 1-21.886 10.653c4.006 8.02 8.638 15.67 13.873 22.848 21.142-6.58 42.646-16.637 64.815-33.213 5.316-56.288-9.08-105.09-38.056-148.36ZM85.474 135.095c-12.645 0-23.015-11.805-23.015-26.18s10.149-26.2 23.015-26.2c12.867 0 23.236 11.804 23.015 26.2.02 14.375-10.148 26.18-23.015 26.18Zm85.051 0c-12.645 0-23.014-11.805-23.014-26.18s10.148-26.2 23.014-26.2c12.867 0 23.236 11.804 23.015 26.2 0 14.375-10.148 26.18-23.015 26.18Z"/>
        </svg>
        <span className="leading-snug" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
          Join Live<br/>Discussion
        </span>
      </a>
    </div>
  </div>
</div>


        {/* Bottom-Right: AI Chatbot */}
        <div className="border border-[#2a2a2a] bg-[#0a0a0a]/90 backdrop-blur-md rounded-br-2xl rounded-tr-sm rounded-tl-sm rounded-bl-sm p-6 flex flex-col relative overflow-hidden group hover:border-[#4a4a4a] transition-all">
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-purple-600 opacity-[0.05] blur-3xl rounded-full"></div>
          <div className="flex justify-center items-center mb-4 border-b border-[#222] pb-4">
            <h3 className="font-display font-bold text-lg text-[#a0a0a0] uppercase flex items-center justify-center gap-2 w-full">
              <img src="/laplogicai.png" alt="LapLogic AI" className="h-8 object-contain" />
            </h3>
          </div>
          {/* Message List */}
          <div
            ref={chatScrollRef}
            className="flex-grow flex flex-col overflow-y-auto mb-4 space-y-4 pr-2 scrollbar-thin scrollbar-thumb-[#2a2a2a] scrollbar-track-transparent scroll-smooth"
          >
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-xl max-w-[85%] text-sm text-[#ccc] whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-purple-900/30 border border-purple-500/30 self-end ml-auto rounded-tr-sm'
                    : 'bg-[#111] border border-[#222] rounded-tl-sm'
                }`}
              >
                <p>{msg.content}</p>
              </div>
            ))}
            {isThinking && (
              <div className="bg-[#111] border border-[#222] p-4 rounded-xl rounded-tl-sm w-fit text-[#ccc]">
                <p className="animate-pulse">Thinking...</p>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <div className="mt-auto relative shrink-0">
            <input
              type="text"
              placeholder="Ask for strategy inputs..."
              className="w-full bg-[#111] border border-[#222] rounded-full py-3 px-4 pr-12 text-sm text-[#ccc] focus:outline-none focus:border-purple-500 transition-colors"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSendMessage();
              }}
              disabled={isThinking}
            />
            <button
              onClick={handleSendMessage}
              disabled={isThinking || !chatInput.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-purple-600 text-white rounded-full hover:bg-purple-500 transition-colors disabled:opacity-50"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
              </svg>
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
