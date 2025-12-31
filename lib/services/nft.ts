
import { client } from "../viemClient";
import { ABIS, ADRS } from "../contracts";

export async function getNFTBalance(account: `0x${string}`): Promise<bigint> {
  try {
    const result = await client.readContract({
      address: ADRS.nft,
      abi: ABIS.nft,
      functionName: "balanceOf",
      args: [account],
    });
    
    // Viem should return bigint directly for uint256 outputs
    if (typeof result === 'bigint') {
        return result;
    } else if (result !== undefined && result !== null) {
        // Fallback to BigInt conversion for unexpected types, though should be bigint
        return BigInt(result);
    }
    return 0n; // Default if result is undefined/null
  } catch (error) {
    console.error("Error fetching NFT balance for account:", account, error);
    // Rethrow the actual error to propagate it to the AppState context for proper handling
    throw error; 
  }
}

export async function getNFTOwner(tokenId: bigint): Promise<`0x${string}`> {
  try {
    const owner = await client.readContract({
      address: ADRS.nft,
      abi: ABIS.nft,
      functionName: "ownerOf",
      args: [tokenId],
    } as any);
    return owner as `0x${string}`;
  } catch (error) {
    return "0x0000000000000000000000000000000000000000";
  }
}

export function watchNFTTransfers(onLog: (from: string, to: string, tokenId: bigint, hash: string) => void): () => void {
  try {
    const unwatch = client.watchContractEvent({
      address: ADRS.nft,
      abi: ABIS.nft,
      eventName: "Transfer",
      onLogs: (logs) => {
        logs.forEach((log) => {
          const { from, to, tokenId } = log.args;
          if (from && to && tokenId !== undefined) {
            onLog(from, to, tokenId, log.transactionHash);
          }
        });
      },
    });
    // Ensure we return a function even if unwatch is somehow not one
    return typeof unwatch === 'function' ? unwatch : () => {};
  } catch (e) {
    console.warn("Could not watch NFT events:", e);
    return () => {};
  }
}