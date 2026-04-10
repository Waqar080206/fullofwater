'use client';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useWallet } from './WalletContext';
import { authAPI } from '../lib/api';

interface User {
  _id: string;
  walletAddress: string;
  username: string;
  totalPoints: number;
  rank: number;
  rankName: string;
  gameCoins: number;
  tier: 'free' | 'paid';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: () => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null, token: null, isLoading: false,
  login: async () => {}, logout: () => {}, refreshUser: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const { address, signer } = useWallet();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const savedToken = localStorage.getItem('laplogic_token');
    if (savedToken) {
      setToken(savedToken);
      // Optionally decode and set user from token or fetch /me endpoint
    }
  }, []);

  const login = async () => {
    if (!address || !signer) return;
    setIsLoading(true);
    try {
      // 1. Get nonce
      const { nonce } = await authAPI.getNonce(address);
      // 2. Sign nonce
      const signature = await signer.signMessage(nonce);
      // 3. Verify and get JWT
      const { token: jwt, user: userData } = await authAPI.verify(address, signature, nonce);
      setToken(jwt);
      setUser(userData);
      localStorage.setItem('laplogic_token', jwt);
    } catch (err) {
      console.error('Login failed', err);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('laplogic_token');
  };

  const refreshUser = async () => {
    // Fetch updated user data from backend
    // Implement GET /api/auth/me endpoint or decode from token
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);