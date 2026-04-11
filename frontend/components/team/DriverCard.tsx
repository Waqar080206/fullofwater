interface Driver {
  id: string; name: string; team: string; teamName: string;
  price: number; number: number; nationality: string;
}

interface Props {
  driver: Driver;
  isSelected: boolean;
  isDisabled: boolean;
  onClick: () => void;
}

export default function DriverCard({ driver, isSelected, isDisabled, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={`
        relative p-4 text-left border transition-all
        ${isSelected
          ? 'border-[#e8002d] bg-[#e8002d11]'
          : isDisabled
          ? 'border-[#1a1a1a] opacity-40 cursor-not-allowed'
          : 'border-[#2a2a2a] hover:border-[#e8002d55]'
        }
      `}
    >
      {isSelected && (
        <div className="absolute top-2 right-2 w-4 h-4 bg-[#e8002d] rounded-full flex items-center justify-center">
          <span className="text-white text-[8px]">✓</span>
        </div>
      )}
      <p className="font-display font-black text-4xl text-[#1a1a1a] absolute top-2 left-2 select-none">
        {driver.number}
      </p>
      <div className="mt-8">
        <p className="font-display font-bold text-sm leading-tight">{driver.name}</p>
        <p className="text-[#a0a0a0] text-xs mt-1">{driver.teamName}</p>
        <p className="font-display text-[#ffd700] font-bold text-sm mt-3">
          {(driver.price / 1_000_000).toFixed(1)}M
        </p>
      </div>
    </button>
  );
}
