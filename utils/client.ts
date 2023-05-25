import { createPublicClient, http } from 'viem'
import { hardhat, mainnet, optimism, polygon, arbitrum, sepolia } from 'viem/chains'

const chains: any = {
  hardhat,
  mainnet,
  optimism,
  polygon,
  arbitrum,
  sepolia,
}

export function getPublicClient(chain: any) {
  return createPublicClient({
    chain: chains[chain],
    transport: http(),
  })
}
