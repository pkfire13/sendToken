import React from 'react'
import Modal from './Modal'
import { Dialog } from '@headlessui/react'
import Button from '../Button'
import { ThreeDots } from 'react-loader-spinner'

export default function ConfirmationPanel({
  isOpen,
  setIsOpen,
  isLoading,
  setIsLoading,
  handleSend,
  children,
}) {
  return (
    <>
      <Modal isOpen={isOpen} setIsOpen={setIsOpen} isLoading={isLoading}>
        <Dialog.Title
          as="h3"
          className="text-lg font-medium leading-6 text-gray-900"
        >
          Confirmation Receipt
        </Dialog.Title>
        {children}

        <div className="my-3 text-gray-900">
          Are you sure this is the correct information?
        </div>
        {isLoading ? (
          <ThreeDots height={42} width={42} color={'black'} />
        ) : (
          <Button
            text={'Send'}
            onClick={async () => {
              setIsLoading(true)
              await handleSend()
            }}
          />
        )}
      </Modal>
    </>
  )
}
