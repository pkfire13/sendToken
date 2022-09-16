import React from 'react'
import NativeCoinDescription from '../Receipt/NativeCoinDescription'
import ReceiptBox from '../Receipt/ReceiptBox'
import RecipientsBox from '../Summary/RecipientBox'
import ConfirmationPanel from '../TransactionModal/ConfirmationPanel'

export default function NativeCoinModal({
  isOpen,
  setIsOpen,
  handleSend,
  contractArgs,
  receiptInfo,
  symbol,
  isLoading,
  setIsLoading,
}) {
  const num = contractArgs.recipients ? contractArgs.recipients.length : 0
  return (
    <ConfirmationPanel
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      handleSend={handleSend}
      isLoading={isLoading}
      setIsLoading={setIsLoading}
    >
      <NativeCoinDescription
        receiptInfo={receiptInfo}
        symbol={symbol}
        numOfRecipients={num}
      />
      <RecipientsBox contractArgs={contractArgs} />
      <ReceiptBox receiptInfo={receiptInfo} symbol={symbol} />
    </ConfirmationPanel>
  )
}
