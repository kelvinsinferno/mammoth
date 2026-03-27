'use client';
import { useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import Homepage from './views/Homepage';
import ProjectDetail from './views/ProjectDetail';
import LaunchWizard from './views/LaunchWizard';
import CycleDashboard from './views/CycleDashboard';
import WalletModal from './components/wallet/WalletModal';
import { MOCK_PROJECTS } from './lib/data';

export default function MammothApp() {
  const { disconnect, connected, publicKey, wallet } = useWallet();
  const { connection } = useConnection();
  const [view, setView] = useState('home');
  const [selectedProject, setSelectedProject] = useState(null);
  const [projects, setProjects] = useState(MOCK_PROJECTS);
  const [myProjects, setMyProjects] = useState([]);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showLaunchModal, setShowLaunchModal] = useState(false);
  const [showCycleDashboard, setShowCycleDashboard] = useState(false);
  const [walletState, setWalletState] = useState({ status:'disconnected', address:null, short:null, balance:0, adapter:null, error:null });

  // Sync real wallet state — fetch SOL balance when connected
  useEffect(() => {
    if (connected && publicKey) {
      const addr = publicKey.toBase58();
      const short = addr.slice(0, 4) + '...' + addr.slice(-4);
      connection.getBalance(publicKey).then(lamports => {
        setWalletState({
          status: 'connected',
          address: addr,
          short,
          balance: +(lamports / 1e9).toFixed(4),
          adapter: wallet?.adapter?.name || 'Unknown',
          error: null,
        });
      }).catch(() => {
        setWalletState(s => ({ ...s, balance: 0 }));
      });
    } else if (!connected) {
      setWalletState({ status:'disconnected', address:null, short:null, balance:0, adapter:null, error:null });
    }
  }, [connected, publicKey]);
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mammoth-theme');
      return saved || 'dark';
    }
    return 'dark';
  });

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('mammoth-theme', theme);
    }
  }, [theme]);

  const handleSelectProject = (p) => {
    setSelectedProject(p);
    setView('detail');
  };

  const handleLaunchToken = (newProject) => {
    const projectWithData = {
      ...newProject,
      chartData: Array.from({length:30}, (_, i) => ({
        t: Date.now() - (29-i)*24*60*60*1000,
        p: newProject.price * (0.95 + Math.random()*0.15 * (i/30))
      })),
      cycleData: {
        id: 1, status:'ACTIVE', sold:450000, allocation:1000000, currentPrice:newProject.price,
        stepSize:5000, stepIncrement:0.00022, nextStepIn:550000-450000,
        userRights:0, userRightsUsed:0, treasuryRouting:{creator:40,reserve:30,sink:20}
      },
      cycleHistory: [{ id:1, status:'ACTIVE', allocation:`${(newProject.totalSupply/1e6).toFixed(1)}M`, raised:'450 SOL', priceRange:`${(newProject.price*0.95).toFixed(5)} - ${(newProject.price*1.05).toFixed(5)}` }],
      _mine: true
    };
    setMyProjects(p => [...p, projectWithData]);
    setProjects(p => [...p, projectWithData]);
    setShowLaunchModal(false);
    setView('home');
  };

  const handleWalletConnect = (newState) => {
    setWalletState(newState);
    setShowWalletModal(false);
  };

  const handleLaunchCycle = (newCycle) => {
    setMyProjects(ps => ps.map(p => p.id === selectedProject?.id ? { ...p, cycleData:newCycle } : p));
  };

  const handleTerminateProject = (projectId) => {
    setMyProjects(ps => ps.map(p => p.id === projectId ? { ...p, cycleData:{...p.cycleData, status:'TERMINATED'} } : p));
  };

  const handleToggleTheme = () => {
    setTheme(t => t === 'dark' ? 'light' : 'dark');
  };

  if (view === 'home') return (
    <>
      <Homepage projects={projects} onSelectProject={handleSelectProject}
        wallet={walletState.status === 'connected'} walletState={walletState}
        onOpenModal={() => setShowWalletModal(true)} onDisconnect={() => disconnect()}
        onLaunch={() => setShowLaunchModal(true)} theme={theme} onToggleTheme={handleToggleTheme}/>
      {showWalletModal && <WalletModal onClose={() => setShowWalletModal(false)} onConnected={handleWalletConnect}/>}
      {showLaunchModal && <LaunchWizard onClose={() => setShowLaunchModal(false)} onLaunch={handleLaunchToken} walletState={walletState} theme={theme}/>}
    </>
  );

  if (view === 'detail' && selectedProject) return (
    <>
      <ProjectDetail project={selectedProject} onBack={() => setView('home')}
        wallet={walletState.status === 'connected'} walletState={walletState}
        onOpenModal={() => setShowWalletModal(true)} onDisconnect={() => disconnect()}
        onConnect={() => setShowWalletModal(true)} onPurchase={() => {}} onManageCycles={() => setShowCycleDashboard(true)}
        theme={theme} onToggleTheme={handleToggleTheme}/>
      {showWalletModal && <WalletModal onClose={() => setShowWalletModal(false)} onConnected={handleWalletConnect}/>}
      {showCycleDashboard && (
        <CycleDashboard myProjects={myProjects} onClose={() => setShowCycleDashboard(false)}
          onLaunchCycle={handleLaunchCycle} onTerminateProject={handleTerminateProject} theme={theme}/>
      )}
    </>
  );

  return null;
}
