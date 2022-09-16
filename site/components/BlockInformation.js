import React, { useState, useEffect } from 'react'
import { useConnectionContext } from './ConnectionProvider'
import MiddleEllipsize from './Misc/MiddleEllipsize'
import { ExternalLinkIcon } from '@heroicons/react/solid'
import { motion } from 'framer-motion'

export default function BlockInformation() {
  const [latestBlock, setLatestBlock] = useState(0)
  const [contractAddress, setContractAddress] = useState('')
  const [blockExplorer, setBlockExplorer] = useState('')
  const [latestTime, setLatestTime] = useState('')
  const [timeAgo, setTimeAgo] = useState(0)

  const { connectorState } = useConnectionContext()

  useEffect(() => {
    console.log('connectorState', connectorState)

    connectorState.latestBlock
      ? setLatestBlock(connectorState.latestBlock)
      : null

    connectorState.chainParams.contractAddress
      ? setContractAddress(
          connectorState.chainParams.contractAddress.toString(),
        )
      : null

    connectorState.chainParams.blockExplorer
      ? setBlockExplorer(connectorState.chainParams.blockExplorer)
      : null

    connectorState.latestTime ? setLatestTime(connectorState.latestTime) : null
  }, [connectorState])

  useEffect(() => {
    console.log(latestTime)
    updateTimer()
  }, [latestTime])

  const updateTimer = async () => {
    // Get a reference to the last interval + 1
    const interval_id = window.setInterval(function () {},
    Number.MAX_SAFE_INTEGER)

    // Clear any timeout/interval up to that id
    for (let i = 1; i < interval_id; i++) {
      window.clearInterval(i)
    }
    if (latestTime < 10) {
      return
    }

    //getRemainingTime
    let currentUnix = Date.now() / 1000
    console.log(latestTime)
    console.log(currentUnix)

    setInterval(() => {
      let currentUnix = Date.now() / 1000
      setTimeAgo(parseInt(currentUnix - latestTime))
    }, 1000)
  }

  return (
    <div className="z-0 relative">
      <div className="flex justify-between">
        <div>
          {latestBlock > 0 ? (
            <>
              <span className="relative top-[3px] right-0 mr-[2px] inline-block w-2 h-2 transform translate-x-1/2 -translate-y-1/2 bg-green-600 border-[1px] border-green-500 rounded-full"></span>
              <span className="text-gray-700 text-sm pl-[3px]">
                {latestBlock}{' '}
                <span className="text-gray-400">({timeAgo}s ago)</span>
              </span>
            </>
          ) : null}{' '}
        </div>
        <div>
          {contractAddress ? (
            <span className="text-gray-700 text-sm pl-[3px]">
              <a
                href={blockExplorer + contractAddress}
                target="_blank"
                rel="noreferrer"
              >
                <span className="">Protocol: </span>
                <span className="font-bold">
                  <MiddleEllipsize str={contractAddress} len={9} />{' '}
                  <ExternalLinkIcon className="inline relative top-[-2px] inline w-4 h-4" />
                </span>
              </a>
            </span>
          ) : null}
        </div>
      </div>
    </div>
  )
}
