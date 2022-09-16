import React, { useState, useEffect } from 'react'
import { ethers } from 'ethers'

import UserInputBox from '../UserInputBox'
import Panel from '../Panel'
import Button from '../Button'
import AddressInputBox from '../ContractAddressInputBox'
import { useConnectionContext } from '../ConnectionProvider'

//utils
import {
  sendTransaction,
  formatERC1155Input,
  convertERC1155TypeToWeb3,
  convertToERC1155ContractParams,
  isERC1155,
  getUserCoinBalance,
  createTxObj,
  isERC1155ApprovedForAll,
  getERC1155BalanceOfBatch,
  getERC1155MetadataFor,
  getERC1155BalancesFor,
} from '../../utils/web3-utils'
import { toast } from 'react-toastify'
import ERC1155Modal from './ERC1155Modal'
import ReceiptBox from '../Receipt/ReceiptBox'
import NFTBalanceSheet from '../Receipt/NFTBalanceSheet'
import { contractAbis } from '../../utils/constant/contract_abi'

export default function ERC1155Panel({ selected }) {
  const { connectorState } = useConnectionContext()
  const [input, setInput] = useState('')
  const [contractArgs, setContractArgs] = useState({})
  const [address, setAddress] = useState('')
  const [isApproved, setIsApproved] = useState(false)
  const [isValid, setIsValid] = useState(true)
  const [isValidAddress, setIsValidAddress] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [receipt, setReceipt] = useState({})
  const [txObj, setTxObj] = useState({})
  const [symbol, setSymbol] = useState('')
  const [errorMessage, setErrorMessage] = useState('Invalid')
  const [isLoading, setIsLoading] = useState(false)

  // num Receipient
  const [numberOfRecipients, setNumberOfRecipients] = useState(0)
  const [nftElements, setNFTElements] = useState({})
  const [totalNumberOfNFTs, setTotalNumberOfNFTs] = useState(0)
  const [numOfIds, setNumOfIds] = useState(0)

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
      const isERC1155Address = await isERC1155(connectorState.web3, address)
      setIsValidAddress(isERC1155Address)
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
        'sendERC1155Token',
        contractAbis.SENDTOKEN,
        [
          address,
          contractArgs.recipients,
          contractArgs.ids,
          contractArgs.values,
        ],
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
        contractAbis.ERC1155,
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
      setErrorMessage(String(e.message ? e.message : e))
      setIsApproved(false)
    }
  }

  const handlePreqCheck = async () => {
    try {
      //check if user already has approval
      const hasApproval = await isERC1155ApprovedForAll(
        connectorState.web3,
        address,
        connectorState.connected_account,
        connectorState.chainParams.contractAddress,
      )

      if (hasApproval) {
        setIsApproved(true)
      } else {
        setIsApproved(false)
      }
    } catch (e) {
      // console.log('error here', e)
      setErrorMessage('Error in Approval', String(e))
      setIsValid(false)
    }

    try {
      //check if user has balanceOf each Id
      const accounts = Array(contractArgs.ids.length).fill(
        connectorState.connected_account,
      )

      const balanceOfBatch = await getERC1155BalanceOfBatch(
        connectorState.web3,
        address,
        accounts,
        contractArgs.ids,
      )

      //does user have enough id to fulfil values?
      const vals = contractArgs.values
      vals.forEach((val, i) => {
        if (Number(val) > Number(balanceOfBatch[i])) {
          throw `user insufficient balance for id ${contractArgs.ids[i]} (${val} > ${balanceOfBatch[i]})`
        }
      })
    } catch (e) {
      setErrorMessage(String(e))
      setIsValid(false)
    }
  }

  useEffect(() => {
    if (connectorState.validNetwork == false) {
      setModalOpen(false)
    }
  }, [connectorState.validNetwork])

  useEffect(() => {
    //when contract args update, lets do our balance shift update
  }, [contractArgs])

  useEffect(() => {
    handlePreqCheck().catch(console.error)
    if (isApproved && isValid && isValidAddress) {
      handleReceipt().catch(console.error)
      // handle info gathering for balance shift
      getAdditionalReceiptInfo().catch(console.error)
    } else {
      handleApprovalReceipt().catch(console.error)
    }
  }, [contractArgs, isApproved, address])

  useEffect(() => {
    //parse into Contract parameters addresses[] and ids[]
    try {
      let parsedObj = convertERC1155TypeToWeb3(formatERC1155Input(input))

      const { recipients, ids, values } =
        convertToERC1155ContractParams(parsedObj)
      setContractArgs((prev) => ({
        ...prev,
        recipients: recipients,
        ids: ids,
        values: values,
      }))
      setIsValid(true)
      setIsApproved(false)
      // console.log('contractArgument', contractArguments)
    } catch (e) {
      setErrorMessage(String(e))
      setIsValid(false)
    }
  }, [input, address])

  useEffect(() => {
    try {
      handleAddress()
    } catch (e) {
      setIsValidAddress(false)
    }
  }, [address])

  const getAdditionalReceiptInfo = async () => {
    // extract the unique ids and values
    const balance_shift = {}

    for (let i = 0; i < contractArgs.ids.length; ++i) {
      if (!balance_shift[contractArgs.ids[i]]) {
        balance_shift[contractArgs.ids[i]] = 0
      }
      balance_shift[contractArgs.ids[i]] += parseInt(contractArgs.values[i])
    }

    // take the set of the ids
    let unique_ids = await Array.from(new Set(contractArgs.ids))

    let current_balances = await getERC1155BalancesFor(
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
      nft_elements[i].metadata = await getERC1155MetadataFor(
        connectorState.web3,
        address,
        unique_ids[i],
      )

      nft_elements[i].balance_shift = balance_shift[unique_ids[i]]
    }

    setNFTElements(nft_elements)
    let unique_recipients = await Array.from(new Set(contractArgs.recipients))
    setNumberOfRecipients(unique_recipients.length)
    setNumOfIds(unique_ids.length)
    setTotalNumberOfNFTs(calcSum(contractArgs.values))
  }

  return (
    <>
      <div className="">
        <ERC1155Modal
          isOpen={modalOpen}
          setIsOpen={setModalOpen}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          handleSend={handleSendTx}
          contractArgs={contractArgs}
          receiptInfo={receipt}
          symbol={symbol}
          nftElements={nftElements}
          numOfRecipients={numberOfRecipients}
          numOfIds={numOfIds}
          totalNumberOfNFTs={totalNumberOfNFTs}
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
            <span className="italic">Address Id Amount</span>
          </div>

          <UserInputBox
            input={input}
            inputHandler={setInput}
            isValid={isValid}
            errorMessage={errorMessage}
            placeholder={'0xD35571fAd241eAD4Ae8182b336e3C27410C42069 13 25'}
          />
          {isValid ? (
            isApproved ? (
              <>
                <ReceiptBox receiptInfo={receipt} symbol={symbol} />
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
