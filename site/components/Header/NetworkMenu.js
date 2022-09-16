import { Menu, Transition } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/solid'
import React, { Fragment } from 'react'
import { ThreeDots } from 'react-loader-spinner'
import { NETWORKS } from '../../utils/constant/networks'

export default function NetworkMenu({
  loading,
  invalid,
  network,
  show,
  setShow,
  handleNetworkSelection,
}) {
  return (
    <>
      <Menu as="div" className={'text-left mx-2 '}>
        {({ open }) => (
          <>
            <div onClick={() => setShow(!show)}>
              <Menu.Button
                className={`flex justify-center py-1 px-2 border-2 rounded-md font-bold text-sm hover:bg-slate-100 hover:drop-shadow-md ${
                  invalid
                    ? 'border-red-500 relative z-50 bg-white'
                    : 'border-black'
                }`}
              >
                {loading ? (
                  <ThreeDots
                    height={20}
                    width={20}
                    color={'black'}
                    className={`${invalid ? 'text-red-500' : null}`}
                  />
                ) : (
                  <div className={`${invalid ? 'text-red-500' : ''}`}>
                    {network}
                  </div>
                )}
                <ChevronDownIcon
                  className={`ml-1 -mr-1 mt-[1px] h-5 w-5 ${
                    invalid ? 'text-red-500' : ''
                  }
                  `}
                />
              </Menu.Button>
            </div>
            <Transition
              as={Fragment}
              show={show}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items
                static
                className={`absolute -right-15 mt-2 w-56 rounded-md border-2 border-black bg-white`}
              >
                <div className="px-1 py-1">
                  {Object.entries(NETWORKS).map((network, key) => {
                    const networkId = network[1].chainId
                    const networkParams = network[1]
                    return (
                      <Menu.Item key={key}>
                        <button
                          onClick={() => handleNetworkSelection(networkId)}
                          className="flex w-full items-center rounded-md px-2 py-2 text-sm"
                        >
                          {networkParams.name}
                        </button>
                      </Menu.Item>
                    )
                  })}
                </div>
              </Menu.Items>
            </Transition>
          </>
        )}
      </Menu>
    </>
  )
}
