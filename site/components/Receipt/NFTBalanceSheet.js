import React from 'react'
import Ellipsize from '../Misc/Ellipsize'

export default function NFTBalanceSheet({ nftElements }) {
  return (
    <>
      <div className="flex flex-row gap-2 overflow-x-scroll my-2 max-w-inherit">
        {' '}
        {Object.entries(nftElements).map((ele, key) => {
          console.log('mapping over balance shift', ele)
          return (
            <div
              key={key}
              className={`rounded-lg text-center p-2  ${
                ele[1].balance - ele[1].balance_shift < 0
                  ? 'bg-offBlack'
                  : 'bg-offBlack'
              }`}
            >
              <div className="flex justify-between w-full w-[92px]">
                <div className="text-sm text-white mb-[8px]">
                  {ele[1].metadata.name ? (
                    <Ellipsize str={ele[1].metadata.name.toString()} len={10} />
                  ) : (
                    'Unknown'
                  )}{' '}
                  <br />
                  <p className="text-left text-xs text-gray-300">
                    Id: {ele[1].id}
                  </p>
                </div>

                {/* </a> */}
                {/* <ReactTooltip effect="solid" /> */}
              </div>
              <div className=" text-sm text-white"></div>
              <div className="w-full text-center flex justify-center">
                <div className="h-[64px] w-[64px] rounded-lg bg-gray-300 justify-center border-gray-100 border-[1px] w-full overflow-hidden ">
                  {ele[1].metadata.image ? (
                    <img
                      style={{
                        transform: 'scale(3)',
                      }}
                      src={ele[1].metadata.image}
                      alt={'UNKNOWN'}
                    />
                  ) : null}
                </div>
              </div>
              <div className="text-xs pt-2 text-white italic">
                Balance Change
              </div>

              <div
                className={`text-center text-xs
                ${
                  ele[1].balance - ele[1].balance_shift < 0
                    ? 'text-red-200'
                    : 'text-green-200'
                }`}
              >
                {' '}
                {ele[1].balance}{' '}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-[20px] w-[16px] inline relative -top-[1px]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>{' '}
                {ele[1].balance - ele[1].balance_shift}{' '}
              </div>
              <div className="text-white text-sm rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500  w-auto p-[5px] relative ">
                {' '}
                <Ellipsize
                  str={'-' + ele[1].balance_shift.toString()}
                  len={7}
                />{' '}
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}
