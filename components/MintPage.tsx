'use client'

import { Input, Button, Grid, GridItem, Box, Image, Spinner, useToast } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { NFTStorage, File } from 'nft.storage'
import { getNetwork, prepareWriteContract, writeContract } from '@wagmi/core'
import ABI from '../constants/ai-nft-abi.json'
import ADDRESSES from '../constants/contract-addresses.json'
import { parseEther, parseAbiItem } from 'viem'
import { Buffer } from 'buffer'
import axios from 'axios'
import { getPublicClient } from '@/utils/client'

const MintPage = () => {
  const addresses: any = ADDRESSES
  const toast = useToast()
  const { chain } = getNetwork()
  const address = addresses[`${chain!.id}`].aiNft[0]
  const [prompt, setPrompt] = useState({ name: '', description: '' })
  const [img, setImg] = useState('')
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [isMint, setIsMint] = useState(false)

  const createImage = async (description: string) => {
    if (!prompt.name || !prompt.description) {
      return toast({
        title: 'Generate Warning',
        description: 'Need name and description.',
        status: 'warning',
        duration: 9000,
        isClosable: true,
        position: 'top',
      })
    }
    const data = { inputs: description, options: { wait_for_model: true } }
    setLoading(true)
    setIsMint(true)
    try {
      const response = await axios({
        url: 'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2-1',
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_HUGGING_FACE_API_KEY!}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        method: 'POST',
        data: JSON.stringify(data),
        responseType: 'arraybuffer',
      })
      const type = response.headers['content-type']
      const res = response.data
      const base64data = Buffer.from(res).toString('base64')
      const src = `data:${type};base64,` + base64data
      setImg(src)
      setLoading(false)
      toast({
        title: 'Generate Success',
        description: "We've created your AI NFT.",
        status: 'success',
        duration: 9000,
        isClosable: true,
        position: 'top',
      })
      return res
    } catch (error) {
      console.error(error)
      setLoading(false)
      toast({
        title: 'Generate Fail',
        description: 'We can not create your AI NFT.',
        status: 'error',
        duration: 9000,
        isClosable: true,
        position: 'top',
      })
    }
  }

  const storeImage = async (imageData: any) => {
    const nftStorage = new NFTStorage({ token: process.env.NEXT_PUBLIC_NFT_STORAGE_API_KEY! })
    const { ipnft } = await nftStorage.store({
      image: new File([imageData], 'image.jpeg', { type: 'image/jpeg' }),
      name: prompt.name,
      description: prompt.description,
    })
    const url = `https://ipfs.io/ipfs/${ipnft}/metadata.json`
    setUrl(url)
    return url
  }
  const handleGenerator = async (description: string) => {
    const imagedata = await createImage(description)
    const url = await storeImage(imagedata)
    await mintNft(url)
  }

  const mintNft = async (tokenURI: string) => {
    const unwatch = getPublicClient(chain!.network).watchEvent({
      address,
      event: parseAbiItem('event Minted(uint256 indexed tokenId, address to)'),
      onLogs: logs => {
        console.log(logs)
        toast({
          title: 'Transaction Success',
          description: `tokenId is ${logs[logs.length - 1].args.tokenId?.toString()}`,
          status: 'success',
          duration: 9000,
          isClosable: true,
          position: 'top',
        })
        unwatch()
        setPrompt({ name: '', description: '' })
      },
    })
    const { request } = await prepareWriteContract({
      address,
      abi: ABI,
      args: [tokenURI],
      functionName: 'mintNft',
      value: parseEther('0.01') as any,
    })
    const { hash } = await writeContract(request)
    console.log(hash)
    setIsMint(false)
  }

  return (
    <>
      <Grid templateColumns='repeat(5, 1fr)' gap={16} className='mt-16'>
        <GridItem colStart={2}>
          <Input
            variant='filled'
            isRequired
            placeholder='Create a name...'
            className='block my-10'
            value={prompt.name}
            onChange={e => {
              setPrompt({ ...prompt, name: e.target.value })
            }}
          />
          <Input
            variant='filled'
            isRequired
            placeholder='Create a description...'
            className='block my-10'
            value={prompt.description}
            onChange={e => {
              setPrompt({ ...prompt, description: e.target.value })
            }}
          />
          <Button
            isLoading={isMint}
            border='2px'
            borderColor='blue.500'
            className='block my-10 m-auto w-60'
            onClick={() => {
              handleGenerator(prompt.description)
            }}
          >
            Generate
          </Button>
        </GridItem>
        <GridItem colSpan={2}>
          {loading ? (
            <Box borderWidth='1px' borderRadius='lg' overflow='hidden' height={480} className='w-full'>
              <Spinner
                thickness='4px'
                speed='0.65s'
                emptyColor='gray.200'
                color='blue.500'
                size='xl'
                className='m-auto block mt-40'
              />
            </Box>
          ) : (
            <>
              <Box borderWidth='1px' borderRadius='lg' overflow='hidden'>
                <Image
                  src={img}
                  alt='AI image'
                  height={480}
                  fallbackSrc='https://doodleipsum.com/700/outline?bg=63C8D9&i=238f14c2ec23befb1ebee53ec4abf03b'
                  className='w-full'
                />
              </Box>
              <div className='mt-5 ml-5'>
                View{' '}
                <div className='inline text-blue-600'>
                  <a href={url}>Metadata</a>
                </div>
              </div>
            </>
          )}
        </GridItem>
      </Grid>
    </>
  )
}

export default MintPage
