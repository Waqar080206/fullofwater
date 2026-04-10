import type { Metadata } from 'next';
import './globals.css';
import { WalletProvider } from '../context/WalletContext';
import { AuthProvider } from '../context/AuthContext';
import Navbar from '../components/layout/Navbar';

export const metadata: Metadata = {
  title: 'LapLogic',
  description: 'Build your F1 fantasy team, predict race outcomes, earn on-chain.',
  icons: {
    icon: '/logo.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#0a0a0a] text-white font-body min-h-screen">
        <WalletProvider>
          <AuthProvider>
            <Navbar />
            <main className="pt-16">{children}</main>
          </AuthProvider>
        </WalletProvider>
      </body>
    </html>
  );
}