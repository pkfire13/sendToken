import React from 'react'
import { motion } from 'framer-motion'

export default function Panel({ children }) {
  return (
    <>
      <>
        <div className="border-2 border-black rounded-lg drop-shadow-md p-10 ">
          {children}
        </div>
      </>
    </>
  )
}
