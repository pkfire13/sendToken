import React, { useEffect, useState } from 'react'
import { truncateWeb3Address } from '../../utils/web3-utils'
import { useConnectionContext } from '../ConnectionProvider'

export default function Web3_Connection_Button() {
  const { connectorState, setConnectorState } = useConnectionContext()
  const [wallet, setWallet] = useState('Connect Wallet')

  async function handleConnect() {
    await connectorState.connect()
    await setConnectorState({ ...connectorState, updated: true })
    console.log('connector state in button', connectorState)
  }
  useEffect(() => {
    if (connectorState.connected_account) {
      setWallet(truncateWeb3Address(connectorState.connected_account))
    } else {
      setWallet('Connect Wallet')
    }
  }, [connectorState])
  return (
    <>
      <button
        onClick={() => handleConnect()}
        className="px-2 py-1 border-2  border-black rounded-md text-black-400 font-bold text-sm hover:bg-slate-100 hover:drop-shadow-md"
      >
        {wallet}
      </button>
    </>
  )
}
