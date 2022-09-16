import React from 'react'
import { Dialog, Transition, Fragment } from '@headlessui/react'

export default function Modal({ isOpen, setIsOpen, isLoading, children }) {
  return (
    <>
      <Transition
        appear
        show={isOpen}
        as={Fragment}
        style={{ pointerEvents: 'none' }}
      >
        <Dialog
          as="div"
          className="relative z-20 "
          onClose={() => {
            if (isLoading == false) {
              setIsOpen(false)
            }
          }}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 ">
            <div className="flex min-h-full items-center justify-center text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-[900px] px-12 py-8 transform overflow-hidden rounded-lg bg-white text-left align-middle shadow-xl transition-all">
                  {children}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  )
}
