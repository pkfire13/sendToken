import React, { useState, useEffect, useRef } from 'react'
import ValidInputAnimation from './ValidInputAnimation'
import { ExclamationCircleIcon } from '@heroicons/react/outline'

export function ErrorLine({ errorMessage }) {
  return (
    <>
      <div className="">
        <ExclamationCircleIcon className="relative top-[-1px] w-4 h-4 mx-1 inline " />

        <div className="inline leading-[25px]">{errorMessage}</div>
      </div>
    </>
  )
}

export default function UserInputBox({
  placeholder,
  isValid,
  input,
  inputHandler,
  errorMessage,
}) {
  const [isMounted, setIsMounted] = useState(false)
  // const [width, setWidth] = useState('400px')
  const ref = useRef(null)

  const isValidState = () => {
    // good luck
    return isMounted ? isValid : !isMounted
  }

  useEffect(() => {
    if (input != '') {
      setIsMounted(true)
    }
  }, [input])

  return (
    <form className="w-full">
      <ValidInputAnimation flag={isValidState()}>
        <textarea
          id="Token Destinations"
          name="Token Destinations"
          placeholder={placeholder}
          type="text"
          value={input}
          onChange={(e) => inputHandler(e.target.value)}
          className={`w-full border-2 border-black rounded-md h-72 px-4 py-1 whitespace-nowrap overflow-x-auto focus:outline-none focus:border-highlight focus:drop-shadow-xl ${
            isValidState() ? 'border-black' : 'border-red-600'
          }`}
          style={{ resize: 'none' }}
        ></textarea>
      </ValidInputAnimation>
      <div className="text-red-500 text-sm">
        {isValidState() ? null : (
          <>
            <ErrorLine errorMessage={errorMessage} />
          </>
        )}
      </div>
    </form>
  )
}
