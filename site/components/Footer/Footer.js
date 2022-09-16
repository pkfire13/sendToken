import React from 'react'
import Link from 'next/link'

export default function Footer() {
  return (
    <>
      <footer>
        <div className="flex justify-between ">
          <p
            href=""
            onClick={() => alert('coming soon')}
            className="cursor-pointer flex flex-row justify-between items-center gap-4 my-5 min-h-min underline font-semibold"
          >
            How it works
          </p>
          <div className="flex flex-row justify-between items-center gap-4 my-5 min-h-min">
            <a
              href="https://github.com/thechaintech"
              target={'_blank'}
              rel="noreferrer"
            >
              <img
                src="/assets/github.svg"
                width={'48'}
                height={'48'}
                alt={'opensource?'}
              />
            </a>
            <a
              href="https://thechaintech.io"
              target={'_blank'}
              rel="noreferrer"
            >
              <img
                src="/assets/chaintech-logo.webp"
                width={'36'}
                height={'36'}
                alt={'thechaintech'}
              />
            </a>
          </div>
        </div>
      </footer>
    </>
  )
}
