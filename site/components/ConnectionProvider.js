import { createContext, useContext, useState, useEffect } from 'react'
// import SENDTOKEN_ABI from '../utils/constant'
import Web3 from 'web3'
import Web3Modal from 'web3modal'
import SENDTOKEN_ABI from '../utils/constant/contract_abi'
import { NETWORKS } from '../utils/constant/networks'
const ethers = require('ethers')

const INITIAL_STATE = {
  fetching: false,
  connected_account: '',
  provider: null,
  web3: null,
  web3modal: null,
  connected: false,
  chainId: 1,
  showModal: false,
  pendingRequest: false,
  result: null,
  safe: null,
  updated: false,
  chainParams: {},
  latestBlock: null,
  latestTime: null,
}
const ConnectionContext = createContext(INITIAL_STATE)

export function ConnectionProvider({ children }) {
  let web3modal

  const connect = async () => {
    await initModal()

    const provider = await web3modal.connect()

    await provider.enable()

    await subscribeProvider(provider)

    const web3 = await initWeb3(provider)

    const accounts = await web3.eth.getAccounts()

    const connected_account = accounts[0]

    const networkId = await web3.eth.net.getId()

    const chainId = await web3.eth.chainId()

    const latestBlockInfo = await web3.eth.getBlock(web3.eth.defaultBlock)

    const latestBlock = latestBlockInfo.number

    const latestTime = latestBlockInfo.timestamp

    const chainParams = getChainParams(chainId) ?? {}

    let validNetwork
    if (chainParams.name) {
      validNetwork = true
    } else {
      validNetwork = false
    }

    setConnectorState((prevVal) => ({
      ...prevVal,
      web3,
      web3modal,
      provider,
      connected: true,
      connected_account,
      networkId,
      chainId,
      chainParams,
      latestBlock,
      latestTime,
      validNetwork,
    }))
  }

  const initModal = async () => {
    web3modal = new Web3Modal({
      // network: "mainnet", // optional
      cacheProvider: true, // optional
      // providerOptions: {
      //   walletconnect: {
      //     package: WalletConnectProvider, // required
      //     options: {
      //       infuraId: process.env.alchemy_rpc,
      //     },
      //   },
      // },
    })
  }

  const subscribeProvider = async (provider) => {
    if (!provider.on) {
      return
    }
    provider.on('close', () => resetApp())
    provider.on('accountsChanged', async (accounts) => {
      console.log('accountsChanged: relogin')

      // let { access_token } = await logIn(provider, accounts[0]);
      await connect()
    })

    provider.on('chainChanged', async (chainId) => {
      console.log('CHAIN ID', chainId)
      await connect()
    })
    provider.on('networkChanged', async (networkId) => {})
  }

  const initWeb3 = async (provider) => {
    const web3 = new Web3(provider)

    web3.eth.extend({
      methods: [
        {
          name: 'chainId',
          call: 'eth_chainId',
          outputFormatter: web3.utils.hexToNumber,
        },
      ],
    })

    return web3
  }

  const logIn = async (provider, account) => {
    const web3 = new Web3(provider)

    let message =
      'You are signing off this random number to authenticate log in: ' +
      String(parseInt(Math.random() * 42069))

    // // sign this message
    let signedMessage = await web3.eth.personal.sign(message, account, '')

    // // POST request using fetch with async/await
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        wallet_address: web3.utils.toChecksumAddress(account),
        random_message: message,
        signed_message: signedMessage,
      }),
    }

    const response = await fetch(
      'https://dev.infinityskies.io/v1/login/metamask',
      requestOptions,
    )

    const data = await response.json()

    return { access_token: data.access_token }
  }

  const switchChain = async (chainId) => {
    console.log('Calling Switch Chain in the Connection Provider', chainId)

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }], // chainId must be in hexadecimal numbers
      })
    } catch (switchError) {
      console.log('Error in Connection Provider', switchError)
      // This error code indicates that the chain has not been added to MetaMask.
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: getChainParams(chainId),
        })
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${chainId.toString(16)}` }], // chainId must be in hexadecimal numbers
        })
      }
    }

    connect()
  }

  const getChainParams = (chainId) => {
    return NETWORKS[chainId]
  }

  const isMetaMaskConnected = async (provider) => {
    const accounts = await provider.listAccounts()
    return accounts.length > 0
  }

  useEffect(() => {
    const { ethereum } = window
    if (ethereum) {
      var provider = new ethers.providers.Web3Provider(ethereum)
    }

    // check if metamask is connected on page load
    isMetaMaskConnected(provider).then((resp) => {
      if (resp == true) {
        connectorState.connect().then((resp) => {
          // TODO: check if this chain is supported, if not then force switch to supported chain
          console.log('response', resp)
        })
      }
    })
  }, [])

  const [connectorState, setConnectorState] = useState({
    ...INITIAL_STATE,
    connect,
    switchChain,
    logIn,
  })

  return (
    <ConnectionContext.Provider value={{ connectorState, setConnectorState }}>
      {children}
    </ConnectionContext.Provider>
  )
}

export function useConnectionContext() {
  return useContext(ConnectionContext)
}
