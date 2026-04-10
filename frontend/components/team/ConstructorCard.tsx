interface Constructor {
  id: string; name: string; price: number; color: string;
}

interface Props {
  constructor: Constructor;
  isSelected: boolean;
  onClick: () => void;
}

export default function ConstructorCard({ constructor, isSelected, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className={`
        relative p-4 text-left border transition-all overflow-hidden
        ${isSelected
          ? 'border-[#e8002d] bg-[#e8002d11]'
          : 'border-[#2a2a2a] hover:border-[#e8002d55]'
        }
      `}
    >
      {isSelected && (
        <div className="absolute top-2 right-2 w-4 h-4 bg-[#e8002d] rounded-full flex items-center justify-center z-10">
          <span className="text-white text-[8px]">✓</span>
        </div>
      )}
      <div 
        className="absolute top-0 right-0 bottom-0 w-2 opacity-30" 
        style={{ backgroundColor: constructor.color }} 
      />
      <div>
        <p className="font-display font-bold text-sm leading-tight">{constructor.name}</p>
        <p className="font-display text-[#ffd700] font-bold text-sm mt-3">
          {(constructor.price / 1_000_000).toFixed(1)}M
        </p>
      </div>
    </button>
  );
}