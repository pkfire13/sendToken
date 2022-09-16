import React, { useEffect } from 'react'
import { ethers } from 'ethers'

export default function NativeCoinDescription({
  receiptInfo,
  symbol,
  numOfRecipients,
}) {
  return (
    <>
      <div className="text-sm font-normal italic text-gray-600 py-[3px]">
        You will be sending{' '}
        {String(ethers.utils.formatEther(receiptInfo['Subtotal']))} {symbol} to{' '}
        {numOfRecipients} recipient(s) with an estimated total gas fee of{' '}
        {String(ethers.utils.formatEther(receiptInfo['Gas Fee']))} {symbol} for
        a total of {String(ethers.utils.formatEther(receiptInfo['Total']))}{' '}
        {symbol}
      </div>
    </>
  )
}
