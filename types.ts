
export interface NetworkInfo {
  id: number;
  name: string;
  rpcUrl: string;
}

export interface RitualNotification {
  id: string;
  type: 'success' | 'error' | 'info' | 'prophecy';
  message: string;
  timestamp: number;
}

export interface UserState {
  account: `0x${string}` | null;
  chainId: number | null;
  isConnecting: boolean;
  notifications: RitualNotification[];
  loadingStates: {
    balances: boolean;
    staking: boolean;
    claiming: boolean;
    general: boolean;
  };
  balances: {
    native: string;
    token: string;
    nftCount: number;
    rewardRate: string;
  };
}

export interface BlockchainEvent {
  id: string;
  type: 'Transfer' | 'Approval' | 'Staked' | 'Claimed' | 'Minted';
  contract: 'NFT' | 'Token' | 'Staking';
  from: string;
  to?: string;
  amount?: string;
  tokenId?: string;
  timestamp: number;
  hash: string;
}

export interface NFTMetadata {
  tokenId: string;
  name: string;
  description: string;
  image: string;
  owner: string;
}

export interface StakingData {
  totalStaked: string;
  userStaked: string;
  rewardRate: string;
  pendingRewards: string;
}
