import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";
dotenv.config(); 

const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

const config: HardhatUserConfig = {
  solidity: "0.8.19",
  networks:{
    sepolia:{
      url: SEPOLIA_RPC_URL ,
      accounts: [`0x${PRIVATE_KEY}`], 
    }
  }
};

export default config;
