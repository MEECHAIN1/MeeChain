import { ERC20Abi } from '../abi/ERC20'; // นำเข้าจากโครงสร้างไฟล์ใหม่
import { MeeBotNFTAbi } from '../abi/MeeBotNFT'; 
import { MeeBotStakingAbi } from '../abi/MeeBotStaking';

/** 🟢 ข้อมูลสัญญาอัจฉริยะบน BSC Mainnet */
const BSC_MCB_TOKEN = "0x8Da6Eb1cd5c0C8cf84bD522AB7c11747DB1128C9" as const;

/** 🟡 ข้อมูลสัญญาสำหรับการทดสอบ (Local/MeeChain) */
const DEPLOYED_NFT = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512" as const;
const DEPLOYED_TOKEN = "0x5FbDB2315678afecb367f032d93F642f64180aa3" as const;
const DEPLOYED_STAKING = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0" as const;

/** * ฟังก์ชันดึง Address แบบ Dynamic ตาม ChainID 
 * เพื่อรองรับ Multi-chain
 */
export const getADRS = (chainId?: number) => ({
  nft: (process.env.VITE_NFT_ADDRESS as `0x${string}`) || DEPLOYED_NFT,
  // ⚡ ถ้าเป็น Chain 56 (BSC) ให้ใช้ MCB ตัวจริง
  token: chainId === 56 
    ? BSC_MCB_TOKEN 
    : (process.env.VITE_TOKEN_ADDRESS as `0x${string}`) || DEPLOYED_TOKEN,
  staking: (process.env.VITE_STAKING_ADDRESS as `0x${string}`) || DEPLOYED_STAKING,
});

export const ABIS = {
  nft: MeeBotNFTAbi,
  token: ERC20Abi,
  staking: MeeBotStakingAbi,
};