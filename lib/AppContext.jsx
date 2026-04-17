'use client';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { MOCK_PROJECTS } from './data';
import { applyProjectMeta, saveProjectMeta } from './utils';
import {
  getProgram,
  fetchAllProjects,
  fetchProjectByMint,
  fetchActiveCycle,
  getProjectStatePDA,
  getCycleStatePDA,
  computeCurrentPrice,
  lamportsToSol,
} from './anchorClient';

const AppContext = createContext(null);

// ─── Map on-chain ProjectState + CycleState → UI card format ─────────────────

function mapOnChainProject(projectAccount, mintAddress, cycleAccount) {
  const proj = projectAccount;
  const cycle = cycleAccount?.account;

  const supplyMode = proj.supplyMode?.elastic !== undefined ? 'Elastic' : 'Fixed';
  const totalSupply = Number(proj.totalSupply);
  const totalMinted = Number(proj.totalMinted);
  const currentCycle = proj.currentCycle ?? 0;

  let cycleData = null;
  let status = 'BETWEEN';
  let progress = 0;
  let currentPrice = 0;

  if (cycle && cycle.status?.active !== undefined) {
    const supplyCap = Number(cycle.supplyCap);
    const minted = Number(cycle.minted);
    const baseP = lamportsToSol(cycle.basePrice);
    const stepSz = Number(cycle.stepSize);
    const stepIncrSol = lamportsToSol(cycle.stepIncrement);

    currentPrice = computeCurrentPrice(cycle);
    const stepIndex = stepSz > 0 ? Math.floor(minted / stepSz) : 0;
    const nextStepIn = stepSz > 0 ? stepSz - (minted % stepSz) : null;
    const nextStepPrice = stepSz > 0 ? baseP + (stepIndex + 1) * stepIncrSol : null;
    const rightsWindowEnd = Number(cycle.rightsWindowEnd);
    const now = Math.floor(Date.now() / 1000);
    const rightsActive = rightsWindowEnd > now;

    cycleData = {
      id: currentCycle,
      status: 'ACTIVE',
      allocation: supplyCap,
      sold: minted,
      curveType: cycle.curveType?.step !== undefined ? 'Step'
        : cycle.curveType?.linear !== undefined ? 'Linear'
        : 'Exp-Lite',
      currentPrice,
      nextStepIn,
      nextStepPrice,
      stepSize: stepSz,
      stepIncrement: stepIncrSol,
      userRights: 0, // loaded separately when wallet connected
      userRightsUsed: 0,
      solRaised: lamportsToSol(cycle.solRaised),
      rightsWindowEnd,
      rightsActive,
      treasuryRouting: {
        creator: proj.creatorBps / 100,
        reserve: proj.reserveBps / 100,
        sink: proj.sinkBps / 100,
      },
    };

    progress = supplyCap > 0 ? Math.round(minted / supplyCap * 100) : 0;
    status = 'ACTIVE';
  }

  return {
    id: mintAddress,
    mint: mintAddress,
    name: mintAddress.slice(0, 6) + '...' + mintAddress.slice(-4), // fallback until metadata
    ticker: mintAddress.slice(0, 4).toUpperCase(),
    description: '',
    creator: proj.creator?.toBase58?.() || proj.creator?.toString?.() || '',
    createdAt: new Date().toISOString().slice(0, 10),
    supplyMode,
    totalSupply,
    publicAlloc: Number(proj.publicAllocation),
    treasuryAlloc: Number(proj.treasuryAllocation),
    creatorBps: Number(proj.creatorBps ?? 0),
    reserveBps: Number(proj.reserveBps ?? 0),
    sinkBps: Number(proj.sinkBps ?? 0),
    hardCap: proj.supplyMode?.fixed !== undefined,
    status,
    price: currentPrice,
    change: 0,
    volume: 0,
    raised: cycleData ? cycleData.solRaised.toFixed(1) + ' SOL' : '0 SOL',
    progress,
    cycle: currentCycle,
    sparkline: [],
    cycleData,
    cycleHistory: cycleData ? [{
      id: currentCycle,
      allocation: cycleData.allocation,
      sold: cycleData.sold,
      status: 'ACTIVE',
      raised: cycleData.solRaised.toFixed(2) + ' SOL',
      priceRange: `${lamportsToSol(cycle?.basePrice || 0).toFixed(5)}–now`,
    }] : [],
    chartData: [{ t: Date.now(), p: currentPrice || 0 }],
    _onChain: true,
  };
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AppProvider({ children }) {
  const { disconnect, connected, publicKey, wallet, signTransaction, signAllTransactions } = useWallet();
  const { connection } = useConnection();

  const [projects, setProjects] = useState([]);
  const [myProjects, setMyProjects] = useState([]);
  const [walletState, setWalletState] = useState({
    status: 'disconnected', address: null, short: null, balance: 0, adapter: null, error: null
  });
  const [theme, setTheme] = useState('dark');
  const [onChainLoaded, setOnChainLoaded] = useState(false);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [rpcError, setRpcError] = useState(null);

  // Init theme from localStorage
  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('mammoth-theme') : null;
    if (saved) setTheme(saved);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    if (typeof window !== 'undefined') localStorage.setItem('mammoth-theme', theme);
  }, [theme]);

  // Sync real wallet state + balance
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
        setWalletState(s => ({ ...s, status: 'connected', address: addr, short, balance: 0 }));
      });
    } else if (!connected) {
      setWalletState({ status: 'disconnected', address: null, short: null, balance: 0, adapter: null, error: null });
    }
  }, [connected, publicKey, connection, wallet]);

  // Build wallet adapter shim for Anchor
  const getWalletAdapter = useCallback(() => {
    if (!publicKey || !signTransaction || !signAllTransactions) return null;
    return {
      publicKey,
      signTransaction,
      signAllTransactions,
    };
  }, [publicKey, signTransaction, signAllTransactions]);

  // Load on-chain projects
  const loadOnChainProjects = useCallback(async () => {
    setProjectsLoading(true);
    try {
      const walletAdapter = getWalletAdapter() || {
        publicKey: publicKey || { toBase58: () => '' },
        signTransaction: async tx => tx,
        signAllTransactions: async txs => txs,
      };
      const program = getProgram(connection, walletAdapter);
      const rawProjects = await fetchAllProjects(program);

      if (rawProjects.length === 0) {
        // No on-chain projects — keep demo fallback only when nothing real has loaded yet
        setProjects(prev => prev.length ? prev : MOCK_PROJECTS);
        setRpcError(null);
        setProjectsLoading(false);
        return;
      }

      const mapped = await Promise.all(rawProjects.map(async ({ publicKey: projPda, account }) => {
        const mintAddress = account.mint?.toBase58?.() || account.mint?.toString?.() || '';
        // Try to load active cycle
        let cycleAccount = null;
        if (account.currentCycle > 0) {
          cycleAccount = await fetchActiveCycle(program, projPda, account.currentCycle - 1);
        }
        const base = mapOnChainProject(account, mintAddress, cycleAccount);
        return applyProjectMeta(base);
      }));

      setProjects(prev => {
        // Merge: on-chain projects + any mock projects not yet on-chain (for demo)
        const onChainIds = new Set(mapped.map(p => p.id));
        const mockOnly = prev.filter(p => !p._onChain && !onChainIds.has(p.id));
        return [...mapped, ...mockOnly];
      });

      // Filter creator's projects
      if (publicKey) {
        const creatorAddr = publicKey.toBase58();
        const mine = mapped.filter(p => p.creator === creatorAddr);
        setMyProjects(mine);
      }

      setRpcError(null);
      setOnChainLoaded(true);
    } catch (e) {
      console.warn('[mammoth] loadOnChainProjects failed:', e.message);
      // Preserve previously loaded data; only fall back to demo data if nothing exists yet
      setProjects(prev => prev.length ? prev : MOCK_PROJECTS);
      setRpcError('Connection issue — showing cached data when available');
    } finally {
      setProjectsLoading(false);
    }
  }, [connection, publicKey, getWalletAdapter]);

  useEffect(() => {
    loadOnChainProjects();
  }, [loadOnChainProjects]);

  // Reload my projects when wallet connects
  useEffect(() => {
    if (connected && publicKey && onChainLoaded) {
      const creatorAddr = publicKey.toBase58();
      setMyProjects(projects.filter(p => p._onChain && p.creator === creatorAddr));
    }
  }, [connected, publicKey, onChainLoaded, projects]);

  // ─── Handlers (local state for mock / optimistic updates) ────────────────

  const handleLaunchToken = (newProject) => {
    // Persist the editable metadata so it survives on-chain reloads / refreshes
    saveProjectMeta(newProject.mint || newProject.id, newProject);
    const projectWithData = {
      ...newProject,
      chartData: Array.from({ length: 30 }, (_, i) => ({
        t: Date.now() - (29 - i) * 24 * 60 * 60 * 1000,
        p: newProject.price * (0.95 + Math.random() * 0.15 * (i / 30)),
      })),
      cycleData: {
        id: 1, status: 'ACTIVE', sold: 0, allocation: 1000000,
        currentPrice: newProject.price, stepSize: 5000, stepIncrement: 0.00022,
        nextStepIn: 5000, userRights: 0, userRightsUsed: 0,
        treasuryRouting: { creator: 40, reserve: 30, sink: 20 },
      },
      cycleHistory: [{
        id: 1, status: 'ACTIVE',
        allocation: newProject.totalSupply ? Math.floor(newProject.totalSupply * 0.6) : 1000000,
        raised: '0 SOL',
        priceRange: `${newProject.price?.toFixed(5)} - now`,
      }],
      _mine: true,
    };
    setMyProjects(p => [...p, projectWithData]);
    setProjects(p => [...p, projectWithData]);
    // Reload on-chain after a short delay to pick up new project
    setTimeout(() => loadOnChainProjects(), 3000);
  };

  const handleLaunchCycle = (projectId, newCycle) => {
    setMyProjects(ps => ps.map(p => p.id === projectId ? { ...p, cycleData: newCycle } : p));
    setProjects(ps => ps.map(p => p.id === projectId ? { ...p, cycleData: newCycle } : p));
    setTimeout(() => loadOnChainProjects(), 3000);
  };

  const handleTerminateProject = (projectId) => {
    setMyProjects(ps => ps.map(p =>
      p.id === projectId ? { ...p, cycleData: p.cycleData ? { ...p.cycleData, status: 'TERMINATED' } : null } : p
    ));
    setProjects(ps => ps.map(p =>
      p.id === projectId ? { ...p, cycleData: p.cycleData ? { ...p.cycleData, status: 'TERMINATED' } : null } : p
    ));
    setTimeout(() => loadOnChainProjects(), 3000);
  };

  return (
    <AppContext.Provider value={{
      projects, myProjects,
      walletState, setWalletState,
      theme, toggleTheme: () => setTheme(t => t === 'dark' ? 'light' : 'dark'),
      handleLaunchToken, handleLaunchCycle, handleTerminateProject,
      disconnect,
      connection,
      getWalletAdapter,
      loadOnChainProjects,
      projectsLoading,
      rpcError,
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
