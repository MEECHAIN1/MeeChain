
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserState, BlockchainEvent, RitualNotification, MeeBot } from '../types';
import { formatEther } from 'viem';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { client } from '../lib/viemClient';
import { getNFTBalance } from '../lib/services/nft';
import { getTokenBalance } from '../lib/services/token';
import { getRewardRate } from '../lib/services/staking';
import { generateMeeBotName } from '../lib/meeBotNames';
import { ai } from '../lib/ai';

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
  toggleBotStaking: (botId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const BOTS_STORAGE_KEY = 'meebot_collective_data';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { address } = useAccount();
  const { connectAsync, connectors } = useConnect();
  const { disconnectAsync } = useDisconnect();

  const [state, setState] = useState<UserState>(() => {
    const savedBots = localStorage.getItem(BOTS_STORAGE_KEY);
    return {
      account: null,
      chainId: null,
      isConnecting: false,
      notifications: [],
      galleryFilter: 'All',
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
        nftCount: 0,
        rewardRate: '0'
      },
      myBots: savedBots ? JSON.parse(savedBots) : []
    };
  });

  const [events, setEvents] = useState<BlockchainEvent[]>([]);

  // Persist bots to local storage
  useEffect(() => {
    if (state.myBots.length > 0) {
      localStorage.setItem(BOTS_STORAGE_KEY, JSON.stringify(state.myBots));
    }
  }, [state.myBots]);

  // Initialize mock bots when account connects if collective is empty
  useEffect(() => {
    if (address && state.myBots.length === 0) {
      const initialBots: MeeBot[] = Array.from({ length: 6 }).map((_, i) => {
        const id = (2025 + i).toString();
        const rarity = i % 5 === 0 ? "Legendary" : i % 3 === 0 ? "Epic" : "Common";
        return {
          id,
          name: generateMeeBotName(id),
          rarity,
          energyLevel: 0,
          stakingStart: null,
          isStaking: false,
          image: `https://picsum.photos/seed/meebot_rig_${id}/1024/1024`,
          baseStats: {
            power: 40 + Math.random() * 20,
            speed: 40 + Math.random() * 20,
            intel: 40 + Math.random() * 20
          }
        };
      });
      setState(prev => ({ ...prev, account: address as `0x${string}`, myBots: initialBots }));
    } else if (address) {
      setState(prev => ({ ...prev, account: address as `0x${string}` }));
    }
  }, [address]);

  // High-frequency energy infusion logic
  useEffect(() => {
    const interval = setInterval(() => {
      setState(prev => {
        let evolutionOccurred = false;
        const updatedBots = prev.myBots.map(bot => {
          if (bot.isStaking && bot.stakingStart) {
            // Demo: 1 MCB every 10 seconds for visual satisfaction
            const now = Date.now();
            const elapsed = (now - bot.stakingStart) / 1000;
            if (elapsed >= 10) {
              const newEnergy = bot.energyLevel + 1;
              
              // Check for evolution milestones
              if ([10, 25, 50].includes(newEnergy)) evolutionOccurred = true;

              return { ...bot, energyLevel: newEnergy, stakingStart: now };
            }
          }
          return bot;
        });

        if (evolutionOccurred) {
          // Trigger a notification if needed, but handled better via events
        }

        return { ...prev, myBots: updatedBots };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleBotStaking = useCallback((botId: string) => {
    setState(prev => {
      const botIndex = prev.myBots.findIndex(b => b.id === botId);
      if (botIndex === -1) return prev;

      const bot = prev.myBots[botIndex];
      const activating = !bot.isStaking;
      
      const newBots = [...prev.myBots];
      newBots[botIndex] = {
        ...bot,
        isStaking: activating,
        stakingStart: activating ? Date.now() : null
      };

      // Logging logic
      setTimeout(() => {
        addEvent({
          type: activating ? 'Staked' : 'Claimed',
          contract: 'Staking',
          from: prev.account || '0x0',
          tokenId: bot.id,
          hash: `0x${Math.random().toString(16).slice(2, 66)}`
        });
        notify(activating ? 'success' : 'info', `${activating ? 'Rig Active' : 'Rig Idle'} for ${bot.name}`);
      }, 0);

      return { ...prev, myBots: newBots };
    });
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

  const addEvent = useCallback((event: Omit<BlockchainEvent, 'id' | 'timestamp'>) => {
    const newEvent: BlockchainEvent = {
      ...event,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
    };
    setEvents(prev => [newEvent, ...prev].slice(0, 50));
  }, []);

  const setGlobalLoading = useCallback((key: keyof UserState['loadingStates'], isLoading: boolean) => {
    setState(prev => ({
      ...prev,
      loadingStates: { ...prev.loadingStates, [key]: isLoading }
    }));
  }, []);

  const setGalleryFilter = useCallback((filter: string) => {
    setState(prev => ({ ...prev, galleryFilter: filter }));
  }, []);

  const refreshBalances = useCallback(async () => {
    if (!address) return;
    setGlobalLoading('balances', true);
    try {
      const [nativeBalance, tokenBalance, nftBalance, rewardRate] = await Promise.all([
        client.getBalance({ address }),
        getTokenBalance(address),
        getNFTBalance(address),
        getRewardRate()
      ]);
      setState(prev => ({
        ...prev,
        balances: {
          native: formatEther(nativeBalance),
          token: formatEther(tokenBalance),
          nftCount: Number(nftBalance),
          rewardRate: formatEther(rewardRate)
        }
      }));
    } catch (e) {
      console.warn("Sync error:", e);
    } finally {
      setGlobalLoading('balances', false);
    }
  }, [address, setGlobalLoading]);

  const connectWallet = async (connector?: any) => {
    setState(prev => ({ ...prev, isConnecting: true }));
    try {
      const targetConnector = connector || connectors[0];
      await connectAsync({ connector: targetConnector });
    } catch (err: any) {
      notify('error', `Connection Failed: ${err.message}`);
    } finally {
      setState(prev => ({ ...prev, isConnecting: false }));
    }
  };

  const disconnectWallet = async () => {
    try {
      await disconnectAsync();
      setState(prev => ({ ...prev, account: null }));
    } catch (err: any) {
      notify('error', 'Disconnection Failed');
    }
  };

  const removeNotification = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      notifications: prev.notifications.filter(n => n.id !== id)
    }));
  }, []);

  return (
    <AppContext.Provider value={{
      state,
      events,
      connectWallet,
      disconnectWallet,
      refreshBalances,
      addEvent,
      setGlobalLoading,
      setGalleryFilter,
      notify,
      removeNotification,
      toggleBotStaking
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
