import { useAccount, useReadContract, useChainId } from 'wagmi';
import { getADRS, ABIS } from '../lib/contracts';
import { formatUnits } from 'viem';

export function useMCBBalance() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  
  // 🟢 ดึง Address ที่ถูกต้องตาม Chain ปัจจุบัน (รองรับทั้ง MeeChain และ BSC)
  const contracts = getADRS(chainId);

  const { data: balance, isLoading, refetch } = useReadContract({
    address: contracts.token,
    abi: ABIS.token, // ใช้ ERC20 ABI ที่คุณแยกไฟล์ไว้
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: isConnected && !!address,
    },
  });

  // แปลงค่าจาก BigInt เป็นตัวเลขที่อ่านง่าย (18 Decimals)
  const formattedBalance = balance 
    ? Number(formatUnits(balance as bigint, 18)).toLocaleString(undefined, { minimumFractionDigits: 2 }) 
    : '0.00';

  return {
    balance: formattedBalance,
    rawBalance: balance,
    isLoading,
    refetch,
    symbol: 'MCB'
  };
}