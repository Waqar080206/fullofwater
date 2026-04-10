const STATUS_STYLES: Record<string, string> = {
  upcoming: 'text-[#a0a0a0] border-[#2a2a2a]',
  qualifying: 'text-[#ffaa00] border-[#ffaa00]',
  active: 'text-[#00d4aa] border-[#00d4aa]',
  completed: 'text-[#555] border-[#555]',
};

interface Race {
  _id: string; name: string; round: number; country: string;
  circuit: string; raceDate: string; status: string;
}

export default function RaceCard({ race, onClick }: { race: Race; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left border border-[#2a2a2a] hover:border-[#e8002d55] p-6 transition-all group"
    >
      <div className="flex justify-between items-start mb-4">
        <span className="font-display text-[#555] text-sm">R{race.round}</span>
        <span className={`font-display text-xs uppercase border px-2 py-1 ${STATUS_STYLES[race.status] || STATUS_STYLES.upcoming}`}>
          {race.status}
        </span>
      </div>
      <h3 className="font-display font-bold text-lg leading-tight group-hover:text-[#e8002d] transition-colors mb-1">
        {race.name}
      </h3>
      <p className="text-[#a0a0a0] text-sm">{race.circuit}</p>
      <p className="text-[#555] text-xs mt-3">
        {new Date(race.raceDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
      </p>
    </button>
  );
}