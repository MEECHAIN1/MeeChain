import { client } from "../viemClient";
import { ABIS, ADRS } from "../contracts";
import { parseEther } from "viem";

export async function getTokenBalance(account: `0x${string}`): Promise<bigint> {
  if (!account) return 0n;
  try {
    const result = await client.readContract({
      address: ADRS.token,
      abi: ABIS.token,
      functionName: "balanceOf",
      args: [account],
    });
    
    return result ? BigInt(result as string) : 0n;
  } catch (error) {
    console.error("Failed to fetch balance:", error);
    return 0n; // คืนค่า 0 เพื่อให้ User รู้ว่ายังโหลดข้อมูลไม่ได้ แทนการใช้ค่า Mock
  }
}

export function watchTokenTransfers(onLog: (from: string, to: string, value: bigint, hash: string) => void): () => void {
  try {
    return client.watchContractEvent({
      address: ADRS.token,
      abi: ABIS.token,
      eventName: "Transfer",
      onLogs: (logs) => {
        logs.forEach((log: any) => {
          const { from, to, value } = log.args;
          if (from && to && value !== undefined) {
            onLog(from, to, BigInt(value), log.transactionHash);
          }
        });
      },
    });
  } catch (e) {
    console.error("Event Watch Error:", e);
    return () => {};
  }
}