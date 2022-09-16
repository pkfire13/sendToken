import React from 'react'
import ReceiptBox from '../Receipt/ReceiptBox'
import ConfirmationPanel from '../TransactionModal/ConfirmationPanel'
import NFTBalanceSheet from '../Receipt/NFTBalanceSheet'
import ERC1155Description from '../Receipt/ERC1155Description'
import { calcSum } from '../../utils/web3-utils'

export function SummaryRow({ _key, address, value, value2 }) {
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
        <div>{String(value)}</div>
        <div>{String(value2)}</div>
      </div>
    </>
  )
}

export function RecipientsBox({ contractArgs, symbol }) {
  const receipients = contractArgs.recipients ?? []
  const ids = contractArgs.ids ?? []
  const values = contractArgs.values ?? []
  return (
    <>
      <div className="flex flex-row justify-between items-center mt-4 text-gray-800">
        <div className="flex-1">
          <div>Recipient(s)</div>
        </div>
        <div className="flex-0 px-24">
          <div>Id(s)</div>
        </div>
        <div className="flex-0">
          <div>Amount(s)</div>
        </div>
      </div>
      <div
        className="  h-72 overflow-y-scroll px-2  items-start"
        style={{
          boxShadow: 'inset 0 0 5px rgba(0,0,0,0.3)',
        }}
      >
        {receipients.map((address, key) => {
          const id = ids[key]
          const value = values[key]
          return (
            <SummaryRow
              key={key}
              _key={key}
              address={address}
              value={id}
              value2={value}
              symbol={symbol}
            />
          )
        })}
      </div>
    </>
  )
}

export default function ERC1155Modal({
  isOpen,
  setIsOpen,
  handleSend,
  contractArgs,
  receiptInfo,
  symbol,
  nftElements,
  isLoading,
  setIsLoading,
  numOfIds,
  numOfRecipients,
  total,
}) {
  return (
    <ConfirmationPanel
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      handleSend={handleSend}
      symbol={symbol}
      isLoading={isLoading}
      setIsLoading={setIsLoading}
    >
      <ERC1155Description
        receiptInfo={receiptInfo}
        symbol={symbol}
        numOfRecipients={numOfRecipients}
        numOfIds={numOfIds}
        total={total}
      />
      <RecipientsBox contractArgs={contractArgs} />
      <NFTBalanceSheet nftElements={nftElements} />
      <ReceiptBox receiptInfo={receiptInfo} symbol={symbol} />
    </ConfirmationPanel>
  )
}
