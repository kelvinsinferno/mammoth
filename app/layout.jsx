import './globals.css';

export const metadata = {
  title: 'Mammoth',
  description: 'Cycle-based rights issuance framework on Solana',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
