import {ethers} from 'ethers';
import accessJson from "./Access.json";

const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

const AccessABI = accessJson.abi;

export const getContract = async()=>{
    if(typeof window === "undefined" ||!window.ethereum){
        throw new Error("MetaMask is not installed");
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    const contract = new ethers.Contract(contractAddress||"", AccessABI, signer);
    return contract;
}