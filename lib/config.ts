
/**
 * MeeChain MeeBot Protocol - Centralized Configuration
 * All critical system parameters are managed here.
 */

export const CONFIG = {
  VERSION: '5.1.0-STABLE',
  PROTOCOL_NAME: 'MeeChain MeeBot Neural Link',
  NETWORK: {
    BSC_ID: 56,
    RPC: 'https://meechain.run.place',
    EXPLORER: 'https://bscscan.com'
  },
  STORAGE_KEYS: {
    BOTS: 'meebot_collective_data',
    FILTER: 'meebot_gallery_filter',
    LUCKINESS: 'meebot_luckiness_progress'
  },
  THEME: {
    ACCENT: '#f59e0b',
    SECONDARY: '#0ea5e9',
    DANGER: '#f43f5e',
    SUCCESS: '#10b981'
  }
};
