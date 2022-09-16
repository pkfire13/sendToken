import React, { useState, useEffect } from 'react'
import { ethers } from 'ethers'

import UserInputBox from '../UserInputBox'
import Panel from '../Panel'
import Button from '../Button'
import AddressInputBox from '../ContractAddressInputBox'
import ERC721Modal from './ERC721Modal'
import { useConnectionContext } from '../ConnectionProvider'
import ReceiptBox from '../Receipt/ReceiptBox'
import NFTBalanceSheet from '../Receipt/NFTBalanceSheet'

//utils
import {
  sendTransaction,
  convertERC721TypeToWeb3,
  formatERC20Input,
  convertToERC721ContractParams,
  isERC721,
  getUserCoinBalance,
  createTxObj,
  isERC721ApprovedForAll,
  isERC721OwnerOf,
  getERC721BalancesFor,
  getERC721MetadataFor,
} from '../../utils/web3-utils'
import { toast } from 'react-toastify'
import { contractAbis } from '../../utils/constant/contract_abi'

export default function ERC721Panel({ selected }) {
  const { connectorState } = useConnectionContext()
  const [input, setInput] = useState('')
  const [contractArgs, setContractArgs] = useState({})
  const [address, setAddress] = useState('')
  const [isApproved, setIsApproved] = useState(false)
  const [isValid, setIsValid] = useState(true)
  const [isValidAddress, setIsValidAddress] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [receipt, setReceipt] = useState({})
  const [ERCReceipt, setERCReceipt] = useState({})
  const [txObj, setTxObj] = useState({})
  const [symbol, setSymbol] = useState('')
  const [nftElements, setNFTElements] = useState({})

  const [numberOfRecipients, setNumberOfRecipients] = useState(0)
  const [numOfIds, setNumOfIds] = useState(0)

  const [errorMessage, setErrorMessage] = useState('Invalid')
  const [isLoading, setIsLoading] = useState(false)

  const handleSendTx = async () => {
    toast.promise(sendTransaction(connectorState.web3, txObj), {
      pending: 'Awaiting transaction ...',
      success: {
        render({ data }) {
          setIsLoading(false)
          setIsApproved(false)
          setModalOpen(false)
          return 'Sucessfully sent.'
        },
      },
      error: {
        render({ data }) {
          // When the promise is rejected, data will contain the error
          setIsLoading(false)
          return data.message
        },
      },
    })
  }

  const handleApprovalTx = async () => {
    toast.promise(sendTransaction(connectorState.web3, txObj), {
      pending: 'Awaiting transaction ...',
      success: {
        render({ data }) {
          setIsApproved(true)
          return 'Sucessfully sent.'
        },
      },
      error: {
        render({ data }) {
          // When the promise is rejected, data will contain the error
          return data.message
        },
      },
    })
  }

  const handleAddress = async () => {
    try {
      const isERC721Address = await isERC721(connectorState.web3, address)
      setIsValidAddress(isERC721Address)
    } catch (e) {
      setErrorMessage(String(e))
      setIsValidAddress(false)
    }
  }

  const handleModal = async () => {
    setModalOpen(true)
  }

  const handleReceipt = async () => {
    try {
      const txObj = await createTxObj(
        connectorState,
        'sendERC721Token',
        contractAbis.SENDTOKEN,
        [address, contractArgs.recipients, contractArgs.ids],
        connectorState.chainParams.contractAddress,
      )
      setTxObj(txObj)

      const coinSymbol = connectorState.chainParams.symbol
      setSymbol(coinSymbol)

      const balance = await getUserCoinBalance(
        connectorState.web3,
        connectorState.connected_account,
      )

      const gasPrice = await ethers.BigNumber.from(txObj.gasPrice)
      const gasAmount = await ethers.BigNumber.from(txObj.gas)
      const gasFee = gasPrice.mul(gasAmount) ?? 0

      const remainingBalance = balance.sub(gasFee)

      setReceipt({
        Balance: balance,
        'Gas Fee': gasFee,
        'Remaining Balance': remainingBalance,
      })
    } catch (e) {
      setErrorMessage(String(e))
      setIsValid(false)
    }
  }

  const handleApprovalReceipt = async () => {
    try {
      const txObj = await createTxObj(
        connectorState,
        'setApprovalForAll',
        contractAbis.ERC721,
        [connectorState.chainParams.contractAddress, true],
        address,
      )
      setTxObj(txObj)

      const coinSymbol = connectorState.chainParams.symbol
      setSymbol(coinSymbol)

      const gasPrice = await ethers.BigNumber.from(txObj.gasPrice)
      const gasAmount = await ethers.BigNumber.from(txObj.gas)
      const gasFee = gasPrice.mul(gasAmount) ?? 0

      setReceipt({
        'Gas Fee': gasFee,
      })
    } catch (e) {
      setErrorMessage(String(e))
      setIsApproved(false)
    }
  }

  const handlePreqCheck = async () => {
    try {
      //check if user already has approval
      const hasApproval = await isERC721ApprovedForAll(
        connectorState.web3,
        address,
        connectorState.connected_account,
        connectorState.chainParams.contractAddress,
      )
      if (hasApproval) {
        setIsApproved(true)
      }

      //check if user is ownerOf ids
      contractArgs.ids.map(async (id) => {
        try {
          const isOwner = await isERC721OwnerOf(
            connectorState.web3,
            address,
            connectorState.connected_account,
            id,
          )

          if (!isOwner) {
            throw `isOwner(${id}) == false`
          }
        } catch (e) {
          setErrorMessage(`ownerOf error for id ${id}`, e)
          setIsValid(false)
        }
      })
    } catch (e) {
      setErrorMessage(String(e))
      setIsValid(false)
    }
  }

  const getAdditionalReceiptInfo = async () => {
    console.log(contractArgs)

    // extract the unique ids and values
    const balance_shift = {}

    for (let i = 0; i < contractArgs.ids.length; ++i) {
      if (!balance_shift[contractArgs.ids[i]]) {
        balance_shift[contractArgs.ids[i]] = 0
      }
      balance_shift[contractArgs.ids[i]] = 1
    }

    // // take the set of the ids
    let unique_ids = await Array.from(new Set(contractArgs.ids))

    let current_balances = await getERC721BalancesFor(
      connectorState.web3,
      address,
      connectorState.connected_account,
      unique_ids,
    )

    let nft_elements = {}

    for (let i = 0; i < current_balances.length; ++i) {
      if (!nft_elements[i]) {
        nft_elements[i] = {}
      }
      nft_elements[i].id = unique_ids[i]
      nft_elements[i].balance = parseInt(current_balances[i])
      nft_elements[i].metadata = await getERC721MetadataFor(
        connectorState.web3,
        address,
        unique_ids[i],
      )

      console.log('nftElements', nftElements)

      nft_elements[i].balance_shift = balance_shift[unique_ids[i]]
    }

    setNFTElements(nft_elements)
    let unique_recipients = await Array.from(new Set(contractArgs.recipients))
    setNumberOfRecipients(unique_recipients.length)

    setNumOfIds(unique_ids.length)
    setTotalNumberOfNFTs(calcSum(contractArgs.values))
  }

  useEffect(() => {
    if (connectorState.validNetwork == false) {
      setModalOpen(false)
    }
  }, [connectorState.validNetwork])

  useEffect(() => {
    handlePreqCheck().catch(console.error)
    if (isApproved && isValid && isValidAddress) {
      handleReceipt().catch(console.error)
      getAdditionalReceiptInfo().catch(console.error)
    } else {
      handleApprovalReceipt().catch(console.error)
    }
  }, [contractArgs, isApproved, address])

  useEffect(() => {
    //parse into Contract parameters addresses[] and ids[]
    try {
      let parsedObj = convertERC721TypeToWeb3(formatERC20Input(input))
      let contractArguments = convertToERC721ContractParams(parsedObj)
      setContractArgs((prev) => ({
        ...prev,
        recipients: contractArguments.recipients,
        ids: contractArguments.ids,
      }))
      setIsValid(true)
      setIsApproved(false)
      // console.log('contractparams', contractparameters)
    } catch (e) {
      setErrorMessage(String(e))
      setIsValid(false)
    }
  }, [input, address])

  useEffect(() => {
    try {
      handleAddress()
    } catch (e) {
      // console.log('error in validating', e)
      setIsValidAddress(false)
    }
  }, [address])

  return (
    <>
      <div className="">
        <ERC721Modal
          isOpen={modalOpen}
          setIsOpen={setModalOpen}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          handleSend={handleSendTx}
          contractArgs={contractArgs}
          receiptInfo={receipt}
          symbol={symbol}
          nftElements={nftElements}
          numOfIds={numOfIds}
          numOfRecipients={numberOfRecipients}
        />
      </div>
      <Panel>
        <div className="flex flex-col justify-center ">
          <AddressInputBox
            selected={selected}
            isValidAddress={isValidAddress}
            input={address}
            inputHandler={setAddress}
          />
          <div className="py-1 text-xs text-gray-500">
            <span>Line Format: </span>
            <span className="italic">Address Id</span>
          </div>
          <UserInputBox
            input={input}
            inputHandler={setInput}
            isValid={isValid}
            errorMessage={errorMessage}
            placeholder={'0xD35571fAd241eAD4Ae8182b336e3C27410C42069 13'}
          />
          {isValid ? (
            isApproved ? (
              <>
                <ReceiptBox receiptInfo={receipt} symbol={symbol} />
                <ReceiptBox receiptInfo={ERCReceipt} symbol={''} />
                <div className="max-w-[400px]">
                  <NFTBalanceSheet nftElements={nftElements} />
                </div>

                <Button
                  text={'Send'}
                  onClick={async () => await handleModal()}
                />
              </>
            ) : isValidAddress ? (
              <>
                <>
                  <ReceiptBox receiptInfo={receipt} symbol={symbol} />
                  <Button
                    text={'Allow the SendToken Protocol to use your NFTs'}
                    onClick={async () => await handleApprovalTx()}
                  />
                </>
              </>
            ) : null
          ) : null}
        </div>
      </Panel>
    </>
  )
}
