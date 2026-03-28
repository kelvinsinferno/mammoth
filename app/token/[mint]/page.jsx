'use client';
import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import ProjectDetail from '../../../views/ProjectDetail';
import WalletModal from '../../../components/wallet/WalletModal';
import CycleDashboard from '../../../views/CycleDashboard';
import { useApp } from '../../../lib/AppContext';
import { SkeletonChartPanel, SkeletonCyclePanel, Skeleton } from '../../../components/ui/Skeleton';

export default function TokenPage() {
  const router = useRouter();
  const { mint } = useParams();
  const { projects, myProjects, walletState, setWalletState, theme, toggleTheme, handleLaunchCycle, handleTerminateProject, disconnect, projectsLoading, rpcError } = useApp();
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showCycleDashboard, setShowCycleDashboard] = useState(false);

  // Find project by id (mint pubkey once on-chain; id for now)
  const project = projects.find(p => String(p.id) === String(mint));

  // Still loading — show skeleton layout
  if (projectsLoading && !project) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--page-bg)', color: 'var(--text)' }}>
        <div style={{ height: 52, background: 'var(--header-bg)', borderBottom: '1px solid var(--header-border)' }} />
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '20px 16px 64px' }}>
          {/* Token header skeleton */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(139,92,246,0.12)', animation: 'skelPulse 1.6s ease-in-out infinite', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <Skeleton width="40%" height={28} style={{ marginBottom: 8 }} />
              <Skeleton width="60%" height={12} />
            </div>
          </div>
          <SkeletonChartPanel />
          <SkeletonCyclePanel />
        </div>
      </div>
    );
  }

  // Loaded but not found — show error
  if (!project) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--page-bg)', color: 'var(--text-muted)', fontFamily: "'IBM Plex Mono', monospace", fontSize: 14 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 14 }}>🦣</div>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 18, color: 'var(--text)', marginBottom: 8 }}>Token not found</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20 }}>This mint address doesn&apos;t match any known project.</div>
          <button onClick={() => router.push('/')} style={{ background: '#8B5CF6', color: '#fff', border: 'none', borderRadius: 7, padding: '10px 22px', cursor: 'pointer', fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, fontWeight: 700, letterSpacing: '0.04em' }}>
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
        rpcError={rpcError}
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
