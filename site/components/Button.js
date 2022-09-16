import React from 'react'

export default function Button({ text, onClick }) {
  return (
    <>
      <div>
        <button
          onClick={onClick}
          className="border-2 border-black px-3 py-2 rounded-md hover:bg-slate-100 hover:drop-shadow-md"
        >
          {text}
        </button>
      </div>
    </>
  )
}
