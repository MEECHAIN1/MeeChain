
import { ERC20Abi } from '../abi/ERC20';
import { MeeBotNFTAbi } from '../abi/MeeBotNFT';
import { MeeBotStakingAbi } from '../abi/MeeBotStaking';

// Using deployment addresses from provided logs
const DEPLOYED_NFT = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512" as const;
const DEPLOYED_TOKEN = "0x5FbDB2315678afecb367f032d93F642f64180aa3" as const;
const DEPLOYED_STAKING = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0" as const;

export const ADRS = {
  nft: (process.env.VITE_NFT_ADDRESS as `0x${string}`) || DEPLOYED_NFT,
  token: (process.env.VITE_TOKEN_ADDRESS as `0x${string}`) || DEPLOYED_TOKEN,
  staking: (process.env.VITE_STAKING_ADDRESS as `0x${string}`) || DEPLOYED_STAKING,
};

export const ABIS = {
  nft: MeeBotNFTAbi,
  token: ERC20Abi,
  staking: MeeBotStakingAbi,
};
