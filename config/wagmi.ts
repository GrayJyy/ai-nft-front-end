import { getDefaultWallets } from '@rainbow-me/rainbowkit'
import { configureChains, createConfig } from 'wagmi'
import { mainnet, arbitrum, sepolia, polygon, optimism, hardhat } from 'wagmi/chains'
import { publicProvider } from 'wagmi/providers/public'

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [
    mainnet,
    arbitrum,
    polygon,
    optimism,
    ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS ? [sepolia] : []),
    ...(process.env.NEXT_PUBLIC_ENABLE_LOCAL_NETWORK ? [hardhat] : []),
  ],
  [publicProvider()]
)

const { connectors } = getDefaultWallets({
  // get from https://cloud.walletconnect.com/sign-in
  appName: process.env.NEXT_PUBLIC_APP_NAME!,
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID!,
  chains,
})

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
})
export { chains, wagmiConfig }
