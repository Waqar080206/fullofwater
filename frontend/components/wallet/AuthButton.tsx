'use client';
import { useAuth } from '../../context/AuthContext';

export default function AuthButton() {
  const { user, login, logout, isLoading } = useAuth();

  if (!user) {
    return (
      <button
        onClick={login}
        disabled={isLoading}
        className="border border-[#e8002d] text-[#e8002d] hover:bg-[#e8002d] hover:text-white font-display font-bold text-sm tracking-widest uppercase px-8 py-3 transition-all disabled:opacity-50"
      >
        {isLoading ? 'LOADING...' : 'LOGIN / SIGN UP'}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <span className="font-display text-sm text-[#a0a0a0]">
        HELLO, {user.username.toUpperCase()}
      </span>
      <button
        onClick={logout}
        className="border border-[#2a2a2a] text-[#555] hover:border-[#e8002d] hover:text-[#e8002d] font-display text-xs tracking-widest uppercase px-4 py-2 transition-all"
      >
        LOGOUT
      </button>
    </div>
  );
}
