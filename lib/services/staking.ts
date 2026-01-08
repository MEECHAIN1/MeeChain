
import { client } from "../viemClient";
import { ABIS, ADRS } from "../contracts";
import { parseEther } from "viem";

export async function getStakedBalance(account: `0x${string}`): Promise<bigint> {
  try {
    const result = await client.readContract({
      address: ADRS.staking,
      abi: ABIS.staking,
      functionName: "stakedBalances",
      args: [account],
    } as any);
    
    if (result === undefined || result === null) return 0n;
    return BigInt(result as any);
  } catch (error) {
    console.warn("Staked balance fetch failed. Using mock 0.");
    return 0n;
  }
}

export async function getRewardRate(): Promise<bigint> {
  try {
    const result = await client.readContract({
      address: ADRS.staking,
      abi: ABIS.staking,
      functionName: "rewardRate",
    } as any);
    
    if (result === undefined || result === null) return parseEther("0.000042");
    return BigInt(result as any);
  } catch (error) {
    console.warn("Reward rate fetch failed. Using mock rate.");
    return parseEther("0.000042"); // Mock 42 MCB/sec
  }
}

/**
 * Initiates the staking ritual.
 * In a real app, this would use a wallet client. 
 * For this dashboard, we simulate a successful transaction.
 */
export async function stakeTokens(amount: string): Promise<string> {
  // Simulating energy channeling
  await new Promise(resolve => setTimeout(resolve, 2000));
  return `0x${Math.random().toString(16).slice(2, 66)}`;
}

/**
 * Claims accumulated rewards.
 */
export async function claimRewards(): Promise<string> {
  await new Promise(resolve => setTimeout(resolve, 1500));
  return `0x${Math.random().toString(16).slice(2, 66)}`;
}

export function watchStakingEvents(onStaked: (user: string, amount: bigint, hash: string) => void) {
  try {
    return client.watchContractEvent({
      address: ADRS.staking,
      abi: ABIS.staking,
      eventName: "Staked",
      onLogs: (logs) => {
        logs.forEach((log) => {
          const { user, amount } = log.args;
          if (user && amount !== undefined) {
            onStaked(user, amount, log.transactionHash);
          }
        });
      },
    });
  } catch (e) {
    console.warn("Could not watch staking events:", e);
    return () => {};
  }
}
