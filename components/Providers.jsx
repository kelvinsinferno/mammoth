'use client';
import WalletContextProvider from './wallet/WalletProvider';
import { AppProvider } from '../lib/AppContext';
import { ToastProvider } from './ui/Toast';

export default function Providers({ children }) {
  return (
    <WalletContextProvider>
      <AppProvider>
        <ToastProvider>
          {children}
        </ToastProvider>
      </AppProvider>
    </WalletContextProvider>
  );
}
