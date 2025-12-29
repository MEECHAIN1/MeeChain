
import { createPublicClient, http, fallback } from 'viem';
import { meechain } from './constants/chains';

const RPC_URL = "https://dimensional-newest-film.bsc.quiknode.pro/8296e7105d470d5d73b51b19556495493c8f1033";

export { meechain };

export const client = createPublicClient({
  chain: meechain,
  transport: fallback([
    http(RPC_URL),
    http("https://polygon-rpc.com")
  ]),
});
