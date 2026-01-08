import { client } from "../viemClient";
import { ABIS, ADRS } from "../contracts";

/**
 * Fetches NFT balance for an account. 
 * If the contract is not deployed or returns an error, returns a mock balance.
 */
export async function getNFTBalance(account: `0x${string}`): Promise<bigint> {
  try {
    const result = await client.readContract({
      address: ADRS.nft,
      abi: ABIS.nft,
      functionName: "balanceOf",
      args: [account],
    } as any);
    
    if (result === undefined || result === null) return 0n;
    return BigInt(result as any);
  } catch (error) {
    console.warn("NFT balanceOf failed (likely contract not deployed). Using mock fallback.");
    return 3n; 
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

export function watchNFTTransfers(onLog: (from: string, to: string, tokenId: bigint, hash: string) => void) {
  try {
    return client.watchContractEvent({
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
  } catch (e) {
    console.warn("Could not watch NFT events:", e);
    return () => {};
  }
}