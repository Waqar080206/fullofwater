interface User {
  _id: string;
  username: string;
  walletAddress: string;
  totalPoints: number;
  rank: number;
  rankName: string;
}

const POSITION_COLORS: Record<number, string> = {
  1: 'text-[#ffd700]',
  2: 'text-[#c0c0c0]',
  3: 'text-[#cd7f32]',
};

export default function LeaderboardTable({ users }: { users: User[] }) {
  return (
    <div className="border border-[#2a2a2a] overflow-hidden">
      <div className="grid grid-cols-12 px-6 py-3 bg-[#111] text-[#555] text-xs font-display uppercase tracking-widest">
        <span className="col-span-1">POS</span>
        <span className="col-span-4">PILOT</span>
        <span className="col-span-4">RANK</span>
        <span className="col-span-3 text-right">POINTS</span>
      </div>
      {users.map((user, index) => {
        const pos = index + 1;
        const posColor = POSITION_COLORS[pos] || 'text-[#a0a0a0]';
        return (
          <div
            key={user._id}
            className="grid grid-cols-12 px-6 py-4 border-t border-[#1a1a1a] hover:bg-[#111] transition-colors"
          >
            <span className={`col-span-1 font-display font-black text-lg ${posColor}`}>
              P{pos}
            </span>
            <div className="col-span-4">
              <p className="font-bold text-sm">{user.username}</p>
              <p className="text-[#555] text-xs">
                {user.walletAddress.slice(0, 6)}...{user.walletAddress.slice(-4)}
              </p>
            </div>
            <div className="col-span-4">
              <span className="text-[#e8002d] text-xs font-display">{user.rankName}</span>
            </div>
            <span className="col-span-3 text-right font-display font-bold text-[#ffd700]">
              {user.totalPoints.toLocaleString()}
            </span>
          </div>
        );
      })}
    </div>
  );
}
