
import { logger } from '../logger';
import { triggerSuccessRitual } from '../rituals';
import { UserState } from '../../types';

export type RitualType = 'MINT' | 'STAKE' | 'UNSTAKE' | 'SWAP' | 'CLAIM' | 'AI_GENERATION' | 'ORACLE_CONSULT';

interface RitualOptions {
  setLoading: (key: keyof UserState['loadingStates'], val: boolean) => void;
  loadingKey: keyof UserState['loadingStates'];
  notify: (type: 'success' | 'error' | 'info', message: string) => void;
  refreshBalances?: () => Promise<void>;
  successMessage?: string;
  errorMessage?: string;
}

/**
 * executeRitual: The standardized way to perform any complex async task in the MeeBot ecosystem.
 * Ensures consistent logging, loading UI, and telemetry anchoring.
 */
export const executeRitual = async (
  type: RitualType,
  action: () => Promise<any>,
  options: RitualOptions
) => {
  const { setLoading, loadingKey, notify, refreshBalances, successMessage, errorMessage } = options;

  logger.ritual(type, true, { phase: 'INITIATED' });
  setLoading(loadingKey, true);

  try {
    const result = await action();
    
    logger.ritual(type, true, { phase: 'MANIFESTED', result });
    
    if (successMessage) {
      notify('success', successMessage);
    }
    
    triggerSuccessRitual();
    
    if (refreshBalances) {
      await refreshBalances();
    }
    
    return result;
  } catch (error: any) {
    const errorMsg = errorMessage || `Ritual disrupted: ${error.message || 'Quantum instability'}`;
    logger.error(`${type} Ritual Disrupted`, error);
    notify('error', errorMsg);
    throw error;
  } finally {
    setLoading(loadingKey, false);
  }
};
