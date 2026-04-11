'use client';
import { useWallet } from '../../context/WalletContext';
import { useAuth } from '../../context/AuthContext';

export default function ConnectButton() {
  const { address, connect, disconnect, isConnecting } = useWallet();
  const { user, login, logout, isLoading } = useAuth();

  // If user is not logged in, show Log In
  if (!user) {
    return (
      <button
        onClick={login}
        disabled={isLoading}
        className="border border-[#e8002d] text-[#e8002d] hover:bg-[#e8002d] hover:text-white font-display font-bold text-sm tracking-widest uppercase px-8 py-3 transition-all"
      >
        {isLoading ? 'SIGNING IN...' : 'LOG IN'}
      </button>
    );
  }

  // Once user is logged in, they can connect their wallet
  if (!address) {
    return (
      <div className="flex items-center gap-4">
        <span className="font-display text-sm text-[#a0a0a0]">
          Hi, {user.username}
        </span>
        <button
          onClick={connect}
          disabled={isConnecting}
          className="border border-[#e8002d] text-[#e8002d] hover:bg-[#e8002d] hover:text-white font-display font-bold text-sm tracking-widest uppercase px-8 py-3 transition-all disabled:opacity-50"
        >
          {isConnecting ? 'CONNECTING...' : 'CONNECT WALLET'}
        </button>
        <button
          onClick={logout}
          className="border border-[#2a2a2a] text-[#555] hover:border-[#e8002d] hover:text-[#e8002d] font-display text-xs tracking-widest uppercase px-4 py-2 transition-all"
        >
          LOGOUT
        </button>
      </div>
    );
  }

  // Connected both
  return (
    <div className="flex items-center gap-4">
      <span className="font-display text-sm text-[#a0a0a0]">
        Hi, {user.username} | {address.slice(0, 6)}...{address.slice(-4)}
      </span>
      <button
        onClick={disconnect}
        className="border border-[#2a2a2a] text-[#555] hover:border-[#e8002d] hover:text-[#e8002d] font-display text-xs tracking-widest uppercase px-4 py-2 transition-all"
      >
        DISCONNECT WALLET
      </button>
      <button
        onClick={logout}
        className="border border-[#2a2a2a] text-[#555] hover:border-[#e8002d] hover:text-[#e8002d] font-display text-xs tracking-widest uppercase px-4 py-2 transition-all"
      >
        LOGOUT
      </button>
    </div>
  );
}