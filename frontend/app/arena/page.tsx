'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ArenaPage() {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [rulesAccepted, setRulesAccepted] = useState(false);
  const [rulesChecked, setRulesChecked] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const handleAcceptRules = () => {
    if (rulesChecked) {
      setRulesAccepted(true);
    }
  };

  return (
    <>
      {/* Rules & Regulations Modal Overlay */}
      {!rulesAccepted && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-10 bg-[#050505]/70 backdrop-blur-xl animate-in fade-in duration-500">
          <div className="w-full max-w-[80vw] h-[80vh] flex flex-col bg-gradient-to-br from-[#151515] to-[#0a0a0a] border border-white/10 rounded-3xl shadow-[0_0_60px_rgba(232,0,45,0.15)] relative overflow-hidden">
            
            {/* Premium modal styling */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#e8002d] to-transparent opacity-80"></div>
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#e8002d] opacity-10 blur-3xl rounded-full pointer-events-none"></div>
            <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20 pointer-events-none"></div>

            {/* Modal Header */}
            <div className="p-8 md:p-10 border-b border-white/5 shrink-0 z-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <p className="text-[#e8002d] font-bold tracking-[0.3em] uppercase text-xs mb-2 drop-shadow-md">Notice</p>
                <h2 className="font-display font-black text-3xl md:text-5xl tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-gray-200 to-gray-500 uppercase drop-shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
                  Arena <span className="text-transparent bg-clip-text bg-gradient-to-b from-[#ff3355] to-[#a0001a]">DISCLOSURE</span>
                </h2>
              </div>
            </div>

            {/* Scrollable Rules Content */}
            <div className="flex-grow overflow-y-auto p-8 md:p-12 text-gray-300 font-light leading-relaxed scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent space-y-6 z-10 text-[15px] md:text-[17px] text-justify bg-white/[0.02]">
              <p>
                Welcome to the Arena. All race telemetry, driver standings, and historical data provided within the Arena are <span className="font-bold text-white">for entertainment and predictive modeling purposes only</span>. We do not guarantee zero latency in live data feeds, and <span className="font-bold text-white">strategic decisions made by pilots are final upon lock-in</span>. 
              </p>

              <p>
                <span className="font-bold text-white uppercase tracking-wider">Financial Risk Disclosure:</span> Entry into the Pro Grid Championship requires a <span className="font-bold text-white">non-refundable GameCoin stake</span>. You are competing in high-stakes environments where <span className="font-bold text-white">real digital money and financial assets are at risk</span>. Payouts are distributed based on a dynamic pool system driven by global pilot participation. <span className="font-bold text-white">Smart contracts deployed natively execute all championship payouts automatically</span>.
              </p>

              <p>
                Any use of automated bots, exploit scripts, or multi-account coordination to manipulate odds or payouts is <span className="font-bold text-white">strictly prohibited</span>. Violators will face <span className="font-bold text-white">immediate banishment from the Pro Grid and forfeiture of all accumulated GameCoin (GC) balances</span>.
              </p>

              <p>
                Furthermore, in the event of real-world race cancellations, track red-flags, or FIA post-race penalties, the Arena stewards reserve the right to <span className="font-bold text-white">nullify, refund, or retroactively adjust championship points</span> and coin distributions to maintain total grid integrity. By confirming below, you acknowledge and agree to abide by the entirety of the Arena Sporting Code and accept the unyielding nature of the circuit.
              </p>
            </div>

            {/* Modal Footer (Action Area) */}
            <div className="p-4 md:p-6 border-t border-white/5 shrink-0 z-10 bg-black/40 flex flex-col sm:flex-row items-center justify-between gap-4 relative">
              <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
              
              <label className="flex items-center gap-3 cursor-pointer group w-full sm:w-auto md:ml-4">
                <div className="relative flex items-center justify-center w-5 h-5 shrink-0">
                  <input 
                    type="checkbox" 
                    className="peer sr-only"
                    checked={rulesChecked}
                    onChange={(e) => setRulesChecked(e.target.checked)}
                  />
                  <div className="w-5 h-5 border border-gray-600 rounded bg-[#111] shadow-inner peer-checked:bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIzIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwb2x5bGluZSBwb2ludHM9IjIwIDYgOSAxNyA0IDEyIj48L3BvbHlsaW5lPjwvc3ZnPg==')] peer-checked:border-[#e8002d] peer-checked:bg-[#e8002d] bg-no-repeat bg-center bg-[length:12px_12px] transition-all group-hover:border-gray-400 peer-checked:group-hover:border-[#ff3355]"></div>
                </div>
                <span className="text-xs md:text-sm text-gray-400 group-hover:text-gray-200 transition-colors uppercase tracking-[0.15em]">
                  I accept the Arena Sporting Code
                </span>
              </label>

              <button 
                onClick={handleAcceptRules}
                disabled={!rulesChecked}
                className={`px-8 py-3 rounded-full uppercase text-[10px] md:text-xs tracking-[0.2em] font-bold transition-all duration-500 focus:outline-none flex-shrink-0 w-full sm:w-auto md:mr-4 ${
                  rulesChecked 
                    ? 'bg-[#e8002d] text-white shadow-[0_0_20px_rgba(232,0,45,0.4)] hover:shadow-[0_0_30px_rgba(232,0,45,0.6)] hover:bg-[#ff1a40] hover:scale-[1.02]' 
                    : 'bg-white/5 text-gray-600 border border-white/5 cursor-not-allowed'
                }`}
              >
                Enter Grid
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Page Content (Blurred if rules not accepted) */}
      <div className={`relative min-h-[calc(100vh-80px)] p-6 max-w-[1800px] mx-auto flex flex-col gap-6 text-gray-100 transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        !rulesAccepted ? 'blur-xl scale-[0.98] opacity-30 pointer-events-none select-none' : 'blur-0 scale-100 opacity-100'
      }`}>
      
      {/* Top 30%: Horizontal Banner Element */}
      <div className="h-[30vh] min-h-[280px] rounded-3xl border border-white/5 bg-gradient-to-b from-[#111] to-[#050505] p-10 relative overflow-hidden flex flex-col justify-center items-center text-center shadow-2xl">
        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#e8002d]/10 via-[#0a0a0a]/80 to-[#050505]"></div>
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#e8002d] opacity-10 blur-3xl rounded-full pointer-events-none"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20 pointer-events-none"></div>
        
        <p className="text-[#e8002d] font-bold tracking-[0.3em] uppercase text-xs md:text-sm mb-4 z-10 drop-shadow-md">Select Your Event</p>
        <h1 className="font-display font-black text-5xl md:text-7xl tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-gray-200 to-gray-500 uppercase z-10 drop-shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
          The <span className="text-transparent bg-clip-text bg-gradient-to-b from-[#ff3355] to-[#a0001a]">Arena</span>
        </h1>
        <p className="mt-6 text-gray-400 max-w-2xl text-base md:text-lg font-light leading-relaxed z-10">
          Establish your legacy. Master the telemetry, predict the unpredictable, and battle against a global grid of elite pilots for track supremacy.
        </p>
      </div>

      {/* Bottom 70%: Split Content */}
      <div className="flex-grow flex flex-col lg:flex-row gap-6 h-auto min-h-[55vh]">
        
        {/* Left 50%: Game Modes */}
        <div className="w-full lg:w-1/2 flex flex-col gap-6">
          
          {/* Option 1: Free Practice */}
          <button 
            onClick={() => router.push('/team?mode=free')}
            className="flex-1 rounded-3xl border border-white/5 bg-gradient-to-br from-[#121212] to-[#0a0a0a] p-8 group hover:border-emerald-500/30 hover:bg-[#151515] transition-all duration-500 relative overflow-hidden flex flex-col justify-center items-start text-left focus:outline-none shadow-xl"
          >
            <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-emerald-500/5 to-transparent pointer-events-none transition-opacity duration-700 opacity-0 group-hover:opacity-100"></div>
            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/0 via-transparent to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

            <div className="flex items-center gap-3 mb-4">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]"></span>
              <p className="text-emerald-400 text-[10px] uppercase font-bold tracking-[0.25em]">Unranked • No Entry Fee</p>
            </div>
            
            <h3 className="font-display font-bold text-3xl md:text-4xl text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 tracking-tight uppercase mb-4 group-hover:from-white group-hover:to-emerald-100 transition-all duration-500">
              Free Practice
            </h3>
            
            <p className="text-gray-400 font-light leading-relaxed mb-8 max-w-md text-sm md:text-base group-hover:text-gray-300 transition-colors">
              Analyze historical data and experiment with strategic predictions. A perfect proving ground to refine your race-day approach without risking your bankroll.
            </p>
            
            <div className="mt-auto flex items-center justify-between w-full">
              <span className="px-8 py-3 rounded-full border border-white/10 uppercase text-[11px] tracking-[0.2em] font-bold text-gray-300 group-hover:bg-emerald-500 group-hover:border-emerald-500 group-hover:text-black group-hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all duration-500">
                Enter Track
              </span>
            </div>
          </button>

          {/* Option 2: Pro Grid (Paid) */}
          <button 
            onClick={() => router.push('/team?mode=pro')}
            className="flex-1 rounded-3xl border border-white/5 bg-gradient-to-br from-[#151212] to-[#080505] p-8 group hover:border-[#e8002d]/40 hover:bg-[#1a1111] transition-all duration-500 relative overflow-hidden flex flex-col justify-center items-start text-left shadow-2xl focus:outline-none"
          >
            <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-[#e8002d]/10 to-transparent pointer-events-none transition-opacity duration-700 opacity-50 group-hover:opacity-100"></div>
            <div className="absolute inset-0 bg-gradient-to-tr from-[#e8002d]/0 via-transparent to-[#e8002d]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
            
            <div className="absolute top-8 right-8 px-4 py-1.5 bg-gradient-to-r from-[#ffd700]/20 to-[#ffd700]/5 border border-[#ffd700]/30 rounded-full text-[#ffd700] text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-2 shadow-[0_0_15px_rgba(255,215,0,0.15)] overflow-hidden">
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
              High Stakes
            </div>
            
            <div className="flex items-center gap-3 mb-4">
              <span className="w-2 h-2 rounded-full bg-[#e8002d] shadow-[0_0_10px_rgba(232,0,45,0.8)] animate-pulse"></span>
              <p className="text-[#e8002d] text-[10px] uppercase font-bold tracking-[0.25em]">Ranked Championship</p>
            </div>

            <h3 className="font-display font-black text-3xl md:text-4xl text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300 tracking-tight uppercase mb-4 group-hover:from-white group-hover:to-[#ffcccc] transition-all duration-500">
              Pro Grid
            </h3>
            
            <p className="text-gray-400 font-light leading-relaxed mb-8 max-w-md text-sm md:text-base group-hover:text-gray-300 transition-colors">
              Compete in the premier tier of racing strategy. Lock in your predictions, back them with GameCoins, and outsmart the grid to claim massive payouts and global glory.
            </p>
            
            <div className="mt-auto w-full flex items-center justify-between">
              <span className="px-8 py-3 rounded-full bg-[#e8002d] text-white uppercase text-[11px] tracking-[0.2em] font-bold shadow-[0_0_15px_rgba(232,0,45,0.4)] group-hover:shadow-[0_0_25px_rgba(232,0,45,0.6)] group-hover:scale-[1.02] transition-all duration-500">
                Stake & Qualify
              </span>
              <div className="flex flex-col items-end">
                <span className="text-[9px] uppercase tracking-widest text-gray-500 mb-1">Buy-In Requirement</span>
                <span className="text-[#ffd700] font-bold text-lg leading-none tracking-wide drop-shadow-[0_0_8px_rgba(255,215,0,0.3)]">5,000 GC</span>
              </div>
            </div>
          </button>

        </div>

        {/* Right 50%: Leaderboard */}
        <div className="w-full lg:w-1/2 rounded-3xl border border-white/5 bg-[#0a0a0a]/90 backdrop-blur-xl p-8 flex flex-col relative overflow-hidden shadow-2xl h-full">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#ffd700] opacity-[0.02] blur-3xl pointer-events-none"></div>
          
          <div className="flex justify-between items-end mb-8 pb-4 border-b border-white/10 shrink-0 relative">
            <div className="absolute bottom-0 left-0 w-24 h-px bg-gradient-to-r from-[#ffd700]/50 to-transparent"></div>
            <div>
              <p className="text-[#ffd700] text-[10px] font-bold uppercase tracking-[0.25em] mb-2">Live Telemetry</p>
              <h3 className="font-display font-light text-2xl text-white uppercase tracking-wider">
                Global <span className="font-bold">Standings</span>
              </h3>
            </div>
            
            {/* Clickable Refresh Button */}
            <button 
              onClick={handleRefresh}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-gray-400 hover:text-white group focus:outline-none"
              title="Refresh Standings"
            >
              <svg className={`w-4 h-4 transition-transform duration-700 ${isRefreshing ? 'animate-spin text-[#e8002d]' : 'group-hover:rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
            </button>
          </div>

          {/* Leaderboard Rankings List */}
          <div className="flex-grow overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            <div className="space-y-3">
              {[
                { rank: 1, name: "MaxVelocity", points: "45,200", change: "up" },
                { rank: 2, name: "AeroKing", points: "44,850", change: "up" },
                { rank: 3, name: "ApexPredator", points: "42,100", change: "down" },
                { rank: 4, name: "Downforce_99", points: "41,050", change: "none" },
                { rank: 5, name: "SectorOne", points: "38,900", change: "up" },
                { rank: 6, name: "PolePosition", points: "38,400", change: "down" },
                { rank: 7, name: "PitStopPro", points: "36,200", change: "down" },
                { rank: 8, name: "Slipstream00", points: "35,100", change: "none" },
                { rank: 9, name: "DRS_Train", points: "34,500", change: "up" },
                { rank: 10, name: "BrakeMagic", points: "32,800", change: "up" },
              ].map((player, idx) => (
                <div key={idx} className={`group flex items-center justify-between p-4 rounded-xl border transition-all duration-300 ${
                  idx === 0 ? 'bg-gradient-to-r from-[#ffd700]/10 to-transparent border-[#ffd700]/30 hover:border-[#ffd700]/50' : 
                  idx === 1 ? 'bg-gradient-to-r from-gray-300/10 to-transparent border-gray-400/20 hover:border-gray-400/40' : 
                  idx === 2 ? 'bg-gradient-to-r from-amber-700/10 to-transparent border-amber-700/20 hover:border-amber-700/40' : 
                  'bg-white/[0.02] border-white/5 hover:bg-white/[0.04] hover:border-white/10'}`}
                >
                  <div className="flex items-center gap-6">
                    <div className={`font-display w-6 text-center text-xl tracking-tighter ${
                      idx === 0 ? 'text-[#ffd700] font-black drop-shadow-[0_0_10px_rgba(255,215,0,0.6)]' : 
                      idx === 1 ? 'text-gray-300 font-bold' : 
                      idx === 2 ? 'text-amber-600 font-bold' : 'text-gray-600 font-medium group-hover:text-gray-400 transition-colors'}`
                    }>
                      {player.rank}
                    </div>
                    <span className={`text-sm tracking-wide ${
                      idx === 0 ? 'text-white font-bold' : 
                      idx < 3 ? 'text-gray-100 font-semibold' : 'text-gray-300 group-hover:text-white transition-colors'
                    }`}>
                      {player.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="flex flex-col items-end">
                      <span className={`font-display tracking-wider ${
                        idx === 0 ? 'text-[#ffd700] font-bold' : 'text-white font-medium'
                      }`}>
                        {player.points} <span className="text-[10px] text-gray-500 font-sans ml-0.5">GC</span>
                      </span>
                    </div>
                    
                    <div className="w-5 h-5 rounded-full bg-black/40 flex items-center justify-center border border-white/5">
                      {player.change === 'up' && <svg className="w-2.5 h-2.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 15l7-7 7 7"></path></svg>}
                      {player.change === 'down' && <svg className="w-2.5 h-2.5 text-[#e8002d]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"></path></svg>}
                      {player.change === 'none' && <div className="w-1.5 h-0.5 bg-gray-500"></div>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
    </>
  );
}