import React from 'react'
import Tooltip from './Tooltip'

export default function MiddleEllipsize({ str, len }) {
  let new_str1 = ''
  let new_str2 = ''
  let new_str = ''
  if (str.length > len) {
    // shorten to len and add "..."
    new_str1 = str.slice(0, len / 2) + '...'
    new_str2 = str.slice(str.length - (len / 2 - 1), str.length)
    new_str = new_str1 + new_str2
  } else {
    new_str = str
  }

  return (
    <>
      {str.length > len ? (
        <>
          <Tooltip content={str} direction={'bottom'}>
            {new_str}
          </Tooltip>
        </>
      ) : (
        <a>{new_str}</a>
      )}
    </>
  )
}
