'use client';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useWallet } from './WalletContext';
import { authAPI } from '../lib/api';
import { auth } from '../lib/firebase';
import { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

interface User {
  _id: string;
  walletAddress?: string;
  username: string;
  totalPoints: number;
  rank: number;
  rankName: string;
  gameCoins: number;
  tier: 'free' | 'paid';
}

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  token: string | null;
  isLoading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null, firebaseUser: null, token: null, isLoading: true,
  login: async () => {}, logout: async () => {}, refreshUser: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currUser) => {
      setFirebaseUser(currUser);
      if (currUser) {
        // Here you would typically get a custom token from your backend 
        // to authenticate API requests, or simply use the Firebase ID token.
        const idToken = await currUser.getIdToken();
        setToken(idToken);
        localStorage.setItem('laplogic_token', idToken);
        // FIXME: fetch backend user here
        setUser({
          _id: currUser.uid,
          username: currUser.displayName || 'Racer',
          totalPoints: 0,
          rank: 0,
          rankName: 'Rookie',
          gameCoins: 0,
          tier: 'free'
        });
      } else {
        setUser(null);
        setToken(null);
        localStorage.removeItem('laplogic_token');
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async () => {
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error('Login failed', err);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Logout failed', err);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    // Fetch updated user data from backend
    // Implement GET /api/auth/me endpoint or decode from token
  };

  return (
    <AuthContext.Provider value={{ user, firebaseUser, token, isLoading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);