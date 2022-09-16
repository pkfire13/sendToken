import React from 'react'
import { ethers } from 'ethers'

export default function Row({ rowName, symbol, bigNumber }) {
  return (
    <>
      {bigNumber ? (
        <div className="flex flex-row justify-between">
          <>
            <span>{rowName}</span>
            <span>
              <>
                {bigNumber ? ethers.utils.formatEther(bigNumber) : null}{' '}
                {symbol ? String(symbol) : null}
              </>
            </span>
          </>
        </div>
      ) : null}
    </>
  )
}
