'use client';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { useWallet } from '../context/WalletContext';
import ConnectButton from '../components/wallet/ConnectButton';
import GameCoinWidget from '../components/wallet/GameCoinWidget'; // Adjust path if needed

export default function LandingPage() {
  const router = useRouter();
  const { user, login } = useAuth();
  const { address } = useWallet();

  return (
    <div className="bg-[#0a0a0a]">
      {/* Hero Section with Video Background */}
      <section className="relative flex flex-col items-center justify-center min-h-screen text-center px-4 overflow-hidden">
        {/* Premium Video Background */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <iframe
            src="https://player.cloudinary.com/embed/?cloud_name=dmlsqpkve&public_id=Video_gomfbq"
            width="640"
            height="360" 
            style={{ height: '100%', width: '100%', objectFit: 'cover', transform: 'scale(1.5)' }}
            allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
            allowFullScreen
            frameBorder="0"
            className="absolute inset-0 w-full h-full top-0 pointer-events-none"
          ></iframe>
          {/* Dark gradient overlay to ensure text is legible */}
          <div className="absolute inset-0 w-full h-full object-cover brightness-110 contrast-110 bg-black/20" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 flex flex-col items-center">
          <Image 
            src="/logo (1).png" 
            alt="LapLogic Logo" 
            width={320} 
            height={80} 
            className="mb-8 object-contain" 
            priority 
          />
          <p className="font-display text-[#e8002d] text-sm tracking-[0.4em] uppercase mb-4">
            Season 2026 · On Polygon
          </p>
          <h1 className="font-f1-black text-6xl md:text-8xl leading-none mb-6">
            BUILD YOUR<br />
            <span className="text-[#e8002d]">TEAM.</span><br />
            EARN ON CHAIN.
          </h1>
          <p className="text-white/70 text-lg max-w-xl mb-10">
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
              className="bg-[#e8002d] hover:bg-[#ff1a3e] text-white font-display font-bold text-sm tracking-widest uppercase px-10 py-4 transition-all"
            >
              Enter the Grid →
            </button>
          )}
        </div>
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
    <div
      key={step}
      className="border border-[#2a2a2a] p-8 
                 bg-white/5 backdrop-blur-md 
                 hover:border-[#e8002d33] 
                 transition-colors"
    >
      <p className="font-display text-[#e8002d] text-5xl font-black mb-4">{step}</p>
      <h3 className="font-display font-bold text-xl mb-3">{title}</h3>
      <p className="text-[#a0a0a0] text-sm leading-relaxed">{desc}</p>
    </div>
  ))}
        </div>
      </section>
      <GameCoinWidget />
    </div>
  );
}
