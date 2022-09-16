import React, { useState, useEffect } from 'react'
import { ethers } from 'ethers'

import UserInputBox from '../UserInputBox'
import Panel from '../Panel'
import Button from '../Button'
import AddressInputBox from '../ContractAddressInputBox'
import ERC20Modal from './ERC20Modal'

import {
  convertERC20TypeToWeb3,
  convertToERC20ContractParams,
  formatERC20Input,
  sendTransaction,
  calcSumOfBN,
  isERC20,
  getUserCoinBalance,
  getERC20BalanceOf,
  getERC20Info,
  createTxObj,
  getERC20Allowance,
} from '../../utils/web3-utils'
import { toast } from 'react-toastify'
import { useConnectionContext } from '../ConnectionProvider'
import ReceiptBox from '../Receipt/ReceiptBox'
import { contractAbis } from '../../utils/constant/contract_abi'

export default function ERC20Panel({ selected }) {
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
  const [tokenSymbol, setTokenSymbol] = useState('')
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
      const isERC20Address = await isERC20(connectorState.web3, address)
      setIsValidAddress(isERC20Address)
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
        'sendERC20Token',
        contractAbis.SENDTOKEN,
        [address, contractArgs.recipients, contractArgs.values],
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
      console.log('receipt error', e)
      setErrorMessage(String(e))
      setIsValid(false)
    }
  }

  const handleERCReceipt = async () => {
    try {
      const subTotal = calcSumOfBN(contractArgs.values)

      const tokenInfo = await getERC20Info(connectorState.web3, address)
      setTokenSymbol(tokenInfo.symbol)

      const balance = await getERC20BalanceOf(
        connectorState.web3,
        address,
        connectorState.connected_account,
      )
      const remainingBalance = balance.sub(subTotal)

      setERCReceipt({
        'Balance (token)': balance,
        'Subtotal (token)': subTotal,
        'Remaining Balance (token)': remainingBalance,
      })
    } catch (e) {
      setERCReceipt({})
    }
  }

  const handleApprovalReceipt = async () => {
    try {
      const txObj = await createTxObj(
        connectorState,
        'approve',
        contractAbis.ERC20,
        [
          connectorState.chainParams.contractAddress,
          calcSumOfBN(contractArgs.values),
        ],
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
      //check if user has sufficient balance
      const subTotal = calcSumOfBN(contractArgs.values)

      const tokenInfo = await getERC20Info(connectorState.web3, address)
      setTokenSymbol(tokenInfo.symbol)

      const balance = await getERC20BalanceOf(
        connectorState.web3,
        address,
        connectorState.connected_account,
      )
      const remainingBalance = balance.sub(subTotal)

      if (remainingBalance.lt('0')) {
        throw 'Insufficient ERC20 Token Balance'
      }

      //check if user has approved amount (allowance) for contract
      const allowance = await getERC20Allowance(
        connectorState.web3,
        address,
        connectorState.connected_account,
        connectorState.chainParams.contractAddress,
      )

      if (allowance.lt(subTotal)) {
        setIsApproved(false)
      } else {
        setIsApproved(true)
      }
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
    handlePreqCheck().catch(console.error)
    if (isApproved && isValid && isValidAddress) {
      handleReceipt().catch(console.error)
      handleERCReceipt().catch(console.error)
    } else {
      handleApprovalReceipt().catch(console.error)
    }
  }, [contractArgs, address, isApproved])

  useEffect(() => {
    //parse into Contract parameters addresses[] and values[]
    try {
      let parsedObj = convertERC20TypeToWeb3(formatERC20Input(input))
      let contractArguments = convertToERC20ContractParams(parsedObj)
      setContractArgs((prev) => ({
        ...prev,
        recipients: contractArguments.recipients,
        values: contractArguments.values,
      }))
      setIsValid(true)
      setIsApproved(false)
      // console.log('contractArgs', contractArgs)
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

  return (
    <>
      <div className="">
        <ERC20Modal
          isOpen={modalOpen}
          setIsOpen={setModalOpen}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          handleSend={handleSendTx}
          contractArgs={contractArgs}
          receiptInfo={receipt}
          ERC20Receipt={ERCReceipt}
          symbol={symbol}
          tokenSymbol={tokenSymbol}
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
            <span className="italic">Address Amount</span>
          </div>
          <UserInputBox
            input={input}
            inputHandler={setInput}
            isValid={isValid}
            errorMessage={errorMessage}
            placeholder={'0xD35571fAd241eAD4Ae8182b336e3C27410C42069 13.36'}
          />
          {isValid ? (
            isApproved ? (
              <>
                <ReceiptBox receiptInfo={receipt} symbol={symbol} />
                <ReceiptBox receiptInfo={ERCReceipt} symbol={tokenSymbol} />
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
                    text={'Allow the SendToken Protocol to use your token'}
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
