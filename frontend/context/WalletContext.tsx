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
    // Auto-reconnect if wallet was previously connected
    const savedAddress = localStorage.getItem('offgrid_wallet');
    if (savedAddress && window.ethereum) {
      connect();
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

      setProvider(_provider);
      setSigner(_signer);
      setAddress(_address);
      localStorage.setItem('offgrid_wallet', _address);
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
    localStorage.removeItem('offgrid_wallet');
    localStorage.removeItem('offgrid_token');
  };

  return (
    <WalletContext.Provider value={{ address, signer, provider, isConnecting, connect, disconnect }}>
      {children}
    </WalletContext.Provider>
  );
}

export const useWallet = () => useContext(WalletContext);