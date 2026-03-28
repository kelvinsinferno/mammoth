import './globals.css';
import Providers from '../components/Providers';

export const metadata = {
  title: 'Mammoth',
  description: 'Cycle-based rights issuance framework on Solana',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
