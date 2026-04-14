'use client';
import { useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { SolflareWalletAdapter } from '@solana/wallet-adapter-solflare';
import { BackpackWalletAdapter } from '@solana/wallet-adapter-backpack';
import { CoinbaseWalletAdapter } from '@solana/wallet-adapter-coinbase';
import { LedgerWalletAdapter } from '@solana/wallet-adapter-ledger';

const ENDPOINT = process.env.NEXT_PUBLIC_RPC_URL || 'https://api.devnet.solana.com';

export default function WalletContextProvider({ children }) {
  const wallets = useMemo(() => [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter(),
    new BackpackWalletAdapter(),
    new CoinbaseWalletAdapter(),
    new LedgerWalletAdapter(),
  ], []);

  return (
    <ConnectionProvider endpoint={ENDPOINT}>
      <WalletProvider wallets={wallets} autoConnect>
        {children}
      </WalletProvider>
    </ConnectionProvider>
  );
}
