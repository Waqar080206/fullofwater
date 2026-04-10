'use client';
import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { DRIVERS, CONSTRUCTORS, COST_CAP } from '../../lib/constants';
import DriverCard from '../../components/team/DriverCard';
import ConstructorCard from '../../components/team/ConstructorCard';
import CostCapBar from '../../components/team/CostCapBar';
import { teamAPI } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

export default function TeamBuilderPage() {
  const searchParams = useSearchParams();
  const raceId = searchParams.get('raceId');
  const router = useRouter();
  const { token } = useAuth();

  const [selectedDrivers, setSelectedDrivers] = useState<string[]>([]);
  const [selectedConstructor, setSelectedConstructor] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalCost = [
    ...selectedDrivers.map(id => DRIVERS.find(d => d.id === id)?.price || 0),
    selectedConstructor ? (CONSTRUCTORS.find(c => c.id === selectedConstructor)?.price || 0) : 0,
  ].reduce((a, b) => a + b, 0);

  const toggleDriver = (id: string) => {
    setSelectedDrivers(prev => {
      if (prev.includes(id)) return prev.filter(d => d !== id);
      if (prev.length >= 3) return prev; // max 3
      const newCost = totalCost + (DRIVERS.find(d => d.id === id)?.price || 0);
      if (newCost > COST_CAP) { setError('Over cost cap!'); return prev; }
      setError(null);
      return [...prev, id];
    });
  };

  const selectConstructor = (id: string) => {
    const newCost = totalCost - (selectedConstructor ? CONSTRUCTORS.find(c => c.id === selectedConstructor)?.price || 0 : 0)
                   + (CONSTRUCTORS.find(c => c.id === id)?.price || 0);
    if (newCost > COST_CAP) { setError('Over cost cap!'); return; }
    setError(null);
    setSelectedConstructor(prev => prev === id ? null : id);
  };

  const handleSubmit = async () => {
    if (!raceId || !token) return;
    if (selectedDrivers.length !== 3) { setError('Select exactly 3 drivers'); return; }
    if (!selectedConstructor) { setError('Select a constructor'); return; }

    setIsSubmitting(true);
    try {
      await teamAPI.create({
        raceId,
        drivers: selectedDrivers,
        constructor: selectedConstructor,
        totalCost,
      }, token);
      router.push(`/race/${raceId}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display font-bold text-3xl">
          BUILD YOUR <span className="text-[#e8002d]">TEAM</span>
        </h1>
        <CostCapBar spent={totalCost} cap={COST_CAP} />
      </div>

      {error && (
        <div className="border border-[#ff4444] bg-[#ff444411] text-[#ff4444] px-4 py-3 mb-6 text-sm font-display">
          {error}
        </div>
      )}

      {/* Status summary */}
      <div className="flex gap-6 mb-8 text-sm font-display">
        <span>Drivers: <span className={selectedDrivers.length === 3 ? 'text-[#00d4aa]' : 'text-[#e8002d]'}>{selectedDrivers.length}/3</span></span>
        <span>Constructor: <span className={selectedConstructor ? 'text-[#00d4aa]' : 'text-[#e8002d]'}>{selectedConstructor ? '✓' : '0/1'}</span></span>
        <span>Remaining: <span className="text-[#ffd700]">{((COST_CAP - totalCost) / 1_000_000).toFixed(1)}M</span></span>
      </div>

      {/* Drivers grid */}
      <h2 className="font-display text-xl font-bold mb-4">SELECT 3 DRIVERS</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-10">
        {DRIVERS.map(driver => (
          <DriverCard
            key={driver.id}
            driver={driver}
            isSelected={selectedDrivers.includes(driver.id)}
            isDisabled={selectedDrivers.length >= 3 && !selectedDrivers.includes(driver.id)}
            onClick={() => toggleDriver(driver.id)}
          />
        ))}
      </div>

      {/* Constructors */}
      <h2 className="font-display text-xl font-bold mb-4">SELECT 1 CONSTRUCTOR</h2>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-10">
        {CONSTRUCTORS.map(constructor => (
          <ConstructorCard
            key={constructor.id}
            constructor={constructor}
            isSelected={selectedConstructor === constructor.id}
            onClick={() => selectConstructor(constructor.id)}
          />
        ))}
      </div>

      <button
        onClick={handleSubmit}
        disabled={isSubmitting || selectedDrivers.length !== 3 || !selectedConstructor}
        className="w-full bg-[#e8002d] hover:bg-[#ff1a3e] disabled:bg-[#2a2a2a] disabled:text-[#555] text-white font-display font-bold tracking-widest uppercase py-4 transition-all"
      >
        {isSubmitting ? 'LOCKING IN...' : 'LOCK IN TEAM →'}
      </button>
    </div>
  );
}