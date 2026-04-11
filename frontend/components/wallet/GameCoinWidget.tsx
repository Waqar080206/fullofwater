'use client';
import { useEffect, useState } from 'react';
import { useWallet } from '../../context/WalletContext';
import { getOnChainBalance, purchaseGameCoins, redeemGameCoins } from '../../lib/ethers';

const GC_PER_ETH = 12000;

export default function GameCoinWidget() {
  const { address, signer, provider } = useWallet();
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  
  // Modal states
  const [modalType, setModalType] = useState<'closed' | 'buy' | 'sell' | 'success'>('closed');
  const [inputValue, setInputValue] = useState('');
  const [lastTxAmount, setLastTxAmount] = useState(0); 

  useEffect(() => {
    if (address && provider) {
      setLoading(true);
      getOnChainBalance(address, provider)
        .then((bal) => setBalance(bal))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [address, provider]);

  const handleTransaction = async () => {
    if (!signer || !inputValue || isNaN(parseFloat(inputValue)) || parseFloat(inputValue) <= 0) return;
    setPurchasing(true);
    
    try {
      let gcAmount = 0;
      
      if (modalType === 'buy') {
        // Buy: Input is ETH
        await purchaseGameCoins(signer, inputValue);
        gcAmount = parseFloat(inputValue) * GC_PER_ETH;
      } else if (modalType === 'sell') {
        // Sell: Input is GC
        gcAmount = parseFloat(inputValue);
        await redeemGameCoins(signer, gcAmount);
      }
      
      // Refresh the widget's local balance
      const newBalance = await getOnChainBalance(address!, provider!);
      setBalance(newBalance);
      setLastTxAmount(gcAmount);

      // Tell the backend to update MongoDB and record the receipt!
      const lapLogicToken = localStorage.getItem('laplogic_token');
      if (lapLogicToken) {
        // Calculate the exact amounts to send to the DB
        const payload = {
          transactionType: modalType.toUpperCase(),
          amount: gcAmount,
          ethAmount: modalType === 'buy' ? parseFloat(inputValue) : gcAmount / GC_PER_ETH
        };
        
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/sync-balance`, {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${lapLogicToken}`,
            'Content-Type': 'application/json' 
          },
          body: JSON.stringify(payload)
        });
      }
      
      // Transition to success screen instead of closing or reloading immediately
      setModalType('success');
      
    } catch (err) {
      console.error('Transaction failed', err);
    } finally {
      setPurchasing(false);
    }
  };

  const closeModal = () => {
    setModalType('closed');
    setInputValue('');
    // Only reload the window if we just finished a successful transaction
    if (modalType === 'success') {
      window.location.reload();
    }
  };

  if (!address) return null;

  // Calculations for UI display
  const parsedInput = parseFloat(inputValue || '0');
  const mappedGC = modalType === 'buy' ? parsedInput * GC_PER_ETH : parsedInput;
  const mappedETH = modalType === 'sell' ? parsedInput / GC_PER_ETH : parsedInput;

  return (
    <>
      {/* --- MAIN WIDGET DASHBOARD CARD --- */}
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-5 max-w-sm mt-4 shadow-lg">
        <h3 className="font-display font-bold text-[#a0a0a0] text-xs tracking-widest uppercase mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          Web3 Wallet
        </h3>
        
        {loading ? <p className="text-gray-400 text-sm">Loading blockchain...</p> : (
          <>
            <p className="text-3xl font-display font-bold text-white mb-1 shadow-sm">
              {balance !== null ? balance.toLocaleString() : '0'} <span className="text-[#ffd700] text-xl">GC</span>
            </p>
            <p className="text-xs text-gray-500 mb-5">Verified On-Chain Balance</p>

            <div className="flex gap-3">
              <button 
                onClick={() => setModalType('buy')}
                className="flex-1 bg-white hover:bg-gray-200 text-black font-bold py-2 px-4 rounded text-sm uppercase tracking-wider transition-colors"
              >
                Buy GC
              </button>
              <button 
                onClick={() => setModalType('sell')}
                className="flex-1 bg-transparent hover:bg-[#333] border border-[#444] text-white font-bold py-2 px-4 rounded text-sm uppercase tracking-wider transition-colors"
              >
                Sell GC
              </button>
            </div>
          </>
        )}
      </div>

      {/* --- POPUP MODAL --- */}
      {modalType !== 'closed' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#111] border border-[#333] rounded-xl p-6 max-w-md w-full relative shadow-[0_0_40px_rgba(0,0,0,0.5)]">
            
            {/* Close Button */}
            {modalType !== 'success' && !purchasing && (
              <button onClick={closeModal} className="absolute top-4 right-4 text-gray-500 hover:text-white">
                ✕
              </button>
            )}

            {/* SUCCESS SCREEN */}
            {modalType === 'success' ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500">
                  <span className="text-green-500 text-2xl">✓</span>
                </div>
                <h3 className="text-2xl font-display font-bold text-white mb-2 uppercase">Transaction Complete</h3>
                <p className="text-gray-400 mb-6">
                  You successfully {lastTxAmount > 0 && typeof lastTxAmount !== 'undefined' ? (modalType as string === 'buy' ? 'bought' : 'redeemed') : 'processed'} <br/>
                  <span className="text-[#ffd700] font-bold text-xl">{lastTxAmount.toLocaleString()} GC</span>
                </p>
                <button 
                  onClick={closeModal}
                  className="bg-[#e8002d] hover:bg-red-700 text-white font-bold py-3 px-8 rounded-full text-sm uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(232,0,45,0.4)]"
                >
                  Return to Dashboard
                </button>
              </div>
            ) : (
              /* BUY & SELL SCREENS */
              <>
                <h2 className="text-xl font-display font-bold text-white mb-1 uppercase text-center">
                  {modalType === 'buy' ? 'Buy GameCoins' : 'Sell GameCoins'}
                </h2>
                <p className="text-center text-xs text-gray-400 mb-6 uppercase tracking-widest">
                  Exchange Rate: 1 ETH = {GC_PER_ETH.toLocaleString()} GC
                </p>

                <div className="bg-black/50 p-4 rounded-lg border border-[#222] mb-6">
                  <label className="text-xs text-gray-500 uppercase tracking-widest mb-2 block">
                    {modalType === 'buy' ? 'Amount to Pay (ETH)' : 'Amount to Sell (GC)'}
                  </label>
                  <div className="flex gap-2">
                    <input 
                      type="number" step={modalType === 'buy' ? "0.01" : "1"} min="0"
                      value={inputValue} onChange={(e) => setInputValue(e.target.value)}
                      className="bg-transparent text-white text-3xl font-display w-full outline-none"
                      placeholder="0"
                    />
                    <div className="text-gray-500 text-xl font-bold flex items-end pb-1">
                      {modalType === 'buy' ? 'ETH' : 'GC'}
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-[#333] flex justify-between items-center">
                    <span className="text-xs text-gray-400">You will {modalType === 'buy' ? 'Receive' : 'Get Back'}:</span>
                    <span className={modalType === 'buy' ? 'text-[#ffd700] font-bold' : 'text-blue-400 font-bold'}>
                      {modalType === 'buy' 
                        ? `+${isNaN(mappedGC) ? 0 : mappedGC.toLocaleString()} GC` 
                        : `+${isNaN(mappedETH) ? 0 : mappedETH.toFixed(4)} ETH`
                      }
                    </span>
                  </div>
                </div>

                <button 
                  onClick={handleTransaction} 
                  disabled={purchasing || parsedInput <= 0 || isNaN(parsedInput)}
                  className="w-full bg-[#e8002d] hover:bg-red-700 text-white font-bold py-4 rounded text-sm uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {purchasing ? 'Confirming in Wallet...' : `Confirm ${modalType === 'buy' ? 'Purchase' : 'Sale'}`}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
