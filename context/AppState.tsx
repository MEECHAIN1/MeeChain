
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserState, BlockchainEvent, RitualNotification } from '../types';
import { formatEther } from 'viem';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { client } from '../lib/viemClient';
import { getNFTBalance, watchNFTTransfers } from '../lib/services/nft';
import { getTokenBalance, watchTokenTransfers } from '../lib/services/token';
import { getStakedBalance, watchStakingEvents, getRewardRate } from '../lib/services/staking';

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
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { address, chainId } = useAccount();
  const { connectAsync, connectors } = useConnect();
  const { disconnectAsync } = useDisconnect();

  const [state, setState] = useState<UserState>({
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
    }
  });

  const [events, setEvents] = useState<BlockchainEvent[]>([]);

  // Sync state with wagmi account
  useEffect(() => {
    setState(prev => ({
      ...prev,
      account: address || null,
      chainId: chainId || null,
    }));
  }, [address, chainId]);

  const removeNotification = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      notifications: prev.notifications.filter(n => n.id !== id)
    }));
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

  const notify = useCallback((type: RitualNotification['type'], message: string) => {
    const cleanMessage = typeof message === 'string' ? message : JSON.stringify(message);
    const id = Math.random().toString(36).substr(2, 9);
    setState(prev => ({
      ...prev,
      notifications: [...prev.notifications, { id, type, message: cleanMessage, timestamp: Date.now() }]
    }));
    setTimeout(() => removeNotification(id), 6000);
  }, [removeNotification]);

  const addEvent = useCallback((event: Omit<BlockchainEvent, 'id' | 'timestamp'>) => {
    const newEvent: BlockchainEvent = {
      ...event,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
    };
    setEvents(prev => [newEvent, ...prev].slice(0, 50));
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
    } catch (error) {
      console.error("Refresh Balances Error:", error);
    } finally {
      setGlobalLoading('balances', false);
    }
  }, [address, setGlobalLoading]);

  const connectWallet = async (connector?: any) => {
    setState(prev => ({ ...prev, isConnecting: true }));
    try {
      const targetConnector = connector || connectors[0];
      await connectAsync({ connector: targetConnector });
      notify('success', 'Neural Link established successfully.');
    } catch (err: any) {
      notify('error', `Connection Ritual Failed: ${err.message}`);
    } finally {
      setState(prev => ({ ...prev, isConnecting: false }));
    }
  };

  const disconnectWallet = async () => {
    try {
      await disconnectAsync();
      notify('info', 'Neural Link severed.');
    } catch (err: any) {
      notify('error', 'Disconnection Failed.');
    }
  };

  useEffect(() => {
    if (address) {
      refreshBalances();
    }
  }, [address, refreshBalances]);

  useEffect(() => {
    if (!address) return;
    
    const unwatchNFT = watchNFTTransfers((from, to, tokenId, hash) => {
      if (from.toLowerCase() === address.toLowerCase() || to.toLowerCase() === address.toLowerCase()) {
        addEvent({ type: 'Transfer', contract: 'NFT', from, to, tokenId: tokenId.toString(), hash });
        refreshBalances();
      }
    });

    const unwatchToken = watchTokenTransfers((from, to, value, hash) => {
      if (from.toLowerCase() === address.toLowerCase() || to.toLowerCase() === address.toLowerCase()) {
        addEvent({ type: 'Transfer', contract: 'Token', from, to, amount: formatEther(value), hash });
        refreshBalances();
      }
    });

    const unwatchStaking = watchStakingEvents((user, amount, hash) => {
      if (user.toLowerCase() === address.toLowerCase()) {
        addEvent({ type: 'Staked', contract: 'Staking', from: user, amount: formatEther(amount), hash });
        refreshBalances();
      }
    });

    return () => {
      if (typeof unwatchNFT === 'function') unwatchNFT();
      if (typeof unwatchToken === 'function') unwatchToken();
      if (typeof unwatchStaking === 'function') unwatchStaking();
    };
  }, [address, addEvent, refreshBalances]);

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
      removeNotification
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};