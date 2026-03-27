'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Homepage from '../views/Homepage';
import WalletModal from '../components/wallet/WalletModal';
import LaunchWizard from '../views/LaunchWizard';
import { useApp } from '../lib/AppContext';

export default function Page() {
  const router = useRouter();
  const { projects, walletState, setWalletState, theme, toggleTheme, handleLaunchToken, disconnect } = useApp();
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showLaunchModal, setShowLaunchModal] = useState(false);

  const handleSelectProject = (p) => {
    router.push(`/token/${p.id}`);
  };

  const handleLaunch = (newProject) => {
    handleLaunchToken(newProject);
    setShowLaunchModal(false);
  };

  return (
    <>
      <Homepage
        projects={projects}
        onSelectProject={handleSelectProject}
        wallet={walletState.status === 'connected'}
        walletState={walletState}
        onOpenModal={() => setShowWalletModal(true)}
        onDisconnect={() => disconnect()}
        onLaunch={() => setShowLaunchModal(true)}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
      {showWalletModal && (
        <WalletModal
          onClose={() => setShowWalletModal(false)}
          onConnected={(s) => { setWalletState(s); setShowWalletModal(false); }}
        />
      )}
      {showLaunchModal && (
        <LaunchWizard
          onClose={() => setShowLaunchModal(false)}
          onLaunch={handleLaunch}
          walletState={walletState}
          theme={theme}
        />
      )}
    </>
  );
}
