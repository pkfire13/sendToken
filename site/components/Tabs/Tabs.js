import React from 'react'

export default function Tabs(props) {
  return (
    <>
      <div className="relative ">
        <button
          className={`px-1 border-t-2 border-r-[1px] border-l-2 border-black rounded-t-md hover:bg-slate-100 hover:font-bold ease-in-out duration-300 ${
            props.selected == 1 ? `font-bold hover:bg-vanilla` : `text-gray-600`
          }`}
          onClick={() => props.setSelected(1)}
        >
          Native Coin
        </button>
        <button
          className={`px-1 border-t-2 border-r-[1px] border-l-2 border-black rounded-t-md hover:bg-slate-100 hover:font-bold ease-in-out duration-300 ${
            props.selected == 2
              ? `font-bold font-bold hover:bg-vanilla`
              : `text-gray-600`
          }`}
          onClick={() => props.setSelected(2)}
        >
          ERC-20
        </button>
        <button
          className={`px-1 border-t-2 border-r-[1px] border-l-2 border-black rounded-t-md hover:bg-slate-100 hover:font-bold ease-in-out duration-300 ${
            props.selected == 3
              ? `font-bold font-bold hover:bg-vanilla`
              : `text-gray-600`
          }`}
          onClick={() => props.setSelected(3)}
        >
          ERC-721
        </button>
        <button
          className={`px-1 border-t-2 border-r-2 border-l-2 border-black rounded-t-md hover:bg-slate-100 hover:font-bold ease-in-out duration-300  ${
            props.selected == 4
              ? `font-bold font-bold hover:bg-vanilla`
              : `text-gray-600`
          }`}
          onClick={() => props.setSelected(4)}
        >
          ERC-1155
        </button>
      </div>
    </>
    //selected: bold text, black border, slightly bigger scale on the button, hover:scale and darker
    //unselected: off-black border, off-black text,
    //border sc
  )
}
