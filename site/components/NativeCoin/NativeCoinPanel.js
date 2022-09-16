import React, { useState, useEffect } from 'react'
import { ethers } from 'ethers'

import UserInputBox from '../UserInputBox'
import Panel from '../Panel'
import Button from '../Button'
import NativeCoinModal from './NativeCoinModal'

import {
  calcSumOfBN,
  convertERC20TypeToWeb3,
  convertToERC20ContractParams,
  createTxObj,
  formatERC20Input,
  getUserCoinBalance,
  sendTransaction,
} from '../../utils/web3-utils'
import { toast } from 'react-toastify'
import { useConnectionContext } from '../ConnectionProvider'
import ReceiptBox from '../Receipt/ReceiptBox'
import { contractAbis } from '../../utils/constant/contract_abi'

export default function ERC20Panel() {
  const { connectorState } = useConnectionContext()
  const [input, setInput] = useState('')
  const [contractArgs, setContractArgs] = useState({})
  const [isValid, setIsValid] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [receipt, setReceipt] = useState({})
  const [txObj, setTxObj] = useState({})
  const [symbol, setSymbol] = useState('')
  const [errorMessage, setErrorMessage] = useState('Invalid')
  const [isLoading, setIsLoading] = useState(false)

  const handleSendTx = async () => {
    toast.promise(sendTransaction(connectorState.web3, txObj), {
      pending: 'Awaiting transaction ...',
      success: {
        render({ data }) {
          setIsLoading(false)
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

  const handleModal = async () => {
    setModalOpen(true)
  }

  const handleReceipt = async () => {
    try {
      const txObj = await createTxObj(
        connectorState,
        'sendNativeCoin',
        contractAbis.SENDTOKEN,
        [contractArgs.recipients, contractArgs.values],
        connectorState.chainParams.contractAddress,
        calcSumOfBN(contractArgs.values),
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

      const subTotal = calcSumOfBN(contractArgs.values)
      const total = subTotal.add(gasFee)

      const remainingBalance = balance.sub(total)

      if (remainingBalance.lt('0')) {
        throw 'Insufficient Coin Balance'
      }

      setReceipt({
        Balance: balance,
        'Gas Fee': gasFee,
        Subtotal: subTotal,
        Total: total,
        'Remaining Balance': remainingBalance,
      })
    } catch (e) {
      setErrorMessage(String(e))
      setReceipt({})
      setIsValid(false)
    }
  }

  useEffect(() => {
    if (connectorState.validNetwork == false) {
      setModalOpen(false)
    }
  }, [connectorState.validNetwork])

  useEffect(() => {
    if (isValid) {
      handleReceipt().catch(console.error)
    }
  }, [contractArgs])

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
      // console.log('contractArgs', contractArgs)
    } catch (e) {
      setErrorMessage(String(e))
      setIsValid(false)
    }
  }, [input])

  return (
    <div className="w-full">
      <div className="">
        <NativeCoinModal
          isOpen={modalOpen}
          setIsOpen={setModalOpen}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          handleSend={handleSendTx}
          contractArgs={contractArgs}
          receiptInfo={receipt}
          symbol={symbol}
        />
      </div>

      <Panel>
        <div className="flex flex-col justify-center ">
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
            <>
              <ReceiptBox receiptInfo={receipt} symbol={symbol} />
              <Button text={'Send'} onClick={async () => await handleModal()} />
            </>
          ) : null}
        </div>
      </Panel>
    </div>
  )
}
