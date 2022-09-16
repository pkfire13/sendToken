import React from 'react'
import { ethers } from 'ethers'

export default function ERC20Description({
  receiptInfo,
  ERC20ReceiptInfo,
  symbol,
  tokenSymbol,
  numOfRecipients,
}) {
  console.log('receiptInfo', receiptInfo)
  return (
    <>
      <div className="text-sm font-normal italic text-gray-600 py-[3px]">
        You will be sending{' '}
        {String(ethers.utils.formatEther(ERC20ReceiptInfo['Subtotal (token)']))}{' '}
        {tokenSymbol} to {numOfRecipients} recipient(s) with an estimated total
        gas fee of {String(ethers.utils.formatEther(receiptInfo['Gas Fee']))}{' '}
        {symbol}
      </div>
    </>
  )
}
