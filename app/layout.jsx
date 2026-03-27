import './globals.css';
import WalletContextProvider from '../components/wallet/WalletProvider';

export const metadata = {
  title: 'Mammoth',
  description: 'Cycle-based rights issuance framework on Solana',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <WalletContextProvider>
          {children}
        </WalletContextProvider>
      </body>
    </html>
  );
}
