import Image from 'next/image'
import React from 'react'

export default function HeaderTitle() {
  return (
    <>
      <div className="flex flex-row items-center ">
        <div className="mx-2">
          <Image
            src="/assets/sendtoken.webp"
            alt="Picture of the author"
            width="50px"
            height="40px"
          />
        </div>
        <div className="font-bold text-lg">sendToken</div>
      </div>
    </>
  )
}
