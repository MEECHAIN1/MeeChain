
import { client } from "../viemClient";
import { ABIS, ADRS } from "../contracts";
import { parseEther } from "viem";

/**
 * Fetches Token balance for an account.
 * Returns mock value if the contract call fails.
 */
export async function getTokenBalance(account: `0x${string}`): Promise<bigint> {
  try {
    const result = await client.readContract({
      address: ADRS.token,
      abi: ABIS.token,
      functionName: "balanceOf",
      args: [account],
    } as any);
    
    if (result === undefined || result === null) return 0n;
    return BigInt(result as any);
  } catch (error) {
    console.warn("Token balanceOf failed. Using mock fallback.");
    return parseEther("1250.75"); // Mock fallback
  }
}

export async function getTokenMetadata() {
  try {
    const [symbol, decimals] = await Promise.all([
      client.readContract({ address: ADRS.token, abi: ABIS.token, functionName: "symbol" } as any),
      client.readContract({ address: ADRS.token, abi: ABIS.token, functionName: "decimals" } as any),
    ]);
    return { symbol: symbol as string, decimals: decimals as number };
  } catch (error) {
    return { symbol: "MCB", decimals: 18 };
  }
}

/**
 * Watches for the 'Transfer' event on the ERC20 token contract.
 */
export function watchTokenTransfers(onLog: (from: string, to: string, value: bigint, hash: string) => void) {
  try {
    return client.watchContractEvent({
      address: ADRS.token,
      abi: ABIS.token,
      eventName: "Transfer",
      onLogs: (logs) => {
        logs.forEach((log) => {
          const { from, to, value } = log.args as { from?: string; to?: string; value?: bigint };
          if (from && to && value !== undefined) {
            onLog(from, to, value, log.transactionHash);
          }
        });
      },
    });
  } catch (e) {
    console.warn("Could not watch token events:", e);
    return () => {};
  }
}
