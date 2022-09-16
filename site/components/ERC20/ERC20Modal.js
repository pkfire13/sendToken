import ReceiptBox from '../Receipt/ReceiptBox'
import RecipientsBox from '../Summary/RecipientBox'
import ConfirmationPanel from '../TransactionModal/ConfirmationPanel'
import ERC20Description from '../Receipt/ERC20Description'

export default function ERC20Modal({
  isOpen,
  setIsOpen,
  handleSend,
  contractArgs,
  receiptInfo,
  ERC20Receipt,
  symbol,
  tokenSymbol,
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
      <ERC20Description
        receiptInfo={receiptInfo}
        ERC20ReceiptInfo={ERC20Receipt}
        symbol={symbol}
        tokenSymbol={tokenSymbol}
        numOfRecipients={num}
      />
      <RecipientsBox contractArgs={contractArgs} />
      <ReceiptBox receiptInfo={receiptInfo} symbol={symbol} />
      <ReceiptBox receiptInfo={ERC20Receipt} symbol={tokenSymbol} />
    </ConfirmationPanel>
  )
}
