/** @format */

import Header from '../components/Header/Header'
import Head from 'next/head'
import MastHead from '../components/Masthead'
import Footer from '../components/Footer/Footer'

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="">
        <div className="relative z-10 ">
          <Header />
        </div>
        <div className="relative z-0">
          <MastHead />
        </div>
      </div>
      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  )
}
