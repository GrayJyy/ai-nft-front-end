import './globals.css'
import '@rainbow-me/rainbowkit/styles.css'
import { Nunito } from 'next/font/google'
import Wrapper from '@/components/Wrapper'
import Header from '@/components/Header'
import Link from 'next/link'

const nunito = Nunito({ subsets: ['latin'] })

export const metadata = {
  title: 'AI NFT Marketplace',
  description: 'mint and swap your NFTs',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en'>
      <body className={nunito.className}>
        <Wrapper>
          <nav className={'p-6 flex items-center justify-between  border-b-2'}>
            <h1 className={'py-3 px-3 font-bold text-4xl text-sky-400/100'}>AI NFT Marketplace</h1>
            <div className={'flex items-center justify-between  flex-row gap-3'}>
              <Link href={'/'}>
                <div className='px-3 hover:text-blue-300 font-bold'>Home</div>
              </Link>
              <Link href={'/sell'}>
                <div className=' border-r-2 px-3 hover:text-blue-300 font-bold'>Sell Nft</div>
              </Link>

              <Header />
            </div>
          </nav>
          {children}
        </Wrapper>
      </body>
    </html>
  )
}
