import { createPublicClient, http } from 'viem';
import { meechain } from './constants/chains';

export { meechain };

const PRIMARY_RPC = "https://meechain.run.place";

export const client = createPublicClient({
  chain: meechain,
  transport: http(PRIMARY_RPC, {
    timeout: 10000,
    retryCount: 3,
    retryDelay: 1000,
  }),
  batch: {
    multicall: true, 
  }, 
});