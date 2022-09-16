import React from 'react'
import Row from './Row'

export default function ReceiptBox({ receiptInfo, symbol }) {
  const receipt = receiptInfo ?? {}
  return (
    <>
      <div className="grid gap-2 py-3">
        {Object.entries(receipt).map((ele, counter) => {
          return (
            <Row
              key={counter}
              rowName={ele[0]}
              symbol={symbol}
              bigNumber={ele[1]}
            />
          )
        })}
      </div>
    </>
  )
}
