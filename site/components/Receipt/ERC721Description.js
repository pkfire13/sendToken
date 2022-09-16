import React from 'react'
import { ethers } from 'ethers'

export default function ERC721Description({
  receiptInfo,
  symbol,
  numOfRecipients,
  numOfIds,
}) {
  return (
    <>
      <div className="text-sm font-normal italic text-gray-600 py-[3px]">
        You will be sending {numOfIds} NFTs to {numOfRecipients} unique
        recipient(s) with an estimated total gas fee of{' '}
        {String(ethers.utils.formatEther(receiptInfo['Gas Fee']))} {symbol}
      </div>
    </>
  )
}
