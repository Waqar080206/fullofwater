'use client';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { useWallet } from '../context/WalletContext';
import ConnectButton from '../components/wallet/ConnectButton';

export default function LandingPage() {
  const router = useRouter();
  const { user, login } = useAuth();
  const { address } = useWallet();

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Animated background: diagonal red speed lines */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#110008] to-[#0a0a0a]" />
      <div className="absolute inset-0 opacity-10"
           style={{ backgroundImage: 'repeating-linear-gradient(65deg, #e8002d 0px, #e8002d 1px, transparent 1px, transparent 60px)' }} />

      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center min-h-screen text-center px-4">
        <p className="font-display text-[#e8002d] text-sm tracking-[0.4em] uppercase mb-4">
          Season 2025 · On Polygon
        </p>
        <h1 className="font-display font-black text-6xl md:text-8xl leading-none mb-6">
          BUILD YOUR<br />
          <span className="text-[#e8002d]">GRID.</span><br />
          EARN ON CHAIN.
        </h1>
        <p className="text-[#a0a0a0] text-lg max-w-xl mb-10">
          Pick 3 drivers and a constructor under a 60M GameCoin cap.
          Predict race outcomes. Climb the ranks. Redeem to ETH.
        </p>
        {!user ? (
          <button
            onClick={login}
            className="bg-[#e8002d] hover:bg-[#ff1a3e] text-white font-display font-bold text-sm tracking-widest uppercase px-10 py-4 transition-all"
          >
            Log In or Sign Up
          </button>
        ) : (
          <button
            onClick={() => router.push('/dashboard')}
            className="border border-[#e8002d] text-[#e8002d] hover:bg-[#e8002d] hover:text-white font-display font-bold text-sm tracking-widest uppercase px-10 py-4 transition-all"
          >
            Enter the Grid →
          </button>
        )}
      </section>

      {/* How It Works */}
      <section className="relative py-24 px-4 max-w-5xl mx-auto">
        <h2 className="font-display text-3xl font-bold text-center mb-16">
          HOW IT <span className="text-[#e8002d]">WORKS</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { step: '01', title: 'Sign Up', desc: 'Securely sign up with your email or social accounts. No upfront crypto needed.' },
            { step: '02', title: 'Build Your Team', desc: 'Pick 3 drivers + 1 constructor under 60M GameCoins. Lock before qualifying.' },
            { step: '03', title: 'Connect to Earn', desc: 'Connect your MetaMask wallet only when withdrawing to track your on-chain earnings.' },
          ].map(({ step, title, desc }) => (
            <div key={step} className="border border-[#2a2a2a] p-8 hover:border-[#e8002d33] transition-colors">
              <p className="font-display text-[#e8002d] text-5xl font-black mb-4">{step}</p>
              <h3 className="font-display font-bold text-xl mb-3">{title}</h3>
              <p className="text-[#a0a0a0] text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
