'use client'

import { chains, wagmiConfig } from '@/config/wagmi'
import { RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { ChakraProvider } from '@chakra-ui/react'
import { CacheProvider } from '@chakra-ui/next-js'
import { WagmiConfig } from 'wagmi'

export default function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className={'container mx-auto'}>
      <WagmiConfig config={wagmiConfig}>
        <RainbowKitProvider chains={chains}>
          <CacheProvider>
            <ChakraProvider>{children}</ChakraProvider>
          </CacheProvider>
        </RainbowKitProvider>
      </WagmiConfig>
    </div>
  )
}
