'use client';
import WalletContextProvider from './wallet/WalletProvider';
import { AppProvider } from '../lib/AppContext';

export default function Providers({ children }) {
  return (
    <WalletContextProvider>
      <AppProvider>
        {children}
      </AppProvider>
    </WalletContextProvider>
  );
}
