
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

export interface MeeBot {
  id: string;
  name: string;
  rarity: "Common" | "Epic" | "Legendary";
  energyLevel: number; // MCB Energy accumulated (0-100+)
  stakingStart: number | null; // Timestamp when current session began
  isStaking: boolean;
  image: string;
  baseStats: {
    power: number;
    speed: number;
    intel: number;
  };
}

export interface UserState {
  account: `0x${string}` | null;
  chainId: number | null;
  isConnecting: boolean;
  notifications: RitualNotification[];
  galleryFilter: string;
  loadingStates: {
    balances: boolean;
    staking: boolean;
    claiming: boolean;
    gallery: boolean;
    oracle: boolean;
    general: boolean;
  };
  balances: {
    native: string;
    token: string;
    nftCount: number;
    rewardRate: string;
  };
  myBots: MeeBot[]; // Tracked MeeBot collective with persisted energy
}

export interface BlockchainEvent {
  id: string;
  type: 'Transfer' | 'Approval' | 'Staked' | 'Claimed' | 'Minted' | 'Infused' | 'Ascended';
  contract: 'NFT' | 'Token' | 'Staking' | 'NeuralCore';
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
