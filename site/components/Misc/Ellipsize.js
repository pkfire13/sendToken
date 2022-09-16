import React from 'react'
import Tooltip from './Tooltip'

export default function Ellipsize({ str, len }) {
  let new_str = ''
  if (str.length > len) {
    // shorten to len and add "..."
    new_str = str.slice(0, len) + '...'
  } else {
    new_str = str
  }

  return (
    <>
      {str.length > len ? (
        <Tooltip content={str} direction={'bottom'}>
          {new_str}
        </Tooltip>
      ) : (
        <a>{new_str}</a>
      )}
    </>
  )
}
