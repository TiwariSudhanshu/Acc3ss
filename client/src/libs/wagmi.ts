import { http,createConfig } from 'wagmi';
import { sepolia } from 'viem/chains';
import { metaMask } from 'wagmi/connectors';


export const config = createConfig({
    chains: [sepolia],
    connectors: [metaMask()],
    transports: {
        [sepolia.id]: http(
      `https://eth-sepolia.g.alchemy.com/v2/n4h1Isy1TI336HiyIGWxv`
    ),
    }
})