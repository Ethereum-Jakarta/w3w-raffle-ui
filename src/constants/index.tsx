import RAFFLE_ABI_JSON from "./RAFFLE_ABI.json"
import ERC20_ABI_JSON from "./ERC20_ABI.json"

export const RAFFLE_ABI = RAFFLE_ABI_JSON;
export const ERC20_ABI = ERC20_ABI_JSON;

export const CHAIN_IDS = {
  BASE: 8453,
  BASE_SEPOLIA: 84532,
} as const;

export const DEFAULT_CHAIN_ID = CHAIN_IDS.BASE_SEPOLIA;

export const RAFFLE_ADDRESSES: Record<number, `0x${string}`> = {
  [CHAIN_IDS.BASE]: "0xf44adEdec3f5E7a9794bC8E830BE67e4855FA8fF",
  [CHAIN_IDS.BASE_SEPOLIA]: "0x4B9b6708d5801AA0F2Dd2AA1E74c408Ab255C561",
};

export const USDC_ADDRESSES: Record<number, `0x${string}`> = {
  [CHAIN_IDS.BASE]: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  [CHAIN_IDS.BASE_SEPOLIA]: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
};

export const getAddressesForChain = (chainId?: number) => {
  const safeChainId = chainId && RAFFLE_ADDRESSES[chainId] ? chainId : DEFAULT_CHAIN_ID;

  return {
    raffle: RAFFLE_ADDRESSES[safeChainId],
    usdc: USDC_ADDRESSES[safeChainId],
    chainId: safeChainId,
  };
};
