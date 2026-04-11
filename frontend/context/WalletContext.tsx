'use client';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ethers, BrowserProvider, JsonRpcSigner } from 'ethers';

interface WalletContextType {
  address: string | null;
  signer: JsonRpcSigner | null;
  provider: BrowserProvider | null;
  isConnecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextType>({
  address: null, signer: null, provider: null, isConnecting: false,
  connect: async () => {}, disconnect: () => {},
});

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    // Auto-reconnect if wallet was previously connected AND no valid token exists
    // (If token exists, AuthContext will handle hydration without requiring an annoying signature)
    const savedAddress = localStorage.getItem('laplogic_wallet');
    const hasToken = localStorage.getItem('laplogic_token');
    
    if (savedAddress && window.ethereum && !hasToken) {
      connect();
    } else if (savedAddress && window.ethereum && hasToken) {
      // Just silently restore the provider/signer so ethers.js calls still work
      const _provider = new ethers.BrowserProvider(window.ethereum);
      setProvider(_provider);
      _provider.getSigner().then(_signer => {
        setSigner(_signer);
        setAddress(savedAddress);
      }).catch(console.error);
    }
  }, []);

  const connect = async () => {
    if (!window.ethereum) {
      alert('MetaMask not found. Please install MetaMask.');
      return;
    }

    setIsConnecting(true);
    try {
      const _provider = new ethers.BrowserProvider(window.ethereum);
      await _provider.send('eth_requestAccounts', []);

      // Switch to Polygon Amoy if needed
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x13882' }], // 80002 in hex = Polygon Amoy
        });
      } catch (switchError: any) {
        // Chain not added — add it
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0x13882',
              chainName: 'Polygon Amoy Testnet',
              nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
              rpcUrls: ['https://rpc-amoy.polygon.technology'],
              blockExplorerUrls: ['https://amoy.polygonscan.com'],
            }],
          });
        }
      }

      const _signer = await _provider.getSigner();
      const _address = await _signer.getAddress();

      const resContext = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/nonce/${_address}`);
      const { nonce } = await resContext.json();
      
      const signature = await _signer.signMessage(nonce);
      
      const authRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: _address, signature, nonce }) 
      });
      const data = await authRes.json();
      if (!authRes.ok) throw new Error(data.error);

      setProvider(_provider);
      setSigner(_signer);
      setAddress(_address);
      localStorage.setItem('laplogic_wallet', _address);
      localStorage.setItem('laplogic_token', data.token);
      
      window.dispatchEvent(new Event('wallet_connected'));

    } catch (err) {
      console.error('Wallet connect failed', err);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    setAddress(null);
    setSigner(null);
    setProvider(null);
    localStorage.removeItem('laplogic_wallet');
    localStorage.removeItem('laplogic_token');
  };

  return (
    <WalletContext.Provider value={{ address, signer, provider, isConnecting, connect, disconnect }}>
      {children}
    </WalletContext.Provider>
  );
}

export const useWallet = () => useContext(WalletContext);
