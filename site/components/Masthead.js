import React, { useState } from 'react'

import Tabs from './Tabs/Tabs'
import ERC1155Panel from './ERC1155/ERC1155Panel'
import ERC20Panel from './ERC20/ERC20Panel'
import ERC721Panel from './ERC721/ERC721Panel'
import NativeCoinPanel from './NativeCoin/NativeCoinPanel'
import BlockInformation from './BlockInformation'

import { motion } from 'framer-motion'

export default function MastHead() {
  const [selected, setSelected] = useState(1)

  return (
    <div className="py-20">
      <div className="flex flex-col justify-center items-center ">
        <Tabs selected={selected} setSelected={setSelected} />
        <motion.div
          layout={true}
          className="z-50 bg-vanilla relative w-[555px] min-h-[300px]"
          transition={{
            layout: {
              duration: 0.2,
              ease: 'easeIn',
            },
          }}
        >
          {selected == 1 ? <NativeCoinPanel /> : null}
          {selected == 2 ? <ERC20Panel selected={selected} /> : null}
          {selected == 3 ? <ERC721Panel selected={selected} /> : null}
          {selected == 4 ? <ERC1155Panel selected={selected} /> : null}
          <BlockInformation />
        </motion.div>
      </div>
    </div>
  )
}
