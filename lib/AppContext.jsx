'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { MOCK_PROJECTS } from './data';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const { disconnect, connected, publicKey, wallet } = useWallet();
  const { connection } = useConnection();

  const [projects, setProjects] = useState(MOCK_PROJECTS);
  const [myProjects, setMyProjects] = useState([]);
  const [walletState, setWalletState] = useState({ status:'disconnected', address:null, short:null, balance:0, adapter:null, error:null });
  const [theme, setTheme] = useState('dark');

  // Init theme from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('mammoth-theme');
    if (saved) setTheme(saved);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('mammoth-theme', theme);
  }, [theme]);

  // Sync real wallet state
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

  const handleLaunchToken = (newProject) => {
    const projectWithData = {
      ...newProject,
      chartData: Array.from({ length: 30 }, (_, i) => ({
        t: Date.now() - (29 - i) * 24 * 60 * 60 * 1000,
        p: newProject.price * (0.95 + Math.random() * 0.15 * (i / 30)),
      })),
      cycleData: {
        id: 1, status: 'ACTIVE', sold: 450000, allocation: 1000000,
        currentPrice: newProject.price, stepSize: 5000, stepIncrement: 0.00022,
        nextStepIn: 100000, userRights: 0, userRightsUsed: 0,
        treasuryRouting: { creator: 40, reserve: 30, sink: 20 },
      },
      cycleHistory: [{ id: 1, status: 'ACTIVE', allocation: `${(newProject.totalSupply / 1e6).toFixed(1)}M`, raised: '450 SOL', priceRange: `${(newProject.price * 0.95).toFixed(5)} - ${(newProject.price * 1.05).toFixed(5)}` }],
      _mine: true,
    };
    setMyProjects(p => [...p, projectWithData]);
    setProjects(p => [...p, projectWithData]);
  };

  const handleLaunchCycle = (projectId, newCycle) => {
    setMyProjects(ps => ps.map(p => p.id === projectId ? { ...p, cycleData: newCycle } : p));
  };

  const handleTerminateProject = (projectId) => {
    setMyProjects(ps => ps.map(p => p.id === projectId ? { ...p, cycleData: { ...p.cycleData, status: 'TERMINATED' } } : p));
  };

  return (
    <AppContext.Provider value={{
      projects, myProjects,
      walletState, setWalletState,
      theme, toggleTheme: () => setTheme(t => t === 'dark' ? 'light' : 'dark'),
      handleLaunchToken, handleLaunchCycle, handleTerminateProject,
      disconnect,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
