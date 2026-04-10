'use client';
import { useWallet } from '../../context/WalletContext';
import { useAuth } from '../../context/AuthContext';

export default function ConnectButton() {
  const { address, connect, disconnect, isConnecting } = useWallet();
  const { user, login, logout, isLoading } = useAuth();

  if (!address) {
    return (
      <button
        onClick={connect}
        disabled={isConnecting}
        className="border border-[#e8002d] text-[#e8002d] hover:bg-[#e8002d] hover:text-white font-display font-bold text-sm tracking-widest uppercase px-8 py-3 transition-all disabled:opacity-50"
      >
        {isConnecting ? 'CONNECTING...' : 'CONNECT WALLET'}
      </button>
    );
  }

  if (!user) {
    return (
      <button
        onClick={login}
        disabled={isLoading}
        className="border border-[#e8002d] text-[#e8002d] hover:bg-[#e8002d] hover:text-white font-display font-bold text-sm tracking-widest uppercase px-8 py-3 transition-all"
      >
        {isLoading ? 'SIGNING...' : 'SIGN IN'}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <span className="font-display text-sm text-[#a0a0a0]">
        {address.slice(0, 6)}...{address.slice(-4)}
      </span>
      <button
        onClick={() => { logout(); disconnect(); }}
        className="border border-[#2a2a2a] text-[#555] hover:border-[#e8002d] hover:text-[#e8002d] font-display text-xs tracking-widest uppercase px-4 py-2 transition-all"
      >
        DISCONNECT
      </button>
    </div>
  );
}