import React, { useEffect } from 'react'
import { motion, useAnimation } from 'framer-motion'

export default function ValidInputAnimation({ flag, children }) {
  const controls = useAnimation()
  const sequence = async () => {
    await controls.start({ x: 0 }, { duration: 0.1 })
    await controls.start({ x: 4 }, { duration: 0.05 })
    await controls.start({ x: -5 }, { duration: 0.05 })
    await controls.start({ x: 5 }, { duration: 0.01 })
    return controls.start({ x: 0 }, { duration: 0.05 })
  }

  useEffect(() => {
    if (flag == false) sequence().catch(console.error)
  }, [flag])
  return (
    <>
      <motion.div animate={flag ? null : controls}>{children}</motion.div>
    </>
  )
}
