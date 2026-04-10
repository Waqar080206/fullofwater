'use client';
import Link from 'next/link';
import ConnectButton from '../wallet/ConnectButton';

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-[#0a0a0a]/90 backdrop-blur-sm border-b border-[#2a2a2a] z-50">
      <div className="max-w-6xl mx-auto px-4 h-full flex items-center justify-between">
        <Link href="/" className="font-display font-black text-xl tracking-wider text-white">
          OFF<span className="text-[#e8002d]">GRID</span>
        </Link>
        <div className="flex gap-6 items-center">
          <Link href="/dashboard" className="font-display text-sm text-[#a0a0a0] hover:text-white transition-colors">DASHBOARD</Link>
          <ConnectButton />
        </div>
      </div>
    </nav>
  );
}