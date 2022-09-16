import React from 'react'
import SummaryRow from './SummaryRow'
import { ethers } from 'ethers'

export default function RecipientsBox({ contractArgs, symbol }) {
  const receipients = contractArgs.recipients ?? []
  const values = contractArgs.values ?? []
  return (
    <>
      <div className="flex flex-row justify-between items-center mt-4 text-gray-800">
        <div>Recipient(s)</div>
        <div>Amount(s)</div>
      </div>
      <div
        className="  h-72 overflow-y-scroll px-2  items-start"
        style={{
          boxShadow: 'inset 0 0 5px rgba(0,0,0,0.3)',
        }}
      >
        {receipients.map((address, key) => {
          const valEth = ethers.utils.formatEther(values[key])
          return (
            <SummaryRow
              key={key}
              _key={key}
              address={address}
              value={valEth}
              symbol={symbol}
            />
          )
        })}
      </div>
    </>
  )
}
