import React from 'react'

export default function SummaryRow({ _key, address, value, symbol }) {
  return (
    <>
      <div
        key={_key}
        className="flex justify-between items-center my-2 text-gray-900"
      >
        <div>
          <span className="">
            {''}
            {_key + 1}
            {'.\t'}
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          </span>

          {address}
        </div>
        <div>
          {String(value)} {symbol}
        </div>
      </div>
    </>
  )
}
