
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserState, BlockchainEvent, RitualNotification, MeeBot } from '../types';
import { formatEther } from 'viem';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { client } from '../lib/viemClient';
import { getNFTBalance } from '../lib/services/nft';
import { getTokenBalance } from '../lib/services/token';
import { getRewardRate, getStakedBalance } from '../lib/services/staking';
import { generateMeeBotName } from '../lib/meeBotNames';
import { logger } from '../lib/logger';
import { CONFIG } from '../lib/config';
import { executeRitual } from '../lib/services/ritual';

interface AppContextType {
  state: UserState;
  events: BlockchainEvent[];
  connectWallet: (connector?: any) => Promise<void>;
  disconnectWallet: () => void;
  refreshBalances: () => Promise<void>;
  addEvent: (event: Omit<BlockchainEvent, 'id' | 'timestamp'>) => void;
  setGlobalLoading: (key: keyof UserState['loadingStates'], isLoading: boolean) => void;
  setGalleryFilter: (filter: string) => void;
  notify: (type: RitualNotification['type'], message: string) => void;
  removeNotification: (id: string) => void;
  toggleBotStaking: (botId: string) => Promise<void>;
  addBot: (bot: MeeBot) => void;
  updateLuckiness: (amount: number, reset?: boolean) => void;
  spendGems: (amount: number) => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { address } = useAccount();
  const { connectAsync, connectors } = useConnect();
  const { disconnectAsync } = useDisconnect();

  const [state, setState] = useState<UserState>(() => {
    const savedBots = localStorage.getItem(CONFIG.STORAGE_KEYS.BOTS);
    const savedFilter = localStorage.getItem(CONFIG.STORAGE_KEYS.FILTER) || 'All';
    const savedLuck = localStorage.getItem(CONFIG.STORAGE_KEYS.LUCKINESS);
    return {
      account: null,
      chainId: null,
      isConnecting: false,
      notifications: [],
      galleryFilter: savedFilter,
      loadingStates: {
        balances: false,
        staking: false,
        claiming: false,
        gallery: false,
        oracle: false,
        general: false
      },
      balances: {
        native: '0',
        token: '0',
        staked: '0',
        nftCount: 0,
        rewardRate: '0',
        gems: 250, 
        luckiness: savedLuck ? parseInt(savedLuck) : 5
      },
      myBots: savedBots ? JSON.parse(savedBots) : []
    };
  });

  const [events, setEvents] = useState<BlockchainEvent[]>([]);

  // Persistent storage sync
  useEffect(() => {
    localStorage.setItem(CONFIG.STORAGE_KEYS.BOTS, JSON.stringify(state.myBots));
  }, [state.myBots]);

  useEffect(() => {
    localStorage.setItem(CONFIG.STORAGE_KEYS.FILTER, state.galleryFilter);
  }, [state.galleryFilter]);

  useEffect(() => {
    localStorage.setItem(CONFIG.STORAGE_KEYS.LUCKINESS, state.balances.luckiness.toString());
  }, [state.balances.luckiness]);

  // Account sync
  useEffect(() => {
    if (address) {
      setState(prev => ({ ...prev, account: address as `0x${string}` }));
      if (state.myBots.length === 0) {
        // Initial mock bots for demonstration if none exist
        const initialBots: MeeBot[] = Array.from({ length: 3 }).map((_, i) => {
          const id = (3600 + i).toString();
          return {
            id,
            name: generateMeeBotName(id),
            rarity: i === 0 ? "Epic" : "Common",
            energyLevel: 0,
            stakingStart: null,
            isStaking: false,
            image: `https://picsum.photos/seed/meebot_${id}/1024/1024`,
            baseStats: { power: 50, speed: 50, intel: 50 },
            components: ["Core Logic", "Chassis v4"]
          };
        });
        setState(prev => ({ ...prev, myBots: initialBots }));
      }
    }
  }, [address]);

  const setGlobalLoading = useCallback((key: keyof UserState['loadingStates'], isLoading: boolean) => {
    setState(prev => ({
      ...prev,
      loadingStates: { ...prev.loadingStates, [key]: isLoading }
    }));
  }, []);

  const notify = useCallback((type: RitualNotification['type'], message: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setState(prev => ({
      ...prev,
      notifications: [...prev.notifications, { id, type, message, timestamp: Date.now() }]
    }));
    setTimeout(() => {
      setState(current => ({
        ...current,
        notifications: current.notifications.filter(n => n.id !== id)
      }));
    }, 5000);
  }, []);

  const refreshBalances = useCallback(async () => {
    if (!address) return;
    setGlobalLoading('balances', true);
    try {
      const results = await Promise.allSettled([
        client.getBalance({ address }),
        getTokenBalance(address),
        getStakedBalance(address),
        getNFTBalance(address),
        getRewardRate()
      ]);

      const [nativeRes, tokenRes, stakedRes, nftRes, rewardRes] = results;

      setState(prev => ({
        ...prev,
        balances: {
          ...prev.balances,
          native: nativeRes.status === 'fulfilled' ? formatEther(nativeRes.value) : prev.balances.native,
          token: tokenRes.status === 'fulfilled' ? formatEther(tokenRes.value) : prev.balances.token,
          staked: stakedRes.status === 'fulfilled' ? formatEther(stakedRes.value) : prev.balances.staked,
          rewardRate: rewardRes.status === 'fulfilled' ? formatEther(rewardRes.value) : prev.balances.rewardRate
        }
      }));
    } catch (e) {
      logger.error('Failed to sync telemetry', e);
    } finally {
      setGlobalLoading('balances', false);
    }
  }, [address, setGlobalLoading]);

  // Neural Heartbeat (Auto-Polling)
  useEffect(() => {
    if (!address) return;
    refreshBalances(); // Initial fetch
    const interval = setInterval(refreshBalances, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, [address, refreshBalances]);

  const toggleBotStaking = useCallback(async (botId: string) => {
    await executeRitual(
      'STAKE',
      async () => {
        await new Promise(r => setTimeout(r, 1500)); // Simulate chain work
        setState(prev => {
          const newBots = [...prev.myBots];
          const idx = newBots.findIndex(b => b.id === botId);
          if (idx !== -1) {
            newBots[idx] = { 
              ...newBots[idx], 
              isStaking: !newBots[idx].isStaking,
              stakingStart: !newBots[idx].isStaking ? Date.now() : null 
            };
          }
          return { ...prev, myBots: newBots };
        });
        return botId;
      },
      {
        setLoading: setGlobalLoading,
        loadingKey: 'staking',
        notify,
        successMessage: 'Rig manifest adjusted successfully.'
      }
    );
  }, [setGlobalLoading, notify]);

  // Rest of the methods...
  const addBot = useCallback((bot: MeeBot) => {
    setState(prev => ({ ...prev, myBots: [bot, ...prev.myBots] }));
  }, []);

  const updateLuckiness = useCallback((amount: number, reset: boolean = false) => {
    setState(prev => ({
      ...prev,
      balances: { ...prev.balances, luckiness: reset ? 0 : Math.min(prev.balances.luckiness + amount, 100) }
    }));
  }, []);

  const spendGems = useCallback((amount: number) => {
    let success = false;
    setState(prev => {
      if (prev.balances.gems >= amount) {
        success = true;
        return { ...prev, balances: { ...prev.balances, gems: prev.balances.gems - amount } };
      }
      return prev;
    });
    return success;
  }, []);

  const connectWallet = async (connector?: any) => {
    setState(prev => ({ ...prev, isConnecting: true }));
    try {
      await connectAsync({ connector: connector || connectors[0] });
    } catch (err: any) {
      notify('error', `Link failed: ${err.message}`);
    } finally {
      setState(prev => ({ ...prev, isConnecting: false }));
    }
  };

  const disconnectWallet = async () => {
    await disconnectAsync();
    setState(prev => ({ ...prev, account: null }));
  };

  const addEvent = useCallback((event: Omit<BlockchainEvent, 'id' | 'timestamp'>) => {
    setEvents(prev => [{ ...event, id: Math.random().toString(36).substr(2, 9), timestamp: Date.now() }, ...prev].slice(0, 50));
  }, []);

  return (
    <AppContext.Provider value={{
      state, events, connectWallet, disconnectWallet, refreshBalances,
      addEvent, setGlobalLoading, setGalleryFilter: (f) => setState(s => ({...s, galleryFilter: f})),
      notify, removeNotification: (id) => setState(s => ({...s, notifications: s.notifications.filter(n => n.id !== id)})),
      toggleBotStaking, addBot, updateLuckiness, spendGems
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
