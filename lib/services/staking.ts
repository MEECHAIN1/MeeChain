import { client } from "../viemClient";
import { ABIS, getADRS } from "../contracts"; // 🟢 แก้ไข: เปลี่ยน ADRS เป็น getADRS
import { parseEther } from "viem";

/**
 * ดึงยอดการ Stake ของบัญชี
 * รองรับ Multi-chain โดยส่ง chainId เข้ามา
 */
export async function getStakedBalance(account: `0x${string}`, chainId?: number): Promise<bigint> {
  const contracts = getADRS(chainId); // 🟢 ดึงที่อยู่สัญญาตาม Chain ID ปัจจุบัน
  try {
    const result = await client.readContract({
      address: contracts.staking, // 🟢 แก้ไข: ใช้จากฟังก์ชัน getADRS
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

export async function getRewardRate(chainId?: number): Promise<bigint> {
  const contracts = getADRS(chainId);
  try {
    const result = await client.readContract({
      address: contracts.staking,
      abi: ABIS.staking,
      functionName: "rewardRate",
    } as any);
    
    if (result === undefined || result === null) return parseEther("0.000042");
    return BigInt(result as any);
  } catch (error) {
    console.warn("Reward rate fetch failed. Using mock rate.");
    return parseEther("0.000042"); // Mock 42 MCB/sec ที่โชว์บนหน้าจอ
  }
}

// ... ฟังก์ชัน stakeTokens และ claimRewards เดิมของคุณ ...

export function watchStakingEvents(onStaked: (user: string, amount: bigint, hash: string) => void, chainId?: number) {
  const contracts = getADRS(chainId);
  try {
    return client.watchContractEvent({
      address: contracts.staking,
      abi: ABIS.staking,
      eventName: "Staked",
      onLogs: (logs) => {
        logs.forEach((log) => {
          const { user, amount } = log.args as any;
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