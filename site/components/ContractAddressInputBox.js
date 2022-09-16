import React, { useEffect, useState } from 'react'
import ValidInputAnimation from './ValidInputAnimation'

export default function AddressInputBox({
  isValidAddress,
  input,
  inputHandler,
  selected,
}) {
  const _placeholder = '0x5dfd5edfde4d8ec9e632dca9d09fc7e833f74210'
  const [isMounted, setIsMounted] = useState(false)
  const [prefix, setPrefix] = useState('')

  const isValidState = () => {
    // good luck
    return isMounted ? isValidAddress : !isMounted
  }

  useEffect(() => {
    if (selected == 2) {
      setPrefix('ERC20 ')
    } else if (selected == 3) {
      setPrefix('ERC721 ')
    } else if (selected == 4) {
      setPrefix('ERC1155 ')
    }

    if (input != '') {
      setIsMounted(true)
    }
  }, [input])

  return (
    <div className="mt-4">
      <div className="py-1 text-xs text-gray-500">{prefix} Token Address</div>
      <ValidInputAnimation flag={isValidState()}>
        <form>
          <input
            placeholder={_placeholder}
            value={input}
            onChange={(e) => inputHandler(e.target.value)}
            className={`px-4 py-2 w-full text-md border-2 rounded-md focus:outline-none border-black 
          ${isValidState() ? `border-black` : `border-red-500`}`}
          ></input>
          <div className="my-1 text-red-500 text-sm">
            {isValidState() ? null : 'This Input is invalid'}
          </div>
        </form>
      </ValidInputAnimation>
    </div>
  )
}
