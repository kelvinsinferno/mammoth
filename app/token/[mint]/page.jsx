'use client';
import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import ProjectDetail from '../../../views/ProjectDetail';
import WalletModal from '../../../components/wallet/WalletModal';
import CycleDashboard from '../../../views/CycleDashboard';
import { useApp } from '../../../lib/AppContext';

export default function TokenPage() {
  const router = useRouter();
  const { mint } = useParams();
  const { projects, myProjects, walletState, setWalletState, theme, toggleTheme, handleLaunchCycle, handleTerminateProject, disconnect } = useApp();
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showCycleDashboard, setShowCycleDashboard] = useState(false);

  // Find project by id (mint pubkey once on-chain; id for now)
  const project = projects.find(p => String(p.id) === String(mint));

  if (!project) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', color: 'var(--text-muted)', fontFamily: "'IBM Plex Mono', monospace", fontSize: 14 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🦣</div>
          <div>Token not found</div>
          <button onClick={() => router.push('/')} style={{ marginTop: 16, background: '#8B5CF6', color: '#fff', border: 'none', borderRadius: 7, padding: '8px 20px', cursor: 'pointer', fontFamily: "'IBM Plex Mono', monospace", fontSize: 12 }}>
            ← Back to Discovery
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <ProjectDetail
        project={project}
        onBack={() => router.push('/')}
        wallet={walletState.status === 'connected'}
        walletState={walletState}
        onOpenModal={() => setShowWalletModal(true)}
        onDisconnect={() => disconnect()}
        onConnect={() => setShowWalletModal(true)}
        onPurchase={() => {}}
        onManageCycles={() => setShowCycleDashboard(true)}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
      {showWalletModal && (
        <WalletModal
          onClose={() => setShowWalletModal(false)}
          onConnected={(s) => { setWalletState(s); setShowWalletModal(false); }}
        />
      )}
      {showCycleDashboard && (
        <CycleDashboard
          myProjects={myProjects}
          onClose={() => setShowCycleDashboard(false)}
          onLaunchCycle={(cycle) => handleLaunchCycle(project.id, cycle)}
          onTerminateProject={handleTerminateProject}
          theme={theme}
        />
      )}
    </>
  );
}
