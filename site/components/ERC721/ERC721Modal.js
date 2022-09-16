import React from 'react'
import ConfirmationPanel from '../TransactionModal/ConfirmationPanel'
import SummaryRow from '../Summary/SummaryRow'
import ReceiptBox from '../Receipt/ReceiptBox'
import NFTBalanceSheet from '../Receipt/NFTBalanceSheet'
import ERC721Description from '../Receipt/ERC721Description'

export function RecipientsBox({ contractArgs, symbol }) {
  const receipients = contractArgs.recipients ?? []
  const ids = contractArgs.ids ?? []
  return (
    <>
      <div className="flex flex-row justify-between items-center mt-4 text-gray-800">
        <div>Recipient(s)</div>
        <div>Id(s)</div>
      </div>
      <div
        className="  h-72 overflow-y-scroll px-2  items-start"
        style={{
          boxShadow: 'inset 0 0 5px rgba(0,0,0,0.3)',
        }}
      >
        {receipients.map((address, key) => {
          const id = ids[key]
          return (
            <SummaryRow
              key={key}
              _key={key}
              address={address}
              value={id}
              symbol={symbol}
            />
          )
        })}
      </div>
    </>
  )
}

export default function ERC721Modal({
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
}) {
  return (
    <ConfirmationPanel
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      handleSend={handleSend}
      isLoading={isLoading}
      setIsLoading={setIsLoading}
    >
      <ERC721Description
        receiptInfo={receiptInfo}
        symbol={symbol}
        numOfRecipients={numOfRecipients}
        numOfIds={numOfIds}
      />
      <RecipientsBox contractArgs={contractArgs} />
      <NFTBalanceSheet nftElements={nftElements} />
      <ReceiptBox receiptInfo={receiptInfo} symbol={symbol} />
    </ConfirmationPanel>
  )
}
