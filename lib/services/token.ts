import { client } from "../viemClient";
import { ABIS, getADRS } from "../contracts"; // 🟢 แก้ไข: เปลี่ยน ADRS เป็น getADRS
import { parseEther } from "viem";

/**
 * Fetches Token balance for an account.
 * รองรับ Multi-chain โดยส่ง chainId เข้ามาด้วย
 */
export async function getTokenBalance(account: `0x${string}`, chainId?: number): Promise<bigint> {
  const contracts = getADRS(chainId); // 🟢 ดึง Address ตาม Chain ปัจจุบัน
  try {
    const result = await client.readContract({
      address: contracts.token, // 🟢 แก้ไข: ใช้ contracts.token
      abi: ABIS.token,
      functionName: "balanceOf",
      args: [account],
    } as any);
    
    if (result === undefined || result === null) return 0n;
    return BigInt(result as any);
  } catch (error) {
    console.warn("Token balanceOf failed. Using mock fallback.");
    return parseEther("1250.75"); // Mock ที่คุณเห็นใน Dashboard
  }
}

export async function getTokenMetadata(chainId?: number) {
  const contracts = getADRS(chainId);
  try {
    const [symbol, decimals] = await Promise.all([
      client.readContract({ address: contracts.token, abi: ABIS.token, functionName: "symbol" } as any),
      client.readContract({ address: contracts.token, abi: ABIS.token, functionName: "decimals" } as any),
    ]);
    return { symbol: symbol as string, decimals: decimals as number };
  } catch (error) {
    return { symbol: "MCB", decimals: 18 };
  }
}

export function watchTokenTransfers(onLog: (from: string, to: string, value: bigint, hash: string) => void, chainId?: number) {
  const contracts = getADRS(chainId);
  try {
    return client.watchContractEvent({
      address: contracts.token,
      abi: ABIS.token,
      eventName: "Transfer",
      onLogs: (logs) => {
        logs.forEach((log) => {
          const { from, to, value } = log.args as any;
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