'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CycleDashboard from '../../views/CycleDashboard';
import WalletModal from '../../components/wallet/WalletModal';
import LaunchWizard from '../../views/LaunchWizard';
import { useApp } from '../../lib/AppContext';

export default function CreatorPage() {
  const router = useRouter();
  const { myProjects, walletState, setWalletState, theme, handleLaunchCycle, handleTerminateProject, handleLaunchToken, projectsLoading } = useApp();
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showLaunchModal, setShowLaunchModal] = useState(false);

  // If not connected, prompt wallet connection
  useEffect(() => {
    if (walletState.status !== 'connected') {
      setShowWalletModal(true);
    }
  }, []);

  return (
    <>
      <CycleDashboard
        myProjects={myProjects}
        onClose={() => router.push('/')}
        onLaunchCycle={(cycle) => handleLaunchCycle(null, cycle)}
        onTerminateProject={handleTerminateProject}
        theme={theme}
        loading={projectsLoading}
        onLaunchNew={() => setShowLaunchModal(true)}
      />
      {showLaunchModal && (
        <LaunchWizard
          onClose={() => setShowLaunchModal(false)}
          onLaunch={(newProject) => { handleLaunchToken(newProject); setShowLaunchModal(false); }}
          walletState={walletState}
          theme={theme}
        />
      )}
      {showWalletModal && (
        <WalletModal
          onClose={() => { setShowWalletModal(false); if (walletState.status !== 'connected') router.push('/'); }}
          onConnected={(s) => { setWalletState(s); setShowWalletModal(false); }}
        />
      )}
    </>
  );
}
