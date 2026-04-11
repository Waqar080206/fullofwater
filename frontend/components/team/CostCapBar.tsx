interface Props {
  spent: number;
  cap: number;
}

export default function CostCapBar({ spent, cap }: Props) {
  const pct = Math.min((spent / cap) * 100, 100);
  const isOver = spent > cap;
  const isDanger = pct > 85;

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex gap-2 items-baseline">
        <span className={`font-display font-bold text-lg ${isOver ? 'text-[#ff4444]' : isDanger ? 'text-[#ffaa00]' : 'text-[#ffd700]'}`}>
          {(spent / 1_000_000).toFixed(1)}M
        </span>
        <span className="text-[#555] text-sm">/ 60M</span>
      </div>
      <div className="w-48 h-1.5 bg-[#1a1a1a] rounded-full overflow-hidden">
        <div
          className={`h-full transition-all rounded-full ${isOver ? 'bg-[#ff4444]' : isDanger ? 'bg-[#ffaa00]' : 'bg-[#e8002d]'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
