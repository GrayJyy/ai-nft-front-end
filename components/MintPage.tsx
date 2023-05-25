'use client'

import { Input, Button, Grid, GridItem, Box, Image, Spinner, useToast } from '@chakra-ui/react'
import { useCallback, useState } from 'react'
import { NFTStorage, File } from 'nft.storage'
import ADDRESSES from '../constants/contract-addresses.json'
import { parseEther } from 'viem'
import { Buffer } from 'buffer'
import axios from 'axios'
import {
  useContractEvent,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
  useNetwork,
  useAccount,
} from 'wagmi'

const MintPage = () => {
  const abi = [
    {
      inputs: [
        { internalType: 'string', name: '_name', type: 'string' },
        { internalType: 'string', name: '_symbol', type: 'string' },
        { internalType: 'uint256', name: '_cost', type: 'uint256' },
      ],
      stateMutability: 'nonpayable',
      type: 'constructor',
    },
    { inputs: [], name: 'AiNft__BalanceIsZero', type: 'error' },
    { inputs: [], name: 'AiNft__PaymentFailed', type: 'error' },
    { inputs: [], name: 'AiNft__PaymentIsNotEnough', type: 'error' },
    {
      anonymous: false,
      inputs: [
        { indexed: true, internalType: 'address', name: 'owner', type: 'address' },
        { indexed: true, internalType: 'address', name: 'approved', type: 'address' },
        { indexed: true, internalType: 'uint256', name: 'tokenId', type: 'uint256' },
      ],
      name: 'Approval',
      type: 'event',
    },
    {
      anonymous: false,
      inputs: [
        { indexed: true, internalType: 'address', name: 'owner', type: 'address' },
        { indexed: true, internalType: 'address', name: 'operator', type: 'address' },
        { indexed: false, internalType: 'bool', name: 'approved', type: 'bool' },
      ],
      name: 'ApprovalForAll',
      type: 'event',
    },
    {
      anonymous: false,
      inputs: [
        { indexed: true, internalType: 'uint256', name: 'tokenId', type: 'uint256' },
        { indexed: false, internalType: 'address', name: 'to', type: 'address' },
      ],
      name: 'Minted',
      type: 'event',
    },
    {
      anonymous: false,
      inputs: [
        { indexed: true, internalType: 'address', name: 'from', type: 'address' },
        { indexed: true, internalType: 'address', name: 'to', type: 'address' },
        { indexed: true, internalType: 'uint256', name: 'tokenId', type: 'uint256' },
      ],
      name: 'Transfer',
      type: 'event',
    },
    {
      inputs: [
        { internalType: 'address', name: 'to', type: 'address' },
        { internalType: 'uint256', name: 'tokenId', type: 'uint256' },
      ],
      name: 'approve',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [{ internalType: 'address', name: 'owner', type: 'address' }],
      name: 'balanceOf',
      outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [{ internalType: 'uint256', name: 'tokenId', type: 'uint256' }],
      name: 'getApproved',
      outputs: [{ internalType: 'address', name: '', type: 'address' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'getCost',
      outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'getOwner',
      outputs: [{ internalType: 'address', name: '', type: 'address' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [
        { internalType: 'address', name: 'owner', type: 'address' },
        { internalType: 'address', name: 'operator', type: 'address' },
      ],
      name: 'isApprovedForAll',
      outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [{ internalType: 'string', name: 'tokenUri', type: 'string' }],
      name: 'mintNft',
      outputs: [],
      stateMutability: 'payable',
      type: 'function',
    },
    {
      inputs: [],
      name: 'name',
      outputs: [{ internalType: 'string', name: '', type: 'string' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [{ internalType: 'uint256', name: 'tokenId', type: 'uint256' }],
      name: 'ownerOf',
      outputs: [{ internalType: 'address', name: '', type: 'address' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [
        { internalType: 'address', name: 'from', type: 'address' },
        { internalType: 'address', name: 'to', type: 'address' },
        { internalType: 'uint256', name: 'tokenId', type: 'uint256' },
      ],
      name: 'safeTransferFrom',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        { internalType: 'address', name: 'from', type: 'address' },
        { internalType: 'address', name: 'to', type: 'address' },
        { internalType: 'uint256', name: 'tokenId', type: 'uint256' },
        { internalType: 'bytes', name: 'data', type: 'bytes' },
      ],
      name: 'safeTransferFrom',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        { internalType: 'address', name: 'operator', type: 'address' },
        { internalType: 'bool', name: 'approved', type: 'bool' },
      ],
      name: 'setApprovalForAll',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [{ internalType: 'bytes4', name: 'interfaceId', type: 'bytes4' }],
      name: 'supportsInterface',
      outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'symbol',
      outputs: [{ internalType: 'string', name: '', type: 'string' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [{ internalType: 'uint256', name: 'tokenId', type: 'uint256' }],
      name: 'tokenURI',
      outputs: [{ internalType: 'string', name: '', type: 'string' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'totalSupply',
      outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [
        { internalType: 'address', name: 'from', type: 'address' },
        { internalType: 'address', name: 'to', type: 'address' },
        { internalType: 'uint256', name: 'tokenId', type: 'uint256' },
      ],
      name: 'transferFrom',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    { inputs: [], name: 'withdraw', outputs: [], stateMutability: 'payable', type: 'function' },
  ] as const
  const addresses: any = ADDRESSES
  const toast = useToast()
  const { chain } = useNetwork()
  const { isConnecting } = useAccount()
  const address = addresses[`${chain?.id}`]?.aiNft[0]
  const [prompt, setPrompt] = useState({ name: '', description: '' })
  const [img, setImg] = useState('')
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)

  const createImage = useCallback(
    async (description: string) => {
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
    },
    [prompt.description]
  )

  const storeImage = useCallback(
    async (imageData: any) => {
      const nftStorage = new NFTStorage({ token: process.env.NEXT_PUBLIC_NFT_STORAGE_API_KEY! })
      const { ipnft } = await nftStorage.store({
        image: new File([imageData], 'image.jpeg', { type: 'image/jpeg' }),
        name: prompt.name,
        description: prompt.description,
      })
      const url = `https://ipfs.io/ipfs/${ipnft}/metadata.json`
      setUrl(url)
    },
    [prompt.description]
  )
  const handleGenerator = useCallback(
    async (description: string) => {
      const imagedata = await createImage(description)
      await storeImage(imagedata)
      write?.()
      setLoading(false)
    },
    [prompt.description]
  )

  const { config } = usePrepareContractWrite({
    address,
    abi,
    functionName: 'mintNft',
    args: [url],
    value: parseEther('0.01'),
    enabled: Boolean(url),
  })
  const { write, data } = useContractWrite(config)
  const { isSuccess } = useWaitForTransaction({ hash: data?.hash })
  const unwatch = useContractEvent({
    address,
    abi,
    eventName: 'Minted',
    listener(log) {
      if (isSuccess) {
        toast({
          title: 'Mint',
          description: `We've mint your AI NFT which tokenId is ${log[0].args.tokenId?.toString()}`,
          status: 'success',
          duration: 9000,
          isClosable: true,
          position: 'top',
        })
        unwatch?.()
      }
    },
  })

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
            isLoading={loading}
            // isDisabled={!isConnecting}
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
