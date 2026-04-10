'use client';
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { DRIVERS, CONSTRUCTORS, COST_CAP } from '../../lib/constants';
import { teamAPI, raceAPI } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

export default function TeamBuilderPage() {
  const searchParams = useSearchParams();
  const raceId = searchParams.get('raceId');
  const mode = searchParams.get('mode'); // 'free' or 'pro'
  const router = useRouter();
  const { token } = useAuth();

  const [selectedDrivers, setSelectedDrivers] = useState<string[]>([]);
  const [selectedConstructor, setSelectedConstructor] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'drivers' | 'constructors'>('drivers');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [targetOverwriteRaceId, setTargetOverwriteRaceId] = useState<string | null>(null);

  const totalCost = [
    ...selectedDrivers.map(id => DRIVERS.find(d => d.id === id)?.price || 0),
    selectedConstructor ? (CONSTRUCTORS.find(c => c.id === selectedConstructor)?.price || 0) : 0,
  ].reduce((a, b) => a + b, 0);

  const remainingBudget = COST_CAP - totalCost;

  const toggleDriver = (id: string) => {
    setSelectedDrivers(prev => {
      if (prev.includes(id)) return prev.filter(d => d !== id);
      if (prev.length >= 3) return prev; // max 3
      const newCost = totalCost + (DRIVERS.find(d => d.id === id)?.price || 0);
      if (newCost > COST_CAP) { setError('Budget exceeded!'); return prev; }
      setError(null);
      return [...prev, id];
    });
  };

  const selectConstructor = (id: string) => {
    if (selectedConstructor === id) {
      setSelectedConstructor(null);
      return;
    }
    const newCost = totalCost - (selectedConstructor ? CONSTRUCTORS.find(c => c.id === selectedConstructor)?.price || 0 : 0)
                   + (CONSTRUCTORS.find(c => c.id === id)?.price || 0);
    if (newCost > COST_CAP) { setError('Budget exceeded!'); return; }
    setError(null);
    setSelectedConstructor(id);
  };

  const handleSubmit = async () => {
    if (selectedDrivers.length !== 3) { setError('Your team must have exactly 3 drivers.'); return; }
    if (!selectedConstructor) { setError('You must select a constructor.'); return; }

    if (!token) {
      setError('Please connect your wallet to save your team to the database.');
      return;
    }

    setIsSubmitting(true);
    let targetRaceId = raceId;
    try {
      // If no raceId in URL, fetch next upcoming race
      if (!targetRaceId) {
        const races = await raceAPI.getAll();
        const upcomingRace = races.find(r => r.status === 'upcoming');
        if (!upcomingRace) {
          throw new Error('No upcoming races available. Cannot save team.');
        }
        targetRaceId = upcomingRace._id;
      }

      await teamAPI.create({
        raceId: targetRaceId,
        drivers: selectedDrivers,
        constructor: selectedConstructor,
        totalCost,
        mode: mode || 'free'
      }, token);

      router.push(`/predict/${targetRaceId}`);
    } catch (err: any) {
      if (err.message === 'Team already exists for this race') {
        setTargetOverwriteRaceId(targetRaceId);
      } else {
        console.error("Save Team Error:", err);
        setError(err.message || 'Failed to save team');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOverwrite = async () => {
    if (!targetOverwriteRaceId || !token) return;
    setIsSubmitting(true);
    try {
      await teamAPI.update(targetOverwriteRaceId, {
        drivers: selectedDrivers,
        constructor: selectedConstructor,
        totalCost,
        mode: mode || 'free'
      }, token);
      setTargetOverwriteRaceId(null);
      router.push(`/predict/${targetOverwriteRaceId}`);
    } catch (err: any) {
      setError(err.message || 'Failed to overwrite team');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper for formatting prices
  const formatM = (price: number) => `$${(price / 1000000).toFixed(1)}M`;

  // Filled slots vs Empty Slots
  const driverSlots = [0, 1, 2].map(index => {
    const dId = selectedDrivers[index];
    return dId ? DRIVERS.find(d => d.id === dId) : null;
  });

  const filledConstructor = selectedConstructor ? CONSTRUCTORS.find(c => c.id === selectedConstructor) : null;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col font-sans">
      
      {/* Overwrite Modal */}
      {targetOverwriteRaceId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
          <div className="bg-[#111] border border-[#333] shadow-2xl max-w-md w-full flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#e8002d] opacity-10 blur-3xl rounded-full"></div>
            
            <div className="p-8">
              <h2 className="font-display font-black text-2xl text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="text-[#e8002d]">⚠</span> Conflict Detected
              </h2>
              <p className="text-gray-400 text-sm leading-relaxed mb-8 font-semibold">
                You already have a confirmed team locked in for this race weekend. Do you want to keep your existing lineup, or overwrite it with this new roster?
              </p>
              
              <div className="flex gap-4 w-full">
                <button 
                  onClick={() => router.push('/dashboard')} 
                  className="flex-1 py-3.5 border border-white/10 text-gray-300 font-bold uppercase tracking-widest text-[11px] hover:bg-white/5 hover:border-white/30 transition-colors"
                >
                  Keep Old Team
                </button>
                <button 
                  onClick={handleOverwrite}
                  disabled={isSubmitting}
                  className="flex-1 py-3.5 bg-[#e8002d] text-white font-bold uppercase tracking-widest text-[11px] hover:bg-[#ff1a40] transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Updating...' : 'Overwrite'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header - Mimicking F1 Fantasy */}
      <header className="sticky top-0 z-40 bg-[#151515] border-b border-white/10 shadow-lg">
        <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <div className="flex items-center gap-4">
            <h1 className="font-display font-black text-2xl md:text-3xl tracking-tight uppercase uppercase bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              Create <span className={mode === 'pro' ? 'text-[#ffd700]' : 'text-[#e8002d]'}>Team</span>
            </h1>
            {mode === 'pro' && (
              <span className="px-3 py-1 bg-[#ffd700]/20 border border-[#ffd700] rounded text-[#ffd700] text-[10px] font-bold uppercase tracking-widest">
                Pro Grid
              </span>
            )}
          </div>

          {/* Budget Bar */}
          <div className="flex flex-1 max-w-2xl bg-black/50 border border-white/10 rounded-xl p-3 md:p-4 items-center gap-6">
            <div className="flex flex-col flex-1">
              <div className="flex justify-between text-xs font-bold uppercase tracking-wider mb-2">
                <span className="text-gray-400">Remaining Budget</span>
                <span className={remainingBudget < 0 ? 'text-[#e8002d]' : 'text-white'}>
                  {formatM(remainingBudget)}
                </span>
              </div>
              <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${remainingBudget < 0 ? 'bg-[#e8002d]' : 'bg-[#e8002d]'}`}
                  style={{ width: `${Math.min(100, Math.max(0, (totalCost / COST_CAP) * 100))}%` }}
                />
              </div>
            </div>
            
            <div className="hidden sm:flex flex-col border-l border-white/10 pl-6 shrink-0">
              <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Total Cost</span>
              <span className="text-lg font-display font-bold text-white">{formatM(totalCost)} / {formatM(COST_CAP)}</span>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting || selectedDrivers.length !== 3 || !selectedConstructor}
            className={`px-8 py-3.5 rounded-lg uppercase text-sm tracking-[0.2em] font-bold transition-all focus:outline-none flex-shrink-0 ${
              selectedDrivers.length === 3 && selectedConstructor && !isSubmitting
                ? mode === 'pro' 
                  ? 'bg-gradient-to-r from-[#ffd700] to-[#cca900] text-black shadow-[0_0_20px_rgba(255,215,0,0.3)] hover:scale-105'
                  : 'bg-[#e8002d] text-white shadow-[0_0_20px_rgba(232,0,45,0.4)] hover:shadow-[0_0_30px_rgba(232,0,45,0.6)] hover:bg-[#ff1a40] hover:scale-105'
                : 'bg-white/5 text-gray-600 border border-white/5 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? 'Saving...' : 'Save Team'}
          </button>
        </div>
      </header>

      {/* Main Content Split */}
      <div className="flex-grow max-w-[1600px] w-full mx-auto flex flex-col lg:flex-row relative">
        
        {/* Left Column: Team Pitch (Visually mimicking a track or field) */}
        <div className="w-full lg:w-3/5 p-4 md:p-8 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] bg-[#111] relative border-r border-white/5">
          <div className="absolute inset-0 bg-gradient-to-b from-[#e8002d]/5 to-transparent pointer-events-none"></div>
          
          {error && (
            <div className="bg-[#e8002d]/20 border border-[#e8002d] text-white px-4 py-3 mb-6 rounded flex items-center justify-between z-10 relative backdrop-blur-sm">
              <span className="text-sm font-bold uppercase tracking-wider">{error}</span>
              <button onClick={() => setError(null)} className="text-white hover:text-gray-300">✕</button>
            </div>
          )}

          <div className="relative z-10 flex flex-col items-center gap-6 md:gap-10 h-full justify-center min-h-[500px]">
            
            {/* Drivers Row 1 */}
            <div className="flex w-full justify-center gap-4 md:gap-10">
              <SlotCard 
                type="Driver 1" 
                slot={driverSlots[0]} 
                onClickEmpty={() => setActiveTab('drivers')} 
                onClickRemove={() => driverSlots[0] && toggleDriver(driverSlots[0].id)} 
              />
              <SlotCard 
                type="Driver 2" 
                slot={driverSlots[1]} 
                onClickEmpty={() => setActiveTab('drivers')} 
                onClickRemove={() => driverSlots[1] && toggleDriver(driverSlots[1].id)} 
              />
            </div>
            
            {/* Drivers Row 2 */}
            <div className="flex w-full justify-center">
              <SlotCard 
                type="Driver 3" 
                slot={driverSlots[2]} 
                onClickEmpty={() => setActiveTab('drivers')} 
                onClickRemove={() => driverSlots[2] && toggleDriver(driverSlots[2].id)} 
              />
            </div>

            <div className="w-2/3 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent my-4"></div>

            {/* Constructor Slot */}
            <div className="flex w-full justify-center">
              <SlotCard 
                type="Constructor" 
                slot={filledConstructor} 
                onClickEmpty={() => setActiveTab('constructors')} 
                onClickRemove={() => filledConstructor && selectConstructor(filledConstructor.id)} 
                isConstructor={true}
              />
            </div>
          </div>
        </div>

        {/* Right Column: Player Selection List */}
        <div className="w-full lg:w-2/5 flex flex-col bg-[#0a0a0a] min-h-[600px] h-[calc(100vh-100px)] lg:sticky top-[100px]">
          
          {/* Tabs */}
          <div className="flex border-b border-white/10 shrink-0">
            <button 
              onClick={() => setActiveTab('drivers')}
              className={`flex-1 py-5 text-sm font-bold uppercase tracking-widest transition-colors ${
                activeTab === 'drivers' 
                  ? 'bg-white/5 text-white border-b-2 border-[#e8002d]' 
                  : 'text-gray-500 hover:bg-white/[0.02] hover:text-gray-300'
              }`}
            >
              Drivers ({selectedDrivers.length}/3)
            </button>
            <button 
              onClick={() => setActiveTab('constructors')}
              className={`flex-1 py-5 text-sm font-bold uppercase tracking-widest transition-colors ${
                activeTab === 'constructors' 
                  ? 'bg-white/5 text-white border-b-2 border-[#e8002d]' 
                  : 'text-gray-500 hover:bg-white/[0.02] hover:text-gray-300'
              }`}
            >
              Constructors ({selectedConstructor ? 1 : 0}/1)
            </button>
          </div>

          {/* List Settings / Filters Row */}
          <div className="px-6 py-3 bg-[#111] border-b border-white/5 shrink-0 flex justify-between items-center text-[10px] text-gray-500 font-bold uppercase tracking-widest">
            <span>{activeTab === 'drivers' ? 'Driver' : 'Constructor'}</span>
            <span>Price</span>
          </div>

          {/* Scrollable Roster */}
          <div className="flex-grow overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            {activeTab === 'drivers' && DRIVERS.map((driver) => {
              const isSelected = selectedDrivers.includes(driver.id);
              const maxSelected = selectedDrivers.length >= 3 && !isSelected;
              return (
                <div key={driver.id} className="flex items-center justify-between p-4 border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center shrink-0 overflow-hidden relative border-2 border-white/20">
                      {driver.imageUrl ? (
                        <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${driver.imageUrl})` }}></div>
                      ) : (
                        <span className="font-display font-black text-white/20 text-xl absolute">{driver.number}</span>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-white font-bold tracking-wide">{driver.name}</span>
                      <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider">{driver.teamName}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <span className="text-white font-display font-bold tracking-wider">{formatM(driver.price)}</span>
                    <button 
                      onClick={() => toggleDriver(driver.id)}
                      disabled={maxSelected}
                      className={`w-24 py-2 border rounded text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center ${
                        isSelected 
                          ? 'bg-[#e8002d]/10 border-[#e8002d]/50 text-[#e8002d] hover:bg-[#e8002d] hover:text-white' 
                          : maxSelected
                            ? 'border-gray-800 text-gray-600 bg-transparent cursor-not-allowed'
                            : 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-black'
                      }`}
                    >
                      {isSelected ? 'Remove' : 'Add'}
                    </button>
                  </div>
                </div>
              );
            })}

            {activeTab === 'constructors' && CONSTRUCTORS.map((constructor) => {
              const isSelected = selectedConstructor === constructor.id;
              const maxSelected = selectedConstructor !== null && !isSelected;
              return (
                <div key={constructor.id} className="flex items-center justify-between p-4 border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded bg-white/5 flex items-center justify-center shrink-0 border border-white/20 overflow-hidden" style={{ borderBottomColor: constructor.color, borderBottomWidth: 3 }}>
                       {constructor.imageUrl ? (
                         <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${constructor.imageUrl})` }}></div>
                       ) : (
                         <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M19.5,13.5v-1c0-0.8-0.7-1.5-1.5-1.5H6c-0.8,0-1.5,0.7-1.5,1.5v1c-1.1,0-2,0.9-2,2v2c0,1.1,0.9,2,2,2h15c1.1,0,2-0.9,2-2v-2C21.5,14.4,20.6,13.5,19.5,13.5z M8,17c-0.6,0-1-0.4-1-1s0.4-1,1-1s1,0.4,1,1S8.6,17,8,17z M16,17c-0.6,0-1-0.4-1-1s0.4-1,1-1s1,0.4,1,1S16.6,17,16,17z"/></svg>
                       )}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-white font-bold tracking-wide">{constructor.name}</span>
                      <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Chassis / PU</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <span className="text-white font-display font-bold tracking-wider">{formatM(constructor.price)}</span>
                    <button 
                      onClick={() => selectConstructor(constructor.id)}
                      disabled={maxSelected}
                      className={`w-24 py-2 border rounded text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center ${
                        isSelected 
                          ? 'bg-[#e8002d]/10 border-[#e8002d]/50 text-[#e8002d] hover:bg-[#e8002d] hover:text-white' 
                          : maxSelected
                            ? 'border-gray-800 text-gray-600 bg-transparent cursor-not-allowed'
                            : 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-black'
                      }`}
                    >
                      {isSelected ? 'Remove' : 'Add'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}

// ----------------------------------------------------
// UI Slot Component representing the empty/filled spaces
// ----------------------------------------------------
function SlotCard({ type, slot, onClickEmpty, onClickRemove, isConstructor = false }: { 
  type: string, 
  slot: any, 
  onClickEmpty: () => void, 
  onClickRemove: () => void,
  isConstructor?: boolean 
}) {
  
  if (!slot) {
    return (
      <button 
        onClick={onClickEmpty}
        className={`relative flex flex-col items-center justify-center border-2 border-dashed border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/40 transition-all rounded-xl overflow-hidden focus:outline-none group
          ${isConstructor ? 'w-64 md:w-80 h-32 md:h-40' : 'w-36 md:w-48 h-48 md:h-60'}`}
      >
         <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
           <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
         </div>
         <span className="text-gray-400 font-bold uppercase tracking-widest text-xs">{type}</span>
      </button>
    );
  }

  // Filled State
  const priceStr = `$${(slot.price / 1000000).toFixed(1)}M`;

  return (
    <div 
      className={`relative flex flex-col border border-white/20 bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a] rounded-xl overflow-hidden shadow-2xl group
        ${isConstructor ? 'w-64 md:w-80 h-32 md:h-40' : 'w-36 md:w-48 h-48 md:h-60'}`}
      style={{ borderBottomWidth: '4px', borderBottomColor: slot.color || '#e8002d' }}
    >
      {/* Background Decor */}
      <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>

      {/* Remove Button Hover Reveal */}
      <button 
        onClick={onClickRemove}
        className="absolute top-2 right-2 w-8 h-8 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-[#e8002d] hover:text-white z-20 border border-white/10"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
      </button>

      {isConstructor ? (
        <div className="flex flex-col h-full justify-center p-4 relative z-10 w-full bg-cover bg-center" style={{ backgroundImage: slot.imageUrl ? `url(${slot.imageUrl})` : 'none' }}>
           <div className={`absolute inset-0 z-0 ${slot.imageUrl ? 'bg-black/60' : ''}`}></div>
           <span className="text-gray-200 text-[10px] uppercase tracking-widest font-bold mb-1 relative z-10">{type}</span>
           <span className="font-display font-black text-xl md:text-2xl text-white truncate w-full relative z-10">{slot.name}</span>
           <span className="text-emerald-400 font-bold tracking-wider mt-auto relative z-10">{priceStr}</span>
        </div>
      ) : (
        <div className="flex flex-col h-full bg-cover bg-center relative w-full" style={{ backgroundImage: slot.imageUrl ? `url(${slot.imageUrl})` : 'none', backgroundColor: '#222' }}>
           <div className="p-3 bg-black/40 z-10 w-full flex justify-between items-start absolute top-0 left-0">
             <span className="text-gray-300 text-[10px] uppercase tracking-widest font-bold">{type}</span>
             {slot.nationality && (
                <span className="text-gray-300 text-[10px] uppercase tracking-widest font-bold">{slot.nationality}</span>
             )}
           </div>
           
           <div className="flex flex-col justify-end p-3 flex-grow bg-gradient-to-t from-black via-black/80 to-transparent z-10 w-full absolute bottom-0 left-0">
             <span className="text-gray-400 text-[10px] uppercase tracking-widest font-bold mb-0.5">{slot.teamName}</span>
             <span className="font-display font-bold text-base md:text-lg text-white leading-tight truncate w-full">{slot.name}</span>
             <span className="text-emerald-400 font-bold tracking-wider text-sm mt-1">{priceStr}</span>
           </div>
           {/* Fallback silhouette if no actual image - using number */}
           {!slot.imageUrl && (
             <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none z-0">
               <span className="font-display font-black text-[100px]">{slot.number}</span>
             </div>
           )}
        </div>
      )}
    </div>
  );
}