'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@solana/wallet-adapter-react';
import CycleDashboard from '../../views/CycleDashboard';
import WalletModal from '../../components/wallet/WalletModal';
import LaunchWizard from '../../views/LaunchWizard';
import { useApp } from '../../lib/AppContext';

export default function CreatorPage() {
  const router = useRouter();
  const { myProjects, walletState, setWalletState, theme, handleLaunchCycle, handleTerminateProject, handleLaunchToken, projectsLoading } = useApp();
  const { connected, connecting } = useWallet();
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showLaunchModal, setShowLaunchModal] = useState(false);
  const [resumeDraft, setResumeDraft] = useState(null);
  const [userClosedModal, setUserClosedModal] = useState(false);

  // Prompt wallet only after autoConnect has had a chance to rehydrate.
  // Avoids the flash-modal-then-home-redirect race.
  useEffect(() => {
    if (connected) {
      setShowWalletModal(false);
      setUserClosedModal(false);
      return;
    }
    if (connecting) return; // wait for autoConnect to settle
    // Give the adapter one tick to restore a prior session before popping the modal
    const t = setTimeout(() => {
      if (!connected && !userClosedModal) setShowWalletModal(true);
    }, 400);
    return () => clearTimeout(t);
  }, [connected, connecting, userClosedModal]);

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
        onResumeDraft={(draft) => { setResumeDraft(draft); setShowLaunchModal(true); }}
      />
      {showLaunchModal && (
        <LaunchWizard
          onClose={() => { setShowLaunchModal(false); setResumeDraft(null); }}
          onLaunch={(newProject) => { handleLaunchToken(newProject); setShowLaunchModal(false); setResumeDraft(null); }}
          walletState={walletState}
          theme={theme}
          initialData={resumeDraft}
        />
      )}
      {showWalletModal && (
        <WalletModal
          onClose={() => {
            setShowWalletModal(false);
            // Only bounce home if the user actually rejected; if a connect
            // is in flight or already succeeded, stay on /creator.
            if (!connected && !connecting) {
              setUserClosedModal(true);
              router.push('/');
            }
          }}
          onConnected={(s) => { setWalletState(s); setShowWalletModal(false); }}
        />
      )}
    </>
  );
}
