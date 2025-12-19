
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserState, BlockchainEvent, RitualNotification } from '../types';
import { formatEther, parseEther } from 'viem';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { client } from '../lib/viemClient';
import { getNFTBalance, watchNFTTransfers } from '../lib/services/nft';
import { getTokenBalance, watchTokenTransfers } from '../lib/services/token';
import { getStakedBalance, watchStakingEvents, getRewardRate } from '../lib/services/staking';

interface AppContextType {
  state: UserState;
  events: BlockchainEvent[];
  connectWallet: (connectorId?: any) => Promise<void>;
  disconnectWallet: () => void;
  refreshBalances: () => Promise<void>;
  addEvent: (event: Omit<BlockchainEvent, 'id' | 'timestamp'>) => void;
  setGlobalLoading: (key: keyof UserState['loadingStates'], isLoading: boolean) => void;
  notify: (type: RitualNotification['type'], message: string) => void;
  removeNotification: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { address, isConnected, chainId } = useAccount();
  const { connectAsync, connectors } = useConnect();
  const { disconnectAsync } = useDisconnect();

  const [state, setState] = useState<UserState>({
    account: null,
    chainId: null,
    isConnecting: false,
    notifications: [],
    loadingStates: {
      balances: false,
      staking: false,
      claiming: false,
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

  const notify = useCallback((type: RitualNotification['type'], message: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setState(prev => ({
      ...prev,
      notifications: [...prev.notifications, { id, type, message, timestamp: Date.now() }]
    }));
    setTimeout(() => removeNotification(id), 6000);
  }, []);

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

  const addEvent = useCallback((event: Omit<BlockchainEvent, 'id' | 'timestamp'>) => {
    const newEvent: BlockchainEvent = {
      ...event,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
    };
    setEvents(prev => [newEvent, ...prev].slice(0, 50));
    notify('success', `ใหม่: ตรวจพบ ${event.type} ใน Ledger ✨`);
  }, [notify]);

  const refreshBalances = useCallback(async () => {
    if (!address) return;
    setGlobalLoading('balances', true);
    try {
      const [nativeBal, tokenBal, nftCount, rewardRate] = await Promise.all([
        client.getBalance({ address }).catch(() => parseEther("8.5")),
        getTokenBalance(address),
        getNFTBalance(address),
        getRewardRate()
      ]);

      setState(prev => ({
        ...prev,
        balances: {
          native: formatEther(nativeBal),
          token: formatEther(tokenBal),
          nftCount: Number(nftCount),
          rewardRate: formatEther(rewardRate)
        }
      }));
    } catch (error) {
      console.error("Balance refresh failed", error);
    } finally {
      setGlobalLoading('balances', false);
    }
  }, [address, setGlobalLoading]);

  useEffect(() => {
    if (!address) return;

    const unwatchNFT = watchNFTTransfers((from, to, tokenId, hash) => {
      addEvent({
        type: 'Transfer',
        contract: 'NFT',
        from,
        to,
        tokenId: tokenId.toString(),
        hash
      });
      refreshBalances();
    });

    const unwatchToken = watchTokenTransfers((from, to, value, hash) => {
      addEvent({
        type: 'Transfer',
        contract: 'Token',
        from,
        to,
        amount: `${formatEther(value)} MCB`,
        hash
      });
      refreshBalances();
    });

    const unwatchStaking = watchStakingEvents((user, amount, hash) => {
      addEvent({
        type: 'Staked',
        contract: 'Staking',
        from: user,
        amount: `${formatEther(amount)} MCB`,
        hash
      });
      refreshBalances();
    });

    return () => {
      unwatchNFT();
      unwatchToken();
      unwatchStaking();
    };
  }, [address, addEvent, refreshBalances]);

  const connectWallet = async (connectorId?: any) => {
    setState(prev => ({ ...prev, isConnecting: true }));
    try {
      const connector = connectorId || connectors[0];
      
      // Proactive cleanup for WalletConnect to prevent "Proposal expired"
      if (connector.id === 'walletConnect') {
        try {
          localStorage.removeItem('walletconnect');
          localStorage.removeItem('WCM_RECENT_WALLET_DATA');
          localStorage.removeItem('wc@2:client:0.3:session');
        } catch (e) {}
      }

      await connectAsync({ connector });
      notify('success', 'เชื่อมต่อ Neural Link สำเร็จ... ยินดีต้อนรับสมาชิก Collective');
    } catch (error: any) {
      console.error("Wallet connection failed", error);
      let errorMessage = 'การเชื่อมต่อถูกรบกวน กรุณาลองใหม่อีกครั้ง';
      
      const msg = error.message?.toLowerCase() || '';
      if (msg.includes('rejected') || msg.includes('reject') || msg.includes('cancel')) {
        errorMessage = 'ท่านได้ปฏิเสธการเชื่อมต่อ (Session Rejected)... กรุณาลองใหม่เมื่อพร้อม';
      } else if (msg.includes('expired')) {
        errorMessage = 'เซสชันการเชื่อมต่อหมดอายุ (Proposal expired) กรุณา Refresh หน้าเว็บและลองใหม่อีกครั้ง';
      }
      
      notify('error', errorMessage);
    } finally {
      setState(prev => ({ ...prev, isConnecting: false }));
    }
  };

  const disconnectWallet = async () => {
    await disconnectAsync();
    setState(prev => ({
      ...prev,
      account: null,
      chainId: null,
      notifications: [],
      balances: { native: '0', token: '0', nftCount: 0, rewardRate: '0' }
    }));
    setEvents([]);
    notify('info', 'ตัดการเชื่อมต่อ Neural Link เรียบร้อย');
  };

  return (
    <AppContext.Provider value={{ state, events, connectWallet, disconnectWallet, refreshBalances, addEvent, setGlobalLoading, notify, removeNotification }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};
