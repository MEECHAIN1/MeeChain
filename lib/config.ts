
/**
 * MeeChain MeeBot Protocol - Centralized Configuration
 * All critical system parameters are managed here.
 */

export const CONFIG = {
  VERSION: '4.1.0-STABLE',
  NETWORK: {
  ID: 13390, 
    RPC: 'https://meechain.run.place',
    EXPLORER: 'https://meechainScan.run.place'
  },
  TOKENS: {
    CLIENT_ROLLBAR: '1d6379b7fbb5403b8cf07e4a9c4889e2',
    PROJECT_ID_WAGMI: 'b0d81328f8ab0541fdede7db9ff25cb1'
  },
  STORAGE_KEYS: {
    BOTS: 'meebot_collective_data',
    FILTER: 'meebot_gallery_filter',
    LUCKINESS: 'meebot_luckiness_progress'
  }
};
