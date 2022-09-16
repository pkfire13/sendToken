import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { useScrollLock } from '../../hooks/useScrollLock'
import { useConnectionContext } from '../ConnectionProvider'
import HeaderTitle from './HeaderTitle'
import NetworkMenu from './NetworkMenu'
import Web3_Connection_Button from './Web3_Connection_Button'

export default function Header() {
  const { connectorState, setConnectorState } = useConnectionContext()
  const { lockScroll, unlockScroll } = useScrollLock()
  const [network, setNetwork] = useState('Networks')
  const [loading, setLoading] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [isInvalid, setIsInvalid] = useState(false)

  const handleNetworkSelection = async (chainId) => {
    setLoading((prev) => true)
    let id = toast.loading('Awaiting Network Switch')
    try {
      await connectorState.switchChain(chainId)
      setMenuOpen(false)
    } catch (e) {
      console.log(e)
    } finally {
      setLoading((prev) => false)
    }
    toast.dismiss()
  }

  const handleForceValidNetwork = async () => {
    setMenuOpen(true)
    setIsInvalid(true)
    setNetwork('Invalid Network')
    lockScroll()
  }

  useEffect(() => {
    if (connectorState.validNetwork) {
      setIsInvalid(false)
      setMenuOpen(false)
      setNetwork(connectorState.chainParams.name)
      unlockScroll()
    }
  }, [connectorState])

  useEffect(() => {
    if (connectorState.validNetwork == false) {
      handleForceValidNetwork()
    }
  })

  return (
    <>
      <div
        className={`min-h-screen min-w-[10000px] bg-black opacity-50 absolute mx-[-50px] ${
          isInvalid ? 'overflow-hidden' : 'hidden'
        }`}
      ></div>
      <div className="container mx-auto py-5 flex flex-row justify-between items-center min-h-min">
        <HeaderTitle />
        <div className="flex flex-row ">
          <NetworkMenu
            network={network}
            show={menuOpen}
            setShow={setMenuOpen}
            invalid={isInvalid}
            loading={loading}
            handleNetworkSelection={handleNetworkSelection}
          />
          <Web3_Connection_Button onClick={connectorState.connect} />
        </div>
      </div>
    </>
  )
}
