import { ethers } from "ethers";

const SEPOLIA_CHAIN_ID = "0xaa36a7"; 

export const checkCorrectNetwork = async () => {
  if (!window.ethereum) return false;

  const provider = new ethers.BrowserProvider(window.ethereum);
  const network = await provider.getNetwork();

  if (network.chainId !== BigInt(11155111)) {
    console.warn("⚠️ Wrong network detected:", network.name);
    return false;
  }

  return true;
};
